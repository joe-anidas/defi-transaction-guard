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
    transactionsScreened: 0,
    exploitsBlocked: 0,
    fundsProtected: 0,
    falsePositiveRate: 0
  })

  const [recentBlocks, setRecentBlocks] = useState([])

  const [isScanning, setIsScanning] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)

  // Poll backend for stats and alerts
  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/stats')
        if (res.ok) {
          const data = await res.json()
          if (!isMounted) return
          setStats({
            transactionsScreened: data.TransactionsScreened || 0,
            exploitsBlocked: data.ExploitsBlocked || 0,
            fundsProtected: data.FundsProtected || 0,
            falsePositiveRate: data.FalsePositiveRate || 0
          })
        }
      } catch {}
    }

    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/alerts')
        if (res.ok) {
          const list = await res.json()
          if (!isMounted) return
          const mapped = list.map((a) => ({
            id: a.id,
            type: a.type,
            amount: a.potentialLoss || Math.floor(Math.random() * 150000) + 25000,
            time: new Date(a.timestamp * 1000).toLocaleTimeString(),
            confidence: 95,
            status: 'blocked'
          }))
          setRecentBlocks(mapped)
        }
      } catch {}
    }

    fetchStats()
    fetchAlerts()
    const interval = setInterval(() => {
      fetchStats()
      fetchAlerts()
    }, 5000)
    return () => { isMounted = false; clearInterval(interval) }
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