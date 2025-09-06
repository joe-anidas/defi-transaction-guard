# 🔧 Environment Variables Setup Guide

This guide explains all environment variables used in the DeFi Transaction Guard project and how to configure them.

## 📁 Project Structure

```
defi-transaction-guard/
├── .env.example                 # Root project configuration
├── backend/.env.example         # Backend API configuration  
├── blockchain/.env.example      # Smart contract deployment
├── frontend/.env.example        # React frontend configuration
└── ENVIRONMENT_SETUP.md        # This guide
```

## 🚀 Quick Start (Minimal Setup)

For a basic demo, you only need:

1. **Copy the example files:**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp blockchain/.env.example blockchain/.env  
cp frontend/.env.example frontend/.env
```

2. **The system works out-of-the-box with defaults!**
   - AI features use simulated responses
   - Blockchain uses local Hardhat network
   - All services use default ports

## 🔑 Environment Variables by Category

### 🤖 AI Integration (Optional)

The system works with simulated AI if these are not provided:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GROK_API` | Primary Grok API key | [Groq Console](https://console.groq.com/) |
| `GROK_API_2` | Backup Grok API key | [Groq Console](https://console.groq.com/) |
| `GEMINI_API` | Primary Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `GEMINI_API_2` | Backup Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

**Setup Instructions:**
1. **Grok API**: Sign up at Groq, create API key, starts with `gsk_`
2. **Gemini API**: Go to Google AI Studio, create project, generate API key

### 🔗 Blockchain Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PRIVATE_KEY` | Deployment private key | Hardhat test key |
| `BLOCKCHAIN_RPC_URL` | Local blockchain RPC | `http://127.0.0.1:8545` |
| `BLOCKDAG_RPC_URL` | BlockDAG network RPC | `https://rpc-testnet.blockdag.network` |
| `CHAIN_ID` | Network chain ID | `31337` (localhost) |

**For Production:**
- Use your own private key (never commit to git!)
- Configure mainnet/testnet RPC URLs
- Set appropriate chain IDs

### 🌐 Service Ports

| Service | Port | Environment Variable |
|---------|------|---------------------|
| Frontend | 5173 | `FRONTEND_PORT` |
| Backend API | 8000 | `BACKEND_PORT` |
| Blockchain | 8545 | `BLOCKCHAIN_PORT` |

### 🔍 Contract Verification

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `ETHERSCAN_API_KEY` | Ethereum contract verification | [Etherscan](https://etherscan.io/apis) |
| `POLYGONSCAN_API_KEY` | Polygon contract verification | [PolygonScan](https://polygonscan.com/apis) |

### 📊 External Services (Optional)

| Variable | Description | Purpose |
|----------|-------------|---------|
| `INFURA_PROJECT_ID` | Infura RPC access | Blockchain connectivity |
| `ALCHEMY_API_KEY` | Alchemy RPC access | Alternative RPC provider |
| `WALLET_CONNECT_PROJECT_ID` | WalletConnect integration | Multi-wallet support |
| `SENTRY_DSN` | Error monitoring | Production error tracking |

## 📂 File-Specific Configuration

### Backend (.env)
```bash
# Required for full AI features
GROK_API=gsk_your_key_here
GEMINI_API=your_gemini_key_here

# Optional - GoFr handles defaults
PORT=8000
LOG_LEVEL=INFO
```

### Blockchain (.env)
```bash
# For testnet/mainnet deployment
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_api_key_here

# Network configurations
BLOCKDAG_RPC_URL=https://rpc-testnet.blockdag.network
```

### Frontend (.env)
```bash
# API endpoint (adjust if backend port changes)
VITE_API_URL=http://localhost:8000

# Feature flags
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_AI_FEATURES=true
```

## 🔒 Security Best Practices

### ✅ Do's
- Use `.env.example` files as templates
- Keep `.env` files in `.gitignore`
- Use different keys for development/production
- Rotate API keys regularly
- Use environment-specific configurations

### ❌ Don'ts
- Never commit `.env` files with real keys
- Don't use production keys in development
- Don't share API keys in public repositories
- Don't hardcode sensitive values in source code

## 🛠️ Development vs Production

### Development (Default)
```bash
# Uses simulated AI responses
MOCK_AI_RESPONSES=true

# Uses local blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545

# Debug mode enabled
DEBUG_MODE=true
```

### Production
```bash
# Real AI integration
GROK_API=gsk_real_key_here
GEMINI_API=real_gemini_key_here

# Production blockchain
BLOCKDAG_RPC_URL=https://rpc-mainnet.blockdag.network

# Security enabled
JWT_SECRET=secure_random_string
CORS_ORIGINS=https://yourdomain.com
```

## 🚨 Troubleshooting

### Common Issues

1. **"AI services unavailable"**
   - Check API keys are valid
   - Verify network connectivity
   - System falls back to simulated responses

2. **"Cannot connect to blockchain"**
   - Ensure Hardhat node is running: `npm run node`
   - Check `BLOCKCHAIN_RPC_URL` is correct
   - Verify port 8545 is available

3. **"Backend API not responding"**
   - Check backend is running: `go run .`
   - Verify `BACKEND_PORT` configuration
   - Ensure no port conflicts

4. **"Contract deployment failed"**
   - Check `PRIVATE_KEY` has sufficient funds
   - Verify RPC URL is accessible
   - Ensure network configuration is correct

### Port Conflicts
```bash
# Kill processes on specific ports
lsof -ti:8545 | xargs kill -9  # Blockchain
lsof -ti:8000 | xargs kill -9  # Backend  
lsof -ti:5173 | xargs kill -9  # Frontend
```

## 📋 Environment Checklist

Before running the project:

- [ ] Copied all `.env.example` files to `.env`
- [ ] Configured AI API keys (optional)
- [ ] Set blockchain network configuration
- [ ] Verified all ports are available
- [ ] Checked service dependencies are installed

## 🆘 Getting Help

If you encounter issues:

1. Check this guide for configuration details
2. Verify all `.env` files are properly configured
3. Run the diagnostic script: `./diagnose.sh`
4. Check service logs for specific error messages
5. Ensure all dependencies are installed

The system is designed to work with minimal configuration - most variables are optional and have sensible defaults!