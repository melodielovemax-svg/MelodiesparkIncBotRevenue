const state = {
  config: null,
  auth: { authenticated: false, setupRequired: true, user: null },
  csrf: sessionStorage.getItem('ms_csrf') || null,
  wallet: readWallet(),
  section: 'overview',
  guardianSearch: '',
  busy: new Set()
};

const sectionMeta = {
  overview: ['Operational truth', 'Overview'],
  revenue: ['Reconciliation ledger', 'Revenue'],
  wallet: ['Non-custodial boundary', 'Wallet'],
  guardians: ['Measured orchestration', 'Guardians'],
  workflows: ['Bounded execution', 'Workflows'],
  store: ['Human-reviewed commerce', 'Store'],
  karma: ['Engagement ledger', 'Karma'],
  integrations: ['Server-side adapters', 'Integrations'],
  security: ['Blue Light Fortress', 'Security'],
  architecture: ['Protocol boundaries', 'Architecture'],
  legal: ['Operational honesty', 'Legal & Safety']
};

function readWallet() {
  try { return JSON.parse(localStorage.getItem('ms_wallet') || 'null'); } catch { return null; }
}

function saveWallet(wallet) {
  state.wallet = wallet;
  if (wallet) localStorage.setItem('ms_wallet', JSON.stringify(wallet));
  else localStorage.removeItem('ms_wallet');
  updateWalletLabels();
}

function updateWalletLabels() {
  const button = document.querySelector('#wallet-button');
  if (!button) return;
  button.textContent = state.wallet?.verified ? `${state.wallet.address.slice(0, 6)}…${state.wallet.address.slice(-4)}` : 'Connect wallet';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function relativeTime(value) {
  if (!value) return 'never';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second');
  if (Math.abs(seconds) < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (Math.abs(seconds) < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}

function moneyMinor(amountMinor, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'code' }).format(Number(amountMinor) / 100);
  } catch {
    return `${(Number(amountMinor) / 100).toFixed(2)} ${currency}`;
  }
}

function statusChip(status) {
  const normalized = String(status || 'unknown').toLowerCase();
  const style = ['succeeded', 'success', 'paid', 'settled', 'active', 'verified'].some((item) => normalized.includes(item)) ? 'success'
    : ['failed', 'error', 'denied', 'blocked'].some((item) => normalized.includes(item)) ? 'danger'
      : ['partial', 'pending', 'awaiting', 'configured', 'review'].some((item) => normalized.includes(item)) ? 'warning' : 'subtle';
  return `<span class="chip ${style}">${escapeHtml(normalized.replaceAll('_', ' '))}</span>`;
}

function toast(title, message = '', type = 'info') {
  const region = document.querySelector('#toast-region');
  const element = document.createElement('div');
  element.className = `toast ${type === 'error' ? 'error' : ''}`;
  element.innerHTML = `<strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ''}`;
  region.append(element);
  setTimeout(() => element.remove(), 5200);
}

async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD'].includes(method) && state.csrf) headers['X-CSRF-Token'] = state.csrf;
  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
    signal
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : { error: { message: await response.text() } };
  if (!response.ok) {
    const error = new Error(payload.error?.message || `Request failed (${response.status}).`);
    error.status = response.status;
    error.code = payload.error?.code;
    error.details = payload.error?.details;
    throw error;
  }
  return payload;
}

function requireLogin() {
  if (state.auth.authenticated) return true;
  document.querySelector('#login-dialog').showModal();
  return false;
}

async function withBusy(key, operation) {
  if (state.busy.has(key)) return;
  state.busy.add(key);
  document.querySelectorAll(`[data-action="${key}"]`).forEach((button) => { button.disabled = true; });
  try { return await operation(); }
  finally {
    state.busy.delete(key);
    document.querySelectorAll(`[data-action="${key}"]`).forEach((button) => { button.disabled = false; });
  }
}

async function loadAuth() {
  const status = await api('/api/auth/status');
  state.auth = status;
  if (status.csrfToken) {
    state.csrf = status.csrfToken;
    sessionStorage.setItem('ms_csrf', status.csrfToken);
  }
  const button = document.querySelector('#login-button');
  button.textContent = status.authenticated ? status.user.role : status.setupRequired ? 'Setup required' : 'Administrator';
  document.querySelector('#login-setup-note').textContent = status.setupRequired
    ? 'No administrator password is configured. Run .\\Start-Melodiespark.ps1 -SetPassword, then reload.'
    : 'Uses the password configured by the local operator. No shared withdrawal password exists.';
}

async function loadConfig() {
  state.config = await api('/api/config');
  const mode = document.querySelector('#mode-chip');
  mode.textContent = `${state.config.mode} mode`;
  mode.className = `chip ${state.config.mode === 'live' ? 'warning' : 'success'}`;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

async function checkHealth() {
  const dot = document.querySelector('#sidebar-health-dot');
  const label = document.querySelector('#sidebar-health');
  try {
    const health = await api('/api/health');
    dot.className = `status-dot ${health.status === 'ok' ? 'ok' : 'error'}`;
    label.textContent = `Local service ${health.status}`;
  } catch {
    dot.className = 'status-dot error';
    label.textContent = 'Local service unavailable';
  }
}

function metricCard(label, value, note, color = 'var(--cyan)') {
  const colorClasses = {
    'var(--cyan)': 'metric-cyan',
    'var(--green)': 'metric-green',
    'var(--blue)': 'metric-blue',
    'var(--amber)': 'metric-amber',
    'var(--red)': 'metric-red'
  };
  return `<article class="metric-card ${colorClasses[color] || 'metric-cyan'}"><p class="metric-label">${escapeHtml(label)}</p><strong class="metric-value">${escapeHtml(value)}</strong><span class="metric-note">${escapeHtml(note)}</span></article>`;
}

function renderMetrics(target, cards) {
  document.querySelector(target).innerHTML = cards.map((card) => metricCard(card.label, card.value, card.note, card.color)).join('');
}

async function loadOverview() {
  const [dashboard, revenue] = await Promise.all([api('/api/dashboard'), api('/api/revenue?limit=8')]);
  const currencyCount = dashboard.revenue.byCurrency.length;
  const settled = dashboard.revenue.byCurrency.reduce((sum, row) => sum + row.settledMinor, 0);
  const workflowRate = dashboard.workflows.sevenDay.total
    ? Math.round((dashboard.workflows.sevenDay.succeeded / dashboard.workflows.sevenDay.total) * 100)
    : 0;
  renderMetrics('#metric-grid', [
    { label: 'Ledger events', value: String(dashboard.revenue.totalRecords), note: 'Demo and verified events remain labeled', color: 'var(--cyan)' },
    { label: 'Settled records', value: currencyCount ? `${currencyCount} currencies` : 'None', note: currencyCount ? `${moneyMinor(settled, 'USD')} shown only as a count context` : 'Connect a payment source', color: 'var(--green)' },
    { label: 'Workflow success', value: `${workflowRate}%`, note: 'Measured over seven days', color: 'var(--blue)' },
    { label: 'Pending intents', value: String(dashboard.pendingWithdrawals), note: 'No funds are moved automatically', color: 'var(--amber)' }
  ]);
  document.querySelector('#currency-summary').innerHTML = dashboard.revenue.byCurrency.length
    ? dashboard.revenue.byCurrency.map((row) => `<div class="currency-card"><span class="chip subtle">${escapeHtml(row.currency)}</span><strong>${escapeHtml(moneyMinor(row.settledMinor, row.currency))}</strong><span class="metric-note">${row.records} event${row.records === 1 ? '' : 's'}</span></div>`).join('')
    : '<div class="empty-state"><p>No revenue events are recorded.</p></div>';
  document.querySelector('#integration-summary').innerHTML = Object.entries(dashboard.integrations).map(([name, value]) => `<div class="status-row"><span>${escapeHtml(name.replaceAll(/[-_]/g, ' '))}</span>${statusChip(value.configured ? (value.lastRun?.status || 'configured') : 'not configured')}</div>`).join('');
  renderWorkflowTimeline(dashboard.workflows.recent);
  renderRevenueRows(revenue.items);
}

function renderWorkflowTimeline(items) {
  const target = document.querySelector('#recent-workflows');
  target.innerHTML = items.length ? items.map((item) => `<div class="timeline-row"><span class="status-dot ${item.status === 'succeeded' ? 'ok' : ''}"></span><div class="timeline-main"><strong>${escapeHtml(item.cycle_id)}</strong><small>${item.tasks_succeeded}/${item.tasks_total} tasks · ${item.tasks_failed} failed · ${relativeTime(item.completed_at)}</small></div>${statusChip(item.status)}</div>`).join('') : '<div class="empty-state"><p>No safe workflow cycle has run yet.</p></div>';
}

function renderRevenueRows(items) {
  const target = document.querySelector('#revenue-table');
  target.innerHTML = items.length ? items.map((item) => `<tr><td>${escapeHtml(item.source)}</td><td><code>${escapeHtml(item.external_id)}</code></td><td>${escapeHtml(moneyMinor(item.amount_minor, item.currency))}</td><td>${statusChip(item.status)}</td><td>${escapeHtml(formatDate(item.occurred_at))}</td><td>${item.is_demo ? '<span class="chip warning">Demo</span>' : '<span class="chip success">Source record</span>'}</td></tr>`).join('') : '<tr><td colspan="6">No revenue records.</td></tr>';
}

async function loadRevenue() {
  const revenue = await api('/api/revenue?limit=100');
  renderMetrics('#revenue-metrics', [
    { label: 'Events', value: String(revenue.summary.totalRecords), note: 'Current local ledger' },
    { label: 'Currencies', value: String(revenue.summary.byCurrency.length), note: 'Never summed without FX accounting' },
    { label: 'Demo events', value: String(revenue.items.filter((item) => item.is_demo).length), note: 'Visible sample page only' },
    { label: 'Settled events', value: String(revenue.items.filter((item) => ['settled', 'paid', 'succeeded'].includes(item.status)).length), note: 'Based on source status labels' }
  ]);
  renderRevenueRows(revenue.items);
}

async function loadWallet() {
  renderWalletState();
  const balanceTarget = document.querySelector('#wallet-balance');
  if (!state.wallet?.verified) {
    balanceTarget.innerHTML = '<span>◇</span><p>Connect a verified wallet, then request a read-only RPC balance.</p>';
  } else {
    balanceTarget.innerHTML = '<p>Wallet verified. Request a read-only balance when an RPC endpoint is configured.</p><div class="wallet-actions"><button class="button secondary compact" type="button" data-action="request-balance">Read native ETH balance</button></div>';
  }
  const list = document.querySelector('#withdrawal-list');
  if (!state.auth.authenticated) {
    list.innerHTML = '<div class="empty-state"><p>Administrator sign-in is required to view authorization records.</p></div>';
    return;
  }
  const response = await api('/api/withdrawals?limit=50');
  list.innerHTML = response.items.length ? response.items.map((item) => `<div class="record-row"><div class="record-main"><strong>${escapeHtml(item.amount_display)} ${escapeHtml(item.asset)} → ${escapeHtml(item.destination)}</strong><small>${escapeHtml(item.id)} · ${escapeHtml(formatDate(item.created_at))} · provider: ${escapeHtml(item.provider)}</small></div>${statusChip(item.status)}</div>`).join('') : '<div class="empty-state"><p>No withdrawal intents have been created.</p></div>';
}

function renderWalletState() {
  const target = document.querySelector('#wallet-state');
  if (!state.wallet?.address) {
    target.innerHTML = '<div class="empty-state"><span>◇</span><p>MetaMask is not connected.</p></div>';
    return;
  }
  target.innerHTML = `<div class="wallet-address"><span>${state.wallet.verified ? '✓' : '…'}</span><strong>${escapeHtml(state.wallet.address)}</strong></div><div class="status-row"><span>Chain ID</span><strong>${escapeHtml(state.wallet.chainId)}</strong></div><div class="status-row"><span>Verification</span>${statusChip(state.wallet.verified ? 'verified' : 'unverified')}</div><p class="muted">The connection is stored only in this browser. It is cleared when local storage is removed.</p>`;
}

async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask or another injected EVM wallet was not detected.');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No wallet account was selected.');
  const address = accounts[0];
  const chainId = Number.parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
  saveWallet({ address, chainId, verified: false, connectedAt: new Date().toISOString() });
  const challenge = await api(`/api/wallet/challenge?address=${encodeURIComponent(address)}&chainId=${chainId}`);
  const signature = await window.ethereum.request({ method: 'personal_sign', params: [challenge.hexMessage, address] });
  const verified = await api('/api/wallet/verify', { method: 'POST', body: { challengeId: challenge.id, signature } });
  saveWallet({ address: verified.address, chainId: verified.chainId, verified: true, connectedAt: state.wallet.connectedAt });
  toast('Wallet verified', 'No transaction was submitted.');
  if (state.section === 'wallet') loadSection('wallet');
}

async function requestBalance() {
  if (!requireLogin() || !state.wallet?.verified) return;
  const result = await api('/api/wallet/balance', { method: 'POST', body: { address: state.wallet.address, chainId: state.wallet.chainId } });
  document.querySelector('#wallet-balance').innerHTML = `<div class="currency-card"><span class="chip success">Read only</span><strong>${escapeHtml(result.balanceEth)} ETH</strong><span class="metric-note">Chain ${result.chainId} · ${escapeHtml(result.address)}</span></div><p class="muted">This balance is informational and not an executable quote.</p>`;
}

function openWithdrawalDialog() {
  if (!requireLogin() || !state.wallet?.verified) {
    if (!state.wallet?.verified) toast('Wallet required', 'Connect and verify a wallet first.', 'error');
    return;
  }
  const form = document.querySelector('#withdrawal-form');
  form.elements.chainId.value = String(state.wallet.chainId);
  form.elements.destination.value = state.wallet.address;
  document.querySelector('#withdrawal-error').hidden = true;
  document.querySelector('#withdrawal-dialog').showModal();
}

async function submitWithdrawal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorTarget = document.querySelector('#withdrawal-error');
  errorTarget.hidden = true;
  try {
    const chainId = Number(form.elements.chainId.value);
    const amountEth = form.elements.amountEth.value;
    const destination = form.elements.destination.value;
    const intent = await api('/api/withdrawal-intents', { method: 'POST', body: { chainId, amountEth, destination } });
    const signature = await window.ethereum.request({ method: 'personal_sign', params: [intent.hexMessage, destination] });
    const result = await api(`/api/withdrawal-intents/${encodeURIComponent(intent.id)}/sign`, { method: 'POST', body: { signature } });
    document.querySelector('#withdrawal-dialog').close();
    form.reset();
    toast('Authorization intent verified', `Funds moved: ${result.fundsMoved ? 'yes' : 'no'}.`);
    loadSection('wallet');
  } catch (error) {
    errorTarget.textContent = error.message;
    errorTarget.hidden = false;
  }
}

