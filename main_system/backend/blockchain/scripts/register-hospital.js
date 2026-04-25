const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const HOSPITAL_WALLET = process.env.HOSPITAL_WALLET_ADDRESS;
    const PAYMENT_CONTRACT_ADDRESS = process.env.PAYMENT_CONTRACT_ADDRESS;
    
    if (!HOSPITAL_WALLET) {
        throw new Error("❌ Set HOSPITAL_WALLET_ADDRESS in blockchain/.env");
    }
    
    if (!PAYMENT_CONTRACT_ADDRESS) {
        throw new Error("❌ Set PAYMENT_CONTRACT_ADDRESS in blockchain/.env");
    }

    console.log("========================================");
    console.log("Registering Hospital on Payment Contract");
    console.log("========================================\n");
    console.log("Contract Address:", PAYMENT_CONTRACT_ADDRESS);
    console.log("Hospital Wallet:", HOSPITAL_WALLET);
    
    const Payment = await hre.ethers.getContractAt("Payment", PAYMENT_CONTRACT_ADDRESS);
    
    console.log("\n📝 Sending registration transaction...");
    const tx = await Payment.registerHospital(HOSPITAL_WALLET);
    console.log("Transaction Hash:", tx.hash);
    
    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await tx.wait(1);
    
    console.log("\n✅ Hospital registered successfully!");
    console.log("📦 Block Number:", receipt.blockNumber);
    console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });

    //successfull execution example
  //View on Etherscan: https://sepolia.etherscan.io/tx/0xd9138c465a8659549c7007a94268083e60efa3a1da7b9e622f750cd1c4ebb777