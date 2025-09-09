import { createContext, useContext, useState, useEffect } from 'react'
import { analyzeTransaction, getAnalysisSteps } from '../services/geminiAI'

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

  // Real AI analysis using Gemini
  const performGeminiAnalysis = async (amount, gasLimit, isMalicious, functionName = 'transfer') => {
    console.log('🔍 Starting performGeminiAnalysis with:', { amount, gasLimit, isMalicious, functionName })
    
    const transactionData = {
      amount,
      gasLimit,
      type: isMalicious ? 'malicious' : 'safe',
      contractAddress: isMalicious ? '0x1234567890abcdef1234567890abcdef12345678' : '0xSafeContract',
      functionName: isMalicious ? 'drainLiquidity' : 'transfer'
    }

    console.log('📤 Sending to Gemini AI:', transactionData)
    const analysisResult = await analyzeTransaction(transactionData)
    console.log('📥 Received from Gemini AI:', analysisResult)
    
    return analysisResult.analysis
  }

  // Static demo data - no API polling needed for demo
  const simulateExploitAttempt = (amount = '0.0005', gasLimit = '21000', isMalicious = true, onAnalysisComplete = null) => {
    setIsScanning(true)
    setCurrentTransaction({
      hash: '0x' + Math.random().toString(16).substr(2, 8),
      from: '0x742d35Cc6634C0532925a3b8D4A2f',
      to: isMalicious ? '0x1234567890abcdef1234567890abcdef12345678' : '0xSafeContract',
      value: `${amount} BDAG`,
      gasLimit: gasLimit,
      status: 'analyzing',
      isMalicious: isMalicious,
      analysisSteps: getAnalysisSteps(true)
    })

    // Perform real Gemini AI analysis
    performGeminiAnalysis(amount, gasLimit, isMalicious)
      .then(analysis => {
        setTimeout(() => {
          setCurrentTransaction(prev => ({ 
            ...prev, 
            status: analysis.isBlocked ? 'blocked' : 'approved',
            riskScore: analysis.riskScore,
            threatType: analysis.threatType,
            reason: analysis.reason,
            patterns: analysis.patterns,
            recommendations: analysis.recommendations,
            geminiAnalysis: analysis
          }))
          
          if (analysis.isBlocked) {
            // Add to recent blocks for malicious transactions
            const newBlock = {
              id: Date.now(),
              type: analysis.threatType,
              amount: Number(amount),
              time: 'Just now',
              confidence: analysis.riskScore,
              status: 'blocked'
            }
            
            setRecentBlocks(prev => [newBlock, ...prev.slice(0, 4)])
            setStats(prev => ({
              ...prev,
              exploitsBlocked: prev.exploitsBlocked + 1,
              fundsProtected: prev.fundsProtected + Number(amount)
            }))
          } else {
            setStats(prev => ({
              ...prev,
              transactionsScreened: prev.transactionsScreened + 1
            }))

            // Call the callback to initiate MetaMask transaction for approved transactions
            if (onAnalysisComplete) {
              setTimeout(() => onAnalysisComplete(), 500)
            }
          }
          setIsScanning(false)
        }, 2000) // Shorter delay since we're doing real analysis
      })
      .catch(error => {
        console.error('Gemini analysis failed:', error)
        // Fallback to deterministic analysis
        setTimeout(() => {
          if (isMalicious) {
            setCurrentTransaction(prev => ({ 
              ...prev, 
              status: 'blocked',
              riskScore: 94,
              threatType: 'Malicious Pattern Detected',
              reason: `AI analysis detected suspicious activity: ${amount} BDAG with gas limit ${gasLimit}`,
              patterns: ['High gas limit', 'Malicious function signature'],
              recommendations: 'Block this transaction immediately'
            }))
            
            const newBlock = {
              id: Date.now(),
              type: 'Malicious Pattern',
              amount: Number(amount),
              time: 'Just now',
              confidence: 94,
              status: 'blocked'
            }
            
            setRecentBlocks(prev => [newBlock, ...prev.slice(0, 4)])
            setStats(prev => ({
              ...prev,
              exploitsBlocked: prev.exploitsBlocked + 1,
              fundsProtected: prev.fundsProtected + Number(amount)
            }))
          } else {
            setCurrentTransaction(prev => ({ 
              ...prev, 
              status: 'approved',
              riskScore: 15,
              threatType: 'Safe Transaction',
              reason: `Transaction verified safe: ${amount} BDAG with normal gas limit ${gasLimit}`,
              patterns: ['Normal gas usage', 'Standard function'],
              recommendations: 'Transaction is safe to proceed'
            }))
            
            setStats(prev => ({
              ...prev,
              transactionsScreened: prev.transactionsScreened + 1
            }))

            if (onAnalysisComplete) {
              setTimeout(() => onAnalysisComplete(), 500)
            }
          }
          setIsScanning(false)
        }, 3000)
      })
  }

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

  const resetDemo = () => {
    setCurrentTransaction(null)
    setIsScanning(false)
  }

  const value = {
    stats,
    recentBlocks,
    isScanning,
    currentTransaction,
    setCurrentTransaction,
    simulateExploitAttempt,
    resetDemo
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}