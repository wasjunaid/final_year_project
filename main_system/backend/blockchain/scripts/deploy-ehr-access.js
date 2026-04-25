require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Deploying EHRAccessControl Contract");
  console.log("========================================\n");

  // Get backend address from environment (same pattern as deploy.js)
  const backend = (process.env.BACKEND_ROLE_ADDRESS || "").trim();
  if (!backend) {
    throw new Error("BACKEND_ROLE_ADDRESS missing in .env");
  }

  console.log("📋 Backend Address:", backend);
  console.log("📋 Network:", hre.network.name);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("📋 Chain ID:", network.chainId.toString());
  console.log();

  // Deploy contract (same pattern as deploy.js)
  console.log("🔨 Deploying contract...");
  const EHRAccessControl = await hre.ethers.getContractFactory("EHRAccessControl");
  const contract = await EHRAccessControl.deploy(backend);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  const txHash = contract.deploymentTransaction().hash;

  console.log("\n✅ EHRAccessControl deployed to:", addr);
  console.log("📝 Deployment tx:", txHash);

  // Get transaction receipt for gas info
  const receipt = await contract.deploymentTransaction().wait(3);
  console.log("📦 Block Number:", receipt.blockNumber);
  console.log("⛽ Gas Used:", receipt.gasUsed.toString());

  // 1) Save deployments file
  console.log("\n💾 Saving deployment information...");
  const outDir = path.join(__dirname, "..", "deployments", "sepolia");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "EHRAccessControl.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        contract: "EHRAccessControl",
        network: "sepolia",
        address: addr,
        txHash,
        constructorArgs: [backend],
        deployedAt: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
      null,
      2
    )
  );
  console.log("✅ Saved deployment info:", outFile);

  // 2) Save ABI
  console.log("\n📄 Saving ABI...");
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "EHRAccessControl.sol",
    "EHRAccessControl.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error("❌ Contract artifact not found. Run 'npx hardhat compile' first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const abiDir = path.join(__dirname, "..", "abi");
  fs.mkdirSync(abiDir, { recursive: true });

  const abiData = {
    address: addr,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
  };

  const abiFile = path.join(abiDir, "EHRAccessControl.json");
  fs.writeFileSync(abiFile, JSON.stringify(abiData, null, 2));
  console.log("✅ Saved ABI:", abiFile);

  // 3) Update .env file in blockchain folder
  console.log("\n🔧 Updating .env file...");
  const envPath = path.join(__dirname, "..", ".env");
  try {
    let env = fs.readFileSync(envPath, "utf8");
    if (env.includes("EHRACCESS_CONTRACT_ADDRESS=")) {
      env = env.replace(/EHRACCESS_CONTRACT_ADDRESS=.*/g, `EHRACCESS_CONTRACT_ADDRESS=${addr}`);
      console.log("✅ Updated existing EHRACCESS_CONTRACT_ADDRESS in .env");
    } else {
      if (!env.endsWith('\n')) env += '\n';
      env += `\n# EHR Access Control Contract\nEHRACCESS_CONTRACT_ADDRESS=${addr}\n`;
      console.log("✅ Added EHRACCESS_CONTRACT_ADDRESS to .env");
    }
    fs.writeFileSync(envPath, env);
  } catch (err) {
    console.log("⚠️  Could not update .env:", err.message);
  }

  // Print summary
  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Contract Name:     EHRAccessControl");
  console.log("Network:           sepolia");
  console.log("Chain ID:         ", network.chainId.toString());
  console.log("Contract Address: ", addr);
  console.log("Backend Address:  ", backend);
  console.log("Transaction Hash: ", txHash);
  console.log("Block Number:     ", receipt.blockNumber);
  console.log("Gas Used:         ", receipt.gasUsed.toString());
  console.log("Etherscan URL:    ", `https://sepolia.etherscan.io/address/${addr}`);
  console.log("========================================\n");

  console.log("Deployment completed successfully!");

}

main().catch((e) => {
  console.error("\n❌ Deployment failed!");
  console.error(e);
  process.exit(1);
});