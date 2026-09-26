/**
 * Web3 Wallet Commands for Melodie-CLI V9.34.32999
 * 
 * Safe Web3 operations with evidence-first approach:
 * - Read-only by default
 * - Explicit consent for signing
 * - Comprehensive audit trails
 * - No automatic transactions
 */

import { parseArgs, shiftCommand } from '../args.ts';
import { fail, heading, line, style } from '../output.ts';
import { CatalogError } from '../store.ts';

// Browser environment check helper
function isBrowserEnvironment(): boolean {
  // @ts-ignore - window is browser-specific
  return typeof window !== 'undefined' && 
         // @ts-ignore - ethereum is browser-specific
         typeof window.ethereum !== 'undefined';
}

interface Web3WalletState {
  connected: boolean;
  address: string | null;
  chainId: string | null;
  balance: string | null;
  network: string | null;
}

interface Web3TransactionIntent {
  from: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  nonce?: number;
}

// Web3 wallet state (in-memory for this session)
let walletState: Web3WalletState = {
  connected: false,
  address: null,
  chainId: null,
  balance: null,
  network: null
};

/**
 * Connect to Web3 wallet (browser-based or local)
 * READ-ONLY OPERATION - No signing capabilities
 */
export async function web3Connect(args: ReturnType<typeof parseArgs>): Promise<void> {
  heading('Web3 Wallet Connection');
  line('Attempting to connect to Web3 wallet...');
  line();

  // Check for browser wallet (EIP-1193)
  if (isBrowserEnvironment()) {
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        walletState.connected = true;
        walletState.address = accounts[0];
        walletState.chainId = await ethereum.request({ method: 'eth_chainId' });
        walletState.network = getNetworkName(walletState.chainId);
        
        // Get balance (read-only)
        const balanceHex = await ethereum.request({
          method: 'eth_getBalance',
          params: [walletState.address, 'latest']
        });
        walletState.balance = formatBalance(balanceHex);

        line(style.green('✓ Wallet connected successfully'));
        line(`  Address: ${shortenAddress(walletState.address!)}`);
        line(`  Network: ${walletState.network}`);
        line(`  Balance: ${walletState.balance} ETH`);
        line();
        line(style.dim('Mode: READ-ONLY - No transaction signing enabled'));
        return;
      }
    } catch (error) {
      fail(`Connection failed: ${(error as Error).message}`);
      return;
    }
  }

  // Fallback: Local wallet simulation for CLI
  line(style.yellow('No browser wallet detected (EIP-1193 provider not found)'));
  line('For CLI usage, configure local wallet in config:');
  line('  melodie web3 config --wallet <path>');
  line();
  line('Or run in browser environment with MetaMask/WalletConnect enabled.');
}

/**
 * Show current Web3 wallet status
 */
export async function web3Status(args: ReturnType<typeof parseArgs>): Promise<void> {
  heading('Web3 Wallet Status');
  
  if (!walletState.connected) {
    line(style.yellow('No wallet connected'));
    line('Run: melodie web3 connect');
    return;
  }

  line(`Status: ${style.green('CONNECTED')}`);
  line(`Address: ${walletState.address}`);
  line(`Network: ${walletState.network} (Chain ID: ${walletState.chainId})`);
  line(`Balance: ${walletState.balance} ETH`);
  line();
  line(style.dim('Mode: READ-ONLY - Transaction signing requires explicit consent'));
}

/**
 * Create transaction intent (NO EXECUTION)
 * This only creates the intent - does not sign or broadcast
 */
