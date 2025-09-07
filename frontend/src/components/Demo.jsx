import { useState, useEffect } from 'react'
import { useTransaction } from '../context/TransactionContext'
import { useBlockchain } from '../hooks/useBlockchain'
import TransactionAnalysis from './TransactionAnalysis'
import SetupStatus from './SetupStatus'
import EnhancedNetworkStatus from './EnhancedNetworkStatus'

function Demo() {
  const { simulateExploitAttempt, resetDemo, currentTransaction, isScanning } = useTransaction()
  const { 
    isConnected, 
    account, 
    getBDAGBalance, 
    simulateMaliciousTransaction,
    addresses,
    formatEther 
  } = useBlockchain()
  
  const [walletBalance, setWalletBalance] = useState('0')
  const [selectedContract, setSelectedContract] = useState('')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Load wallet balance when connected
  useEffect(() => {
    if (isConnected && account) {
      loadBalance()
    }
  }, [isConnected, account])

  const loadBalance = async () => {
    try {
      setIsLoadingBalance(true)
      const balance = await getBDAGBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error('Error loading balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const maliciousContracts = [
    {
      address: addresses.maliciousContract,
      name: 'LiquidityDrainer',
      risk: 'CRITICAL',
      description: 'Known liquidity draining contract',
      attackType: 'drainLiquidity'
    },
    {
      address: addresses.maliciousContract,
      name: 'RugPullContract',
      risk: 'CRITICAL', 
      description: 'Rug pull pattern detected',
      attackType: 'rugPull'
    },
    {
      address: addresses.maliciousContract,
      name: 'SandwichBot',
      risk: 'HIGH',
      description: 'MEV sandwich attack vector',
      attackType: 'sandwichAttack'
    }
  ]

  const handleExploitAttempt = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const selectedContractData = maliciousContracts.find(c => c.address === selectedContract)
    if (!selectedContractData) return

    try {
      // First simulate the exploit attempt on blockchain
      const result = await simulateMaliciousTransaction(selectedContractData.attackType)
      
      if (result.blocked) {
        // If blocked by smart contract, also trigger UI simulation
        simulateExploitAttempt()
      }
    } catch (error) {
      // Transaction was blocked - trigger UI simulation
      simulateExploitAttempt()
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-400 bg-red-900'
      case 'HIGH': return 'text-orange-400 bg-orange-900'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900'
      default: return 'text-green-400 bg-green-900'
    }
  }

  return (

    
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
              <SetupStatus />
              <EnhancedNetworkStatus />
            </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Live Exploit Prevention Demo
        </h1>
        <p className="text-gray-400">
          Watch the Transaction Guard block malicious transactions in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Wallet & Transaction */}
        <div className="space-y-6">
          {/* Wallet Status */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Your Wallet</h3>
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <div className="text-sm text-gray-400">BDAG Balance</div>
                <div className="text-2xl font-bold text-green-400">
                  {isLoadingBalance ? 'Loading...' : `${parseFloat(walletBalance).toFixed(2)} BDAG`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Status</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Protected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Selection */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Select Contract to Interact</h3>
            <div className="space-y-3">
              {maliciousContracts.map((contract) => (
                <div
                  key={contract.address}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedContract === contract.address
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedContract(contract.address)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{contract.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(contract.risk)}`}>
                      {contract.risk}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {contract.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    {contract.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Execute Transaction</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Transaction Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="text-white">500 BDAG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Limit:</span>
                    <span className="text-orange-400">500,000 (Suspicious!)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="text-white font-mono text-xs">
                      {selectedContract || 'Select a contract'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExploitAttempt}
                disabled={!selectedContract || isScanning || !isConnected}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  !selectedContract || isScanning || !isConnected
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105'
                }`}
              >
                {!isConnected 
                  ? 'Connect Wallet First' 
                  : isScanning 
                    ? 'Analyzing Transaction...' 
                    : 'Execute Malicious Transaction'
                }
              </button>

              {currentTransaction && (
                <button
                  onClick={resetDemo}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Reset Demo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Analysis */}
        <div>
          <TransactionAnalysis />
        </div>
      </div>

      {/* Impact Comparison */}
      {currentTransaction?.status === 'blocked' && (
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-6">Impact Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Guard */}
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
              <h4 className="text-lg font-medium text-red-400 mb-4">Without Transaction Guard</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Initial Balance:</span>
                  <span className="text-white">1,000 BDAG</span>
                </div>
                <div className="flex justify-between">
                  <span>After Exploit:</span>
                  <span className="text-red-400 font-bold">0 BDAG</span>
                </div>
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="text-red-400 font-bold">$50,000</span>
                </div>
                <div className="text-sm text-red-300 mt-4">
                  ❌ Funds completely drained by liquidity exploit
                </div>
              </div>
            </div>

            {/* With Guard */}
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
              <h4 className="text-lg font-medium text-green-400 mb-4">With Transaction Guard</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Initial Balance:</span>
                  <span className="text-white">{parseFloat(walletBalance).toFixed(2)} BDAG</span>
                </div>
                <div className="flex justify-between">
                  <span>After Protection:</span>
                  <span className="text-green-400 font-bold">{parseFloat(walletBalance).toFixed(2)} BDAG</span>
                </div>
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="text-green-400 font-bold">$0</span>
                </div>
                <div className="text-sm text-green-300 mt-4">
                  ✅ Transaction blocked - funds completely safe
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Demo