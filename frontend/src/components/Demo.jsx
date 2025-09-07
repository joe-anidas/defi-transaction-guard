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
    balance,
    simulateMaliciousTransaction,
    addresses,
    formatAddress,
    connectWallet,
    isLoading,
    error
  } = useBlockchain()
  
  const [selectedContract, setSelectedContract] = useState('')

  // Format balance for display
  const displayBalance = balance ? parseFloat(balance).toFixed(6) : '0.000000'

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (e) {
      console.error('Connection failed:', e)
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
      {/* <div className="container mx-auto px-4 py-4">
              <SetupStatus />
              <EnhancedNetworkStatus />
            </div> */}
      
      {/* Live Balance Header */}
      {isConnected && (
        <div className="mb-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-xl">💰</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Live BlockDAG Balance</div>
                <div className="text-2xl font-bold text-green-400 flex items-center space-x-2">
                  <span>{displayBalance} BDAG</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Account</div>
              <div className="text-sm font-mono text-white">
                {formatAddress ? formatAddress(account) : account?.slice(0, 10) + '...'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Live Exploit Prevention Demo
        </h1>
        <p className="text-gray-400">
          {isConnected 
            ? 'Watch the Transaction Guard block malicious transactions in real-time' 
            : 'Connect your wallet to see live balance updates and try the demo'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Wallet & Transaction */}
        <div className="space-y-6">
          {/* Wallet Status */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Your Wallet</h3>
            
            {!isConnected ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🦊</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Connect Your Wallet</h4>
                  <p className="text-sm text-gray-400 mb-6">
                    Connect to BlockDAG Primordial Testnet to see your live balance and try the demo
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    'Connect to BlockDAG'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Balance Display */}
                <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="text-sm text-gray-400">Live BDAG Balance</div>
                        <div className="px-2 py-1 bg-green-900/50 rounded text-xs text-green-300 border border-green-500/30">
                          LIVE
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-400 flex items-center space-x-3">
                        <span>{displayBalance}</span>
                        <span className="text-lg text-gray-400">BDAG</span>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                        <span>🔄 Auto-updates every 5 seconds</span>
                        <span className="text-green-400">•</span>
                        <span>Real-time blockchain data</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Protection Status</div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="font-medium text-green-400">ACTIVE</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Transaction Guard Enabled
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">Connected Account</div>
                      <div className="text-sm font-mono text-white">
                        {formatAddress ? formatAddress(account) : account}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Network</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <span className="text-sm text-purple-300">BlockDAG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <span className="text-white">{displayBalance} BDAG</span>
                </div>
                <div className="flex justify-between">
                  <span>After Protection:</span>
                  <span className="text-green-400 font-bold">{displayBalance} BDAG</span>
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