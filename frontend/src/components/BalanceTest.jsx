import React, { useState, useEffect } from 'react'
import { useBlockchain } from '../hooks/useBlockchain'

function BalanceTest() {
  const {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isLoading,
    error,
    chainId
  } = useBlockchain()

  const [updateCount, setUpdateCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Track balance updates
  useEffect(() => {
    if (balance && balance !== '0') {
      setUpdateCount(prev => prev + 1)
      setLastUpdate(new Date().toLocaleTimeString())
    }
  }, [balance])

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🧪 Live Balance Testing Dashboard
        </h2>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chain ID:</span>
                <span className="text-white">{chainId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="text-white font-mono text-sm">
                  {account ? (formatAddress ? formatAddress(account) : account.slice(0, 10) + '...') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Balance Updates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span className="text-green-400 font-bold">
                  {balance ? `${parseFloat(balance).toFixed(6)} BDAG` : '0 BDAG'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Updates Count:</span>
                <span className="text-blue-400">{updateCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="text-yellow-400 text-sm">{lastUpdate || 'Never'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="text-red-400 font-semibold mb-2">Error</h4>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Live Balance Display */}
        {isConnected && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">🔴 LIVE BlockDAG Balance</div>
              <div className="text-4xl font-bold text-green-400 mb-2 flex items-center justify-center space-x-3">
                <span>{balance ? parseFloat(balance).toFixed(8) : '0.00000000'}</span>
                <span className="text-xl text-gray-400">BDAG</span>
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-gray-500">
                Auto-refreshes every 5 seconds • Real-time blockchain data
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
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
                '🦊 Connect to BlockDAG Testnet'
              )}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all transform hover:scale-105"
            >
              🔌 Disconnect Wallet
            </button>
          )}
        </div>

        {/* Network Info */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h4 className="text-lg font-semibold mb-3">Network Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Network Name:</div>
              <div className="text-white">BlockDAG Primordial Testnet</div>
            </div>
            <div>
              <div className="text-gray-400">Chain ID:</div>
              <div className="text-white">1043 (0x413)</div>
            </div>
            <div>
              <div className="text-gray-400">RPC URL:</div>
              <div className="text-white text-xs">https://rpc.primordial.bdagscan.com</div>
            </div>
            <div>
              <div className="text-gray-400">Explorer:</div>
              <div className="text-white text-xs">https://primordial.bdagscan.com</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2">📋 Testing Instructions</h4>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>Connect your wallet to BlockDAG Primordial Testnet</li>
            <li>Watch the balance update automatically every 5 seconds</li>
            <li>Send some BDAG to/from your wallet to see live updates</li>
            <li>Check the "Updates Count" to verify automatic refreshing</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default BalanceTest