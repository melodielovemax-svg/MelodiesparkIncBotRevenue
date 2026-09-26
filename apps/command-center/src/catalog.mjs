export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet', currency: 'ETH', testnet: false },
  { id: 11155111, name: 'Sepolia', currency: 'ETH', testnet: true }
];

export const FIAT_CURRENCIES = [
  ['USD', 'US Dollar'], ['CAD', 'Canadian Dollar'], ['EUR', 'Euro'], ['JPY', 'Japanese Yen'],
  ['GBP', 'British Pound'], ['CHF', 'Swiss Franc'], ['AUD', 'Australian Dollar'], ['NZD', 'New Zealand Dollar'],
  ['CNY', 'Chinese Yuan'], ['HKD', 'Hong Kong Dollar'], ['SGD', 'Singapore Dollar'], ['KRW', 'South Korean Won'],
  ['INR', 'Indian Rupee'], ['BRL', 'Brazilian Real'], ['MXN', 'Mexican Peso'], ['ZAR', 'South African Rand'],
  ['SEK', 'Swedish Krona'], ['NOK', 'Norwegian Krone'], ['DKK', 'Danish Krone'], ['PLN', 'Polish Zloty'],
  ['CZK', 'Czech Koruna'], ['HUF', 'Hungarian Forint'], ['RON', 'Romanian Leu'], ['TRY', 'Turkish Lira'],
  ['AED', 'UAE Dirham'], ['SAR', 'Saudi Riyal'], ['ILS', 'Israeli Shekel'], ['THB', 'Thai Baht'],
  ['MYR', 'Malaysian Ringgit'], ['IDR', 'Indonesian Rupiah'], ['PHP', 'Philippine Peso'], ['VND', 'Vietnamese Dong'],
  ['CLP', 'Chilean Peso'], ['COP', 'Colombian Peso'], ['ARS', 'Argentine Peso']
].map(([code, name]) => ({ code, name }));

const tokenRows = [
  ['bitcoin', 'BTC', 'Bitcoin'], ['ethereum', 'ETH', 'Ethereum'], ['tether', 'USDT', 'Tether'],
  ['binancecoin', 'BNB', 'BNB'], ['solana', 'SOL', 'Solana'], ['usd-coin', 'USDC', 'USD Coin'],
  ['ripple', 'XRP', 'XRP'], ['dogecoin', 'DOGE', 'Dogecoin'], ['cardano', 'ADA', 'Cardano'],
  ['tron', 'TRX', 'TRON'], ['avalanche-2', 'AVAX', 'Avalanche'], ['chainlink', 'LINK', 'Chainlink'],
  ['polkadot', 'DOT', 'Polkadot'], ['matic-network', 'MATIC', 'Polygon'], ['litecoin', 'LTC', 'Litecoin'],
  ['uniswap', 'UNI', 'Uniswap'], ['internet-computer', 'ICP', 'Internet Computer'], ['near', 'NEAR', 'NEAR'],
  ['aptos', 'APT', 'Aptos'], ['cosmos', 'ATOM', 'Cosmos'], ['ethereum-classic', 'ETC', 'Ethereum Classic'],
  ['filecoin', 'FIL', 'Filecoin'], ['hedera-hashgraph', 'HBAR', 'Hedera'], ['algorand', 'ALGO', 'Algorand'],
  ['aave', 'AAVE', 'Aave'], ['stellar', 'XLM', 'Stellar'], ['immutable-x', 'IMX', 'Immutable'],
  ['the-graph', 'GRT', 'The Graph'], ['sandbox', 'SAND', 'The Sandbox'], ['decentraland', 'MANA', 'Decentraland'],
  ['axie-infinity', 'AXS', 'Axie Infinity'], ['the-sandbox', 'SAND', 'The Sandbox'], ['fantom', 'FTM', 'Fantom'],
  ['arbitrum', 'ARB', 'Arbitrum'], ['optimism', 'OP', 'Optimism'], ['celestia', 'TIA', 'Celestia'],
  ['injective-protocol', 'INJ', 'Injective'], ['sei-network', 'SEI', 'Sei'], ['render-token', 'RENDER', 'Render'],
  ['worldcoin-wld', 'WLD', 'Worldcoin'], ['jupiter-exchange-solana', 'JUP', 'Jupiter'],
  ['bonk', 'BONK', 'Bonk'], ['dogwifcoin', 'WIF', 'dogwifhat'], ['pepe', 'PEPE', 'Pepe'],
  ['shiba-inu', 'SHIB', 'Shiba Inu'], ['sui', 'SUI', 'Sui'], ['aptos', 'APT', 'Aptos'],
  ['stellar', 'XLM', 'Stellar'], ['curve-dao-token', 'CRV', 'Curve DAO'], ['maker', 'MKR', 'Maker']
];

export const TOKEN_CATALOG = [...new Map(tokenRows.map(([id, symbol, name]) => [id, { id, symbol, name }])).values()];
export const TOKEN_IDS = TOKEN_CATALOG.map((token) => token.id);

