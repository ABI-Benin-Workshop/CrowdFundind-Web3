require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    devNetwork: {
      url: "http://127.0.0.1:8545/"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ,
      accounts: [process.env.PRIVATE_KEY,process.env.SECOND_PRIVATE_KEY],
      chainId: 11155111,
      etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: process.env.ETHERSCAN_API_KEY
      },

    }
  }
};
