import { ethers } from 'ethers'

// Contract ABIs
export const TRANSACTION_GUARD_ABI = [
  "function getFirewallStats() view returns (uint256, uint256, uint256, uint256, uint256)",
  "function submitRiskAssessment(bytes32 txHash, uint256 riskScore, string threatType)",
  "function isTransactionSafe(bytes32 txHash) view returns (bool)",
  "function stakeAsValidator(uint256 amount)",
  "function getValidatorInfo(address validator) view returns (uint256, uint256, uint256, bool, uint256)",
  "function simulateExploitPrevention(address target, uint256 potentialLoss, string exploitType)",
  "event TransactionBlocked(bytes32 indexed txHash, uint256 riskScore, string threatType)",
  "event ExploitPrevented(address indexed target, uint256 potentialLoss)",
  "event ValidatorStaked(address indexed validator, uint256 amount)"
]

export const BDAG_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function faucet(address to, uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
]

export const PROTECTED_DEX_ABI = [
  "function createPool(address tokenA, address tokenB) returns (bytes32)",
  "function addLiquidity(bytes32 poolId, uint256 amountA, uint256 amountB, uint256 minAmountA, uint256 minAmountB)",
  "function swap(bytes32 poolId, address tokenIn, uint256 amountIn, uint256 minAmountOut)",
  "function getPoolInfo(bytes32 poolId) view returns (address, address, uint256, uint256, uint256)",
  "function getAmountOut(bytes32 poolId, address tokenIn, uint256 amountIn) view returns (uint256)"
]

export const MALICIOUS_CONTRACT_ABI = [
  "function drainLiquidity(address target, uint256 amount)",
  "function rugPull()",
  "function sandwichAttack(address victim, uint256 frontrunAmount)",
  "event ExploitAttempted(address victim, uint256 amount)"
]

export const TEST_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function faucet(address to, uint256 amount)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
]

// Default contract addresses (updated after deployment)
export const DEFAULT_ADDRESSES = {
  bdagToken: "0x0000000000000000000000000000000000000000",
  transactionGuard: "0x0000000000000000000000000000000000000000",
  tokenA: "0x0000000000000000000000000000000000000000",
  tokenB: "0x0000000000000000000000000000000000000000",
  protectedDEX: "0x0000000000000000000000000000000000000000",
  maliciousContract: "0x0000000000000000000000000000000000000000",
  deployer: "0x0000000000000000000000000000000000000000",
  poolId: "0x0000000000000000000000000000000000000000000000000000000000000000"
}

// Load contract addresses from deployed file
export const loadContractAddresses = async () => {
  try {
    // Try to import the addresses file
    const addressesModule = await import('../contracts/addresses.json')
    const addresses = addressesModule.default || addressesModule
    
    // Validate addresses
    const isValidAddress = (addr) => addr && addr !== "0x0000000000000000000000000000000000000000"
    
    if (isValidAddress(addresses.transactionGuard)) {
      console.log('✅ Loaded deployed contract addresses')
      return addresses
    }
  } catch (error) {
    console.warn('⚠️ Contract addresses not found, using defaults')
  }
  
  return DEFAULT_ADDRESSES
}

// Create contract instances
export const createContractInstances = (addresses, signer) => {
  try {
    return {
      transactionGuard: new ethers.Contract(addresses.transactionGuard, TRANSACTION_GUARD_ABI, signer),
      bdagToken: new ethers.Contract(addresses.bdagToken, BDAG_TOKEN_ABI, signer),
      protectedDEX: new ethers.Contract(addresses.protectedDEX, PROTECTED_DEX_ABI, signer),
      maliciousContract: new ethers.Contract(addresses.maliciousContract, MALICIOUS_CONTRACT_ABI, signer),
      tokenA: new ethers.Contract(addresses.tokenA, TEST_TOKEN_ABI, signer),
      tokenB: new ethers.Contract(addresses.tokenB, TEST_TOKEN_ABI, signer)
    }
  } catch (error) {
    console.error('Error creating contract instances:', error)
    return {}
  }
}

// Utility functions
export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatEther = (value) => {
  try {
    return ethers.utils.formatEther(value)
  } catch (error) {
    return '0'
  }
}

export const parseEther = (value) => {
  try {
    return ethers.utils.parseEther(value.toString())
  } catch (error) {
    return ethers.BigNumber.from(0)
  }
}

// Network configuration
export const SUPPORTED_NETWORKS = {
  31337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337
  },
  12345: {
    name: 'BlockDAG Testnet',
    rpcUrl: 'https://rpc-testnet.blockdag.network',
    chainId: 12345
  }
}

export const isNetworkSupported = (chainId) => {
  return Object.keys(SUPPORTED_NETWORKS).includes(chainId.toString())
}