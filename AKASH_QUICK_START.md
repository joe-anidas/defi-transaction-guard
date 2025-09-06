# 🚀 DeFi Transaction Guard - Akash Quick Start

## **One-Command Deployment** ⚡

Deploy your entire DeFi Transaction Guard project to Akash Network with a single command:

```bash
./deploy-to-akash.sh
```

## **Prerequisites** ✅

1. **Docker installed** and running
2. **Docker Hub account** (joeanidas)
3. **AKT tokens** (get from [faucet](https://faucet.akash.network/))

## **Complete Deployment Flow** 🔄

### **Step 1: Build & Push Images**
```bash
# Build and push all Docker images
./build-and-push-images.sh
```

### **Step 2: Deploy to Akash**
```bash
# Deploy using the automated script
./deploy-to-akash.sh
```

### **Step 3: Access Your Services**
The script will output your service endpoints:
- 🤖 **AI Service**: `https://your-ai-service.akash.network`
- 🔧 **GoFr Backend**: `https://your-backend.akash.network:8080`
- 🎨 **Frontend**: `https://your-frontend.akash.network`
- 📊 **Prometheus**: `https://your-prometheus.akash.network:9090`

## **Manual Deployment** (Alternative)

If you prefer manual control:

### **1. Install Akash CLI**
```bash
curl -s https://raw.githubusercontent.com/ovrclk/akash/master/install.sh | sh
export PATH="$PATH:$HOME/.akash/bin"
```

### **2. Create Wallet**
```bash
akash keys add defi-guard-wallet
# Save your mnemonic phrase!
```

### **3. Fund Wallet**
Get AKT from [faucet](https://faucet.akash.network/) or transfer from exchange.

### **4. Deploy**
```bash
# Create deployment
akash tx deployment create demo-sdl.yaml --from defi-guard-wallet --node https://rpc.akashnet.net:443 --chain-id akashnet-2 --gas auto --gas-adjustment 1.5 --gas-prices 0.025uakt

# Wait for bids, then create lease
akash tx market lease create --dseq <DSEQ> --gseq 1 --oseq 1 --provider <PROVIDER> --from defi-guard-wallet

# Send manifest
akash provider send-manifest demo-sdl.yaml --dseq <DSEQ> --provider <PROVIDER> --from defi-guard-wallet
```

## **Service Architecture** 🏗️

Your deployment includes:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **AI Service** | `joeanidas/defi-ai-service:latest` | 5000→80 | GPU-powered threat detection |
| **GoFr Backend** | `joeanidas/gofr-backend:latest` | 8080 | High-performance API server |
| **Frontend** | `joeanidas/defi-frontend:latest` | 80 | React dashboard UI |
| **Redis Cache** | `redis:7-alpine` | 6379 | AI response caching |
| **Prometheus** | `prom/prometheus:latest` | 9090 | System monitoring |

## **Resource Requirements** 💰

- **Total Cost**: ~18,500 uakt per block (~$0.50/day)
- **GPU**: 1x NVIDIA (RTX4090, A100, V100, etc.)
- **CPU**: 8.5 total cores
- **Memory**: 20Gi total
- **Storage**: 55Gi total (15Gi persistent)

## **Environment Variables** 🔧

Configure these in your SDL file:

```yaml
env:
  - GROK_API_KEY=your_grok_key
  - GEMINI_API_KEY=your_gemini_key
  - BLOCKDAG_API_KEY=your_blockdag_key
  - BLOCKCHAIN_RPC_URL=https://rpc.ankr.com/eth
  - BLOCKDAG_NODE_URL=https://rpc.blockdag.network
```

## **Monitoring & Management** 📊

### **View Logs**
```bash
akash provider lease-logs --dseq <DSEQ> --gseq 1 --oseq 1 --provider <PROVIDER> --from defi-guard-wallet
```

### **Check Status**
```bash
akash provider lease-status --dseq <DSEQ> --gseq 1 --oseq 1 --provider <PROVIDER> --from defi-guard-wallet
```

### **Close Deployment**
```bash
akash tx deployment close --dseq <DSEQ> --from defi-guard-wallet --node https://rpc.akashnet.net:443 --chain-id akashnet-2
```

## **Troubleshooting** 🔧

### **No Bids Received**
- Check AKT balance (need at least 1 AKT)
- Verify SDL syntax
- Try reducing resource requirements

### **Services Not Starting**
- Check logs for errors
- Verify Docker images exist
- Check environment variables

### **GPU Not Available**
- Some providers may not have GPU
- Check provider capabilities
- Consider CPU-only deployment

## **Production Tips** 🚀

1. **Use specific image tags** instead of `:latest`
2. **Set up monitoring** with Prometheus
3. **Configure health checks** for all services
4. **Use persistent storage** for important data
5. **Set up backups** for critical data

## **Hackathon Tracks** 🏆

This deployment demonstrates:

- ✅ **BlockDAG Track**: Native integration and staking
- ✅ **GoFr Track**: High-performance microservices
- ✅ **Akash Track**: GPU-powered decentralized compute

---

**Ready to deploy? Run `./deploy-to-akash.sh` and watch your DeFi Transaction Guard come to life on Akash Network!** 🚀
