module.exports = {
  rpcUrl: process.env.ETH_RPC_URL || "",
  chainId: Number(process.env.ETH_CHAIN_ID || 11155111), // Sepolia
  contractAddress: process.env.EHRPROOF_CONTRACT_ADDRESS || "",
  backendPrivateKey: process.env.ETH_BACKEND_PRIVATE_KEY || "",
  explorerTxBaseUrl: process.env.ETH_EXPLORER_TX_BASE || "https://sepolia.etherscan.io/tx/"
};