# 🔗 Blockchain - Smart Contracts

This folder contains all the smart contracts for the DeFi Transaction Guard firewall system.

## 📄 Smart Contracts

### Core Contracts
- **TransactionGuard.sol** - Main firewall contract with BDAG staking
- **ProtectedDEX.sol** - Sample DEX with integrated protection
- **MockBDAG.sol** - BDAG token for testing and staking
- **TestTokens.sol** - Demo tokens and malicious contracts

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Start Local Blockchain
```bash
npm run node
# Keep this terminal open
```

### 4. Deploy Contracts (New Terminal)
```bash
npm run deploy
```

### 5. Run Tests
```bash
npm test
```

## 📋 Available Scripts

- `npm run compile` - Compile smart contracts
- `npm run node` - Start local Hardhat blockchain
- `npm run deploy` - Deploy contracts to local network
- `npm run test` - Run contract tests
- `npm run clean` - Clean artifacts and cache

## 🏆 BlockDAG Integration

### BDAG Token Staking
- Validators stake BDAG tokens to participate
- Minimum stake: 1,000 BDAG tokens
- Slashing for incorrect risk assessments
- Economic incentives for honest behavior

### Smart Contract Features
- **Real-time protection** with `protected()` modifier
- **Risk assessment** submission and validation
- **Validator network** with BDAG staking
- **Cross-chain compatibility** via BlockDAG bridge

### Network Configuration
- **Local Development**: localhost:8545 (Chain ID: 31337)
- **BlockDAG Testnet**: Configure in hardhat.config.js
- **Production**: Deploy to BlockDAG mainnet

## 🔧 Contract Addresses

After deployment, contract addresses are automatically saved to:
`../frontend/src/contracts/addresses.json`

This allows the frontend to automatically connect to deployed contracts.

## 🧪 Testing

The test suite covers:
- ✅ Validator staking and slashing
- ✅ Risk assessment submission
- ✅ Transaction blocking logic
- ✅ Protected DEX functionality
- ✅ Malicious contract detection

Run tests with: `npm test`

## 🛡️ Security Features

### Transaction Firewall
- Pre-execution transaction analysis
- AI-powered risk scoring integration
- On-chain enforcement that cannot be bypassed
- Real-time blocking of malicious transactions

### Validator Network
- Decentralized risk assessment
- Economic incentives via BDAG staking
- Slashing mechanism for bad actors
- Consensus-based security decisions

## 📚 Integration Guide

### For DeFi Protocols
Add the `protected()` modifier to critical functions:

```solidity
import "./TransactionGuard.sol";

contract MyDeFiProtocol {
    TransactionGuard public immutable guard;
    
    constructor(address _guard) {
        guard = TransactionGuard(_guard);
    }
    
    modifier protected() {
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, msg.data, block.timestamp));
        require(guard.isTransactionSafe(txHash), "Transaction blocked by firewall");
        _;
    }
    
    function criticalFunction() external protected {
        // Your protected logic here
    }
}
```

### For Validators
1. Stake BDAG tokens: `stakeAsValidator(amount)`
2. Monitor transactions and submit risk assessments
3. Earn rewards for correct predictions
4. Risk slashing for incorrect assessments

This blockchain layer provides the foundation for the world's first real-time DeFi exploit firewall! 🛡️