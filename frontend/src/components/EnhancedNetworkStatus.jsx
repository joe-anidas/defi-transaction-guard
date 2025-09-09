import { useState, useEffect } from 'react'
import { useBlockchain } from '../hooks/useBlockchain'
import { motion } from 'framer-motion'
import { clsx } from '../utils/cn'
import { ethers } from 'ethers'
import { 
  CheckCircle, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  ExternalLink,
  Settings,
  Zap,
  Shield,
  Activity
} from 'lucide-react'

const EnhancedNetworkStatus = () => {
  const { chainId, isConnected, provider, switchNetwork } = useBlockchain()
  const [networkInfo, setNetworkInfo] = useState(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [gasPrice, setGasPrice] = useState(null)
  const [blockNumber, setBlockNumber] = useState(null)

  // Enhanced network configuration with BlockDAG testnet
  const SUPPORTED_NETWORKS = {
    1: { 
      name: 'Ethereum Mainnet', 
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://etherscan.io',
      optimal: false,
      gasPrice: 'high',
      color: 'blue'
    },
    5: { 
      name: 'Goerli Testnet', 
      symbol: 'ETH',
      rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
      blockExplorer: 'https://goerli.etherscan.io',
      optimal: false,
      gasPrice: 'medium',
      color: 'purple'
    },
    137: { 
      name: 'Polygon Mainnet', 
      symbol: 'MATIC',
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com',
      optimal: false,
      gasPrice: 'low',
      color: 'purple'
    },
    80001: { 
      name: 'Polygon Mumbai', 
      symbol: 'MATIC',
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      blockExplorer: 'https://mumbai.polygonscan.com',
      optimal: false,
      gasPrice: 'very-low',
      color: 'purple'
    },
    31337: { 
      name: 'Localhost', 
      symbol: 'ETH',
      rpcUrl: 'http://127.0.0.1:8545',
      blockExplorer: 'http://localhost:8545',
      optimal: true,
      gasPrice: 'free',
      color: 'green'
    },
    19648: { 
      name: 'BlockDAG Testnet', 
      symbol: 'BDAG',
      rpcUrl: 'https://rpc-testnet.blockdag.network',
      blockExplorer: 'https://explorer-testnet.blockdag.network',
      optimal: true,
      gasPrice: 'very-low',
      color: 'blue',
      features: ['parallel-execution', 'low-latency', 'high-throughput']
    },
    1337: { 
      name: 'Localhost Alt', 
      symbol: 'ETH',
      rpcUrl: 'http://127.0.0.1:8545',
      blockExplorer: 'http://localhost:8545',
      optimal: true,
      gasPrice: 'free',
      color: 'green'
    }
  }

  useEffect(() => {
    if (chainId && isConnected) {
      updateNetworkInfo(chainId)
      fetchNetworkData()
    }
  }, [chainId, isConnected])

  const updateNetworkInfo = (chainId) => {
    const network = SUPPORTED_NETWORKS[chainId] || { 
      name: `Unknown Network ${chainId}`, 
      optimal: false,
      gasPrice: 'unknown',
      color: 'gray'
    }
    setNetworkInfo(network)
  }

  const fetchNetworkData = async () => {
    if (!provider) return

    try {
      // Fetch gas price
      const feeData = await provider.getFeeData()
      if (feeData.gasPrice) {
        const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei'))
        setGasPrice(gasPriceGwei.toFixed(2))
      }

      // Fetch block number
      const blockNumber = await provider.getBlockNumber()
      setBlockNumber(blockNumber)
    } catch (error) {
      console.error('Error fetching network data:', error)
    }
  }

  const switchToNetwork = async (targetChainId) => {
    setIsSwitching(true)
    try {
      await switchNetwork(targetChainId)
    } catch (error) {
      console.error('Error switching network:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  const addBlockDAGTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x4cc0', // 19648 in hex
          chainName: 'BlockDAG Testnet',
          rpcUrls: ['https://rpc-testnet.blockdag.network'],
          blockExplorerUrls: ['https://explorer-testnet.blockdag.network'],
          nativeCurrency: {
            name: 'BDAG',
            symbol: 'BDAG',
            decimals: 18
          }
        }]
      })
    } catch (error) {
      console.error('Error adding BlockDAG testnet:', error)
    }
  }

  const getStatusColor = (network) => {
    if (!network) return 'text-gray-400'
    if (network.optimal) return 'text-green-400'
    if (network.gasPrice === 'high') return 'text-red-400'
    if (network.gasPrice === 'medium') return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getStatusIcon = (network) => {
    if (!network) return WifiOff
    if (network.optimal) return CheckCircle
    if (network.gasPrice === 'high') return AlertTriangle
    return Activity
  }

  const getGasPriceColor = (gasPrice) => {
    if (!gasPrice) return 'text-gray-400'
    if (gasPrice === 'free') return 'text-green-400'
    if (gasPrice === 'very-low') return 'text-green-300'
    if (gasPrice === 'low') return 'text-blue-400'
    if (gasPrice === 'medium') return 'text-yellow-400'
    return 'text-red-400'
  }

  const getGasPriceLabel = (gasPrice) => {
    const labels = {
      'free': 'Free',
      'very-low': 'Very Low',
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'unknown': 'Unknown'
    }
    return labels[gasPrice] || 'Unknown'
  }

  if (!isConnected) return null

  const StatusIcon = getStatusIcon(networkInfo)

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 
          className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Network Status
        </motion.h3>
        
        <motion.button
          onClick={fetchNetworkData}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>

      {/* Current Network */}
      <motion.div 
        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
              networkInfo?.color === 'green' && "bg-gradient-to-r from-green-500 to-emerald-500",
              networkInfo?.color === 'blue' && "bg-gradient-to-r from-blue-500 to-cyan-500",
              networkInfo?.color === 'purple' && "bg-gradient-to-r from-purple-500 to-pink-500",
              networkInfo?.color === 'gray' && "bg-gradient-to-r from-gray-500 to-gray-600"
            )}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity 
            }}
          >
            <StatusIcon className="w-6 h-6 text-white" />
          </motion.div>
          
          <div>
            <h4 className="text-lg font-semibold text-white">{networkInfo?.name}</h4>
            <p className="text-sm text-gray-400">Chain ID: {chainId}</p>
            {gasPrice && (
              <p className="text-xs text-gray-500">
                Gas Price: {gasPrice} Gwei
              </p>
            )}
            {blockNumber && (
              <p className="text-xs text-gray-500">
                Block: {blockNumber.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className={clsx(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
            networkInfo?.optimal 
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          )}>
            <div className={clsx(
              "w-2 h-2 rounded-full",
              networkInfo?.optimal ? "bg-green-400" : "bg-yellow-400"
            )} />
            {networkInfo?.optimal ? 'Optimal' : 'Suboptimal'}
          </div>
        </div>
      </motion.div>

      {/* Network Features */}
      {networkInfo?.features && (
        <motion.div 
          className="mb-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">BlockDAG Features</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {networkInfo.features.map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
              >
                {feature.replace('-', ' ')}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gas Price Indicator */}
      <motion.div 
        className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Gas Price</span>
          </div>
          <div className={clsx(
            "px-3 py-1 rounded-full text-sm font-semibold",
            getGasPriceColor(networkInfo?.gasPrice)
          )}>
            {getGasPriceLabel(networkInfo?.gasPrice)}
          </div>
        </div>
      </motion.div>

      {/* Network Actions */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* BlockDAG Testnet */}
          {chainId !== 19648 && (
            <motion.button
              onClick={() => switchToNetwork(19648)}
              disabled={isSwitching}
              className="flex items-center gap-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-sm font-semibold text-blue-400">BlockDAG Testnet</div>
                <div className="text-xs text-gray-400">Optimal for DeFi Guard</div>
              </div>
            </motion.button>
          )}

          {/* Localhost */}
          {chainId !== 31337 && (
            <motion.button
              onClick={() => switchToNetwork(31337)}
              disabled={isSwitching}
              className="flex items-center gap-3 p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wifi className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <div className="text-sm font-semibold text-green-400">Localhost</div>
                <div className="text-xs text-gray-400">Free gas for testing</div>
              </div>
            </motion.button>
          )}

          {/* Add BlockDAG Testnet */}
          <motion.button
            onClick={addBlockDAGTestnet}
            className="flex items-center gap-3 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-purple-400">Add BlockDAG</div>
              <div className="text-xs text-gray-400">Add to wallet</div>
            </div>
          </motion.button>

          {/* View on Explorer */}
          {networkInfo?.blockExplorer && (
            <motion.a
              href={`${networkInfo.blockExplorer}/address/${window.ethereum?.selectedAddress || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5 text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-400">View Explorer</div>
                <div className="text-xs text-gray-500">Open in new tab</div>
              </div>
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Status Messages */}
      {!networkInfo?.optimal && (
        <motion.div 
          className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400 mb-1">
                Network Not Optimal
              </p>
              <p className="text-xs text-yellow-300">
                For the best DeFi Transaction Guard experience, switch to BlockDAG Testnet or Localhost. 
                These networks offer lower gas fees and better performance for the demo.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {networkInfo?.optimal && (
        <motion.div 
          className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-400 mb-1">
                Optimal Network Connected
              </p>
              <p className="text-xs text-green-300">
                You're connected to the best network for DeFi Transaction Guard. 
                Enjoy low gas fees and optimal performance!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default EnhancedNetworkStatus