async function loadGuardians() {
  const [guardians, leaderboard] = await Promise.all([api('/api/guardians?limit=600'), api('/api/leaderboard?limit=20')]);
  renderMetrics('#guardian-metrics', [
    { label: 'Arc Angels', value: String(guardians.counts.arc_angel || 0), note: 'Policy-gated controllers' },
    { label: 'Guardians', value: String(guardians.counts.guardian || 0), note: 'Functional profiles' },
    { label: 'Sub-Guardians', value: String(guardians.counts.sub_guardian || 0), note: 'Disabled until assigned' },
    { label: 'Ranked modules', value: String(leaderboard.items.length), note: 'Only modules with real runs' }
  ]);
  renderGuardianRows(guardians.items);
  const leaderboardTarget = document.querySelector('#leaderboard');
  leaderboardTarget.innerHTML = leaderboard.items.length ? leaderboard.items.map((item, index) => `<div class="leaderboard-row"><span class="rank">${index + 1}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.domain)} · ${item.successful_runs}/${item.runs} successful</small></div><span class="chip subtle">${item.average_latency_ms} ms</span></div>`).join('') : '<div class="empty-state"><p>No measured runs yet. Run a safe cycle to create evidence.</p></div>';
  document.querySelector('#guardian-search').oninput = (event) => { state.guardianSearch = event.target.value.toLowerCase(); renderGuardianRows(guardians.items); };
}

function renderGuardianRows(items) {
  const filtered = items.filter((item) => !state.guardianSearch || `${item.id} ${item.name} ${item.domain} ${item.role}`.toLowerCase().includes(state.guardianSearch));
  document.querySelector('#guardian-table').innerHTML = filtered.slice(0, 600).map((item) => `<tr><td><code>${escapeHtml(item.id)}</code></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.tier.replaceAll('_', ' '))}</td><td>${escapeHtml(item.domain)}</td><td>${statusChip(item.status)}</td></tr>`).join('') || '<tr><td colspan="5">No profiles match the filter.</td></tr>';
}

