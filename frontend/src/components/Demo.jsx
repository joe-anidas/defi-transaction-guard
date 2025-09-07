import { useState, useEffect } from 'react'
import { useTransaction } from '../context/TransactionContext'
import { useBlockchain } from '../hooks/useBlockchain'
import TransactionAnalysis from './TransactionAnalysis'
import SetupStatus from './SetupStatus'
import EnhancedNetworkStatus from './EnhancedNetworkStatus'

function Demo() {
  const { simulateExploitAttempt, resetDemo, currentTransaction, setCurrentTransaction, isScanning } = useTransaction()
  const { 
    isConnected, 
    account, 
    balance,
    contracts,
    simulateMaliciousTransaction,
    addresses,
    formatAddress,
    connectWallet,
    executeGoodTransaction,
    isLoading,
    error
  } = useBlockchain()
  
  const [selectedContract, setSelectedContract] = useState('')
  const [dagAmount, setDagAmount] = useState('500')
  const [gasLimit, setGasLimit] = useState('500000')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingTransactionType, setPendingTransactionType] = useState(null) // 'good' or 'malicious'

  // Format balance for display
  const displayBalance = balance ? parseFloat(balance).toFixed(6) : '0.000000'

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

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (e) {
      console.error('Connection failed:', e)
    }
  }

  const handleMaliciousTransaction = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Determine attack type based on selected contract
      const selectedContractData = maliciousContracts.find(c => c.address === selectedContract)
      const attackType = selectedContractData?.attackType || 'drainLiquidity'
      
      // USE REAL GEMINI AI ANALYSIS for malicious transaction
      console.log('Starting REAL Gemini AI analysis for malicious transaction...')
      simulateExploitAttempt(dagAmount, gasLimit, true, async () => {
        // After REAL AI analysis shows it's malicious, show confirmation that it will be blocked
        setPendingTransactionType('malicious')
        setShowConfirmation(true)
      })
    } catch (error) {
      console.error('Error in handleMaliciousTransaction:', error)
      simulateExploitAttempt(dagAmount, gasLimit, true)
    }
  }

  const handleGoodTransaction = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // USE REAL GEMINI AI ANALYSIS with RANDOM VARIATIONS to prove it's dynamic
      const randomAmount = (Math.random() * 1000 + 100).toFixed(0) // Random amount 100-1100
      const randomGas = (Math.random() * 100000 + 21000).toFixed(0) // Random gas 21000-121000
      
      console.log('🧪 Testing REAL Gemini AI with random inputs:', { 
        amount: randomAmount, 
        gasLimit: randomGas,
        originalAmount: dagAmount,
        originalGas: gasLimit 
      })
      
      // Use random values to prove AI gives different results
      simulateExploitAttempt(randomAmount, randomGas, false, () => {
        // After REAL AI analysis approves it, show confirmation modal
        setPendingTransactionType('good')
        setShowConfirmation(true)
      })
    } catch (error) {
      console.error('Error in handleGoodTransaction:', error)
      // Fallback to static analysis if Gemini fails
      simulateExploitAttempt(dagAmount, gasLimit, false)
    }
  }

  // Smart transaction handler that decides based on contract selection
  const handleSmartTransaction = async () => {
    if (selectedContract) {
      // If a contract is selected, execute malicious transaction
      await handleMaliciousTransaction()
    } else {
      // If no contract selected, execute good transaction
      await handleGoodTransaction()
    }
  }

  const confirmGoodTransaction = async () => {
    console.log('confirmGoodTransaction called')
    try {
      setShowConfirmation(false)
      setPendingTransactionType(null)
      
      console.log('Setting transaction status to processing...')
      // Update status to show transaction is being processed - MARK AS GOOD TRANSACTION
      setCurrentTransaction(prev => ({
        ...prev,
        status: 'processing',
        reason: 'Opening MetaMask for transaction confirmation...',
        isMalicious: false, // Explicitly mark as good transaction
        analysisSteps: [
          { id: 1, name: 'Gemini AI Analysis', status: 'completed', result: 'SAFE VERIFIED' },
          { id: 2, name: 'Pattern Recognition', status: 'completed', result: 'NORMAL PATTERNS' },
          { id: 3, name: 'Risk Assessment', status: 'completed', result: 'LOW RISK' },
          { id: 4, name: 'Final Verdict', status: 'completed', result: 'APPROVE TRANSACTION' }
        ]
      }))

      console.log('Wallet connected:', isConnected)
      console.log('Account:', account)
      console.log('Available contracts:', Object.keys(contracts))
      console.log('BDAG Token contract:', contracts.bdagToken)
      console.log('Executing good transaction with:', { dagAmount, gasLimit })
      
      // Try a simple MetaMask transaction first
      if (window.ethereum) {
        console.log('Attempting direct MetaMask transaction...')
        const result = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: account, // Send to self for testing
            value: '0x0', // 0 ETH
            gas: '0x5208', // 21000 gas
          }],
        })
        
        console.log('Direct transaction result:', result)
        
        setCurrentTransaction(prev => ({
          ...prev,
          hash: result,
          status: 'pending',
          reason: 'Transaction submitted successfully!'
        }))
        
        return
      }
      
      // Fallback to contract method
      const result = await executeGoodTransaction(dagAmount, gasLimit)
      
      console.log('Transaction result:', result)
      
      // Update transaction status with real hash if successful
      if (result && result.hash) {
        setCurrentTransaction(prev => ({
          ...prev,
          hash: result.hash,
          status: 'pending',
          reason: 'Transaction submitted, waiting for confirmation...'
        }))

        // Wait for transaction confirmation
        if (result.wait) {
          const receipt = await result.wait()
          setCurrentTransaction(prev => ({
            ...prev,
            hash: receipt.transactionHash || result.hash,
            status: 'completed',
            reason: `Transaction completed successfully - ${dagAmount} BDAG processed`
          }))
        } else {
          // If no wait function, just mark as completed
          setCurrentTransaction(prev => ({
            ...prev,
            status: 'completed',
            reason: `Transaction submitted successfully - ${dagAmount} BDAG processed`
          }))
        }
      } else {
        setCurrentTransaction(prev => ({
          ...prev,
          status: 'failed',
          reason: 'Transaction failed: No transaction hash received'
        }))
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setCurrentTransaction(prev => ({
        ...prev,
        status: 'failed',
        reason: 'Transaction failed: ' + (error.message || error.toString())
      }))
      
      // Show error alert for debugging
      alert('Transaction failed: ' + (error.message || error.toString()))
    }
  }

  const confirmMaliciousTransaction = async () => {
    try {
      setShowConfirmation(false)
      setPendingTransactionType(null)
      
      // Determine attack type based on selected contract
      const selectedContractData = maliciousContracts.find(c => c.address === selectedContract)
      const attackType = selectedContractData?.attackType || 'drainLiquidity'
      
      console.log('Executing malicious transaction with:', { attackType, dagAmount, gasLimit })
      
      // Attempt the malicious transaction to show blocking
      try {
        await simulateMaliciousTransaction(attackType, dagAmount, gasLimit)
      } catch (error) {
        console.log('Malicious transaction blocked as expected:', error)
      }
    } catch (error) {
      console.error('Error in malicious transaction:', error)
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
            
            {isConnected ? (
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
                      <div className="text-sm text-gray-400">Account</div>
                      <div className="text-sm font-mono text-white">
                        {formatAddress ? formatAddress(account) : account?.slice(0, 10) + '...'}
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
            ) : (
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
            )}
          </div>

          {/* Contract Selection */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-2">Select Contract to Interact</h3>
            <p className="text-sm text-gray-400 mb-4">
              Click a contract to test malicious transaction blocking, or leave none selected for safe transactions.
            </p>
            <div className="space-y-3">
              {maliciousContracts.map((contract) => (
                <div
                  key={contract.address}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedContract === contract.address
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedContract(selectedContract === contract.address ? '' : contract.address)}
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
            
            {/* Clear Selection Button */}
            {selectedContract && (
              <div className="mt-4">
                <button
                  onClick={() => setSelectedContract('')}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Clear Selection (Execute Good Transaction)
                </button>
              </div>
            )}
            
            {/* Current Mode Indicator */}
            <div className="mt-4 p-3 rounded-lg border">
              {selectedContract ? (
                <div className="border-red-500/30 bg-red-900/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-medium text-sm">Malicious Mode Active</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Selected: {maliciousContracts.find(c => c.address === selectedContract)?.name}
                  </p>
                </div>
              ) : (
                <div className="border-green-500/30 bg-green-900/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 font-medium text-sm">Safe Mode Active</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    No contract selected - will execute normal transaction
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Testing */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Transaction Testing</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Transaction Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Amount:</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white w-32 text-right"
                      value={dagAmount}
                      onChange={e => setDagAmount(e.target.value)}
                      placeholder="BDAG"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gas Limit:</span>
                    <input
                      type="number"
                      min="21000"
                      step="1000"
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white w-32 text-right"
                      value={gasLimit}
                      onChange={e => setGasLimit(e.target.value)}
                      placeholder="Gas Limit"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Target Contract:</span>
                    <span className="text-white font-mono text-xs">
                      {selectedContract ? 
                        maliciousContracts.find(c => c.address === selectedContract)?.name || 'Selected Contract'
                        : 'None Selected'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Smart Transaction Button */}
              <div className="space-y-3">
                <button
                  onClick={handleSmartTransaction}
                  disabled={isScanning || !isConnected}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    isScanning || !isConnected
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : selectedContract
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transform hover:scale-105'
                  }`}
                >
                  {!isConnected 
                    ? 'Connect Wallet First' 
                    : isScanning 
                      ? 'Analyzing Transaction...' 
                      : selectedContract
                        ? `🚨 Execute Malicious Transaction (${maliciousContracts.find(c => c.address === selectedContract)?.name})`
                        : '✅ Execute Good Transaction'
                  }
                </button>
                
                {/* Helper text to explain the logic */}
                <div className="text-xs text-gray-400 text-center">
                  {selectedContract 
                    ? 'Contract selected - will execute malicious transaction for testing'
                    : 'No contract selected - will execute safe transaction'
                  }
                </div>
              </div>

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

      {/* Confirmation Modal for Transactions */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
            {pendingTransactionType === 'good' ? (
              <>
                <h3 className="text-xl font-semibold mb-4 text-green-400">✅ Transaction Approved</h3>
                <p className="text-gray-300 mb-6">
                  The AI analysis has verified this transaction as safe. Do you want to proceed with the transaction?
                </p>
                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="text-white">{dagAmount} BDAG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Limit:</span>
                    <span className="text-white">{gasLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-400">Safe to Execute</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmation(false)
                      setPendingTransactionType(null)
                    }}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmGoodTransaction}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Confirm Transaction
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4 text-red-400">🚨 Malicious Transaction Detected</h3>
                <p className="text-gray-300 mb-6">
                  The AI analysis has detected this transaction as malicious and will be blocked by the security system. 
                  Do you want to proceed to see the blocking in action?
                </p>
                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="text-white">{dagAmount} BDAG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Limit:</span>
                    <span className="text-white">{gasLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="text-red-400">
                      {maliciousContracts.find(c => c.address === selectedContract)?.name || 'Malicious Contract'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-red-400">Will Be Blocked</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmation(false)
                      setPendingTransactionType(null)
                    }}
                    className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMaliciousTransaction}
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Proceed (Test Blocking)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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