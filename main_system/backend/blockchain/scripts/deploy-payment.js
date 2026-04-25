const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Deploying Payment Contract");
  console.log("========================================\n");

  const Payment = await hre.ethers.getContractFactory("Payment");
  const contract = await Payment.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  const txHash = contract.deploymentTransaction().hash;

  console.log("Payment deployed to:", addr);
  console.log("Deployment tx:", txHash);

  const receipt = await contract.deploymentTransaction().wait(3);
  console.log("Block Number:", receipt.blockNumber);

  // Save deployment info
  const outDir = path.join(__dirname, "..", "deployments", "sepolia");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "Payment.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify({
      contract: "Payment",
      network: "sepolia",
      address: addr,
      txHash,
      deployedAt: new Date().toISOString(),
      blockNumber: receipt.blockNumber
    }, null, 2)
  );

  console.log("Deployment info saved to:", outFile);
  
  // Update .env
  const envPath = path.join(__dirname, "..", "..", ".env");
  let env = fs.readFileSync(envPath, "utf8");
  if (!/PAYMENT_CONTRACT_ADDRESS/.test(env)) {
    env += `\nPAYMENT_CONTRACT_ADDRESS=${addr}\n`;
    fs.writeFileSync(envPath, env);
    console.log("Added PAYMENT_CONTRACT_ADDRESS to .env");
  }

  console.log("\nDeployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});