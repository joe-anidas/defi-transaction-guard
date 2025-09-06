# 🚀 DeFi Transaction Guard - Setup Guide

## Quick Start (Automated)

```bash
# One-command startup (recommended)
./start-demo.sh
```

## Manual Setup (Step by Step)

### Prerequisites
- Node.js (v16+)
- Go (v1.21+)
- MetaMask browser extension

### Step 1: Start Blockchain (Terminal 1)
```bash
cd blockchain
npm install
npm run compile
npm run node
# Keep this terminal open - blockchain runs here
```

### Step 2: Deploy Contracts (Terminal 2)
```bash
cd blockchain
npm run deploy
npm run verify
```

### Step 3: Start Backend (Terminal 3)
```bash
cd backend
go mod tidy
go run .
# Backend runs on http://localhost:8080
```

### Step 4: Start Frontend (Terminal 4)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## MetaMask Configuration

### Add Localhost Network
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter these details:
   - **Network Name**: Localhost
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### Import Test Account (Optional)
For demo funds, import this Hardhat test account:
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance**: 10,000 ETH

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
pkill -f "hardhat node"  # Port 8545
pkill -f "go run"        # Port 8080
pkill -f "vite"          # Port 5173
```

### Blockchain Not Starting
```bash
cd blockchain
rm -rf cache artifacts
npm run clean
npm run compile
npm run node
```

### Contracts Not Deployed
```bash
cd blockchain
npm run deploy
# Check frontend/src/contracts/addresses.json for addresses
```

### Backend API Errors
```bash
cd backend
# Check .env file for API keys
cat .env
go run .
```

### Frontend Connection Issues
1. Ensure blockchain is running on port 8545
2. Check MetaMask network (should be localhost:31337)
3. Refresh browser page
4. Check browser console for errors

## Verification Commands

### Check Blockchain
```bash
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Check Backend
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/ai/status
```

### Check Frontend
Open http://localhost:5173 in browser

## Demo Flow

1. **Open Frontend**: http://localhost:5173
2. **Connect Wallet**: Click "Connect Wallet"
3. **Switch Network**: Use "Switch to Localhost" button
4. **View Dashboard**: See firewall statistics
5. **Try Demo**: Go to Demo page
6. **Simulate Exploit**: Click "Simulate Attack"
7. **See Protection**: Watch transaction get blocked

## API Testing

### Test AI Analysis
```bash
curl -X POST http://localhost:8080/api/risk-score \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x123...",
    "from": "0xabc...",
    "to": "0x1234567890abcdef1234567890abcdef12345678",
    "value": "1000",
    "gasLimit": "800000",
    "data": "0x945bcec9"
  }'
```

### Test Statistics
```bash
curl http://localhost:8080/api/stats
```

### Test Alerts
```bash
curl http://localhost:8080/api/alerts
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │    │   (GoFr + AI)   │    │   (Hardhat)     │
│   Port 5173     │◄──►│   Port 8080     │◄──►│   Port 8545     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   User Interface         AI Risk Analysis        Smart Contracts
   - Wallet Connect       - Grok/Gemini APIs      - Transaction Guard
   - Network Status       - Real-time Scoring     - BDAG Staking
   - Demo Interface       - Threat Detection      - Protection Logic
```

## Success Indicators

✅ **Blockchain**: Hardhat node running, contracts deployed
✅ **Backend**: API responding, AI services connected
✅ **Frontend**: Page loads, wallet connects, network detected
✅ **Integration**: Risk analysis working, alerts showing
✅ **Demo**: Exploit simulation blocks malicious transactions

## Support

If you encounter issues:
1. Check all terminals for error messages
2. Verify all ports are available (8545, 8080, 5173)
3. Ensure MetaMask is on localhost network
4. Try the automated startup script: `./start-demo.sh`

Happy hacking! 🛡️