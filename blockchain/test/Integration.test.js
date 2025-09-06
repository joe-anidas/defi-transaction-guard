const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Transaction Guard - Full Integration", function () {
  let transactionGuard, guardRegistry, protectedDEX;
  let bdagToken, tokenA, tokenB, maliciousContract;
  let owner, validator, user, attacker;
  let poolId;

  beforeEach(async function () {
    [owner, validator, user, attacker] = await ethers.getSigners();

    // Deploy all contracts
    const MockBDAG = await ethers.getContractFactory("MockBDAG");
    bdagToken = await MockBDAG.deploy();

    const TransactionGuard = await ethers.getContractFactory("TransactionGuard");
    transactionGuard = await TransactionGuard.deploy(bdagToken.address, owner.address);

    const GuardRegistry = await ethers.getContractFactory("GuardRegistry");
    guardRegistry = await GuardRegistry.deploy(transactionGuard.address);

    const TestTokenA = await ethers.getContractFactory("TestTokenA");
    tokenA = await TestTokenA.deploy();

    const TestTokenB = await ethers.getContractFactory("TestTokenB");
    tokenB = await TestTokenB.deploy();

    const ProtectedDEX = await ethers.getContractFactory("ProtectedDEX");
    protectedDEX = await ProtectedDEX.deploy(transactionGuard.address);

    const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
    maliciousContract = await MaliciousContract.deploy();

    // Calculate pool ID
    const token0 = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? tokenA.address : tokenB.address;
    const token1 = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? tokenB.address : tokenA.address;
    poolId = ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'address'], [token0, token1]));
  });

  describe("🛡️ Complete Firewall Demo Scenario", function () {
    it("Should demonstrate full exploit prevention workflow", async function () {
      console.log("\n🎬 Starting DeFi Transaction Guard Demo...");

      // Step 1: Setup validator with BDAG staking
      console.log("📋 Step 1: Setting up validator with BDAG staking");
      const stakeAmount = ethers.utils.parseEther("2000");
      await bdagToken.mint(validator.address, stakeAmount);
      await bdagToken.connect(validator).approve(transactionGuard.address, stakeAmount);
      await transactionGuard.connect(validator).stakeAsValidator(stakeAmount);
      
      const validatorInfo = await transactionGuard.getValidatorInfo(validator.address);
      expect(validatorInfo.isActive).to.be.true;
      console.log(`   ✅ Validator staked ${ethers.utils.formatEther(stakeAmount)} BDAG`);

      // Step 2: Register DEX in Guard Registry
      console.log("📋 Step 2: Registering DEX in Guard Registry");
      await guardRegistry.registerProtocol(protectedDEX.address, "Protected DEX Demo", "DEX");
      
      const isActive = await guardRegistry.isProtocolActive(protectedDEX.address);
      expect(isActive).to.be.true;
      console.log("   ✅ DEX registered for protection");

      // Step 3: Setup DEX with liquidity
      console.log("📋 Step 3: Setting up DEX with initial liquidity");
      await tokenA.faucet(user.address, ethers.utils.parseEther("1000"));
      await tokenB.faucet(user.address, ethers.utils.parseEther("1000"));
      
      await tokenA.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));
      await tokenB.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));
      
      await protectedDEX.connect(user).createPool(tokenA.address, tokenB.address);
      await protectedDEX.connect(user).addLiquidity(
        poolId,
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("90"),
        ethers.utils.parseEther("90")
      );
      
      const poolInfo = await protectedDEX.getPoolInfo(poolId);
      expect(poolInfo.totalLiquidity).to.be.gt(0);
      console.log("   ✅ DEX pool created with liquidity");

      // Step 4: Set risk scores (simulating AI backend)
      console.log("📋 Step 4: AI Backend sets risk scores");
      await transactionGuard.updateRiskScore(protectedDEX.address, 15); // Low risk
      await transactionGuard.updateRiskScore(maliciousContract.address, 95); // High risk
      
      const dexRisk = await transactionGuard.riskScores(protectedDEX.address);
      const maliciousRisk = await transactionGuard.riskScores(maliciousContract.address);
      expect(dexRisk).to.equal(15);
      expect(maliciousRisk).to.equal(95);
      console.log(`   ✅ Risk scores set: DEX=${dexRisk}, Malicious=${maliciousRisk}`);

      // Step 5: Normal transaction (should succeed)
      console.log("📋 Step 5: Testing normal transaction (should succeed)");
      const normalTxHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("normal_swap"));
      await transactionGuard.connect(validator).submitRiskAssessment(normalTxHash, 25, "Normal Swap");
      
      const isSafe = await transactionGuard.isTransactionSafe(normalTxHash);
      expect(isSafe).to.be.true;
      console.log("   ✅ Normal transaction approved by firewall");

      // Step 6: Malicious transaction (should be blocked)
      console.log("📋 Step 6: Testing malicious transaction (should be blocked)");
      const maliciousTxHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("exploit_attempt"));
      await transactionGuard.connect(validator).submitRiskAssessment(maliciousTxHash, 95, "Flash Loan Attack");
      
      const isBlocked = await transactionGuard.isTransactionSafe(maliciousTxHash);
      expect(isBlocked).to.be.false;
      console.log("   🛡️ Malicious transaction BLOCKED by firewall");

      // Step 7: Attempt actual malicious contract call (should revert)
      console.log("📋 Step 7: Attempting actual exploit (should revert)");
      await expect(
        maliciousContract.connect(attacker).drainLiquidity(user.address, 1000)
      ).to.be.revertedWith("Malicious transaction blocked by Transaction Guard");
      console.log("   🛡️ Exploit attempt PREVENTED");

      // Step 8: Simulate exploit prevention statistics
      console.log("📋 Step 8: Recording exploit prevention statistics");
      await transactionGuard.simulateExploitPrevention(
        maliciousContract.address, 
        ethers.utils.parseEther("50"), 
        "Flash Loan Attack"
      );
      
      const stats = await transactionGuard.getFirewallStats();
      expect(stats.exploitsBlocked).to.be.gt(0);
      expect(stats.fundsProtected).to.be.gt(0);
      console.log(`   📊 Stats: ${stats.exploitsBlocked} exploits blocked, ${ethers.utils.formatEther(stats.fundsProtected)} ETH protected`);

      // Step 9: Verify registry statistics
      console.log("📋 Step 9: Checking registry statistics");
      const registryStats = await guardRegistry.getRegistryStats();
      expect(registryStats.activeProtocols).to.equal(1);
      console.log(`   📊 Registry: ${registryStats.activeProtocols} active protocols protected`);

      console.log("\n🎉 DEMO COMPLETE: DeFi Transaction Guard successfully prevented exploit!");
      console.log("=" .repeat(60));
      console.log("🛡️ Key Results:");
      console.log(`   • Validator Staked: ${ethers.utils.formatEther(validatorInfo.stakedAmount)} BDAG`);
      console.log(`   • Protocols Protected: ${registryStats.activeProtocols}`);
      console.log(`   • Exploits Blocked: ${stats.exploitsBlocked}`);
      console.log(`   • Funds Protected: ${ethers.utils.formatEther(stats.fundsProtected)} ETH`);
      console.log(`   • Normal Transactions: ✅ Allowed`);
      console.log(`   • Malicious Transactions: 🛡️ BLOCKED`);
      console.log("=" .repeat(60));
    });

    it("Should handle validator slashing for incorrect predictions", async function () {
      // Setup validator
      const stakeAmount = ethers.utils.parseEther("2000");
      await bdagToken.mint(validator.address, stakeAmount);
      await bdagToken.connect(validator).approve(transactionGuard.address, stakeAmount);
      await transactionGuard.connect(validator).stakeAsValidator(stakeAmount);

      // Slash validator for misbehavior
      const slashAmount = ethers.utils.parseEther("500");
      await expect(transactionGuard.slashValidator(validator.address, slashAmount, "Incorrect risk assessment"))
        .to.emit(transactionGuard, "ValidatorSlashed")
        .withArgs(validator.address, slashAmount, "Incorrect risk assessment");

      // Verify slashing
      const validatorInfo = await transactionGuard.getValidatorInfo(validator.address);
      expect(validatorInfo.stakedAmount).to.equal(stakeAmount.sub(slashAmount));
    });

    it("Should support batch risk score updates for efficiency", async function () {
      const contracts = [tokenA.address, tokenB.address, protectedDEX.address];
      const scores = [20, 25, 15];

      await transactionGuard.batchUpdateRiskScores(contracts, scores);

      for (let i = 0; i < contracts.length; i++) {
        const score = await transactionGuard.riskScores(contracts[i]);
        expect(score).to.equal(scores[i]);
      }
    });
  });

  describe("🔄 Protected DEX Integration", function () {
    beforeEach(async function () {
      // Setup tokens and approvals
      await tokenA.faucet(user.address, ethers.utils.parseEther("1000"));
      await tokenB.faucet(user.address, ethers.utils.parseEther("1000"));
      await tokenA.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));
      await tokenB.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));

      // Create and setup pool
      await protectedDEX.connect(user).createPool(tokenA.address, tokenB.address);
      await protectedDEX.connect(user).addLiquidity(
        poolId,
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("90"),
        ethers.utils.parseEther("90")
      );
    });

    it("Should allow normal swaps through firewall", async function () {
      const swapAmount = ethers.utils.parseEther("10");
      const minAmountOut = ethers.utils.parseEther("9");

      await expect(protectedDEX.connect(user).swap(poolId, tokenA.address, swapAmount, minAmountOut))
        .to.emit(protectedDEX, "Swap");
    });

    it("Should calculate correct swap amounts", async function () {
      const amountIn = ethers.utils.parseEther("10");
      const amountOut = await protectedDEX.getAmountOut(poolId, tokenA.address, amountIn);
      
      expect(amountOut).to.be.gt(0);
      expect(amountOut).to.be.lt(amountIn); // Should be less due to fees
    });
  });
});