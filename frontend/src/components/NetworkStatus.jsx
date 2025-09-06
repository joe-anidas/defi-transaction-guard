import { useState, useEffect } from 'react'
import { useBlockchain } from '../hooks/useBlockchain'

const NetworkStatus = () => {
  const { chainId, isConnected, provider } = useBlockchain()
  const [networkName, setNetworkName] = useState('')
  const [isOptimal, setIsOptimal] = useState(false)

  useEffect(() => {
    if (chainId) {
      updateNetworkInfo(chainId)
    }
  }, [chainId])

  const updateNetworkInfo = (chainId) => {
    const networks = {
      1: { name: 'Ethereum Mainnet', optimal: false },
      5: { name: 'Goerli Testnet', optimal: false },
      137: { name: 'Polygon Mainnet', optimal: false },
      80001: { name: 'Polygon Mumbai', optimal: false },
      31337: { name: 'Localhost', optimal: true },
      1337: { name: 'Localhost Alt', optimal: true },
      12345: { name: 'BlockDAG Testnet', optimal: true }
    }

    const network = networks[chainId] || { name: `Network ${chainId}`, optimal: false }
    setNetworkName(network.name)
    setIsOptimal(network.optimal)
  }

  const switchToLocalhost = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }] // 31337 in hex
      })
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Localhost',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              }
            }]
          })
        } catch (addError) {
          console.error('Error adding localhost network:', addError)
        }
      }
    }
  }

  if (!isConnected) return null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isOptimal ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <div>
            <p className="text-sm font-medium text-white">
              Network: {networkName}
            </p>
            <p className="text-xs text-gray-400">
              Chain ID: {chainId}
            </p>
          </div>
        </div>
        
        {!isOptimal && (
          <div className="text-right">
            <p className="text-xs text-yellow-400 mb-2">
              For full demo functionality, switch to localhost
            </p>
            <button
              onClick={switchToLocalhost}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Switch to Localhost
            </button>
          </div>
        )}
      </div>
      
      {!isOptimal && (
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <p className="text-xs text-yellow-300">
            <strong>Demo Note:</strong> You're on {networkName}. The demo works best on localhost (31337) 
            where contracts are deployed. Some features may not work on other networks.
          </p>
        </div>
      )}
      
      {isOptimal && (
        <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded">
          <p className="text-xs text-green-300">
            <strong>✅ Optimal Network:</strong> You're connected to the right network for the full demo experience!
          </p>
        </div>
      )}
    </div>
  )
}

export default NetworkStatus