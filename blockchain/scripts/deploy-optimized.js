const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Optimized Deployment Script for DeFi Transaction Guard
 * 
 * This script deploys gas-optimized contracts to BlockDAG testnet
 * with proper configuration and gas optimization.
 */

async function main() {
  console.log("🚀 Deploying Optimized DeFi Transaction Guard Contracts");
  console.log("=====================================================");

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Gas price information
  const gasPrice = await ethers.provider.getGasPrice();
  console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);

  // Deploy MockBDAG token first
  console.log("\n📦 Deploying MockBDAG Token...");
  const MockBDAG = await ethers.getContractFactory("MockBDAG");
  const bdagToken = await MockBDAG.deploy();
  await bdagToken.deployed();
  console.log(`✅ MockBDAG deployed to: ${bdagToken.address}`);

  // Deploy Optimized TransactionGuard
  console.log("\n🛡️ Deploying Optimized TransactionGuard...");
  const OptimizedTransactionGuard = await ethers.getContractFactory("OptimizedTransactionGuard");
  
  // Estimate gas for deployment
  const deploymentGas = await OptimizedTransactionGuard.signer.estimateGas(
    OptimizedTransactionGuard.getDeployTransaction(bdagToken.address, deployer.address)
  );
  console.log(`📊 Estimated deployment gas: ${deploymentGas.toString()}`);
  
  // Deploy with gas optimization
  const transactionGuard = await OptimizedTransactionGuard.deploy(
    bdagToken.address,
    deployer.address,
    {
      gasLimit: 8000000, // High gas limit for complex contract
      gasPrice: gasPrice.mul(110).div(100), // 10% higher gas price for faster confirmation
    }
  );
  await transactionGuard.deployed();
  console.log(`✅ Optimized TransactionGuard deployed to: ${transactionGuard.address}`);

  // Deploy Optimized ProtectedDEX
  console.log("\n🏦 Deploying Optimized ProtectedDEX...");
  const OptimizedProtectedDEX = await ethers.getContractFactory("OptimizedProtectedDEX");
  const protectedDEX = await OptimizedProtectedDEX.deploy(
    transactionGuard.address,
    {
      gasLimit: 6000000,
      gasPrice: gasPrice.mul(110).div(100),
    }
  );
  await protectedDEX.deployed();
  console.log(`✅ Optimized ProtectedDEX deployed to: ${protectedDEX.address}`);

  // Deploy GuardRegistry
  console.log("\n📋 Deploying GuardRegistry...");
  const GuardRegistry = await ethers.getContractFactory("GuardRegistry");
  const guardRegistry = await GuardRegistry.deploy(
    transactionGuard.address,
    {
      gasLimit: 4000000,
      gasPrice: gasPrice.mul(110).div(100),
    }
  );
  await guardRegistry.deployed();
  console.log(`✅ GuardRegistry deployed to: ${guardRegistry.address}`);

  // Verify deployments
  console.log("\n🔍 Verifying Deployments...");
  
  // Check contract codes
  const bdagCode = await ethers.provider.getCode(bdagToken.address);
  const guardCode = await ethers.provider.getCode(transactionGuard.address);
  const dexCode = await ethers.provider.getCode(protectedDEX.address);
  const registryCode = await ethers.provider.getCode(guardRegistry.address);

  console.log(`📊 BDAG Token code size: ${bdagCode.length} bytes`);
  console.log(`📊 TransactionGuard code size: ${guardCode.length} bytes`);
  console.log(`📊 ProtectedDEX code size: ${dexCode.length} bytes`);
  console.log(`📊 GuardRegistry code size: ${registryCode.length} bytes`);

  // Test basic functionality
  console.log("\n🧪 Testing Basic Functionality...");
  
  try {
    // Test BDAG token
    const totalSupply = await bdagToken.totalSupply();
    console.log(`✅ BDAG Total Supply: ${ethers.utils.formatEther(totalSupply)} BDAG`);

    // Test TransactionGuard
    const maxRiskScore = await transactionGuard.MAX_RISK_SCORE();
    const blockThreshold = await transactionGuard.BLOCK_THRESHOLD();
    console.log(`✅ Max Risk Score: ${maxRiskScore}`);
    console.log(`✅ Block Threshold: ${blockThreshold}`);

    // Test ProtectedDEX
    const feeRate = await protectedDEX.FEE_RATE();
    console.log(`✅ DEX Fee Rate: ${feeRate} basis points`);

    console.log("✅ All basic functionality tests passed!");
  } catch (error) {
    console.error("❌ Basic functionality test failed:", error);
  }

  // Gas optimization analysis
  console.log("\n⛽ Gas Optimization Analysis");
  console.log("============================");
  
  // Estimate gas for common operations
  const stakeAmount = ethers.utils.parseEther("1000");
  
  try {
    const stakeGas = await transactionGuard.estimateGas.stakeAsValidator(stakeAmount);
    console.log(`📊 Stake as Validator: ${stakeGas.toString()} gas`);
    
    const riskAssessmentGas = await transactionGuard.estimateGas.submitRiskAssessment(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-tx")),
      85,
      1 // Flash loan enum
    );
    console.log(`📊 Submit Risk Assessment: ${riskAssessmentGas.toString()} gas`);
    
    const updateRiskGas = await transactionGuard.estimateGas.updateRiskScore(
      ethers.Wallet.createRandom().address,
      75
    );
    console.log(`📊 Update Risk Score: ${updateRiskGas.toString()} gas`);
    
    // Calculate gas costs in USD (assuming $2000 ETH)
    const ethPrice = 2000;
    const stakeCostWei = stakeGas.mul(gasPrice);
    const stakeCostEth = parseFloat(ethers.utils.formatEther(stakeCostWei));
    const stakeCostUsd = stakeCostEth * ethPrice;
    
    console.log(`💰 Stake Cost: $${stakeCostUsd.toFixed(4)} USD`);
    
  } catch (error) {
    console.error("❌ Gas estimation failed:", error);
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
    timestamp: new Date().toISOString(),
    contracts: {
      MockBDAG: bdagToken.address,
      OptimizedTransactionGuard: transactionGuard.address,
      OptimizedProtectedDEX: protectedDEX.address,
      GuardRegistry: guardRegistry.address
    },
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Save to file
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}-${network.chainId}.json`);
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Update frontend addresses
  const frontendAddressesPath = path.join(__dirname, "..", "..", "frontend", "src", "contracts", "addresses.json");
  const frontendAddresses = {
    [network.chainId]: {
      MockBDAG: bdagToken.address,
      TransactionGuard: transactionGuard.address,
      ProtectedDEX: protectedDEX.address,
      GuardRegistry: guardRegistry.address
    }
  };
  
  fs.writeFileSync(frontendAddressesPath, JSON.stringify(frontendAddresses, null, 2));
  console.log(`✅ Frontend addresses updated: ${frontendAddressesPath}`);

  // Network-specific instructions
  console.log("\n🌐 Network-Specific Instructions");
  console.log("=================================");
  
  if (network.chainId === 19648) {
    console.log("🎉 BlockDAG Testnet Deployment Complete!");
    console.log("📋 Next Steps:");
    console.log("1. Add BlockDAG testnet to your wallet");
    console.log("2. Get test BDAG tokens from faucet");
    console.log("3. Test the DeFi Transaction Guard functionality");
    console.log("4. Monitor gas usage and performance");
  } else if (network.chainId === 31337) {
    console.log("🏠 Localhost Deployment Complete!");
    console.log("📋 Next Steps:");
    console.log("1. Start the frontend application");
    console.log("2. Connect to localhost network");
    console.log("3. Test all functionality locally");
  } else {
    console.log("⚠️  Non-optimal network detected");
    console.log("📋 Recommendations:");
    console.log("1. Switch to BlockDAG testnet for best experience");
    console.log("2. Or use localhost for development");
    console.log("3. Consider gas costs on this network");
  }

  // Final summary
  console.log("\n🎯 Deployment Summary");
  console.log("=====================");
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
  console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  console.log("\nContract Addresses:");
  console.log(`MockBDAG: ${bdagToken.address}`);
  console.log(`TransactionGuard: ${transactionGuard.address}`);
  console.log(`ProtectedDEX: ${protectedDEX.address}`);
  console.log(`GuardRegistry: ${guardRegistry.address}`);
  
  console.log("\n✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