export const ARC_ANGELS = [
  ['AA-001', 'ZEUS-PRIME', 'Control', 'Authoritative orchestration and policy enforcement'],
  ['AA-002', 'BRAHMA-CORE', 'Creation', 'Versioned content and product draft generation'],
  ['AA-003', 'AETHER-OMEGA', 'Data', 'Validated synchronization and deduplication'],
  ['AA-004', 'CHRONOS-X', 'Scheduling', 'Bounded schedules, retries, and idempotency'],
  ['AA-005', 'NOVA-INTEL', 'Intelligence', 'Explainable recommendations and anomaly signals'],
  ['AA-006', 'TITAN-FORGE', 'Infrastructure', 'Build, health, and deployment readiness'],
  ['AA-007', 'SERAPH-LOCK', 'Security', 'Access control, validation, and threat response'],
  ['AA-008', 'LUX-ARC', 'Performance', 'Measured latency and resource optimization'],
  ['AA-009', 'ORION-NET', 'Connectivity', 'Typed integration adapters and health checks'],
  ['AA-010', 'VORTEX-TRADE', 'Finance', 'Read-only portfolio and settlement reporting'],
  ['AA-011', 'KARMA-CORE', 'Rewards', 'Auditable, non-transferable gameplay points'],
  ['AA-012', 'ETHEREUM-ARC', 'Blockchain', 'Wallet signatures and chain intent verification']
].map(([id, name, domain, description]) => ({ id, name, domain, description }));

export const GUARDIAN_DOMAINS = [
  ['REVENUE', 'Commerce revenue reconciliation'],
  ['DASHBOARD', 'Metrics and data presentation'],
  ['AUTOMATION', 'Safe workflow execution'],
  ['SECURITY', 'Security validation and response'],
  ['DATA', 'Data quality and retention'],
  ['API', 'External integration adapters'],
  ['AI', 'Explainable content assistance'],
  ['WALLET', 'Non-custodial wallet sessions'],
  ['LOGIC', 'Policy and workflow decisions'],
  ['MARKETING', 'Consent-aware campaign planning']
];

const prefixes = ['AURORA', 'NOVA', 'VESPER', 'SOLAR', 'LUMEN', 'CIPHER', 'EMBER', 'RIVER', 'ECHO', 'ATLAS', 'ORBIT', 'PRISM'];
const suffixes = ['WATCH', 'FORGE', 'BRIDGE', 'SCOPE', 'SHIELD', 'THREAD', 'GATE', 'MESH', 'BEACON', 'CURRENT'];

export function generateGuardianProfiles(count = 600) {
  const profiles = ARC_ANGELS.map((angel) => ({
    id: angel.id,
    name: angel.name,
    tier: 'arc_angel',
    domain: angel.domain,
    soulCore: 'policy-gated orchestration',
    role: angel.description,
    status: 'configured'
  }));

  const subGuardianCount = Math.max(0, count - profiles.length);
  for (let index = 0; index < subGuardianCount; index += 1) {
    const [domain, role] = GUARDIAN_DOMAINS[index % GUARDIAN_DOMAINS.length];
    const serial = String(index + 1).padStart(4, '0');
    const name = `${prefixes[index % prefixes.length]}-${suffixes[Math.floor(index / prefixes.length) % suffixes.length]}-${serial}`;
    profiles.push({
      id: `SG-${serial}`,
      name,
      tier: 'sub_guardian',
      domain,
      soulCore: `${domain.toLowerCase()}-verification-v1`,
      role,
      status: 'configured',
      enabled: false
    });
  }

  return profiles.slice(0, count);
}

export const SYSTEM_ARCHITECTURE = [
  ['Presentation', 'Responsive dashboard and accessible forms', 'Static HTML/CSS/JS; no financial authority'],
  ['Application API', 'Authentication, validation, audit, workflow dispatch', 'Node.js HTTP API'],
  ['Data', 'Revenue ledger, requests, tasks, guardian runs, audit events', 'SQLite local; PostgreSQL production schema'],
  ['Integrations', 'Shopify, Stripe, optional public price feed, optional RPC', 'Server-side fixed-host adapters'],
  ['Wallet', 'Connect, sign challenge, sign withdrawal intent', 'Browser wallet; viem verification'],
  ['Governance', 'Feature gates, human approval, legal and operational boundaries', 'Policy rules and immutable audit log']
];

export const STARTER_PRODUCTS = [
  { sku: 'SVC-COMMERCE-AUDIT', title: 'Commerce Operations Audit', priceCad: 149900, type: 'service', status: 'draft' },
  { sku: 'SVC-SHOPIFY-INTEGRATION', title: 'Shopify Integration Sprint', priceCad: 299900, type: 'service', status: 'draft' },
  { sku: 'SVC-WALLET-READINESS', title: 'Wallet Security Readiness Review', priceCad: 199900, type: 'service', status: 'draft' },
  { sku: 'SVC-COMPLIANCE-MAP', title: 'Compliance Requirements Map', priceCad: 249900, type: 'service', status: 'draft' },
  { sku: 'DOC-API-ARCHITECTURE', title: 'API Architecture Workbook', priceCad: 7900, type: 'digital', status: 'draft' },
  { sku: 'DOC-SECURITY-CHECKLIST', title: 'Small-Team Security Checklist', priceCad: 4900, type: 'digital', status: 'draft' },
  { sku: 'TPL-WORKFLOW-AUDIT', title: 'Auditable Workflow Templates', priceCad: 9900, type: 'template', status: 'draft' },
  { sku: 'TPL-SEO-BRIEF', title: 'Ethical SEO Content Brief Pack', priceCad: 5900, type: 'template', status: 'draft' }
];
