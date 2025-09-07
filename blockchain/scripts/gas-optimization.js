const { ethers } = require("hardhat");

/**
 * Gas Optimization Script for DeFi Transaction Guard
 * 
 * This script demonstrates gas optimization techniques and provides
 * tools to estimate and reduce gas costs for transactions.
 */

async function main() {
  console.log("🔧 Gas Optimization Analysis for DeFi Transaction Guard");
  console.log("=====================================================");

  // Get the contract factory
  const TransactionGuard = await ethers.getContractFactory("TransactionGuard");
  const OptimizedTransactionGuard = await ethers.getContractFactory("OptimizedTransactionGuard");
  
  // Deploy both versions for comparison
  console.log("\n📦 Deploying contracts for gas comparison...");
  
  // Mock BDAG token for testing
  const MockBDAG = await ethers.getContractFactory("MockBDAG");
  const bdagToken = await MockBDAG.deploy();
  await bdagToken.deployed();
  console.log("✅ MockBDAG deployed to:", bdagToken.address);
  
  // Deploy original version
  const originalGuard = await TransactionGuard.deploy(bdagToken.address, ethers.constants.AddressZero);
  await originalGuard.deployed();
  console.log("✅ Original TransactionGuard deployed to:", originalGuard.address);
  
  // Deploy optimized version
  const optimizedGuard = await OptimizedTransactionGuard.deploy(bdagToken.address, ethers.constants.AddressZero);
  await optimizedGuard.deployed();
  console.log("✅ Optimized TransactionGuard deployed to:", optimizedGuard.address);
  
  // Gas estimation functions
  console.log("\n⛽ Gas Cost Analysis");
  console.log("===================");
  
  // Estimate gas for stake function
  const stakeAmount = ethers.utils.parseEther("1000");
  
  // Original contract gas estimation
  const originalStakeGas = await originalGuard.estimateGas.stakeAsValidator(stakeAmount);
  console.log(`📊 Original stakeAsValidator: ${originalStakeGas.toString()} gas`);
  
  // Optimized contract gas estimation
  const optimizedStakeGas = await optimizedGuard.estimateGas.stakeAsValidator(stakeAmount);
  console.log(`📊 Optimized stakeAsValidator: ${optimizedStakeGas.toString()} gas`);
  
  const gasSavings = originalStakeGas.sub(optimizedStakeGas);
  const gasSavingsPercent = (gasSavings.mul(100)).div(originalStakeGas);
  console.log(`💰 Gas savings: ${gasSavings.toString()} gas (${gasSavingsPercent.toString()}%)`);
  
  // Estimate gas for risk assessment
  const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-transaction"));
  const riskScore = 85;
  const threatType = "Flash Loan Attack";
  
  // Original contract
  const originalRiskGas = await originalGuard.estimateGas.submitRiskAssessment(
    txHash, 
    riskScore, 
    threatType
  );
  console.log(`📊 Original submitRiskAssessment: ${originalRiskGas.toString()} gas`);
  
  // Optimized contract (using enum instead of string)
  const optimizedRiskGas = await optimizedGuard.estimateGas.submitRiskAssessment(
    txHash, 
    riskScore, 
    1 // Flash loan enum value
  );
  console.log(`📊 Optimized submitRiskAssessment: ${optimizedRiskGas.toString()} gas`);
  
  const riskGasSavings = originalRiskGas.sub(optimizedRiskGas);
  const riskGasSavingsPercent = (riskGasSavings.mul(100)).div(originalRiskGas);
  console.log(`💰 Risk assessment gas savings: ${riskGasSavings.toString()} gas (${riskGasSavingsPercent.toString()}%)`);
  
  // Batch operations gas estimation
  console.log("\n🔄 Batch Operations Analysis");
  console.log("============================");
  
  const contracts = [
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address
  ];
  const scores = [75, 60, 90];
  
  // Estimate individual updates vs batch update
  let individualGas = ethers.BigNumber.from(0);
  for (let i = 0; i < contracts.length; i++) {
    const gas = await originalGuard.estimateGas.updateRiskScore(contracts[i], scores[i]);
    individualGas = individualGas.add(gas);
  }
  
  const batchGas = await originalGuard.estimateGas.batchUpdateRiskScores(contracts, scores);
  
  console.log(`📊 Individual updates: ${individualGas.toString()} gas`);
  console.log(`📊 Batch update: ${batchGas.toString()} gas`);
  console.log(`💰 Batch savings: ${individualGas.sub(batchGas).toString()} gas`);
  
  // Gas optimization recommendations
  console.log("\n💡 Gas Optimization Recommendations");
  console.log("===================================");
  console.log("1. ✅ Use packed structs to reduce storage slots");
  console.log("2. ✅ Replace strings with enums for threat types");
  console.log("3. ✅ Use custom errors instead of require strings");
  console.log("4. ✅ Implement batch operations for multiple updates");
  console.log("5. ✅ Use unchecked arithmetic where safe");
  console.log("6. ✅ Pack storage variables efficiently");
  console.log("7. ✅ Reduce external calls and storage reads");
  console.log("8. ✅ Use events with indexed parameters");
  
  // Gas cost estimation at different gas prices
  console.log("\n💵 Gas Cost Estimation (USD)");
  console.log("============================");
  
  const gasPrices = [20, 50, 100, 200]; // Gwei
  const ethPrice = 2000; // USD per ETH
  
  for (const gasPrice of gasPrices) {
    const gasPriceWei = ethers.utils.parseUnits(gasPrice.toString(), "gwei");
    const stakeCostWei = optimizedStakeGas.mul(gasPriceWei);
    const stakeCostEth = ethers.utils.formatEther(stakeCostWei);
    const stakeCostUsd = parseFloat(stakeCostEth) * ethPrice;
    
    console.log(`Gas Price: ${gasPrice} Gwei | Stake Cost: $${stakeCostUsd.toFixed(4)}`);
  }
  
  // Network-specific optimizations
  console.log("\n🌐 Network-Specific Optimizations");
  console.log("=================================");
  console.log("BlockDAG Testnet:");
  console.log("- Lower gas prices due to parallel processing");
  console.log("- Faster confirmation times");
  console.log("- Reduced congestion");
  console.log("- Estimated 30-50% gas savings vs Ethereum");
  
  console.log("\nPolygon Mumbai:");
  console.log("- Very low gas prices");
  console.log("- Fast confirmation");
  console.log("- Good for testing");
  
  console.log("\nEthereum Mainnet:");
  console.log("- Highest gas prices");
  console.log("- Use gas optimization techniques");
  console.log("- Consider Layer 2 solutions");
  
  // Deployment recommendations
  console.log("\n🚀 Deployment Recommendations");
  console.log("=============================");
  console.log("1. Deploy optimized contracts to BlockDAG testnet");
  console.log("2. Use batch operations for initial setup");
  console.log("3. Implement gas price monitoring");
  console.log("4. Set up gas price alerts");
  console.log("5. Use gas estimation before transactions");
  
  console.log("\n✅ Gas optimization analysis complete!");
}

// Gas monitoring utility
async function monitorGasPrices() {
  console.log("📊 Gas Price Monitoring");
  console.log("=======================");
  
  const provider = ethers.provider;
  
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
    
    if (maxFeePerGas) {
      console.log(`Max Fee Per Gas: ${ethers.utils.formatUnits(maxFeePerGas, "gwei")} Gwei`);
    }
    
    if (maxPriorityFeePerGas) {
      console.log(`Max Priority Fee: ${ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")} Gwei`);
    }
    
    // Gas price recommendations
    const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, "gwei"));
    
    if (gasPriceGwei < 20) {
      console.log("🟢 Gas prices are low - good time to transact");
    } else if (gasPriceGwei < 50) {
      console.log("🟡 Gas prices are moderate - consider timing");
    } else {
      console.log("🔴 Gas prices are high - wait for better timing");
    }
    
  } catch (error) {
    console.error("Error monitoring gas prices:", error);
  }
}

// Execute gas optimization analysis
main()
  .then(() => {
    console.log("\n🔧 Running gas price monitoring...");
    return monitorGasPrices();
  })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
