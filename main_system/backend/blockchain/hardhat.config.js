const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("@nomicfoundation/hardhat-toolbox");

const { ETH_RPC_URL, ETH_BACKEND_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: ETH_RPC_URL,
      accounts: ETH_BACKEND_PRIVATE_KEY ? [ETH_BACKEND_PRIVATE_KEY] : [],
    },
  },
};