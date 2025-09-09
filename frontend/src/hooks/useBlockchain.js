import { useState, useEffect } from 'react'
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

export const useBlockchain = () => {
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
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new BrowserProvider(window.ethereum)
        setProvider(web3Provider)

        // Get network info
        const network = await web3Provider.getNetwork()
        setChainId(Number(network.chainId))

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

  // Check for previous wallet connection on app load
  const checkPreviousConnection = async () => {
    try {
      const wasConnected = localStorage.getItem('walletConnected')
      const savedAddress = localStorage.getItem('walletAddress')
      
      if (wasConnected === 'true' && window.ethereum && savedAddress) {
        // Check if MetaMask still has accounts connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
          // Auto-reconnect if the same account is still connected in MetaMask
          console.log('Auto-reconnecting to previously connected wallet...')
          await connectWallet()
        } else {
          // Clear stale connection data
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('walletAddress')
        }
      }
    } catch (error) {
      console.error('Error checking previous connection:', error)
      // Clear potentially corrupted data
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('walletAddress')
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
    
    if (!window.ethereum) {
      setError('Install MetaMask')
      return
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Add/switch to BlockDAG network
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

    // Create provider and signer
    const web3Provider = new BrowserProvider(window.ethereum)
    const web3Signer = await web3Provider.getSigner()
    const address = await web3Signer.getAddress()
    const walletBalance = await web3Provider.getBalance(address)

    // Update state
    setProvider(web3Provider)
    setSigner(web3Signer)
    setAccount(address)
    setBalance(formatEther(walletBalance))
    setIsConnected(true)
    setChainId(1043)

    // Store wallet connection in localStorage for persistence
    localStorage.setItem('walletConnected', 'true')
    localStorage.setItem('walletAddress', address)

    // Initialize contracts
    await initializeContracts(web3Signer)

    return address
  } catch (err) {
    console.error('Error connecting wallet:', err)
    setError(err.message)
    throw err
  } finally {
    setIsLoading(false)
  }
}



  const disconnectWallet = async () => {
    console.log('Starting wallet disconnection...')
    
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
    
    console.log('Wallet disconnection completed - all state cleared')
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
      
      // Update balance for new account
      if (provider) {
        provider.getBalance(newAccount).then(balance => {
          setBalance(formatEther(balance))
        }).catch(console.error)
      }
    }
  }

  const handleChainChanged = async (chainId) => {
    const newChainId = parseInt(chainId, 16)
    setChainId(newChainId)
    
    // If connected and chain changed, try to reconnect to maintain state
    if (isConnected && window.ethereum) {
      try {
        console.log('Chain changed, reconnecting...')
        // Small delay to let MetaMask settle
        setTimeout(async () => {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            // Refresh connection without full page reload
            const web3Provider = new BrowserProvider(window.ethereum)
            const web3Signer = await web3Provider.getSigner()
            const address = await web3Signer.getAddress()
            const walletBalance = await web3Provider.getBalance(address)

            setProvider(web3Provider)
            setSigner(web3Signer)
            setAccount(address)
            setBalance(formatEther(walletBalance))
            
            // Reinitialize contracts on new chain
            await initializeContracts(web3Signer)
          }
        }, 100)
      } catch (error) {
        console.error('Error handling chain change:', error)
        setError('Chain change failed - please reconnect manually')
      }
    }
  }

  // Contract interaction functions
  const getFirewallStats = async () => {
    try {
      if (!contracts.transactionGuard) {
        return null;
      }

      const stats = await contracts.transactionGuard.getFirewallStats()
      return {
        transactionsScreened: stats[0].toNumber(),
        exploitsBlocked: stats[1].toNumber(),
        fundsProtected: stats[2].toNumber(),
        activeValidators: stats[3].toNumber(),
        totalStaked: formatEther(stats[4])
      }
    } catch (error) {
      console.error('Error getting firewall stats:', error)
      return null
    }
  }

  const getBDAGBalance = async (address = account) => {
    if (!provider || !address) {
      return '0';
    }
    try {
      const wei = await provider.getBalance(address)
      return formatEther(wei)
    } catch (error) {
      console.error('Error getting native BDAG balance:', error)
      return '0'
    }
  }


  const requestBDAGFromFaucet = async (amount = '1000') => {
    try {
      if (!contracts.bdagToken) {
        throw new Error('BDAG contract not available');
      }

      const tx = await contracts.bdagToken.faucet(account, parseEther(amount))
      await tx.wait()

      return tx.hash
    } catch (error) {
      console.error('Error requesting BDAG from faucet:', error)
      throw error
    }
  }

  const simulateMaliciousTransaction = async (type = 'drainLiquidity', amount = '0.0005', gasLimit = '21000') => {
    try {
      let parsedAmount = parseEther(amount.toString());
      let parsedGasLimit = gasLimit ? Math.max(parseInt(gasLimit), 21000) : 21000;
      
      // Check if contracts are available
      if (!contracts.transactionGuard || addresses.transactionGuard === "0x0000000000000000000000000000000000000000") {
        console.log('Transaction Guard contract not available, simulating with direct transaction...');
        
        // Fallback: Create a suspicious transaction that would be flagged
        const suspiciousRecipient = "0x1234567890abcdef1234567890abcdef12345678"; // Known malicious address
        const tx = await signer.sendTransaction({
          to: suspiciousRecipient,
          value: parsedAmount,
          gasLimit: parsedGasLimit,
          data: "0xdeadbeef" // Suspicious data
        });
        
        console.log('Simulated malicious transaction:', tx.hash);
        // This should trigger our AI analysis to flag it as malicious
        return tx;
      }

      let target = contracts.maliciousContract?.address || "0x1234567890abcdef1234567890abcdef12345678";
      let data;
      
      switch (type) {
        case 'drainLiquidity':
          if (contracts.maliciousContract) {
            data = contracts.maliciousContract.interface.encodeFunctionData('drainLiquidity', [account, parsedAmount]);
          } else {
            data = "0xdeadbeef"; // Suspicious data pattern
          }
          break;
        case 'rugPull':
          if (contracts.maliciousContract) {
            data = contracts.maliciousContract.interface.encodeFunctionData('rugPull');
          } else {
            data = "0xrugpull"; // Suspicious data pattern
          }
          break;
        case 'sandwichAttack':
          if (contracts.maliciousContract) {
            data = contracts.maliciousContract.interface.encodeFunctionData('sandwichAttack', [account, parsedAmount]);
          } else {
            data = "0xsandwich"; // Suspicious data pattern
          }
          break;
        case 'transfer':
          // For good transactions, handle missing contracts gracefully
          if (!contracts.bdagToken || addresses.bdagToken === "0x0000000000000000000000000000000000000000") {
            console.log('BDAG contract not available, using native transfer...');
            const tx = await signer.sendTransaction({
              to: account, // Send to self for demo
              value: parsedAmount,
              gasLimit: parsedGasLimit
            });
            return tx;
          }
          
          // Check if we have enough balance, if not, request from faucet first
          try {
            const balance = await contracts.bdagToken.balanceOf(account);
            const requiredAmount = parseEther(amount.toString());
            
            if (balance.lt(requiredAmount)) {
              // Request tokens from faucet first
              console.log('Insufficient balance, requesting from faucet...');
              return await contracts.bdagToken.faucet(account, requiredAmount, { gasLimit: parsedGasLimit });
            } else {
              // Transfer to a different address (using contract address as recipient for demo)
              const recipientAddress = contracts.transactionGuard?.address || account;
              return await contracts.bdagToken.transfer(recipientAddress, parsedAmount, { gasLimit: parsedGasLimit });
            }
          } catch (balanceError) {
            // Fallback to native transaction if balance check fails
            console.log('Balance check failed, using native transaction...', balanceError);
            const tx = await signer.sendTransaction({
              to: account,
              value: parsedAmount,
              gasLimit: parsedGasLimit
            });
            return tx;
          }
        default:
          throw new Error('Unknown attack type');
      }

      // Call TransactionGuard's executeProtected with gas limit for malicious transactions
      let tx = await contracts.transactionGuard.executeProtected(target, data, { gasLimit: parsedGasLimit });

      // Re-send with low-fee overrides if needed
      return await sendWithLowFee(async (overrides) => {
        const populated = await tx.wait(0).then(() => tx).catch(() => tx);
        if (populated && populated.hash) {
          return {
            wait: async () => ({ transactionHash: populated.hash })
          };
        }
        return { wait: async () => ({ transactionHash: tx.hash }) };
      });
    } catch (error) {
      // This should fail due to Transaction Guard protection for malicious transactions
      console.log('Transaction result:', error.message);
      throw error;
    }
  }

  const submitRiskAssessment = async (txHash, riskScore, threatType) => {
    try {
      if (!contracts.transactionGuard) {
        throw new Error('Transaction Guard not available');
      }

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
        parseEther(amount)
      )
      await approveTx.wait()

      // Then stake
      const stakeTx = await contracts.transactionGuard.stakeAsValidator(
        parseEther(amount)
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
    if (!signer) {
      throw new Error('No signer available');
    }
    const net = await signer.provider.getNetwork()
    // Try to set modest gas settings
    const overrides = {}
    try {
      const feeData = await signer.provider.getFeeData()
      if (net.chainId === 19648) {
        // BlockDAG testnet: aim for lower max fee; units are wei
        // Note: cannot force "1 BDAG" exact; gas is gasPrice * gasUsed.
        // We set a low gasPrice and rely on network acceptance.
        const lowGwei = parseUnits('1', 'gwei')
        overrides.maxFeePerGas = lowGwei
        overrides.maxPriorityFeePerGas = parseUnits('0.2', 'gwei')
      } else if (net.chainId === 11155111) {
        // Sepolia: target ~0.01 ETH typical cap by lowering per-gas cost
        const lowGwei = parseUnits('2', 'gwei')
        overrides.maxFeePerGas = lowGwei
        overrides.maxPriorityFeePerGas = parseUnits('0.5', 'gwei')
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
    if (!contracts.transactionGuard) {
      return;
    }

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
        potentialLoss: formatEther(potentialLoss),
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
      1043: {
        chainId: '0x413',
        chainName: 'BlockDAG Primordial Testnet',
        rpcUrls: ['https://rpc.primordial.bdagscan.com'],
        blockExplorerUrls: ['https://primordial.bdagscan.com'],
        nativeCurrency: {
          name: 'BlockDAG Token',
          symbol: 'BDAG',
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

  // Dedicated function for good transactions that opens MetaMask
  const executeGoodTransaction = async (amount = '0.0005', gasLimit = '21000') => {
    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const parsedAmount = parseEther(amount.toString());
      const parsedGasLimit = gasLimit ? Math.max(parseInt(gasLimit), 21000) : 21000;

      console.log('Executing good transaction:', { amount, gasLimit: parsedGasLimit });

      // Check if BDAG token contract is available and valid
      if (!contracts.bdagToken || addresses.bdagToken === "0x0000000000000000000000000000000000000000") {
        console.log('BDAG contract not available, using native BDAG transfer...');
        
        // Fallback: Send native BDAG transaction
        const tx = await signer.sendTransaction({
          to: account, // Send to self for demo
          value: parsedAmount,
          gasLimit: parsedGasLimit
        });
        
        console.log('Native BDAG transaction submitted:', tx.hash);
        return tx;
      }

      // Check balance first with proper error handling
      try {
        const balance = await contracts.bdagToken.balanceOf(account);
        console.log('Current balance:', formatEther(balance), 'BDAG');
        console.log('Required amount:', amount, 'BDAG');

        if (balance.lt(parsedAmount)) {
          // Request tokens from faucet first
          console.log('Insufficient balance, requesting from faucet...');
          const faucetTx = await contracts.bdagToken.faucet(account, parsedAmount, { 
            gasLimit: parsedGasLimit 
          });
          console.log('Faucet transaction submitted:', faucetTx.hash);
          return faucetTx;
        } else {
          // Transfer to a different address (using a demo recipient)
          const recipientAddress = contracts.transactionGuard?.address || account;
          console.log('Transferring to:', recipientAddress);
          
          const transferTx = await contracts.bdagToken.transfer(recipientAddress, parsedAmount, { 
            gasLimit: parsedGasLimit 
          });
          console.log('Transfer transaction submitted:', transferTx.hash);
          return transferTx;
        }
      } catch (balanceError) {
        console.warn('Balance check failed, falling back to native transaction:', balanceError);
        
        // Fallback: Send native BDAG transaction
        const tx = await signer.sendTransaction({
          to: account, // Send to self for demo
          value: parsedAmount,
          gasLimit: parsedGasLimit
        });
        
        console.log('Fallback native transaction submitted:', tx.hash);
        return tx;
      }
    } catch (error) {
      console.error('Good transaction failed:', error);
      throw error;
    }
  }

  return {
    // State
    provider,
    signer,
    account,
    balance,
    contracts,
    isConnected,
    chainId,
    isLoading,
    error,
    addresses,

    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    loadAddresses,

    // Contract interactions
    getFirewallStats,
    getBDAGBalance,
    requestBDAGFromFaucet,
    simulateMaliciousTransaction,
    executeGoodTransaction,
    submitRiskAssessment,
    stakeAsValidator,
    listenForEvents,

    // Utilities
    formatAddress,
    formatEther,
    parseEther,
  }
}