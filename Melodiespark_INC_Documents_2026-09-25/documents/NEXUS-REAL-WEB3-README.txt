NEXUS REAL WEB3 UPGRADE

What changed
- Real EIP-1193 provider detection via window.ethereum.
- Real eth_requestAccounts connection.
- eth_accounts session restoration.
- accountsChanged and chainChanged listeners.
- RPC-derived eth_chainId, eth_blockNumber and eth_gasPrice.
- Required chain validation, fail-closed.
- ERC-20 contract verification via eth_getCode + eth_call:
  symbol(), decimals(), totalSupply().
- Token remains UNCONFIGURED until WEB3_CONFIG.token.address is set.
- No private keys or seed phrases are accepted or stored.
- requestExternalSignature(message) delegates signature approval to the wallet.
- requestApprovedTransaction(tx) requires app confirmation, then delegates
  final signing/broadcast approval to the external wallet.
- Removed fabricated NXS price, APY, market cap, staking and DAO proposal claims.

Configuration
Open NEXUS-REAL-WEB3.html and edit WEB3_CONFIG:
  requiredChainId: '0x1'
  requiredChainName: 'Ethereum Mainnet'
  token.address: null
  token.expectedSymbol: null

Set a real contract address only after you have independently established
which deployed contract the application is meant to represent.
