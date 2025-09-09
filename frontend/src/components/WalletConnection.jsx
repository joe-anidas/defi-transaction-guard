import { useState, useEffect } from 'react'
import { BrowserProvider, formatEther } from 'ethers'

function WalletConnection() {
  const [balance, setBalance] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const connectAndFetch = async () => {
    if (!window.ethereum) {
      setError('Install MetaMask to connect your wallet')
      return
    }

    try {
      setIsConnecting(true)
      setError('')

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Add/Switch to BlockDAG Primordial Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x413' }], // 1043 in hex
        })
      } catch (switchError) {
        // Network not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x413', // 1043 decimal
              chainName: 'BlockDAG Primordial Testnet',
              rpcUrls: ['https://rpc.primordial.bdagscan.com'],
              nativeCurrency: {
                name: 'BlockDAG Token',
                symbol: 'BDAG',
                decimals: 18,
              },
              blockExplorerUrls: ['https://primordial.bdagscan.com'],
            }],
          })
        } else {
          throw switchError
        }
      }

      // Get provider and signer
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      setAddress(addr)

      // Get balance
      const bal = await provider.getBalance(addr)
      setBalance(formatEther(bal) + ' BDAG')
      setIsConnected(true)

    } catch (err) {
      setError(err.message)
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress('')
    setBalance('')
    setIsConnected(false)
    setError('')
  }

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const provider = new BrowserProvider(window.ethereum)
            const network = await provider.getNetwork()
            
            // Only auto-connect if on BlockDAG network
            if (network.chainId === 1043n) {
              const addr = accounts[0]
              setAddress(addr)
              const bal = await provider.getBalance(addr)
              setBalance(formatEther(bal) + ' BDAG')
              setIsConnected(true)
            }
          }
        } catch (error) {
          console.log('Auto-connection failed:', error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== address) {
          connectAndFetch()
        }
      }

      const handleChainChanged = (chainId) => {
        // Instead of reloading, reconnect and fetch new data
        console.log('Chain changed to:', chainId)
        connectAndFetch()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [address])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        BlockDAG Wallet Connection
      </h3>
      
      <div className="space-y-4">
        {!isConnected ? (
          <button
            onClick={connectAndFetch}
            disabled={isConnecting}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all text-white ${
              isConnecting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting to BlockDAG...</span>
              </div>
            ) : (
              'Connect Wallet & Get Balance'
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">BlockDAG Testnet</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Address:</span>
              <span className="text-white font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className="text-blue-400 font-bold">{balance}</span>
            </div>

            <button
              onClick={disconnect}
              className="w-full px-6 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
            >
              Disconnect
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {isConnected && (
          <div className="p-3 bg-green-900/50 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Successfully connected to BlockDAG Primordial Testnet
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-300 font-semibold mb-2">Network Details</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div><strong>Chain ID:</strong> 1043</div>
          <div><strong>RPC URL:</strong> rpc.primordial.bdagscan.com</div>
          <div><strong>Explorer:</strong> primordial.bdagscan.com</div>
          <div><strong>Currency:</strong> BDAG</div>
        </div>
      </div>
    </div>
  )
}

export default WalletConnection