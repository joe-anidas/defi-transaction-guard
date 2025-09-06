// Contract addresses and ABIs
import addresses from './addresses.json'
import TransactionGuardABI from './TransactionGuard.json'
import ProtectedDEXABI from './ProtectedDEX.json'
import MockBDAGABI from './MockBDAG.json'
import TestTokensABI from './TestTokens.json'

// Export contract configurations
export const contracts = {
  TransactionGuard: {
    address: addresses.transactionGuard,
    abi: TransactionGuardABI.abi
  },
  ProtectedDEX: {
    address: addresses.protectedDEX,
    abi: ProtectedDEXABI.abi
  },
  MockBDAG: {
    address: addresses.bdagToken,
    abi: MockBDAGABI.abi
  },
  TestTokenA: {
    address: addresses.tokenA,
    abi: TestTokensABI.abi
  },
  TestTokenB: {
    address: addresses.tokenB,
    abi: TestTokensABI.abi
  },
  MaliciousContract: {
    address: addresses.maliciousContract,
    abi: [
      {
        "inputs": [
          {"internalType": "address", "name": "target", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "drainLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rugPull",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "victim", "type": "address"},
          {"internalType": "uint256", "name": "frontrunAmount", "type": "uint256"}
        ],
        "name": "sandwichAttack",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
}

// Export addresses for easy access
export { addresses }

// Pool ID calculation helper (matches Solidity implementation)
export const calculatePoolId = (tokenA, tokenB) => {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() 
    ? [tokenA, tokenB] 
    : [tokenB, tokenA]
  
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(['address', 'address'], [token0, token1])
  )
}

// Risk score thresholds (matching smart contract)
export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 80,
  CRITICAL: 95
}

// Demo transaction hashes for testing
export const DEMO_TX_HASHES = {
  SAFE: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  RISKY: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  MALICIOUS: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
}

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat local network
  chainName: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
  blockExplorer: 'http://localhost:8545'
}