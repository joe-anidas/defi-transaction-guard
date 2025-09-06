# 🚀 DeFi Transaction Guard - Akash Network Deployment Guide

Complete step-by-step guide to deploy your DeFi Transaction Guard on Akash Network with GPU acceleration, BlockDAG integration, and AI-powered analysis.

## 📋 Prerequisites

### 1. System Requirements
- **Operating System**: Linux, macOS, or WSL2 on Windows
- **Docker**: Latest version installed and running
- **Git**: For cloning repositories
- **curl**: For downloading tools
- **jq**: For JSON processing (`brew install jq` or `apt install jq`)

### 2. Akash Network Setup
```bash
# Install Akash CLI
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
export PATH="$PATH:./bin"

# Verify installation
akash version
```

### 3. Docker Hub Account
- Create account at [hub.docker.com](https://hub.docker.com)
- Login locally: `docker login`

### 4. API Keys (Optional but Recommended)
- **Grok API Key**: Get from [console.groq.com](https://console.groq.com)
- **Gemini API Key**: Get from [aistudio.google.com](https://aistudio.google.com)
- **BlockDAG API Key**: Get from BlockDAG network documentation

## 🛠️ Step-by-Step Deployment

### Step 1: Prepare Your Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd defi-transaction-guard

# Set your Docker Hub username
export DOCKER_USERNAME="your-dockerhub-username"

# Set API keys (optional)
export GROK_API_KEY="gsk_your_grok_key_here"
export GEMINI_API_KEY="your_gemini_key_here"
export BLOCKDAG_API_KEY="your_blockdag_key_here"
```

### Step 2: Build and Push Docker Images

```bash
# Make scripts executable
chmod +x build-and-push.sh deploy-to-akash.sh

# Build and push all images
./build-and-push.sh
```

This script will:
- ✅ Build AI service image with GPU support
- ✅ Build GoFr backend service
- ✅ Build React frontend with Nginx
- ✅ Push all images to Docker Hub
- ✅ Update deployment manifest

### Step 3: Setup Akash Wallet

```bash
# Create new wallet (save the mnemonic!)
akash keys add defi-guard-wallet

# Or import existing wallet
akash keys add defi-guard-wallet --recover

# Get your wallet address
akash keys show defi-guard-wallet -a
```

### Step 4: Fund Your Wallet

You need AKT tokens for deployment:

**Mainnet:**
- Buy AKT from exchanges (Osmosis, Kraken, etc.)
- Minimum: ~15 AKT for full deployment

**Testnet:**
- Get free tokens from [faucet.akash.network](https://faucet.akash.network)

```bash
# Check balance
akash query bank balances $(akash keys show defi-guard-wallet -a) \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2
```

### Step 5: Deploy to Akash Network

```bash
# Deploy with all services
./deploy-to-akash.sh
```

The deployment includes:
- 🤖 **AI Service**: GPU-accelerated analysis with Grok + Gemini
- ⚙️ **Backend**: GoFr API with BlockDAG integration  
- 🌐 **Frontend**: React dashboard with real-time monitoring
- 🗄️ **Redis Cache**: For improved performance
- 📊 **Prometheus**: For monitoring and metrics

### Step 6: Monitor Deployment

```bash
# Check deployment status
akash provider lease-status \
  --dseq <DEPLOYMENT_DSEQ> \
  --gseq 1 \
  --oseq 1 \
  --provider <PROVIDER_ADDRESS> \
  --from defi-guard-wallet \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2

# View service logs
akash provider lease-logs \
  --dseq <DEPLOYMENT_DSEQ> \
  --gseq 1 \
  --oseq 1 \
  --provider <PROVIDER_ADDRESS> \
  --from defi-guard-wallet \
  --node https://rpc.akash.forbole.com:443 \
  --chain-id akashnet-2 \
  --service defi-guard-ai
```

## 🔧 Configuration Options

### Resource Allocation

Edit `akash-deploy.yaml` to adjust resources:

```yaml
profiles:
  compute:
    defi-guard-ai:
      resources:
        cpu:
          units: 4.0        # CPU cores
        memory:
          size: 8Gi         # RAM
        storage:
          size: 20Gi        # Storage
        gpu:
          units: 1          # GPU count
          attributes:
            vendor:
              nvidia:
                - model: rtx4090  # Preferred GPU
```

### Pricing

Adjust bid prices in the deployment file:

```yaml
pricing:
  defi-guard-ai:
    denom: uakt
    amount: 8000    # Higher = better chance of winning bids
```

### Environment Variables

Configure services via environment variables:

```yaml
env:
  - GROK_API_KEY=your_key_here
  - GEMINI_API_KEY=your_key_here
  - BLOCKDAG_API_KEY=your_key_here
  - DEBUG=false
  - GPU_ACCELERATION=true
```

## 🧪 Testing Your Deployment

### Health Checks

```bash
# Test AI service
curl https://your-ai-service-url/health

# Test frontend
curl https://your-frontend-url

# Test transaction analysis
curl -X POST https://your-ai-service-url/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x123...",
    "from": "0xabc...",
    "to": "0xdef...",
    "value": "1.5",
    "gasLimit": "21000"
  }'
```

### Performance Testing

```bash
# Batch analysis test
curl -X POST https://your-ai-service-url/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {"hash": "0x1...", "from": "0xa...", "to": "0xb...", "value": "1.0"},
      {"hash": "0x2...", "from": "0xc...", "to": "0xd...", "value": "2.0"}
    ]
  }'
