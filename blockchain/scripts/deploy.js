const { ethers } = require("hardhat");

async function main() {
  console.log("🛡️ Deploying DeFi Transaction Guard...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Mock BDAG Token
  console.log("\n📄 Deploying Mock BDAG Token...");
  const MockBDAG = await ethers.getContractFactory("MockBDAG");
  const bdagToken = await MockBDAG.deploy();
  await bdagToken.deployed();
  console.log("✅ Mock BDAG deployed to:", bdagToken.address);

  // Deploy Transaction Guard
  console.log("\n🛡️ Deploying Transaction Guard...");
  const TransactionGuard = await ethers.getContractFactory("TransactionGuard");
  const transactionGuard = await TransactionGuard.deploy(bdagToken.address);
  await transactionGuard.deployed();
  console.log("✅ Transaction Guard deployed to:", transactionGuard.address);

  // Deploy Test Tokens
  console.log("\n🪙 Deploying Test Tokens...");
  const TestTokenA = await ethers.getContractFactory("TestTokenA");
  const tokenA = await TestTokenA.deploy();
  await tokenA.deployed();
  console.log("✅ Test Token A deployed to:", tokenA.address);

  const TestTokenB = await ethers.getContractFactory("TestTokenB");
  const tokenB = await TestTokenB.deploy();
  await tokenB.deployed();
  console.log("✅ Test Token B deployed to:", tokenB.address);

  // Deploy Protected DEX
  console.log("\n🔄 Deploying Protected DEX...");
  const ProtectedDEX = await ethers.getContractFactory("ProtectedDEX");
  const protectedDEX = await ProtectedDEX.deploy(transactionGuard.address);
  await protectedDEX.deployed();
  console.log("✅ Protected DEX deployed to:", protectedDEX.address);

  // Deploy Malicious Contract (for demo)
  console.log("\n💀 Deploying Malicious Contract (for demo)...");
  const MaliciousContract = await ethers.getContractFactory("MaliciousContract");
  const maliciousContract = await MaliciousContract.deploy();
  await maliciousContract.deployed();
  console.log("✅ Malicious Contract deployed to:", maliciousContract.address);

  // Setup initial configuration
  console.log("\n⚙️ Setting up initial configuration...");
  
  // Mint some BDAG tokens to deployer for staking
  await bdagToken.mint(deployer.address, ethers.utils.parseEther("10000"));
  console.log("✅ Minted 10,000 BDAG tokens to deployer");

  // Mint test tokens to deployer
  await tokenA.faucet(deployer.address, ethers.utils.parseEther("1000"));
  await tokenB.faucet(deployer.address, ethers.utils.parseEther("1000"));
  console.log("✅ Minted test tokens to deployer");

  // Approve Transaction Guard to spend BDAG for staking
  await bdagToken.approve(transactionGuard.address, ethers.utils.parseEther("5000"));
  console.log("✅ Approved Transaction Guard to spend BDAG");

  // Stake as validator
  await transactionGuard.stakeAsValidator(ethers.utils.parseEther("2000"));
  console.log("✅ Staked 2,000 BDAG as validator");

  // Create a pool in the DEX
  await tokenA.approve(protectedDEX.address, ethers.utils.parseEther("500"));
  await tokenB.approve(protectedDEX.address, ethers.utils.parseEther("500"));
  
  const poolId = ethers.utils.keccak256(
    ethers.utils.solidityPack(["address", "address"], 
    [tokenA.address < tokenB.address ? tokenA.address : tokenB.address,
     tokenA.address < tokenB.address ? tokenB.address : tokenA.address])
  );
  
  await protectedDEX.createPool(tokenA.address, tokenB.address);
  await protectedDEX.addLiquidity(
    poolId,
    ethers.utils.parseEther("100"),
    ethers.utils.parseEther("100"),
    ethers.utils.parseEther("90"),
    ethers.utils.parseEther("90")
  );
  console.log("✅ Created DEX pool with initial liquidity");

  // Submit a risk assessment for demo
  const demoTxHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("demo_transaction"));
  await transactionGuard.submitRiskAssessment(demoTxHash, 25, "Normal Transaction");
  console.log("✅ Submitted demo risk assessment");

  // Display deployment summary
  console.log("\n🎉 Deployment Complete!");
  console.log("=" .repeat(50));
  console.log("📄 Contract Addresses:");
  console.log("   Mock BDAG Token:", bdagToken.address);
  console.log("   Transaction Guard:", transactionGuard.address);
  console.log("   Test Token A:", tokenA.address);
  console.log("   Test Token B:", tokenB.address);
  console.log("   Protected DEX:", protectedDEX.address);
  console.log("   Malicious Contract:", maliciousContract.address);
  console.log("=" .repeat(50));
  
  // Save addresses to file for frontend
  const addresses = {
    bdagToken: bdagToken.address,
    transactionGuard: transactionGuard.address,
    tokenA: tokenA.address,
    tokenB: tokenB.address,
    protectedDEX: protectedDEX.address,
    maliciousContract: maliciousContract.address,
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