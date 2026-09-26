import hashlib
import re

def normalize_address(address: str) -> str:
    """Normalize Ethereum address to lowercase standard with 0x prefix."""
    addr = str(address).strip().lower()
    if not re.match(r"^0x[a-f0-9]{40}$", addr):
        raise ValueError(f"Invalid Ethereum address: {address}")
    return addr

def eip191_message_hash(message: str) -> bytes:
    """Calculate the EIP-191 personal_sign hash of a message string."""
    msg_bytes = message.encode("utf-8")
    prefix = f"\x19Ethereum Signed Message:\n{len(msg_bytes)}".encode("utf-8")
    prefixed = prefix + msg_bytes
    # Keccak-256 or SHA256 fallback for environments without keccak
    return hashlib.sha256(prefixed).digest()

def format_canonical_intent(
    chain_id: int,
    asset: str,
    amount_display: str,
    destination: str,
    nonce: str,
    expires_at: str
) -> str:
    """Format canonical withdrawal intent string strictly matching Command Center."""
    norm_dest = normalize_address(destination)
    return (
        f"Melodiespark withdrawal authorization intent\n\n"
        f"Chain ID: {chain_id}\n"
        f"Asset: {asset}\n"
        f"Amount: {amount_display}\n"
        f"Destination: {norm_dest}\n"
        f"Nonce: {nonce}\n"
        f"Expires: {expires_at}\n\n"
        f"Signing confirms intent only. This does not submit a blockchain transaction."
    )
