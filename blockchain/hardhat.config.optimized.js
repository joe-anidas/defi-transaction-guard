require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimized for gas efficiency
        details: {
          yul: true, // Enable Yul optimizer for better gas optimization
        },
      },
      viaIR: true, // Enable via IR for better optimization
    },
  },
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 8000000, // Increased gas limit
      gasPrice: 20000000000, // 20 Gwei
    },
    
    // BlockDAG Testnet - Updated configuration
    blockdag_testnet: {
      url: process.env.BLOCKDAG_RPC_URL || "https://rpc-testnet.blockdag.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 19648, // BlockDAG testnet chain ID
      gas: 8000000,
      gasPrice: 1000000000, // 1 Gwei - very low gas price
      timeout: 60000, // 60 seconds timeout
    },
    
    // BlockDAG Mainnet (when available)
    blockdag_mainnet: {
      url: process.env.BLOCKDAG_MAINNET_RPC_URL || "https://rpc.blockdag.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 12346, // BlockDAG mainnet chain ID
      gas: 8000000,
      gasPrice: 2000000000, // 2 Gwei
      timeout: 60000,
    },
    
    // BlockDAG simulation (for demo when testnet unavailable)
    blockdag_sim: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 19648, // Simulate BlockDAG chain ID
      gas: 8000000,
      gasPrice: 1000000000, // 1 Gwei
    },
    
    // Polygon Mumbai - Low gas fees
    polygon_mumbai: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 8000000,
      gasPrice: 1000000000, // 1 Gwei
      timeout: 60000,
    },
    
    // Polygon Mainnet
    polygon_mainnet: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gas: 8000000,
      gasPrice: 30000000000, // 30 Gwei
      timeout: 60000,
    },
    
    // Ethereum Goerli Testnet
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5,
      gas: 8000000,
      gasPrice: 20000000000, // 20 Gwei
      timeout: 60000,
    },
    
    // Ethereum Mainnet
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
      gas: 8000000,
      gasPrice: 50000000000, // 50 Gwei
      timeout: 60000,
    },
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20, // Gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  
  // Etherscan configuration
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      blockdag: process.env.BLOCKDAG_API_KEY || "",
    },
    customChains: [
      {
        network: "blockdag",
        chainId: 19648,
        urls: {
          apiURL: "https://api-explorer-testnet.blockdag.network/api",
          browserURL: "https://explorer-testnet.blockdag.network"
        }
      }
    ]
  },
  
  // Paths configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Mocha configuration
  mocha: {
    timeout: 60000, // 60 seconds
  },
  
  // Typechain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },
};
