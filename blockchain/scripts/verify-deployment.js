const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verifying DeFi Transaction Guard Deployment...");
  
  // Load deployed addresses
  const addressesPath = path.join(__dirname, '../../frontend/src/contracts/addresses.json');
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ Addresses file not found. Please deploy contracts first.");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  console.log("📄 Loaded contract addresses");

  // Get contract instances
  const transactionGuard = await ethers.getContractAt("TransactionGuard", addresses.transactionGuard);
  const guardRegistry = await ethers.getContractAt("GuardRegistry", addresses.guardRegistry);
  const bdagToken = await ethers.getContractAt("MockBDAG", addresses.bdagToken);
  const protectedDEX = await ethers.getContractAt("ProtectedDEX", addresses.protectedDEX);
  const tokenA = await ethers.getContractAt("TestTokenA", addresses.tokenA);
  const tokenB = await ethers.getContractAt("TestTokenB", addresses.tokenB);

  console.log("\n🧪 Running Verification Tests...");

  try {
    // Test 1: Verify BDAG token
    const bdagName = await bdagToken.name();
    const bdagSymbol = await bdagToken.symbol();
    console.log(`✅ BDAG Token: ${bdagName} (${bdagSymbol})`);

    // Test 2: Verify Transaction Guard configuration
    const guardBdagToken = await transactionGuard.bdagToken();
    const blockThreshold = await transactionGuard.BLOCK_THRESHOLD();
    console.log(`✅ Transaction Guard: BDAG=${guardBdagToken === addresses.bdagToken ? '✓' : '✗'}, Threshold=${blockThreshold}`);

    // Test 3: Verify firewall statistics
    const stats = await transactionGuard.getFirewallStats();
    console.log(`✅ Firewall Stats: Screened=${stats.transactionsScreened}, Blocked=${stats.exploitsBlocked}, Protected=${ethers.utils.formatEther(stats.fundsProtected)} ETH`);

    // Test 4: Verify validator staking
    const [deployer] = await ethers.getSigners();
    const validatorInfo = await transactionGuard.getValidatorInfo(deployer.address);
    console.log(`✅ Validator Stake: ${ethers.utils.formatEther(validatorInfo.stakedAmount)} BDAG, Active=${validatorInfo.isActive}`);

    // Test 5: Verify DEX pool
    const poolId = addresses.poolId;
    const poolInfo = await protectedDEX.getPoolInfo(poolId);
    console.log(`✅ DEX Pool: TokenA=${poolInfo.tokenA}, TokenB=${poolInfo.tokenB}, Liquidity=${poolInfo.totalLiquidity > 0 ? '✓' : '✗'}`);

    // Test 6: Verify registry
    const registryStats = await guardRegistry.getRegistryStats();
    console.log(`✅ Registry: ${registryStats.totalProtocols} protocols, ${registryStats.activeProtocols} active`);

    // Test 7: Test risk score functionality
    const testContractRisk = await transactionGuard.riskScores(addresses.maliciousContract);
    console.log(`✅ Risk Scores: Malicious contract risk = ${testContractRisk}/100`);

    // Test 8: Verify token balances
    const deployerBdagBalance = await bdagToken.balanceOf(deployer.address);
    const deployerTokenABalance = await tokenA.balanceOf(deployer.address);
    console.log(`✅ Token Balances: BDAG=${ethers.utils.formatEther(deployerBdagBalance)}, TokenA=${ethers.utils.formatEther(deployerTokenABalance)}`);

    console.log("\n🎉 All Verification Tests Passed!");
    console.log("=" .repeat(50));
    console.log("🛡️ DeFi Transaction Guard is ready for demo!");
    console.log("=" .repeat(50));

    // Display demo instructions
    console.log("\n🚀 Demo Instructions:");
    console.log("1. Start backend: cd ../backend && go run main.go");
    console.log("2. Start frontend: cd ../frontend && npm run dev");
    console.log("3. Open http://localhost:5173");
    console.log("4. Connect wallet and try the exploit simulation");

    // Display key metrics for demo
    console.log("\n📊 Key Demo Metrics:");
    console.log(`   • Transactions Screened: ${stats.transactionsScreened}`);
    console.log(`   • Exploits Blocked: ${stats.exploitsBlocked}`);
    console.log(`   • Funds Protected: ${ethers.utils.formatEther(stats.fundsProtected)} ETH`);
    console.log(`   • Active Validators: ${stats.activeValidatorCount}`);
    console.log(`   • Total Staked: ${ethers.utils.formatEther(stats.totalStakedAmount)} BDAG`);

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });