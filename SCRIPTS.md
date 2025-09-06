# 🚀 DeFi Transaction Guard - Essential Scripts

## 📋 Available Scripts

| Script | Purpose | Description |
|--------|---------|-------------|
| `./start.sh` | **Start All Services** | Opens 4 terminals, starts all services, installs dependencies |
| `./deploy-contracts.sh` | **Deploy Contracts** | Deploys smart contracts to blockchain |
| `./stop.sh` | **Stop All Services** | Stops all services and cleans up |
| `./build-and-push-images.sh` | **Build Docker Images** | Builds and pushes Docker images |
| `./deploy-to-akash.sh` | **Deploy to Akash** | Deploys to Akash Network |

---

## 🎯 **Quick Start**

### **1. Start All Services**
```bash
./start.sh
```
This will:
- Check prerequisites (Node.js, Go, Python)
- Install dependencies automatically
- Open 4 terminals with all services
- Start blockchain node, AI service, backend, and frontend

### **2. Deploy Contracts**
```bash
./deploy-contracts.sh
```
This will:
- Wait for blockchain node to be ready
- Compile and deploy smart contracts
- Update contract addresses

### **3. Test the System**
- Open: http://localhost:5173
- Test AI: http://localhost:5002/health
- Test Backend: http://localhost:8080/health

### **4. Stop All Services**
```bash
./stop.sh
```

---

## 🌐 **Service URLs**

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Backend API** | http://localhost:8080 | 8080 |
| **AI Service** | http://localhost:5002 | 5002 |
| **Blockchain** | http://localhost:8545 | 8545 |

---

## 🧪 **Quick Tests**

### **Health Checks**
```bash
# AI Service
curl http://localhost:5002/health

# Backend
curl http://localhost:8080/health

# Blockchain
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### **AI Analysis Test**
```bash
curl -X POST http://localhost:5002/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "from": "0xabcdef1234567890abcdef1234567890abcdef12",
    "to": "0x9876543210fedcba9876543210fedcba98765432",
    "value": "1.5",
    "gasLimit": "21000",
    "data": "0x"
  }'
```

---

## 🔧 **Troubleshooting**

### **Port Already in Use**
```bash
./stop.sh
```

### **Services Not Starting**
1. Check terminal outputs for errors
2. Ensure all dependencies are installed
3. Verify ports are not in use

### **Blockchain Issues**
- Make sure blockchain node is running
- Check `blockchain/` directory has `node_modules`
- Verify Hardhat configuration

---

## 🚀 **Production Deployment**

### **Build Docker Images**
```bash
./build-and-push-images.sh
```

### **Deploy to Akash**
```bash
./deploy-to-akash.sh
```

---

**That's it! Your DeFi Transaction Guard is ready to protect the ecosystem!** 🛡️
