require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const backend = (process.env.BACKEND_ROLE_ADDRESS || "").trim();
  if (!backend) throw new Error("BACKEND_ROLE_ADDRESS missing in .env");

  const EHRProof = await hre.ethers.getContractFactory("EHRProof");
  const contract = await EHRProof.deploy(backend);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  const txHash = contract.deploymentTransaction().hash;

  console.log("EHRProof deployed to:", addr);
  console.log("Deployment tx:", txHash);

  // 1) Save deployments file
  const outDir = path.join(__dirname, "..", "deployments", "sepolia");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "EHRProof.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        contract: "EHRProof",
        network: "sepolia",
        address: addr,
        txHash,
        constructorArgs: [backend],
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log("Saved:", outFile);

  // 2) Optional: update backend env var in blockchain/.env if present
  const envPath = path.join(__dirname, "..", ".env");
  try {
    let env = fs.readFileSync(envPath, "utf8");
    if (env.includes("EHRPROOF_CONTRACT_ADDRESS=")) {
      env = env.replace(/EHRPROOF_CONTRACT_ADDRESS=.*/g, `EHRPROOF_CONTRACT_ADDRESS=${addr}`);
    } else {
      env += `\nEHRPROOF_CONTRACT_ADDRESS=${addr}\n`;
    }
    fs.writeFileSync(envPath, env);
    console.log("Updated .env EHRPROOF_CONTRACT_ADDRESS");
  } catch {
    /* ignore */
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});