import { ethers } from 'ethers'

export const checkBlockchainStatus = async () => {
  const status = {
    isRunning: false,
    contractsDeployed: false,
    networkId: null,
    error: null
  }

  try {
    // Try to connect to localhost
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
    
    // Check if blockchain is running
    const network = await provider.getNetwork()
    status.isRunning = true
    status.networkId = network.chainId
    
    // Check if contracts are deployed by trying to load addresses
    try {
      const addressesModule = await import('../contracts/addresses.json')
      const addresses = addressesModule.default || addressesModule
      
      // Check if we have valid contract addresses
      const hasValidAddresses = addresses.transactionGuard && 
        addresses.transactionGuard !== "0x0000000000000000000000000000000000000000"
      
      if (hasValidAddresses) {
        // Try to call a contract method to verify deployment
        const contract = new ethers.Contract(
          addresses.transactionGuard,
          ['function getFirewallStats() view returns (uint256, uint256, uint256, uint256, uint256)'],
          provider
        )
        
        await contract.getFirewallStats()
        status.contractsDeployed = true
      }
    } catch (contractError) {
      console.log('Contracts not deployed or not accessible:', contractError.message)
    }
    
  } catch (error) {
    status.error = error.message
    console.log('Blockchain not running:', error.message)
  }

  return status
}

export const getSetupInstructions = (status) => {
  const instructions = []

  if (!status.isRunning) {
    instructions.push({
      step: 1,
      title: "Start Local Blockchain",
      command: "cd blockchain && npm run node",
      description: "Start the Hardhat local blockchain"
    })
  }

  if (status.isRunning && !status.contractsDeployed) {
    instructions.push({
      step: 2,
      title: "Deploy Contracts",
      command: "cd blockchain && npm run deploy",
      description: "Deploy smart contracts to the local blockchain"
    })
  }

  if (status.isRunning && status.contractsDeployed) {
    instructions.push({
      step: "✅",
      title: "Ready to Demo!",
      description: "Blockchain is running and contracts are deployed"
    })
  }

  return instructions
}