async function loadWorkflows() {
  const response = await api('/api/workflows?limit=50');
  const total = response.items.length;
  const succeeded = response.items.filter((item) => item.status === 'succeeded').length;
  const taskCount = response.items.reduce((sum, item) => sum + Number(item.tasks_total), 0);
  const average = total ? Math.round(response.items.reduce((sum, item) => sum + (new Date(item.completed_at) - new Date(item.started_at)), 0) / total) : 0;
  renderMetrics('#workflow-metrics', [
    { label: 'Recent cycles', value: String(total), note: 'Local evidence' },
    { label: 'Fully successful', value: String(succeeded), note: 'No failures permitted' },
    { label: 'Tasks observed', value: String(taskCount), note: 'Health and validation only' },
    { label: 'Average duration', value: `${average} ms`, note: 'Measured wall-clock time' }
  ]);
  document.querySelector('#workflow-list').innerHTML = response.items.length ? response.items.map((item) => `<div class="record-row"><div class="record-main"><strong>${escapeHtml(item.cycle_id)}</strong><small>${escapeHtml(item.id)} · ${item.tasks_succeeded}/${item.tasks_total} succeeded · ${item.tasks_failed} failed · ${escapeHtml(formatDate(item.completed_at))}</small></div>${statusChip(item.status)}</div>`).join('') : '<div class="empty-state"><p>No cycle has run. Use “Run one cycle” to generate local evidence.</p></div>';
}

async function loadStore() {
  const response = await api('/api/products?limit=200');
  document.querySelector('#product-table').innerHTML = response.items.length ? response.items.map((item) => `<tr><td><code>${escapeHtml(item.sku)}</code></td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.product_type)}</td><td>${escapeHtml(moneyMinor(item.price_minor, item.currency))}</td><td>${statusChip(item.status)}</td></tr>`).join('') : '<tr><td colspan="5">No product drafts.</td></tr>';
}

async function loadKarma() {
  const response = await api('/api/karma');
  renderMetrics('#karma-metrics', [
    { label: 'Karma balance', value: String(response.balance), note: 'Internal points' },
    { label: 'Transferable', value: response.transferable ? 'Yes' : 'No', note: 'No token conversion enabled' },
    { label: 'Ledger entries', value: String(response.ledger.length), note: 'Verified events only' },
    { label: 'Cash value', value: '$0', note: 'No promise or redemption' }
  ]);
}

async function loadIntegrations() {
  const status = await api('/api/integrations/status');
  const descriptions = {
    shopify: 'Server-side order and product read access with optional signed webhooks.',
    stripe: 'Balance and payout visibility. Webhooks provide the auditable revenue ledger.',
    paypal: 'OAuth integration is intentionally blocked until an approved application is configured server-side.',
    marketPrices: 'Public USD reference prices only; never an execution quote.',
    ethereumRpc: 'Optional read-only RPC for native ETH balances on supported chains.'
  };
  document.querySelector('#integration-grid').innerHTML = Object.entries(status).map(([name, value]) => `<article class="integration-card"><div>${statusChip(value.configured ? (value.lastRun?.status || 'configured') : 'not configured')}</div><h3>${escapeHtml(name.replaceAll(/[-_]/g, ' '))}</h3><p>${escapeHtml(descriptions[name] || '')}</p><div class="capability-list">${(value.capabilities || []).map((capability) => `<span>${escapeHtml(capability)}</span>`).join('')}</div>${value.blocker ? `<p class="muted">${escapeHtml(value.blocker)}</p>` : ''}</article>`).join('');
}

async function loadSecurity() {
  if (!requireLogin()) {
    document.querySelector('#security-summary').innerHTML = '';
    document.querySelector('#security-findings').innerHTML = '<div class="empty-state"><p>Administrator sign-in is required for configuration findings and audit logs.</p></div>';
    document.querySelector('#audit-list').innerHTML = '';
    return;
  }
  const [scan, audit] = await Promise.all([api('/api/security/scan'), api('/api/audit?limit=50')]);
  const critical = scan.findings.filter((item) => ['critical', 'high'].includes(item.severity)).length;
  renderMetrics('#security-summary', [
    { label: 'High/Critical', value: String(critical), note: 'Configuration findings', color: critical ? 'var(--red)' : 'var(--green)' },
    { label: 'Other findings', value: String(scan.findings.length - critical), note: 'Review before production' },
    { label: 'Webhooks', value: state.config.remoteWebhooksEnabled ? 'Enabled' : 'Disabled', note: 'Signed events only' },
    { label: 'Transfer engine', value: 'Off', note: 'No fund movement path' }
  ]);
  document.querySelector('#security-findings').innerHTML = scan.findings.length ? scan.findings.map((item) => `<div class="record-row"><div class="record-main"><strong>${escapeHtml(item.message)}</strong><small>${escapeHtml(item.id)}</small></div>${statusChip(item.severity)}</div>`).join('') : '<div class="empty-state"><p>No local configuration findings.</p></div>';
  renderAudit(audit.items);
}

