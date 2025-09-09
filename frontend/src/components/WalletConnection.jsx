import React from 'react'
import { useBlockchain } from '../hooks/useBlockchain'

const WalletConnection = () => {
  const { 
    isConnected, 
    account, 
    balance,
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    isLoading,
    error 
  } = useBlockchain()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (e) {
      // Error is already handled in the hook
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  // Format balance for display
  const displayBalance = balance ? parseFloat(balance).toFixed(4) : '0.0000'

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        BlockDAG Wallet Connection
      </h3>
      
      <div className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Connected Account</div>
              <div className="font-mono text-white break-all">
                {formatAddress ? formatAddress(account) : `${account?.slice(0, 6)}...${account?.slice(-4)}`}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Balance</div>
              <div className="font-bold text-green-400">
                {displayBalance} BDAG
              </div>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all text-white ${
              isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              'Connect Wallet'
            )}
          </button>
        )}
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            Make sure you're connected to BlockDAG Primordial Testnet
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletConnection