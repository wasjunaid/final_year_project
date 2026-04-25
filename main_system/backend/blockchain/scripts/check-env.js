require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { ethers } = require("ethers");

(async () => {
  const { ETH_RPC_URL, ETH_BACKEND_PRIVATE_KEY, BACKEND_ROLE_ADDRESS } = process.env;
  console.log("ETH_RPC_URL:", ETH_RPC_URL ? "OK" : "MISSING");
  console.log("ETH_BACKEND_PRIVATE_KEY:", ETH_BACKEND_PRIVATE_KEY?.startsWith("0x") ? "OK" : "MISSING/NO 0x");
  console.log("BACKEND_ROLE_ADDRESS:", BACKEND_ROLE_ADDRESS?.startsWith("0x") ? "OK" : "MISSING");

  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, 11155111);
  const net = await provider.getNetwork();
  console.log("Connected chainId:", Number(net.chainId));

  // ethers v6: use getFeeData() instead of getGasPrice()
  const fee = await provider.getFeeData();
  console.log("gasPrice (wei):", fee.gasPrice ? fee.gasPrice.toString() : "n/a"); // may be null on EIP-1559
  console.log("maxFeePerGas (wei):", fee.maxFeePerGas ? fee.maxFeePerGas.toString() : "n/a");
  console.log("maxPriorityFeePerGas (wei):", fee.maxPriorityFeePerGas ? fee.maxPriorityFeePerGas.toString() : "n/a");
})();