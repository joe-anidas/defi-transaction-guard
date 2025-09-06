# 🚀 **DeFi Transaction Guard - Quick Start Guide**

## **⚡ One-Command Setup**

```bash
# Clone and run everything
git clone https://github.com/your-username/defi-transaction-guard.git
cd defi-transaction-guard
./run.sh
```

**That's it!** Your DeFi Transaction Guard will be running at http://localhost:5173

---

## **🔧 Manual Setup (Step by Step)**

### **1. Prerequisites**
```bash
# Install required tools
# Node.js v18+
# Go v1.21+
# Python 3.10+
# Docker & Docker Compose
```

### **2. Clone Repository**
```bash
git clone https://github.com/your-username/defi-transaction-guard.git
cd defi-transaction-guard
```

### **3. Start Backend (Terminal 1)**
```bash
cd backend
go mod tidy
go run main.go
```
**Backend running on**: http://localhost:8080

### **4. Start AI Service (Terminal 2)**
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
**AI Service running on**: http://localhost:5000

### **5. Start Frontend (Terminal 3)**
```bash
cd frontend
npm install
npm run dev
```
**Frontend running on**: http://localhost:5173

### **6. Deploy Smart Contracts (Terminal 4)**
```bash
cd blockchain
npm install
npm run deploy
```

---

## **🎯 Demo Scenarios**

### **1. Test AI Analysis**
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "from": "0xabcdef1234567890abcdef1234567890abcdef12",
    "to": "0x9876543210fedcba9876543210fedcba98765432",
    "value": "1.0",
    "gasLimit": "21000",
    "data": "0x"
  }'
```

### **2. Test Backend API**
```bash
curl -X POST http://localhost:8080/risk-score \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "from": "0xabcdef1234567890abcdef1234567890abcdef12",
    "to": "0x9876543210fedcba9876543210fedcba98765432",
    "value": "1.0",
    "gasLimit": "21000",
    "data": "0x"
  }'
```

### **3. Test Health Checks**
```bash
# AI Service Health
curl http://localhost:5000/health

# Backend Health
curl http://localhost:8080/health

# System Status
curl http://localhost:8080/stats
```

---

## **🌐 Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Dashboard** | http://localhost:5173 | Main UI with real-time monitoring |
| **Backend API** | http://localhost:8080 | GoFr API server |
| **AI Service** | http://localhost:5000 | Python AI analysis service |
| **Health Check** | http://localhost:5000/health | System health monitoring |

---

## **🔧 Configuration**

### **Environment Variables**

Create `.env` files in each service:

#### **Backend (.env)**
```bash
AI_SERVICE_URL=http://localhost:5000
GROK_API_KEY=your_grok_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
BLOCKDAG_NODE_URL=https://rpc.blockdag.network
BLOCKDAG_API_KEY=your_blockdag_api_key_here
LOG_LEVEL=info
```

#### **AI Service (.env)**
```bash
GROK_API_KEY=your_grok_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
GPU_ACCELERATION=true
```

#### **Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_AI_SERVICE_URL=http://localhost:5000
REACT_APP_BLOCKDAG_ENABLED=true
```

---

## **🧪 Testing**

### **Run All Tests**
```bash
# Backend tests
cd backend && go test ./...

# AI service tests
cd ai-service && python -m pytest

# Frontend tests
cd frontend && npm test

# Smart contract tests
cd blockchain && npm test
```

### **Test AI Integration**
```bash
# Test with malicious transaction
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0xmalicious1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "from": "0xattacker1234567890abcdef1234567890abcdef12",
    "to": "0xvictim1234567890abcdef1234567890abcdef12",
    "value": "100.0",
    "gasLimit": "500000",
    "data": "0x608060405234801561001057600080fd5b50"
  }'
```

---

## **🚀 Akash Deployment**

### **Quick Deploy**
```bash
# Build and push images
./build-and-push-images.sh

# Deploy to Akash
./deploy-to-akash.sh
```

### **Manual Deploy**
```bash
# Install Akash CLI
curl -s https://raw.githubusercontent.com/ovrclk/akash/master/install.sh | sh

# Create wallet
akash keys add defi-guard-wallet

# Get AKT tokens from faucet
# https://faucet.akash.network/

# Deploy
akash tx deployment create demo-sdl.yaml --from defi-guard-wallet
```

---

## **📊 Expected Results**

### **AI Analysis Response**
```json
{
  "success": true,
  "riskScore": 85,
  "threatType": "Flash Loan Attack",
  "confidence": 0.92,
  "reasoning": "High gas limit with complex call data suggests flash loan attack pattern",
  "indicators": ["high-gas-limit", "complex-call-data", "flash-loan-pattern"],
  "provider": "grok-akash",
  "processTime": 156,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Backend API Response**
```json
{
  "success": true,
  "riskScore": 85,
  "threatType": "Flash Loan Attack",
  "confidence": 0.92,
  "reasoning": "AI analysis detected flash loan attack pattern",
  "indicators": ["high-gas-limit", "complex-call-data"],
  "provider": "grok-akash",
  "processTime": 156,
  "isBlocked": true,
  "timestamp": 1705312200
}
```

---

## **🔍 Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### **Python Dependencies**
```bash
cd ai-service
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Node Dependencies**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### **Go Dependencies**
```bash
cd backend
go mod tidy
go mod download
```

### **Health Checks**
```bash
# Check all services
curl http://localhost:5000/health  # AI Service
curl http://localhost:8080/health  # Backend
curl http://localhost:5173         # Frontend
```

---

## **🎉 Success!**

If everything is working, you should see:

1. **Frontend Dashboard** at http://localhost:5173
2. **Real-time AI Analysis** working
3. **Transaction Blocking** in action
4. **Health Monitoring** showing all green
5. **Demo Interface** allowing exploit simulation

**Your DeFi Transaction Guard is now protecting the DeFi ecosystem!** 🛡️

---

## **📞 Support**

- **Documentation**: [Full README](README.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/defi-transaction-guard/issues)
- **Discord**: [Community Support](https://discord.gg/your-discord)

**Happy coding!** 🚀