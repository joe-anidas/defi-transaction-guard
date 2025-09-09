import { createContext, useContext, useState, useEffect } from 'react'
import {
  BrowserProvider,
  formatEther,
  parseEther,
  parseUnits,
} from 'ethers';

import {
  loadContractAddresses,
  createContractInstances,
  formatAddress,
  DEFAULT_ADDRESSES
} from '../services/contracts'

// Create the context
const BlockchainContext = createContext()

// Custom hook to use the blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext)
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider')
  }
  return context
}

// Provider component that creates a singleton blockchain state
export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
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
    // Check for previous wallet connection on mount
    checkPreviousConnection()
  }, [])

  // Live balance polling when connected
  useEffect(() => {
    let balanceInterval = null
    
    const updateBalance = async () => {
      if (isConnected && account && provider) {
        try {
          const bal = await provider.getBalance(account)
          setBalance(formatEther(bal))
        } catch (error) {
          console.error('Error fetching balance:', error)
          // On error, if we're supposed to be connected, keep trying
          // But if we're disconnected, clear the balance
          if (!isConnected) {
            setBalance('0')
          }
        }
      }
    }

    if (isConnected && account && provider) {
      updateBalance() // Initial fetch
      balanceInterval = setInterval(updateBalance, 5000) // Update every 5 seconds
    } else {
      // Explicitly clear balance when not connected
      setBalance('0')
      console.log('Balance cleared - wallet not connected')
    }

    return () => {
      if (balanceInterval) {
        clearInterval(balanceInterval)
      }
    }
  }, [isConnected, account, provider])

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
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum)
        setProvider(provider)

        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)
      }
    } catch (error) {
      console.error('Error initializing provider:', error)
      setError('Failed to initialize blockchain provider')
    }
  }

  const checkPreviousConnection = async () => {
    try {
      const wasConnected = localStorage.getItem('walletConnected')
      const savedAddress = localStorage.getItem('walletAddress')
      
      if (wasConnected === 'true' && savedAddress && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
          // Wallet is still connected, restore the connection
          await connectWallet()
        } else {
          // Wallet was disconnected externally, clear localStorage
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('walletAddress')
        }
      }
    } catch (error) {
      // Clear stored connection on error
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('walletAddress')
    }
  }

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error('MetaMask is required to connect')
      }

      const provider = new BrowserProvider(window.ethereum)
      setProvider(provider)

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]
      setAccount(address)
      setIsConnected(true)

      const signer = await provider.getSigner()
      setSigner(signer)

      // Get network info
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))

      // Create contract instances
      const contractInstances = await createContractInstances(signer, addresses)
      setContracts(contractInstances)

      // Store wallet connection in localStorage for persistence
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', address)

      console.log('Wallet connected successfully:', address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setError(error.message)
      setIsConnected(false)
      setAccount('')
      setProvider(null)
      setSigner(null)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    console.log('Context: Starting wallet disconnection...')
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Remove listeners to avoid stale callbacks after disconnect
        window.ethereum.removeListener && window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener && window.ethereum.removeListener('chainChanged', handleChainChanged)
        
        // For some wallet providers, request disconnection if available
        if (window.ethereum.disconnect) {
          await window.ethereum.disconnect()
        }
        
        // Clear any wallet connection permissions if available
        if (window.ethereum.request) {
          try {
            await window.ethereum.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }]
            })
          } catch (revokeError) {
            // Some wallets don't support this method, ignore the error
            console.log('Wallet permission revocation not supported or failed:', revokeError.message)
          }
        }
      }
    } catch (e) {
      console.log('Error during wallet disconnection:', e.message)
    }
    
    // Clear localStorage first
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
    
    // Force clear all state synchronously
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    setAccount('')
    setBalance('0')
    setContracts({})
    setError(null)
    setChainId(null)
    
    console.log('Context: Wallet disconnection completed - all state cleared')
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // Stay disconnected until user explicitly reconnects
      disconnectWallet()
    } else {
      const newAccount = accounts[0]
      setAccount(newAccount)
      setIsConnected(true)
      
      // Update localStorage with new account
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', newAccount)
      
      console.log('Account changed to:', newAccount)
    }
  }

  const handleChainChanged = (chainId) => {
    const numericChainId = parseInt(chainId, 16)
    setChainId(numericChainId)
    console.log('Chain changed to:', numericChainId)
    
    // Reload contracts for new chain
    if (signer) {
      createContractInstances(signer, addresses)
        .then(setContracts)
        .catch(console.error)
    }
  }

  // Add basic transaction functions (simplified)
  const executeGoodTransaction = async (dagAmount = '0.0005', gasLimit = '21000') => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await signer.sendTransaction({
        to: account, // Send to self for demo
        value: parseEther(dagAmount),
        gasLimit: Math.max(parseInt(gasLimit), 21000)
      })
      return tx
    } catch (error) {
      console.error('Error executing good transaction:', error)
      throw error
    }
  }

  const simulateMaliciousTransaction = async (attackType, dagAmount = '0.0005', gasLimit = '21000') => {
    if (!isConnected || !signer) {
      throw new Error('Wallet not connected')
    }

    try {
      // Simulate malicious transaction
      const tx = await signer.sendTransaction({
        to: addresses.maliciousContract || '0x1234567890abcdef1234567890abcdef12345678',
        value: parseEther(dagAmount),
        gasLimit: Math.max(parseInt(gasLimit), 21000),
        data: '0xdeadbeef' // Suspicious data
      })
      return tx
    } catch (error) {
      console.error('Error simulating malicious transaction:', error)
      throw error
    }
  }

  // Context value
  const value = {
    // State
    provider,
    signer,
    account,
    balance,
    contracts,
    isConnected,
    chainId,
    addresses,
    isLoading,
    error,
    
    // Functions
    connectWallet,
    disconnectWallet,
    executeGoodTransaction,
    simulateMaliciousTransaction,
    formatAddress,
  }

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  )
}
