require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: process.env.HARDHAT_MNEMONIC || "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10000 ETH per account
      },
      mining: {
        auto: true,
        interval: 0, // Instant mining
      },
      // Enable console.log in contracts
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Production networks (commented out by default)
    // mainnet: {
    //   url: process.env.ETH_PROVIDER_URL || "https://ethereum.publicnode.com",
    //   accounts: process.env.ADMIN_WALLET_PRIVATE_KEY ? [process.env.ADMIN_WALLET_PRIVATE_KEY] : [],
    // },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
