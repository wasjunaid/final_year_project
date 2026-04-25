const { Wallet } = require("ethers");
const w = Wallet.createRandom();
console.log("ADDRESS:", w.address);
console.log("PRIVATE_KEY:", w.privateKey);
console.log("MNEMONIC:", w.mnemonic?.phrase || "n/a"); 