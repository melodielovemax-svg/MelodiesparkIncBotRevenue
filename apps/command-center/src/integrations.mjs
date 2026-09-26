import crypto from 'node:crypto';
import { createPublicClient, formatEther, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { TOKEN_IDS } from './catalog.mjs';

function safeShopifyDomain(value) {
  const domain = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)) {
    throw new Error('SHOPIFY_STORE_DOMAIN must be a valid *.myshopify.com domain.');
  }
  return domain;
}

function safeShopifyVersion(value) {
  const version = String(value || '');
  if (!/^\d{4}-(01|04|07|10)$/.test(version)) throw new Error('SHOPIFY_API_VERSION is invalid.');
  return version;
}

async function fetchJson(url, options = {}, timeoutMs = 12_000) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs), redirect: 'error' });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { message: text.slice(0, 500) }; }
  if (!response.ok) {
    const error = new Error(`Remote API returned ${response.status}.`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

export class IntegrationManager {
  constructor({ db, config }) {
    this.db = db;
    this.config = config;
    this.priceCache = { expiresAt: 0, data: null };
  }

  getStatus() {
    const latest = (provider) => {
      const row = this.db.latestIntegrationRun(provider);
      if (!row) return null;
      return {
        status: row.status,
        operation: row.operation,
        recordsProcessed: Number(row.records_processed),
        errorCode: row.error_code,
        startedAt: row.started_at,
        completedAt: row.completed_at
      };
    };
    return {
      shopify: {
        configured: Boolean(this.config.shopify.storeDomain && this.config.shopify.accessToken),
        mode: this.config.appMode,
        capabilities: ['orders:read', 'products:read', 'signed_order_webhooks'],
        lastRun: latest('shopify')
      },
      stripe: {
        configured: Boolean(this.config.stripe.secretKey),
        mode: this.config.stripe.secretKey?.startsWith('sk_live_') ? 'live' : this.config.stripe.secretKey ? 'test' : 'not_configured',
        capabilities: ['balance:read', 'payouts:read', 'signed_webhooks'],
        lastRun: latest('stripe')
      },
      paypal: {
        configured: false,
        mode: this.config.paypal.environment,
        capabilities: [],
        blocker: 'Requires an approved PayPal OAuth application. Client secrets are not accepted by this local app.'
      },
      marketPrices: {
        configured: true,
        provider: 'CoinGecko public API',
        mode: 'read-only',
        capabilities: ['token_reference_prices'],
        lastRun: latest('market-prices')
      },
      ethereumRpc: {
        configured: Boolean(this.config.ethereum.rpcUrl),
        mode: 'read-only',
        capabilities: ['native_eth_balance'],
        lastRun: latest('ethereum-rpc')
      }
    };
  }

  async syncAll() {
    const results = [];
    if (this.config.shopify.storeDomain && this.config.shopify.accessToken) results.push(await this.syncShopify());
    if (this.config.stripe.secretKey) results.push(await this.syncStripe());
    if (results.length === 0) {
      return { status: 'not_configured', message: 'No live integrations are configured. Demo data remains labeled.', results };
    }
    return { status: 'completed', results };
  }

  async syncShopify() {
    const startedAt = new Date().toISOString();
    let runId;
    try {
      const domain = safeShopifyDomain(this.config.shopify.storeDomain);
      const version = safeShopifyVersion(this.config.shopify.apiVersion);
      const url = `https://${domain}/admin/api/${version}/orders.json?status=any&limit=250&fields=id,name,created_at,updated_at,current_total_price_set,total_price_set,financial_status,currency,test`;
      const body = await fetchJson(url, {
        headers: {
          'X-Shopify-Access-Token': this.config.shopify.accessToken,
          'Accept': 'application/json',
          'User-Agent': 'Melodiespark-Command-Center/0.1'
        }
      });
      const orders = Array.isArray(body.orders) ? body.orders : [];
      for (const order of orders) this.ingestShopifyOrder(order);
      runId = crypto.randomUUID();
      this.db.recordIntegrationRun({ id: runId, provider: 'shopify', operation: 'orders.sync', status: 'succeeded', recordsProcessed: orders.length, details: { apiVersion: version, testOrders: orders.filter((order) => order.test).length }, completedAt: new Date().toISOString() });
      return { provider: 'shopify', status: 'succeeded', recordsProcessed: orders.length };
    } catch (error) {
      this.db.recordIntegrationRun({ id: runId || crypto.randomUUID(), provider: 'shopify', operation: 'orders.sync', status: 'failed', errorCode: String(error.status || error.name || 'ERROR'), details: { message: error.message, startedAt }, completedAt: new Date().toISOString() });
      return { provider: 'shopify', status: 'failed', message: error.message };
    }
  }

  ingestShopifyOrder(order) {
    const money = order.current_total_price_set?.shop_money || order.total_price_set?.shop_money;
    if (!order.id || !money) return;
    const amountMinor = Math.round(Number(money.amount) * 100);
    if (!Number.isFinite(amountMinor)) return;
    const status = order.financial_status === 'paid' || order.financial_status === 'partially_paid' ? 'paid' : String(order.financial_status || 'pending');
    this.db.insertRevenueEvent({
      source: 'shopify',
      externalId: String(order.id),
      amountMinor: Math.max(0, amountMinor),
      currency: money.currency_code,
      grossMinor: Math.max(0, Math.round(Number(order.total_price_set?.shop_money?.amount || money.amount) * 100)),
      discountMinor: 0,
      taxMinor: 0,
      status,
      occurredAt: order.created_at,
      isDemo: Boolean(order.test),
      raw: { name: order.name, test: Boolean(order.test), financialStatus: order.financial_status, updatedAt: order.updated_at }
    });
  }

  async syncStripe() {
    const startedAt = new Date().toISOString();
    const key = this.config.stripe.secretKey;
    if (!/^sk_(live|test)_[A-Za-z0-9_-]+$/.test(key)) {
      const message = 'STRIPE_SECRET_KEY format is invalid.';
      this.db.recordIntegrationRun({ provider: 'stripe', operation: 'settlement.sync', status: 'failed', errorCode: 'INVALID_CONFIG', details: { message, startedAt }, completedAt: new Date().toISOString() });
      return { provider: 'stripe', status: 'failed', message };
    }
    try {
      const [balance, payouts] = await Promise.all([
        this.stripeRequest('/v1/balance'),
        this.stripeRequest('/v1/payouts?limit=100')
      ]);
      const payoutRows = Array.isArray(payouts.data) ? payouts.data : [];
      this.db.recordIntegrationRun({ provider: 'stripe', operation: 'settlement.sync', status: 'succeeded', recordsProcessed: payoutRows.length, details: { available: balance.available || [], pending: balance.pending || [], livemode: Boolean(balance.livemode) }, completedAt: new Date().toISOString() });
      return { provider: 'stripe', status: 'succeeded', recordsProcessed: payoutRows.length };
    } catch (error) {
      this.db.recordIntegrationRun({ provider: 'stripe', operation: 'settlement.sync', status: 'failed', errorCode: String(error.status || error.name || 'ERROR'), details: { message: error.message, startedAt }, completedAt: new Date().toISOString() });
      return { provider: 'stripe', status: 'failed', message: error.message };
    }
  }

  async stripeRequest(pathname) {
    if (!pathname.startsWith('/v1/')) throw new Error('Blocked Stripe path.');
    return fetchJson(`https://api.stripe.com${pathname}`, {
      headers: { Authorization: `Bearer ${this.config.stripe.secretKey}`, Accept: 'application/json' }
    });
  }

  async ethereumBalance(address, chainId) {
    if (!this.config.ethereum.rpcUrl) throw new Error('ETHEREUM_RPC_URL is not configured.');
    const rpc = new URL(this.config.ethereum.rpcUrl);
    const localRpc = ['localhost', '127.0.0.1', '::1'].includes(rpc.hostname);
    if (rpc.protocol !== 'https:' && !(rpc.protocol === 'http:' && localRpc)) {
      throw new Error('Ethereum RPC must use HTTPS except on localhost.');
    }
    const chain = Number(chainId) === 11155111 ? sepolia : Number(chainId) === 1 ? mainnet : null;
    if (!chain) throw new Error('Unsupported chain for RPC balance lookup.');
    const client = createPublicClient({ chain, transport: http(rpc.toString(), { timeout: 10_000, retryCount: 1 }) });
    const balance = await client.getBalance({ address });
    return { chainId: chain.id, address, balanceWei: balance.toString(), balanceEth: formatEther(balance), blockExplorer: chain.blockExplorers.default.url };
  }

  async marketPrices() {
    if (this.priceCache.data && this.priceCache.expiresAt > Date.now()) return this.priceCache.data;
    const ids = TOKEN_IDS.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${encodeURIComponent(ids)}`;
    const startedAt = new Date().toISOString();
    try {
      const body = await fetchJson(url, { headers: { Accept: 'application/json', 'User-Agent': 'Melodiespark-Command-Center/0.1' } }, 10_000);
      this.db.recordIntegrationRun({ provider: 'market-prices', operation: 'reference_prices.read', status: 'succeeded', recordsProcessed: Object.keys(body).length, details: { startedAt }, completedAt: new Date().toISOString() });
      this.priceCache = { data: body, expiresAt: Date.now() + 5 * 60_000 };
      return body;
    } catch (error) {
      this.db.recordIntegrationRun({ provider: 'market-prices', operation: 'reference_prices.read', status: 'failed', errorCode: String(error.status || error.name || 'ERROR'), details: { message: error.message, startedAt }, completedAt: new Date().toISOString() });
      throw error;
    }
  }

  verifyShopifyWebhook(rawBody, signature) {
    if (!this.config.shopify.webhookSecret) throw new Error('Shopify webhook secret is not configured.');
    if (!signature) throw new Error('Missing Shopify HMAC signature.');
    const expected = crypto.createHmac('sha256', this.config.shopify.webhookSecret).update(rawBody).digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(String(signature));
    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) throw new Error('Invalid Shopify webhook signature.');
  }

  async verifyStripeWebhook(rawBody, signatureHeader) {
    if (!this.config.stripe.webhookSecret) throw new Error('Stripe webhook secret is not configured.');
    const parts = String(signatureHeader || '').split(',').map((part) => part.trim().split('='));
    const timestamp = parts.find(([key]) => key === 't')?.[1];
    const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
    if (!timestamp || !signatures.length) throw new Error('Malformed Stripe-Signature header.');
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) throw new Error('Expired Stripe webhook signature.');
    const expected = crypto.createHmac('sha256', this.config.stripe.webhookSecret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
    const valid = signatures.some((signature) => {
      const a = Buffer.from(expected);
      const b = Buffer.from(signature);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (!valid) throw new Error('Invalid Stripe webhook signature.');
    return JSON.parse(rawBody.toString('utf8'));
  }

  ingestStripeEvent(event) {
    if (!event?.id || !event.type) return;
    const succeeded = ['payment_intent.succeeded', 'checkout.session.completed', 'charge.succeeded'].includes(event.type);
    if (!succeeded) return;
    const object = event.data?.object || {};
    const amountMinor = Number(object.amount_received ?? object.amount_total ?? object.amount);
    const currency = object.currency;
    if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || !currency) return;
    const status = object.status === 'paid' || object.paid === true || object.payment_status === 'paid' ? 'settled' : 'succeeded';
    this.db.insertRevenueEvent({
      source: 'stripe',
      externalId: String(event.id),
      amountMinor,
      currency,
      status,
      occurredAt: new Date(event.created * 1000).toISOString(),
      isDemo: Boolean(object.livemode === false),
      raw: { type: event.type, objectId: object.id, livemode: object.livemode }
    });
  }
}