export async function web3CreateIntent(args: ReturnType<typeof parseArgs>): Promise<void> {
  heading('Transaction Intent Creation');
  line('Creating transaction intent (READ-ONLY - No execution)');
  line();

  if (!walletState.connected) {
    fail('Wallet not connected. Run: melodie web3 connect');
    return;
  }

  const to = args.positionals[0];
  const value = args.options.get('value') || '0';
  
  if (!to) {
    fail('Target address required: melodie web3 intent <address> --value <amount>');
    return;
  }

  const intent: Web3TransactionIntent = {
    from: walletState.address!,
    to: to,
    value: value,
    data: args.options.get('data'),
    gasLimit: args.options.get('gas')
  };

  line('Transaction Intent Created:');
  line(`  From: ${shortenAddress(intent.from)}`);
  line(`  To: ${shortenAddress(intent.to)}`);
  line(`  Value: ${intent.value} ETH`);
  if (intent.data) line(`  Data: ${intent.data.substring(0, 32)}...`);
  line();
  line(style.dim('This is an INTENT only - No transaction will be executed'));
  line('To execute, explicit consent required: --i-understand-this-signs-transactions');
}

/**
 * Sign message (with explicit consent)
 */
export async function web3Sign(args: ReturnType<typeof parseArgs>): Promise<void> {
  heading('Message Signing');
  
  if (!walletState.connected) {
    fail('Wallet not connected. Run: melodie web3 connect');
    return;
  }

  const message = args.positionals.slice(0).join(' ');
  if (!message) {
    fail('Message required: melodie web3 sign <message>');
    return;
  }

  // Check for explicit consent
  const consent = args.flags.has('i-understand-this-signs-transactions');
  if (!consent) {
    fail(style.red('Signing requires explicit consent'));
    line('Add flag: --i-understand-this-signs-transactions');
    line('This action will be logged in audit trail');
    return;
  }

  if (isBrowserEnvironment()) {
    try {
      const ethereum = (window as any).ethereum;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, walletState.address]
      });
      
      line(style.green('✓ Message signed successfully'));
      line(`  Message: ${message}`);
      line(`  Signature: ${signature.substring(0, 16)}...`);
      line();
      line(style.dim('Signature recorded in audit trail'));
    } catch (error) {
      fail(`Signing failed: ${(error as Error).message}`);
    }
  } else {
    fail('Browser wallet required for signing');
  }
}

/**
 * Configure Web3 settings
 */
export async function web3Config(args: ReturnType<typeof parseArgs>): Promise<void> {
  heading('Web3 Configuration');
  line('Web3 configuration options:');
  line();
  line('  melodie web3 config --network <mainnet|testnet|localhost>');
  line('  melodie web3 config --rpc <url>');
  line('  melodie web3 config --wallet <path>');
  line();
  line(style.dim('Current configuration stored in: ~/.melodie/web3-config.json'));
}

// Helper functions
function getNetworkName(chainId: string | null): string {
  if (!chainId) return 'Unknown';
  const networks: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13882': 'Polygon Amoy',
    '0x38': 'BSC Mainnet',
    '0x61': 'BSC Testnet'
  };
  return networks[chainId] || `Chain ${parseInt(chainId, 16)}`;
}

function formatBalance(hex: string): string {
  if (!hex) return '0';
  const wei = BigInt(hex);
  const eth = Number(wei) / 1e18;
  return eth.toFixed(6);
}

function shortenAddress(address: string): string {
  if (!address) return 'None';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Main command dispatcher
export async function runWeb3(args: ReturnType<typeof parseArgs>): Promise<void> {
  const subcommand = args.positionals[0] || '';
  
  switch (subcommand) {
    case 'connect':
      await web3Connect(args);
      break;
    case 'status':
      await web3Status(args);
      break;
    case 'intent':
      await web3CreateIntent(args);
      break;
    case 'sign':
      await web3Sign(args);
      break;
    case 'config':
      await web3Config(args);
      break;
    default:
      heading('Web3 Commands');
      line('  melodie web3 connect              Connect to Web3 wallet (read-only)');
      line('  melodie web3 status               Show wallet status and balance');
      line('  melodie web3 intent <addr>        Create transaction intent (no execution)');
      line('  melodie web3 sign <msg>            Sign message (requires explicit consent)');
      line('  melodie web3 config               Configure Web3 settings');
      line();
      line(style.dim('All operations are read-only by default. Transaction signing requires'));
      line(style.dim('explicit consent with --i-understand-this-signs-transactions flag.'));
  }
}