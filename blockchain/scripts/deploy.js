const { ethers } = require("hardhat");

async function main() {
  console.log("🛡️ Deploying DeFi Transaction Guard...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Mock BDAG Token
  console.log("\n📄 Deploying Mock BDAG Token...");
  const MockBDAG = await ethers.getContractFactory("MockBDAG");
  const bdagToken = await MockBDAG.deploy();
  await bdagToken.waitForDeployment();
  console.log("✅ Mock BDAG deployed to:", await bdagToken.getAddress());

  // Deploy Transaction Guard (deployer acts as backend oracle for demo)
  console.log("\n🛡️ Deploying Transaction Guard...");
  const TransactionGuard = await ethers.getContractFactory("TransactionGuard");
  const transactionGuard = await TransactionGuard.deploy(await bdagToken.getAddress(), deployer.address);
  await transactionGuard.waitForDeployment();
  console.log("✅ Transaction Guard deployed to:", await transactionGuard.getAddress());
  console.log("✅ Backend Oracle set to:", deployer.address);

  // Deploy Test Tokens
  console.log("\n🪙 Deploying Test Tokens...");
  const TestTokenA = await ethers.getContractFactory("TestTokenA");
  const tokenA = await TestTokenA.deploy();
  await tokenA.waitForDeployment();
  console.log("✅ Test Token A deployed to:", await tokenA.getAddress());

  const TestTokenB = await ethers.getContractFactory("TestTokenB");
  const tokenB = await TestTokenB.deploy();
  await tokenB.waitForDeployment();
  console.log("✅ Test Token B deployed to:", await tokenB.getAddress());

  // Deploy Guard Registry
  console.log("\n📋 Deploying Guard Registry...");
  const GuardRegistry = await ethers.getContractFactory("GuardRegistry");
  const guardRegistry = await GuardRegistry.deploy(await transactionGuard.getAddress());
  await guardRegistry.waitForDeployment();
  console.log("✅ Guard Registry deployed to:", await guardRegistry.getAddress());

  // Deploy Protected DEX
  console.log("\n🔄 Deploying Protected DEX...");
  const ProtectedDEX = await ethers.getContractFactory("ProtectedDEX");
  const protectedDEX = await ProtectedDEX.deploy(await transactionGuard.getAddress());
  await protectedDEX.waitForDeployment();
  console.log("✅ Protected DEX deployed to:", await protectedDEX.getAddress());

  // Deploy Malicious Contract (for demo)
  console.log("\n💀 Deploying Malicious Contract (for demo)...");
  const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
  const maliciousContract = await MaliciousContract.deploy();
  await maliciousContract.waitForDeployment();
  console.log("✅ Malicious Contract deployed to:", await maliciousContract.getAddress());

  // Setup initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  // Mint some BDAG tokens to deployer for staking
  await bdagToken.mint(deployer.address, ethers.parseEther("10000"));
  console.log("✅ Minted 10,000 BDAG tokens to deployer");

  // Mint test tokens to deployer
  await tokenA.faucet(deployer.address, ethers.parseEther("1000"));
  await tokenB.faucet(deployer.address, ethers.parseEther("1000"));
  console.log("✅ Minted test tokens to deployer");

  // Approve Transaction Guard to spend BDAG for staking
  await bdagToken.approve(await transactionGuard.getAddress(), ethers.parseEther("5000"));
  console.log("✅ Approved Transaction Guard to spend BDAG");

  // Stake as validator
  await transactionGuard.stakeAsValidator(ethers.parseEther("2000"));
  console.log("✅ Staked 2,000 BDAG as validator");

  // Create a pool in the DEX
  await tokenA.approve(await protectedDEX.getAddress(), ethers.parseEther("500"));
  await tokenB.approve(await protectedDEX.getAddress(), ethers.parseEther("500"));
  
  const tokenAAddr = await tokenA.getAddress();
  const tokenBAddr = await tokenB.getAddress();
  const poolId = ethers.keccak256(
    ethers.solidityPacked(["address", "address"], 
    [tokenAAddr < tokenBAddr ? tokenAAddr : tokenBAddr,
     tokenAAddr < tokenBAddr ? tokenBAddr : tokenAAddr])
  );
  
  await protectedDEX.createPool(tokenAAddr, tokenBAddr);
  await protectedDEX.addLiquidity(
    poolId,
    ethers.parseEther("100"),
    ethers.parseEther("100"),
    ethers.parseEther("90"),
    ethers.parseEther("90")
  );
  console.log("✅ Created DEX pool with initial liquidity");

  // Submit a risk assessment for demo
  const demoTxHash = ethers.keccak256(ethers.toUtf8Bytes("demo_transaction"));
  await transactionGuard.submitRiskAssessment(demoTxHash, 25, "Normal Transaction");
  console.log("✅ Submitted demo risk assessment");

  // Register the Protected DEX in the registry
  await guardRegistry.registerProtocol(await protectedDEX.getAddress(), "Protected DEX Demo", "DEX");
  console.log("✅ Registered Protected DEX in Guard Registry");

  // Set initial risk scores for demo contracts
  await transactionGuard.updateRiskScore(await protectedDEX.getAddress(), 15); // Low risk - trusted DEX
  await transactionGuard.updateRiskScore(await maliciousContract.getAddress(), 95); // High risk - malicious
  console.log("✅ Set initial risk scores for demo contracts");

  // Simulate some exploit prevention for demo stats
  await transactionGuard.simulateExploitPrevention(await maliciousContract.getAddress(), ethers.parseEther("50"), "Flash Loan Attack");
  await transactionGuard.simulateExploitPrevention(await maliciousContract.getAddress(), ethers.parseEther("25"), "Rug Pull Attempt");
  console.log("✅ Simulated exploit prevention for demo statistics");

  // Display deployment summary
  console.log("\n🎉 Deployment Complete!");
  console.log("=" .repeat(50));
  console.log("📄 Contract Addresses:");
  console.log("   Mock BDAG Token:", await bdagToken.getAddress());
  console.log("   Transaction Guard:", await transactionGuard.getAddress());
  console.log("   Guard Registry:", await guardRegistry.getAddress());
  console.log("   Test Token A:", await tokenA.getAddress());
  console.log("   Test Token B:", await tokenB.getAddress());
  console.log("   Protected DEX:", await protectedDEX.getAddress());
  console.log("   Malicious Contract:", await maliciousContract.getAddress());
  console.log("=" .repeat(50));
  
  // Save addresses to file for frontend
  const addresses = {
    bdagToken: await bdagToken.getAddress(),
    transactionGuard: await transactionGuard.getAddress(),
    guardRegistry: await guardRegistry.getAddress(),
    tokenA: await tokenA.getAddress(),
    tokenB: await tokenB.getAddress(),
    protectedDEX: await protectedDEX.getAddress(),
    maliciousContract: await maliciousContract.getAddress(),
    deployer: deployer.address,
    poolId: poolId
  };

  const fs = require('fs');
  const path = require('path');
  
  // Ensure the directory exists
  const contractsDir = path.join(__dirname, '../../frontend/src/contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(contractsDir, 'addresses.json'),
    JSON.stringify(addresses, null, 2)
  );
  console.log("✅ Contract addresses saved to frontend/src/contracts/addresses.json");

  // Display next steps
  console.log("\n🚀 Next Steps:");
  console.log("1. Start the GoFr backend: cd backend && go run main.go");
  console.log("2. Start the React frontend: cd client && npm run dev");
  console.log("3. Open http://localhost:5173 to see the demo");
  console.log("4. Try the exploit simulation in the Live Demo section");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });