import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  loadContractAddresses,
  createContractInstances,
  formatAddress,
  formatEther,
  parseEther,
  isNetworkSupported,
  DEFAULT_ADDRESSES
} from '../services/contracts'

export const useBlockchain = () => {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [contracts, setContracts] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState(null)
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize provider and contracts
  useEffect(() => {
    initializeProvider()
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      const loadedAddresses = await loadContractAddresses()
      setAddresses(loadedAddresses)
    } catch (error) {
      console.error('Error loading contract addresses:', error)
      setError('Failed to load contract addresses')
    }
  }

  const initializeProvider = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)

        // Get network info
        const network = await web3Provider.getNetwork()
        setChainId(network.chainId)

        // Check if already connected
        const accounts = await web3Provider.listAccounts()
        if (accounts.length > 0) {
          const signer = web3Provider.getSigner()
          setSigner(signer)
          setAccount(accounts[0])
          setIsConnected(true)
          await initializeContracts(signer)
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
      } else {
        console.warn('MetaMask not detected')
      }
    } catch (error) {
      console.error('Error initializing provider:', error)
    }
  }

  const initializeContracts = async (signer) => {
    try {
      setIsLoading(true)
      const contractInstances = createContractInstances(addresses, signer)
      setContracts(contractInstances)
      setError(null)
    } catch (error) {
      console.error('Error initializing contracts:', error)
      setError('Failed to initialize contracts')
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!provider) {
        throw new Error('No Web3 provider available. Please install MetaMask.')
      }

      // For demo purposes, allow connection on any network
      // In production, you'd want to enforce specific networks
      const network = await provider.getNetwork()
      console.log(`Connected to network: ${network.chainId}`)
      
      if (!isNetworkSupported(network.chainId)) {
        console.warn(`Network ${network.chainId} not officially supported, but continuing for demo...`)
        // You could add network switching logic here if needed
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      
      setSigner(signer)
      setAccount(address)
      setIsConnected(true)
      
      await initializeContracts(signer)
      
      return address
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }   

  const disconnectWallet = () => {
    setSigner(null)
    setAccount('')
    setIsConnected(false)
    setContracts({})
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16))
    window.location.reload() // Reload to reset state
  }

  // Contract interaction functions
  const getFirewallStats = async () => {
    try {
      if (!contracts.transactionGuard) return null
      
      const stats = await contracts.transactionGuard.getFirewallStats()
      return {
        transactionsScreened: stats[0].toNumber(),
        exploitsBlocked: stats[1].toNumber(),
        fundsProtected: stats[2].toNumber(),
        activeValidators: stats[3].toNumber(),
        totalStaked: ethers.utils.formatEther(stats[4])
      }
    } catch (error) {
      console.error('Error getting firewall stats:', error)
      return null
    }
  }

  const getBDAGBalance = async (address = account) => {
    try {
      if (!address) return '0'
      // Prefer ERC20 balance only if contract is actually deployed on current network
      if (contracts.bdagToken && addresses.bdagToken && provider) {
        const code = await provider.getCode(addresses.bdagToken)
        if (code && code !== '0x') {
          const erc20Bal = await contracts.bdagToken.balanceOf(address)
          return ethers.utils.formatEther(erc20Bal)
        }
      }
      // Fallback: show native balance on BlockDAG (BDAG) or any EVM chain
      if (provider) {
        const wei = await provider.getBalance(address)
        return ethers.utils.formatEther(wei)
      }
      return '0'
    } catch (error) {
      console.error('Error getting BDAG balance:', error)
      return '0'
    }
  }

  const requestBDAGFromFaucet = async (amount = '1000') => {
    try {
      if (!contracts.bdagToken) throw new Error('BDAG contract not available')
      
      const tx = await contracts.bdagToken.faucet(account, ethers.utils.parseEther(amount))
      await tx.wait()
      
      return tx.hash
    } catch (error) {
      console.error('Error requesting BDAG from faucet:', error)
      throw error
    }
  }

  const simulateMaliciousTransaction = async (type = 'drainLiquidity') => {
    try {
      if (!contracts.maliciousContract) throw new Error('Malicious contract not available')
      
      let tx
      switch (type) {
        case 'drainLiquidity':
          tx = await contracts.maliciousContract.drainLiquidity(account, ethers.utils.parseEther('500'))
          break
        case 'rugPull':
          tx = await contracts.maliciousContract.rugPull()
          break
        case 'sandwichAttack':
          tx = await contracts.maliciousContract.sandwichAttack(account, ethers.utils.parseEther('100'))
          break
        default:
          throw new Error('Unknown attack type')
      }
      
      // Re-send with low-fee overrides if needed
      return await sendWithLowFee(async (overrides) => {
        const populated = await tx.wait(0).then(() => tx).catch(() => tx)
        // If tx already sent, just return the hash
        if (populated && populated.hash) {
          return {
            wait: async () => ({ transactionHash: populated.hash })
          }
        }
        // Fallback: call a no-op to fit helper signature
        return { wait: async () => ({ transactionHash: tx.hash }) }
      })
    } catch (error) {
      // This should fail due to Transaction Guard protection
      console.log('Transaction blocked by firewall:', error.message)
      return { blocked: true, reason: error.message }
    }
  }

  const submitRiskAssessment = async (txHash, riskScore, threatType) => {
    try {
      if (!contracts.transactionGuard) throw new Error('Transaction Guard not available')
      
      const tx = await contracts.transactionGuard.submitRiskAssessment(
        txHash,
        riskScore,
        threatType
      )
      await tx.wait()
      
      return tx.hash
    } catch (error) {
      console.error('Error submitting risk assessment:', error)
      throw error
    }
  }

  const stakeAsValidator = async (amount) => {
    try {
      if (!contracts.transactionGuard || !contracts.bdagToken) {
        throw new Error('Contracts not available')
      }
      
      // First approve the transaction guard to spend BDAG
      const approveTx = await contracts.bdagToken.approve(
        addresses.transactionGuard,
        ethers.utils.parseEther(amount)
      )
      await approveTx.wait()
      
      // Then stake
      const stakeTx = await contracts.transactionGuard.stakeAsValidator(
        ethers.utils.parseEther(amount)
      )
      await stakeTx.wait()
      
      return stakeTx.hash
    } catch (error) {
      console.error('Error staking as validator:', error)
      throw error
    }
  }

  // Helper for submitting transactions with lower gas on BDAG or Sepolia
  const sendWithLowFee = async (txPromiseFactory) => {
    if (!signer) throw new Error('No signer available')
    const net = await signer.provider.getNetwork()
    // Try to set modest gas settings
    const overrides = {}
    try {
      const feeData = await signer.provider.getFeeData()
      if (net.chainId === 19648) {
        // BlockDAG testnet: aim for lower max fee; units are wei
        // Note: cannot force "1 BDAG" exact; gas is gasPrice * gasUsed.
        // We set a low gasPrice and rely on network acceptance.
        const lowGwei = ethers.utils.parseUnits('1', 'gwei')
        overrides.maxFeePerGas = lowGwei
        overrides.maxPriorityFeePerGas = ethers.utils.parseUnits('0.2', 'gwei')
      } else if (net.chainId === 11155111) {
        // Sepolia: target ~0.01 ETH typical cap by lowering per-gas cost
        const lowGwei = ethers.utils.parseUnits('2', 'gwei')
        overrides.maxFeePerGas = lowGwei
        overrides.maxPriorityFeePerGas = ethers.utils.parseUnits('0.5', 'gwei')
      } else if (feeData.maxFeePerGas) {
        // Generic gentle reduction
        overrides.maxFeePerGas = feeData.maxFeePerGas.div(2)
        overrides.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas || overrides.maxFeePerGas.div(10))
      }
    } catch (e) {
      console.warn('Fee data error, proceeding with defaults')
    }

    const tx = await txPromiseFactory(overrides)
    return (await tx.wait()).transactionHash
  }

  // Listen for contract events
  const listenForEvents = (callback) => {
    if (!contracts.transactionGuard) return

    contracts.transactionGuard.on('TransactionBlocked', (txHash, riskScore, threatType, event) => {
      callback({
        type: 'TransactionBlocked',
        txHash,
        riskScore: riskScore.toNumber(),
        threatType,
        blockNumber: event.blockNumber
      })
    })

    contracts.transactionGuard.on('ExploitPrevented', (target, potentialLoss, event) => {
      callback({
        type: 'ExploitPrevented',
        target,
        potentialLoss: ethers.utils.formatEther(potentialLoss),
        blockNumber: event.blockNumber
      })
    })
  }

  // Network switching
  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected')
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        const networkConfig = getNetworkConfig(targetChainId)
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig]
          })
        } else {
          throw new Error(`Network ${targetChainId} not supported`)
        }
      } else {
        throw error
      }
    }
  }

  // Get network configuration for adding to wallet
  const getNetworkConfig = (chainId) => {
    const networks = {
      31337: {
        chainId: '0x7a69',
        chainName: 'Localhost',
        rpcUrls: ['http://127.0.0.1:8545'],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      },
      19648: {
        chainId: '0x4cc0',
        chainName: 'BlockDAG Testnet',
        rpcUrls: ['https://rpc-testnet.blockdag.network'],
        blockExplorerUrls: ['https://explorer-testnet.blockdag.network'],
        nativeCurrency: {
          name: 'BDAG',
          symbol: 'BDAG',
          decimals: 18
        }
      },
      80001: {
        chainId: '0x13881',
        chainName: 'Polygon Mumbai',
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      }
    }
    return networks[chainId]
  }

  return {
    // State
    provider,
    signer,
    account,
    contracts,
    isConnected,
    chainId,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Contract interactions
    getFirewallStats,
    getBDAGBalance,
    requestBDAGFromFaucet,
    simulateMaliciousTransaction,
    submitRiskAssessment,
    stakeAsValidator,
    listenForEvents,
    
    // State
    isLoading,
    error,
    addresses,
    
    // Utilities
    formatAddress,
    formatEther,
    parseEther,
    
    // Actions
    loadAddresses
  }
}