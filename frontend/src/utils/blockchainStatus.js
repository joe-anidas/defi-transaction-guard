import { ethers } from 'ethers'

export const checkBlockchainStatus = async () => {
  const status = {
    isRunning: false,
    contractsDeployed: false,
    networkId: null,
    error: null
  }

  try {
    // Try to connect to BlockDAG Testnet
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.primordial.bdagscan.com')
    
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
      title: "Connect to BlockDAG Testnet",
      command: "Network: BlockDAG Testnet (Chain ID: 1043)",
      description: "Connect to BlockDAG Testnet at rpc.primordial.bdagscan.com"
    })
  }

  if (status.isRunning && !status.contractsDeployed) {
    instructions.push({
      step: 2,
      title: "Deploy Contracts",
      command: "cd blockchain && npm run deploy:testnet",
      description: "Deploy smart contracts to BlockDAG Testnet"
    })
  }

  if (status.isRunning && status.contractsDeployed) {
    instructions.push({
      step: "✅",
      title: "Ready to Demo!",
      description: "Connected to BlockDAG Testnet and contracts are deployed"
    })
  }

  return instructions
}