function renderAudit(items) {
  document.querySelector('#audit-list').innerHTML = items.length ? items.map((item) => `<div class="record-row"><div class="record-main"><strong>${escapeHtml(item.action)}</strong><small>${escapeHtml(item.actor_type)} · ${escapeHtml(item.resource_type || 'system')} · ${escapeHtml(formatDate(item.created_at))}</small></div>${statusChip(item.outcome)}</div>`).join('') : '<div class="empty-state"><p>No audit events.</p></div>';
}

async function loadArchitecture() {
  const response = await api('/api/architecture');
  document.querySelector('#architecture-list').innerHTML = response.layers.map(([name, purpose, boundary]) => `<div class="architecture-row"><strong>${escapeHtml(name)}</strong><p>${escapeHtml(purpose)}</p><span class="chip subtle">${escapeHtml(boundary)}</span></div>`).join('');
}

async function loadPrices() {
  const target = document.querySelector('#price-output');
  target.innerHTML = '<p>Fetching public reference prices…</p>';
  try {
    const response = await api('/api/market/prices');
    const entries = Object.entries(response.prices).slice(0, 50);
    target.className = 'table-scroll';
    target.innerHTML = `<table><thead><tr><th>Asset ID</th><th>USD reference</th><th>Source</th></tr></thead><tbody>${entries.map(([id, price]) => `<tr><td><code>${escapeHtml(id)}</code></td><td>${escapeHtml(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(price.usd))}</td><td>CoinGecko</td></tr>`).join('')}</tbody></table>`;
  } catch (error) {
    target.className = 'empty-state';
    target.innerHTML = `<span>↗</span><p>${escapeHtml(error.message)}</p>`;
  }
}

async function runSafeCycle() {
  if (!requireLogin()) return;
  const result = await withBusy('run-cycle', () => api('/api/workflows/run', { method: 'POST', body: {} }));
  toast('Safe cycle complete', `${result.tasksSucceeded}/${result.tasksTotal} tasks succeeded.`);
  loadSection(state.section);
}

async function syncSources() {
  if (!requireLogin()) return;
  const result = await withBusy('sync', () => api('/api/integrations/sync', { method: 'POST', body: {} }));
  toast('Sync complete', result.message || `${result.results.length} configured source(s) checked.`);
  loadSection(state.section);
}

async function securityScan() {
  if (!requireLogin()) return;
  const result = await withBusy('security-scan', () => api('/api/security/scan'));
  toast('Local scan complete', `${result.findings.length} finding(s).`);
  loadSecurity();
}

async function loadAudit() {
  if (!requireLogin()) return;
  const response = await api('/api/audit?limit=50');
  renderAudit(response.items);
}

async function createProduct(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  const form = event.currentTarget;
  const data = new FormData(form);
  const priceMinor = Math.round(Number(data.get('priceCad')) * 100);
  await withBusy('create-product', () => api('/api/products/drafts', {
    method: 'POST',
    body: { title: data.get('title'), sku: data.get('sku'), type: data.get('type'), priceMinor, description: data.get('description') }
  }));
  form.reset();
  toast('Draft created', 'It remains unpublished until human review.');
  loadStore();
}

const loaders = {
  overview: loadOverview,
  revenue: loadRevenue,
  wallet: loadWallet,
  guardians: loadGuardians,
  workflows: loadWorkflows,
  store: loadStore,
  karma: loadKarma,
  integrations: loadIntegrations,
  security: loadSecurity,
  architecture: loadArchitecture,
  legal: async () => {}
};

async function loadSection(section) {
  try {
    await loaders[section]();
  } catch (error) {
    toast('Section unavailable', error.message, 'error');
  }
}

