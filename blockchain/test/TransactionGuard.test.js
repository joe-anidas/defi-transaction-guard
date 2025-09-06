const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Transaction Guard", function () {
  let transactionGuard;
  let bdagToken;
  let protectedDEX;
  let tokenA, tokenB;
  let maliciousContract;
  let owner, validator, user;

  beforeEach(async function () {
    [owner, validator, user] = await ethers.getSigners();

    // Deploy Mock BDAG Token
    const MockBDAG = await ethers.getContractFactory("MockBDAG");
    bdagToken = await MockBDAG.deploy();
    await bdagToken.deployed();

    // Deploy Transaction Guard
    const TransactionGuard = await ethers.getContractFactory("TransactionGuard");
    transactionGuard = await TransactionGuard.deploy(bdagToken.address);
    await transactionGuard.deployed();

    // Deploy Test Tokens
    const TestTokenA = await ethers.getContractFactory("TestTokenA");
    tokenA = await TestTokenA.deploy();
    await tokenA.deployed();

    const TestTokenB = await ethers.getContractFactory("TestTokenB");
    tokenB = await TestTokenB.deploy();
    await tokenB.deployed();

    // Deploy Protected DEX
    const ProtectedDEX = await ethers.getContractFactory("ProtectedDEX");
    protectedDEX = await ProtectedDEX.deploy(transactionGuard.address);
    await protectedDEX.deployed();

    // Deploy Malicious Contract
    const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
    maliciousContract = await MaliciousContract.deploy();
    await maliciousContract.deployed();
  });

  describe("Transaction Guard Core", function () {
    it("Should deploy with correct BDAG token", async function () {
      expect(await transactionGuard.bdagToken()).to.equal(bdagToken.address);
    });

    it("Should allow validator staking", async function () {
      const stakeAmount = ethers.utils.parseEther("2000");
      
      // Mint and approve BDAG tokens
      await bdagToken.mint(validator.address, stakeAmount);
      await bdagToken.connect(validator).approve(transactionGuard.address, stakeAmount);
      
      // Stake as validator
      await expect(transactionGuard.connect(validator).stakeAsValidator(stakeAmount))
        .to.emit(transactionGuard, "ValidatorStaked")
        .withArgs(validator.address, stakeAmount);

      // Check validator info
      const validatorInfo = await transactionGuard.getValidatorInfo(validator.address);
      expect(validatorInfo.stakedAmount).to.equal(stakeAmount);
      expect(validatorInfo.isActive).to.be.true;
    });

    it("Should submit and retrieve risk assessments", async function () {
      // Setup validator
      const stakeAmount = ethers.utils.parseEther("2000");
      await bdagToken.mint(validator.address, stakeAmount);
      await bdagToken.connect(validator).approve(transactionGuard.address, stakeAmount);
      await transactionGuard.connect(validator).stakeAsValidator(stakeAmount);

      // Submit risk assessment
      const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_tx"));
      const riskScore = 25;
      const threatType = "Normal Transaction";

      await expect(transactionGuard.connect(validator).submitRiskAssessment(txHash, riskScore, threatType))
        .to.emit(transactionGuard, "TransactionApproved")
        .withArgs(txHash, riskScore);

      // Check assessment
      const assessment = await transactionGuard.assessments(txHash);
      expect(assessment.riskScore).to.equal(riskScore);
      expect(assessment.threatType).to.equal(threatType);
      expect(assessment.validator).to.equal(validator.address);
      expect(assessment.isBlocked).to.be.false;
    });

    it("Should block high-risk transactions", async function () {
      // Setup validator
      const stakeAmount = ethers.utils.parseEther("2000");
      await bdagToken.mint(validator.address, stakeAmount);
      await bdagToken.connect(validator).approve(transactionGuard.address, stakeAmount);
      await transactionGuard.connect(validator).stakeAsValidator(stakeAmount);

      // Submit high-risk assessment
      const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("malicious_tx"));
      const riskScore = 95;
      const threatType = "Flash Loan Attack";

      await expect(transactionGuard.connect(validator).submitRiskAssessment(txHash, riskScore, threatType))
        .to.emit(transactionGuard, "TransactionBlocked")
        .withArgs(txHash, riskScore, threatType);

      // Check that transaction would be blocked
      expect(await transactionGuard.isTransactionSafe(txHash)).to.be.false;
    });
  });

  describe("Protected DEX", function () {
    beforeEach(async function () {
      // Setup tokens for DEX testing
      await tokenA.faucet(user.address, ethers.utils.parseEther("1000"));
      await tokenB.faucet(user.address, ethers.utils.parseEther("1000"));
      
      await tokenA.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));
      await tokenB.connect(user).approve(protectedDEX.address, ethers.utils.parseEther("500"));
    });

    it("Should create a liquidity pool", async function () {
      await expect(protectedDEX.connect(user).createPool(tokenA.address, tokenB.address))
        .to.emit(protectedDEX, "PoolCreated");

      const poolId = ethers.utils.keccak256(
        ethers.utils.solidityPack(["address", "address"], 
        [tokenA.address < tokenB.address ? tokenA.address : tokenB.address,
         tokenA.address < tokenB.address ? tokenB.address : tokenA.address])
      );

      const poolInfo = await protectedDEX.getPoolInfo(poolId);
      expect(poolInfo.tokenA).to.not.equal(ethers.constants.AddressZero);
      expect(poolInfo.tokenB).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should add liquidity to pool", async function () {
      // Create pool first
      await protectedDEX.connect(user).createPool(tokenA.address, tokenB.address);
      
      const poolId = ethers.utils.keccak256(
        ethers.utils.solidityPack(["address", "address"], 
        [tokenA.address < tokenB.address ? tokenA.address : tokenB.address,
         tokenA.address < tokenB.address ? tokenB.address : tokenA.address])
      );

      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await expect(protectedDEX.connect(user).addLiquidity(
        poolId, amountA, amountB, amountA, amountB
      )).to.emit(protectedDEX, "LiquidityAdded");

      const poolInfo = await protectedDEX.getPoolInfo(poolId);
      expect(poolInfo.reserveA).to.equal(amountA);
      expect(poolInfo.reserveB).to.equal(amountB);
    });
  });

  describe("Malicious Contract Detection", function () {
    it("Should revert on malicious contract calls", async function () {
      await expect(maliciousContract.drainLiquidity(user.address, 1000))
        .to.be.revertedWith("Malicious transaction blocked by Transaction Guard");

      await expect(maliciousContract.rugPull())
        .to.be.revertedWith("Rug pull blocked by Transaction Guard");

      await expect(maliciousContract.sandwichAttack(user.address, 500))
        .to.be.revertedWith("Sandwich attack blocked by Transaction Guard");
    });
  });

  describe("Statistics and Monitoring", function () {
    it("Should track firewall statistics", async function () {
      const stats = await transactionGuard.getFirewallStats();
      expect(stats.transactionsScreened).to.equal(0); // Initial state
      expect(stats.exploitsBlocked).to.equal(0);
      expect(stats.fundsProtected).to.equal(0);
    });

    it("Should simulate exploit prevention", async function () {
      const potentialLoss = 50000;
      const exploitType = "Flash Loan Attack";

      await expect(transactionGuard.simulateExploitPrevention(
        maliciousContract.address, potentialLoss, exploitType
      )).to.emit(transactionGuard, "ExploitPrevented")
        .withArgs(maliciousContract.address, potentialLoss);

      const stats = await transactionGuard.getFirewallStats();
      expect(stats.fundsProtected).to.equal(potentialLoss);
    });
  });
});