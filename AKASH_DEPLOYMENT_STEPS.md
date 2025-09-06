# 🚀 DeFi Transaction Guard - Akash Network Deployment Steps

## Complete step-by-step guide aligned with your project structure

### 📋 What Gets Deployed

Your DeFi Transaction Guard will run as 5 interconnected services on Akash Network:

1. **🤖 AI Detection Service** - Python Flask with GPU support (Grok + Gemini)
2. **⚙️ GoFr Backend API** - Your existing Go backend with BlockDAG integration
3. **🌐 React Frontend** - Dashboard for monitoring and management
4. **🗄️ Redis Cache** - Performance optimization for AI responses
5. **📊 Prometheus** - Monitoring and metrics collection

---

## 🛠️ Step 1: Prerequisites Setup

### Install Required Tools
```bash
# Install Akash CLI
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
export PATH="$PATH:./bin"

# Install jq for JSON processing
brew install jq  # macOS
# or
sudo apt install jq  # Linux

# Verify installations
akash version
jq --version
```

### Docker Setup
```bash
# Make sure Docker is running
docker info

# Login to Docker Hub
docker login
```

### Get API Keys (Optional but Recommended)
- **Grok API**: [console.groq.com](https://console.groq.com) → Create API key
- **Gemini API**: [aistudio.google.com](https://aistudio.google.com) → Get API key
- **BlockDAG API**: Contact BlockDAG team for access

---

## 🐳 Step 2: Build and Push Docker Images

### Set Environment Variables
```bash
# Required: Your Docker Hub username
export DOCKER_USERNAME="your-dockerhub-username"

# Optional: API keys for enhanced AI analysis
export GROK_API_KEY="gsk_your_grok_key_here"
export GEMINI_API_KEY="your_gemini_key_here"
export BLOCKDAG_API_KEY="your_blockdag_key_here"
```

### Build All Services
```bash
# Make build script executable
chmod +x build-for-akash.sh

# Build and push all Docker images
./build-for-akash.sh
```

This will:
- ✅ Build AI service with GPU support
- ✅ Build GoFr backend from your existing code
- ✅ Build React frontend with Nginx
- ✅ Push all images to Docker Hub
- ✅ Update deployment manifest with your images

---

## 🔑 Step 3: Setup Akash Wallet

### Create or Import Wallet
```bash
# Create new wallet (save the mnemonic!)
akash keys add defi-guard-wallet

# OR import existing wallet
akash keys add defi-guard-wallet --recover

# Get your wallet address
akash keys show defi-guard-wallet -a
```

### Fund Your Wallet

**For Mainnet (Production):**
- Buy AKT tokens from exchanges (Osmosis, Kraken, etc.)
- Send to your wallet address
- Minimum needed: **20 AKT** for full deployment

**For Testnet (Testing):**
- Get free tokens from [faucet.akash.network](https://faucet.akash.network)
- Minimum needed: **20 AKT** equivalent

### Verify Balance
```bash
akash query bank balances $(akash keys show defi-guard-wallet -a) \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2
```

---

## 🚀 Step 4: Deploy to Akash Network

### Run Deployment Script
```bash
# Make deployment script executable
chmod +x deploy-to-akash-production.sh

# Deploy all services to Akash
./deploy-to-akash-production.sh
```

### What Happens During Deployment

1. **Validation** - Checks prerequisites and wallet balance
2. **Configuration** - Prepares deployment with your API keys
3. **Deployment Creation** - Submits to Akash Network
4. **Bid Selection** - Waits for and selects provider bids
5. **Lease Creation** - Creates lease with selected provider
6. **Service Startup** - Starts all 5 services
7. **URL Retrieval** - Gets public URLs for your services

### Expected Timeline
- **Bid Reception**: 2-5 minutes
- **Service Startup**: 5-15 minutes (GPU services take longer)
- **Total Deployment**: 10-20 minutes

---

## 🌐 Step 5: Access Your Services

After successful deployment, you'll get URLs like:

```
🤖 AI Service: https://provider-xyz.akash.network
⚙️ Backend API: https://provider-abc.akash.network:8080
🌐 Frontend: https://provider-def.akash.network
📊 Monitoring: https://provider-ghi.akash.network:9090
```

### Test Your Deployment
```bash
# Test AI service health
curl https://your-ai-service-url/health

# Test backend API
curl https://your-backend-url/health

# Test transaction analysis
curl -X POST https://your-ai-service-url/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x123...",
    "from": "0xabc...",
    "to": "0xdef...",
    "value": "1.5",
    "gasLimit": "21000"
  }'
```

---

## 💰 Cost Breakdown

### Estimated Monthly Costs on Akash Network

| Service | Resources | Est. Cost/Month |
|---------|-----------|-----------------|
| AI Service (GPU) | 4 CPU, 8GB RAM, 1 GPU | $200-400 |
| GoFr Backend | 2 CPU, 4GB RAM | $30-60 |
| React Frontend | 1 CPU, 2GB RAM | $15-30 |
| Redis Cache | 0.5 CPU, 2GB RAM | $10-20 |
| Prometheus | 1 CPU, 4GB RAM | $20-40 |
| **Total** | | **$275-550** |

*Much cheaper than AWS/GCP equivalent!*

---

## 🔧 Configuration Options

### Adjust Resources (Edit `akash-production-deploy.yaml`)

```yaml
profiles:
  compute:
    defi-ai-service:
      resources:
        cpu:
          units: 4.0      # Increase for more CPU
        memory:
          size: 8Gi       # Increase for more RAM
        gpu:
          units: 1        # GPU count
```

### Adjust Pricing (Higher = faster deployment)

```yaml
pricing:
  defi-ai-service:
    denom: uakt
    amount: 15000    # Increase for faster bid acceptance
```

---

## 📊 Monitoring Your Deployment

### Check Service Status
```bash
akash provider lease-status \
  --dseq <DEPLOYMENT_DSEQ> \
  --gseq 1 --oseq 1 \
  --provider <PROVIDER_ADDRESS> \
  --from defi-guard-wallet \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2
```

### View Service Logs
```bash
akash provider lease-logs \
  --dseq <DEPLOYMENT_DSEQ> \
  --gseq 1 --oseq 1 \
  --provider <PROVIDER_ADDRESS> \
  --from defi-guard-wallet \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2 \
  --service defi-ai-service
```

### Access Prometheus Metrics
Visit your Prometheus URL to monitor:
- AI service performance
- GPU utilization
- Cache hit rates
- Transaction analysis metrics

---

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. No Bids Received**
```bash
# Solution: Increase bid prices
# Edit akash-production-deploy.yaml and increase amount values
```

**2. Services Not Starting**
```bash
# Check logs for errors
akash provider lease-logs --service defi-ai-service ...

# Common causes:
# - GPU not available (try CPU-only deployment)
# - Insufficient resources
# - Image pull failures
```

**3. AI Service Slow Response**
```bash
# Solutions:
# - Ensure GPU is allocated
# - Check Redis cache is working
# - Verify API keys are set
```

**4. Frontend Can't Connect to Backend**
```bash
# Check service networking in deployment file
# Ensure services can communicate via internal URLs
```

### Get Help
- **Akash Discord**: [discord.gg/akash](https://discord.gg/akash)
- **Provider Status**: [stats.akash.network](https://stats.akash.network)
- **Documentation**: [docs.akash.network](https://docs.akash.network)

---

## 🎯 Integration with Your DApp

### Update Your Frontend
```javascript
// Update your React app to use Akash-hosted APIs
const API_BASE_URL = 'https://your-backend-url-from-akash';
const AI_SERVICE_URL = 'https://your-ai-service-url-from-akash';

// Example API call
const analyzeTransaction = async (txData) => {
  const response = await fetch(`${AI_SERVICE_URL}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData)
  });
  return response.json();
};
```

### Smart Contract Integration
```solidity
// Update your smart contracts to call Akash-hosted APIs
// Use oracles or off-chain services to connect
string constant AI_SERVICE_URL = "https://your-ai-service-url";
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] ✅ All 5 services are running
- [ ] ✅ Frontend dashboard is accessible
- [ ] ✅ AI service responds to health checks
- [ ] ✅ Backend API endpoints work
- [ ] ✅ Transaction analysis returns results
- [ ] ✅ Prometheus metrics are collecting
- [ ] ✅ Redis cache is operational
- [ ] ✅ GPU acceleration is working (if configured)

---

## 🚀 You're Live!

**Congratulations!** Your DeFi Transaction Guard is now running on Akash Network with:

- 🤖 **GPU-accelerated AI analysis** for real-time threat detection
- ⚙️ **GoFr backend** with BlockDAG integration
- 🌐 **Professional dashboard** for monitoring
- 🗄️ **High-performance caching** for optimal response times
- 📊 **Complete monitoring** with Prometheus
- 💰 **Cost-effective hosting** on decentralized infrastructure

Your DeFi security solution is now protecting transactions on the decentralized cloud! 🛡️