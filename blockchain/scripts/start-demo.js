const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function startDemo() {
  console.log("🚀 Starting DeFi Transaction Guard Demo Environment...");
  
  // Check if we're already running on a network
  try {
    const { ethers } = require("hardhat");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    
    if (network.chainId === 31337) {
      console.log("✅ Local blockchain detected, proceeding with deployment...");
      
      // Deploy contracts
      console.log("📄 Deploying contracts...");
      const deployProcess = spawn('npm', ['run', 'deploy'], { 
        stdio: 'inherit',
        cwd: __dirname + '/..'
      });
      
      deployProcess.on('close', (code) => {
        if (code === 0) {
          console.log("✅ Contracts deployed successfully!");
          
          // Verify deployment
          console.log("🔍 Verifying deployment...");
          const verifyProcess = spawn('npm', ['run', 'verify'], { 
            stdio: 'inherit',
            cwd: __dirname + '/..'
          });
          
          verifyProcess.on('close', (verifyCode) => {
            if (verifyCode === 0) {
              console.log("\n🎉 Demo environment ready!");
              console.log("=" .repeat(50));
              console.log("🛡️ DeFi Transaction Guard is live!");
              console.log("=" .repeat(50));
              console.log("\n📋 Next Steps:");
              console.log("1. cd ../backend && go run main.go");
              console.log("2. cd ../frontend && npm run dev");
              console.log("3. Open http://localhost:5173");
              console.log("4. Connect wallet and try the demo!");
            } else {
              console.error("❌ Deployment verification failed");
            }
          });
        } else {
          console.error("❌ Contract deployment failed");
        }
      });
      
    } else {
      console.log("⚠️  Not on local network. Please start Hardhat node first:");
      console.log("   npm run node");
    }
    
  } catch (error) {
    console.error("❌ Error connecting to blockchain:", error.message);
    console.log("\n📋 To start the demo:");
    console.log("1. npm run node (in separate terminal)");
    console.log("2. npm run start-demo");
  }
}

// Run if called directly
if (require.main === module) {
  startDemo().catch(console.error);
}

module.exports = { startDemo };