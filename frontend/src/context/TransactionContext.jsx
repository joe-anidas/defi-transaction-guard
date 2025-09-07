import { createContext, useContext, useState, useEffect } from 'react'

const TransactionContext = createContext()

export const useTransaction = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider')
  }
  return context
}

export const TransactionProvider = ({ children }) => {
  const [stats, setStats] = useState({
    transactionsScreened: 15247, // "more than fifteen thousand transactions screened"
    exploitsBlocked: 33, // "thirty-three exploits blocked"
    fundsProtected: 3300000, // "over 3.3 million dollars in funds protected"
    falsePositiveRate: 2.97 // 97.03% accuracy as mentioned in demo
  })

  const [recentBlocks, setRecentBlocks] = useState([
    {
      id: 1,
      type: 'Flash Loan Attack',
      amount: 125000,
      time: '2 minutes ago',
      confidence: 96,
      status: 'blocked'
    },
    {
      id: 2,
      type: 'Rug Pull Pattern',
      amount: 89000,
      time: '8 minutes ago',
      confidence: 94,
      status: 'blocked'
    },
    {
      id: 3,
      type: 'MEV Sandwich Attack',
      amount: 45000,
      time: '15 minutes ago',
      confidence: 87,
      status: 'blocked'
    },
    {
      id: 4,
      type: 'Liquidity Drain',
      amount: 67000,
      time: '23 minutes ago',
      confidence: 92,
      status: 'blocked'
    },
    {
      id: 5,
      type: 'Governance Exploit',
      amount: 156000,
      time: '31 minutes ago',
      confidence: 98,
      status: 'blocked'
    }
  ])

  const [isScanning, setIsScanning] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)

  // Static demo data - no API polling needed for demo
  useEffect(() => {
    // Simulate live updates by incrementing transaction count occasionally
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        transactionsScreened: prev.transactionsScreened + Math.floor(Math.random() * 3) + 1
      }))
    }, 8000) // Update every 8 seconds to show "live" activity
    
    return () => clearInterval(interval)
  }, [])

  const simulateExploitAttempt = () => {
    setIsScanning(true)
    setCurrentTransaction({
      hash: '0x' + Math.random().toString(16).substr(2, 8),
      from: '0x742d35Cc6634C0532925a3b8D4A2f',
      to: '0x1234567890abcdef1234567890abcdef12345678',
      value: '1000 BDAG',
      gasLimit: '500000',
      status: 'analyzing'
    })

    // Simulate AI analysis phases
    setTimeout(() => {
      setCurrentTransaction(prev => ({ ...prev, status: 'risk_detected' }))
    }, 1500)

    setTimeout(() => {
      setCurrentTransaction(prev => ({ 
        ...prev, 
        status: 'blocked',
        riskScore: 94,
        threatType: 'Liquidity Drain Pattern',
        reason: 'Suspicious gas limit and recipient pattern detected'
      }))
      
      // Add to recent blocks
      const newBlock = {
        id: Date.now(),
        type: 'Liquidity Drain',
        amount: 50000,
        time: 'Just now',
        confidence: 94,
        status: 'blocked'
      }
      
      setRecentBlocks(prev => [newBlock, ...prev.slice(0, 4)])
      setStats(prev => ({
        ...prev,
        exploitsBlocked: prev.exploitsBlocked + 1,
        fundsProtected: prev.fundsProtected + 50000
      }))
      
      setIsScanning(false)
    }, 3000)
  }

  const resetDemo = () => {
    setCurrentTransaction(null)
    setIsScanning(false)
  }

  const value = {
    stats,
    recentBlocks,
    isScanning,
    currentTransaction,
    simulateExploitAttempt,
    resetDemo
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}