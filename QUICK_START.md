# 🚀 Quick Start Guide - DeFi Transaction Guard

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Go** (v1.21 or higher) - [Download here](https://golang.org/dl/)
- **Git** - [Download here](https://git-scm.com/)

## 🏃‍♂️ Quick Start (3 Steps)

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd defi-transaction-guard

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
go mod tidy
cd ..
```

### Step 2: Start Backend API
```bash
cd backend
go run .
```
**Backend will start on:** http://localhost:8080

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
**Frontend will start on:** http://localhost:5173

## 🎯 That's It! 

Open your browser and go to **http://localhost:5173** to see the DeFi Transaction Guard dashboard!

---

## 🔧 Advanced Setup (Optional)

### Add Real AI Integration

1. **Get API Keys:**
   - **Grok API**: https://console.groq.com/
   - **Gemini API**: https://makersuite.google.com/app/apikey

2. **Configure Backend:**
```bash
cd backend
cp .env.example .env

# Edit .env file with your real API keys
GROK_API=gsk_your_actual_grok_key_here
GEMINI_API=your_actual_gemini_key_here
```

3. **Restart Backend:**
```bash
go run .
```

### Deploy Smart Contracts (Optional)

1. **Setup Blockchain:**
```bash
cd blockchain
npm install
```

2. **Start Local Blockchain:**
```bash
npm run node
```

3. **Deploy Contracts:**
```bash
npm run deploy
```

---

## 📱 What You'll See

### Dashboard Features:
- ✅ **Real-time Stats**: Transactions screened, exploits blocked, funds protected
- ✅ **Live Threat Feed**: Recent blocked attacks with AI confidence scores
- ✅ **System Status**: AI engine, blockchain, and API gateway health
- ✅ **Modern UI**: Black-themed design with gradient effects

### Demo Features:
- ✅ **Simulate Exploits**: Test the AI detection system
- ✅ **Real-time Analysis**: Watch transactions get analyzed in real-time
- ✅ **Blockchain Integration**: See risk scores updated on-chain

---

## 🛠️ Troubleshooting

### Port Conflicts
If you get port errors:
```bash
# Kill any processes using the ports
lsof -ti:8080,5173 | xargs kill -9

# Or use different ports
HTTP_PORT=8081 go run .  # Backend on 8081
npm run dev -- --port 3000  # Frontend on 3000
```

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8080/health

# View backend logs
cd backend
go run . 2>&1 | tee backend.log
```

### Frontend Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🌐 API Endpoints

Once running, you can test these endpoints:

- **Health Check**: http://localhost:8080/health
- **AI Status**: http://localhost:8080/api/ai/status
- **Risk Analysis**: POST http://localhost:8080/api/risk-score
- **System Stats**: http://localhost:8080/api/stats

---

## 🎮 Demo Usage

1. **Open Dashboard**: Go to http://localhost:5173
2. **View Live Stats**: See real-time transaction screening
3. **Check Threat Feed**: View recently blocked attacks
4. **Run Demo**: Click "Live Demo" to simulate exploit attempts
5. **Monitor System**: Check AI and blockchain status

---

## 🚀 Production Deployment

For production deployment with real AI and blockchain:

1. **Configure Environment**:
   - Add real Grok/Gemini API keys
   - Set up BlockDAG network connection
   - Configure Akash deployment

2. **Deploy to Akash**:
```bash
akash tx deployment create deploy.yaml --from wallet
```

3. **Monitor Performance**:
   - Check AI response times (<200ms)
   - Monitor blockchain confirmations
   - Track exploit detection accuracy

---

## 📞 Need Help?

- **Check Logs**: Both frontend and backend show detailed logs
- **Test APIs**: Use the provided curl commands
- **Review Code**: All components are well-documented
- **Run Tests**: Use the test scripts in each directory

**Happy Hacking! 🛡️**