```

## 📊 Monitoring and Maintenance

### Service URLs

After deployment, you'll get URLs for:
- **AI Service**: `https://provider-url:port` - API endpoints
- **Frontend**: `https://provider-url:port` - Web dashboard  
- **Monitoring**: `https://provider-url:9090` - Prometheus metrics

### Key Metrics to Monitor

1. **AI Service Performance**
   - Response time per analysis
   - GPU utilization
   - Cache hit rate
   - Error rate

2. **Resource Usage**
   - CPU and memory consumption
   - GPU memory usage
   - Network bandwidth
   - Storage usage

3. **Business Metrics**
   - Transactions analyzed per hour
   - Threats detected
   - False positive rate
   - Service uptime

### Scaling

To scale your deployment:

```yaml
deployment:
  defi-guard-ai:
    akash:
      profile: defi-guard-ai
      count: 3  # Run 3 instances for load balancing
```

## 🔒 Security Best Practices

### API Key Management
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate keys regularly
- Monitor API usage for anomalies

### Network Security
- Use HTTPS for all external communications
- Implement rate limiting
- Monitor for suspicious access patterns
- Keep dependencies updated

### Access Control
- Restrict admin endpoints
- Implement authentication for sensitive operations
- Use least privilege principle
- Monitor access logs

## 🚨 Troubleshooting

### Common Issues

**1. No Bids Received**
```bash
# Solution: Increase bid price or adjust resource requirements
# Edit akash-deploy.yaml and increase pricing amounts
```

**2. Services Not Starting**
```bash
# Check logs for errors
akash provider lease-logs --service defi-guard-ai ...

# Common causes:
# - Insufficient resources
# - Missing environment variables
# - Image pull failures
```

**3. GPU Not Available**
```bash
# Ensure GPU requirements are correctly specified
# Check provider has GPU resources available
# Consider fallback to CPU-only deployment
```

**4. High Latency**
```bash
# Solutions:
# - Enable Redis caching
# - Choose providers closer to your users
# - Optimize AI model parameters
```

### Getting Help

- **Akash Discord**: [discord.gg/akash](https://discord.gg/akash)
- **Documentation**: [docs.akash.network](https://docs.akash.network)
- **Provider Status**: [stats.akash.network](https://stats.akash.network)

## 💰 Cost Optimization

### Estimated Costs (per month)

| Service | Resources | Estimated Cost |
|---------|-----------|----------------|
| AI Service (GPU) | 4 CPU, 8GB RAM, 1 GPU | ~$200-400 |
| Backend | 2 CPU, 4GB RAM | ~$30-60 |
| Frontend | 1 CPU, 2GB RAM | ~$15-30 |
| Redis Cache | 0.5 CPU, 1GB RAM | ~$10-20 |
| **Total** | | **~$255-510** |

### Cost Reduction Tips

1. **Right-size Resources**: Start small and scale up
2. **Use Spot Pricing**: Accept lower availability for lower costs
3. **Optimize Images**: Smaller images = faster deployment
4. **Cache Aggressively**: Reduce AI API calls
5. **Monitor Usage**: Track and optimize resource utilization

## 🎯 Next Steps

After successful deployment:

1. **Integrate with Your DApp**: Update your frontend to use Akash-hosted APIs
2. **Set Up Monitoring**: Configure alerts for service health
3. **Performance Tuning**: Optimize based on real usage patterns
4. **Security Hardening**: Implement additional security measures
5. **Documentation**: Document your specific configuration and procedures

## 📞 Support

For deployment support:
- Create issues in the repository
- Join the Akash Network community
- Consult the comprehensive documentation

---

**🎉 Congratulations!** Your DeFi Transaction Guard is now running on the decentralized Akash Network with GPU acceleration and AI-powered security analysis!