function navigate(section) {
  if (!sectionMeta[section]) section = 'overview';
  state.section = section;
  document.querySelectorAll('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== section; });
  document.querySelectorAll('.nav-list a').forEach((link) => link.classList.toggle('active', link.dataset.section === section));
  document.querySelector('#section-title').textContent = sectionMeta[section][1];
  document.querySelector('#section-eyebrow').textContent = sectionMeta[section][0];
  document.querySelector('#menu-button').setAttribute('aria-expanded', 'false');
  document.querySelector('.sidebar').classList.remove('open');
  history.replaceState(null, '', `#${section}`);
  loadSection(section);
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorTarget = document.querySelector('#login-error');
  errorTarget.hidden = true;
  try {
    const data = new FormData(form);
    const result = await api('/api/auth/login', { method: 'POST', body: { email: data.get('email'), password: data.get('password') } });
    state.auth = { authenticated: true, setupRequired: false, user: result.user };
    state.csrf = result.csrfToken;
    sessionStorage.setItem('ms_csrf', result.csrfToken);
    document.querySelector('#login-dialog').close();
    form.reset();
    document.querySelector('#login-button').textContent = result.user.role;
    toast('Signed in', 'Security token stored for this browser tab.');
    loadSection(state.section);
  } catch (error) {
    errorTarget.textContent = error.message;
    errorTarget.hidden = false;
  }
}

document.addEventListener('click', async (event) => {
  const nav = event.target.closest('[data-nav]');
  if (nav) { navigate(nav.dataset.nav); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const name = action.dataset.action;
  try {
    if (name === 'connect-wallet') await withBusy('connect-wallet', connectWallet);
    if (name === 'request-balance') await withBusy('request-balance', requestBalance);
    if (name === 'new-withdrawal') openWithdrawalDialog();
    if (name === 'run-cycle') await runSafeCycle();
    if (name === 'sync') await syncSources();
    if (name === 'security-scan') await securityScan();
    if (name === 'load-audit') await loadAudit();
    if (name === 'load-prices') await withBusy('load-prices', loadPrices);
    if (name === 'export-revenue') {
      if (!requireLogin()) return;
      window.location.assign('/api/revenue/export.csv');
    }
  } catch (error) {
    toast('Action failed', error.message, 'error');
  }
});

document.querySelector('#login-button').addEventListener('click', () => {
  if (state.auth.authenticated) {
    document.querySelector('#login-dialog').showModal();
  } else {
    document.querySelector('#login-dialog').showModal();
  }
});
document.querySelector('#wallet-button').addEventListener('click', () => document.querySelector('#wallet-button').blur());
document.querySelector('#wallet-button').addEventListener('click', async () => {
  try { await withBusy('connect-wallet', connectWallet); } catch (error) { toast('Wallet connection failed', error.message, 'error'); }
});
document.querySelector('#refresh-button').addEventListener('click', () => loadSection(state.section));
document.querySelector('#login-form').addEventListener('submit', login);
document.querySelector('#withdrawal-form').addEventListener('submit', submitWithdrawal);
document.querySelector('#product-form').addEventListener('submit', createProduct);
document.querySelector('#menu-button').addEventListener('click', (event) => {
  const sidebar = document.querySelector('.sidebar');
  const open = sidebar.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
document.querySelector('#theme-button').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = current;
  localStorage.setItem('ms_theme', current);
});
window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'overview'));

if (window.ethereum?.on) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (!accounts.length) saveWallet(null);
    else if (state.wallet?.address !== accounts[0]) saveWallet({ address: accounts[0], chainId: Number.parseInt(state.wallet?.chainId || '1', 10), verified: false, connectedAt: new Date().toISOString() });
    if (state.section === 'wallet') loadWallet();
  });
  window.ethereum.on('chainChanged', (chainId) => {
    if (state.wallet) saveWallet({ ...state.wallet, chainId: Number.parseInt(chainId, 16), verified: false });
    if (state.section === 'wallet') loadWallet();
  });
}

async function start() {
  document.documentElement.dataset.theme = localStorage.getItem('ms_theme') || 'dark';
  updateWalletLabels();
  await Promise.all([loadConfig(), loadAuth()]);
  checkHealth();
  navigate(location.hash.slice(1) || 'overview');
}
start().catch((error) => toast('Startup failed', error.message, 'error'));
