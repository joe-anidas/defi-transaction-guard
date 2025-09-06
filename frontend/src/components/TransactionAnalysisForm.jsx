import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'
import { 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Shield,
  Zap,
  Target,
  DollarSign,
  Hash,
  User,
  Building
} from 'lucide-react'

function TransactionAnalysisForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      hash: '',
      from: '',
      to: '',
      value: '',
      gasLimit: '',
      data: ''
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis result
      const mockResult = {
        riskScore: Math.floor(Math.random() * 100),
        threatType: ['Flash Loan Attack', 'Rug Pull Attempt', 'Normal Transaction', 'Suspicious Activity'][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 40) + 60,
        reasoning: 'AI analysis detected potential exploit patterns in transaction data',
        indicators: ['high-gas-limit', 'complex-call-data', 'suspicious-address'],
        isBlocked: Math.random() > 0.5
      }
      
      setAnalysisResult(mockResult)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-400'
    if (score >= 60) return 'text-orange-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'CRITICAL', color: 'bg-red-500/20 border-red-500/50' }
    if (score >= 60) return { level: 'HIGH', color: 'bg-orange-500/20 border-orange-500/50' }
    if (score >= 40) return { level: 'MEDIUM', color: 'bg-yellow-500/20 border-yellow-500/50' }
    return { level: 'LOW', color: 'bg-green-500/20 border-green-500/50' }
  }

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Transaction Analysis
          </h2>
        </motion.div>
        <p className="text-gray-300 text-lg">
          Analyze any transaction for potential threats using our AI-powered system
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Hash */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Transaction Hash
            </label>
            <input
              {...register('hash', { 
                required: 'Transaction hash is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{64}$/,
                  message: 'Invalid transaction hash format'
                }
              })}
              className={clsx(
                "w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300",
                errors.hash ? "border-red-500/50" : "border-white/20 hover:border-white/30"
              )}
              placeholder="0x1234..."
            />
            {errors.hash && (
              <motion.p 
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.hash.message}
              </motion.p>
            )}
          </motion.div>

          {/* From Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              From Address
            </label>
            <input
              {...register('from', { 
                required: 'From address is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid address format'
                }
              })}
              className={clsx(
                "w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300",
                errors.from ? "border-red-500/50" : "border-white/20 hover:border-white/30"
              )}
              placeholder="0xabc123..."
            />
            {errors.from && (
              <motion.p 
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.from.message}
              </motion.p>
            )}
          </motion.div>

          {/* To Address */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              To Address
            </label>
            <input
              {...register('to', { 
                required: 'To address is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid address format'
                }
              })}
              className={clsx(
                "w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300",
                errors.to ? "border-red-500/50" : "border-white/20 hover:border-white/30"
              )}
              placeholder="0xdef456..."
            />
            {errors.to && (
              <motion.p 
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.to.message}
              </motion.p>
            )}
          </motion.div>

          {/* Value */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Value (ETH)
            </label>
            <input
              {...register('value', { 
                required: 'Value is required',
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: 'Invalid value format'
                }
              })}
              className={clsx(
                "w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300",
                errors.value ? "border-red-500/50" : "border-white/20 hover:border-white/30"
              )}
              placeholder="1.5"
            />
            {errors.value && (
              <motion.p 
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.value.message}
              </motion.p>
            )}
          </motion.div>

          {/* Gas Limit */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Zap className="w-4 h-4 inline mr-2" />
              Gas Limit
            </label>
            <input
              {...register('gasLimit', { 
                required: 'Gas limit is required',
                pattern: {
                  value: /^\d+$/,
                  message: 'Invalid gas limit format'
                }
              })}
              className={clsx(
                "w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300",
                errors.gasLimit ? "border-red-500/50" : "border-white/20 hover:border-white/30"
              )}
              placeholder="21000"
            />
            {errors.gasLimit && (
              <motion.p 
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.gasLimit.message}
              </motion.p>
            )}
          </motion.div>

          {/* Data */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Call Data
            </label>
            <textarea
              {...register('data')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              placeholder="0x..."
              rows={3}
            />
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            type="submit"
            disabled={isAnalyzing}
            className={clsx(
              "px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-3",
              isAnalyzing 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:from-blue-600 hover:to-purple-600 hover:scale-105"
            )}
            whileHover={!isAnalyzing ? { scale: 1.05 } : {}}
            whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Transaction
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Analysis Result */}
      {analysisResult && (
        <motion.div 
          className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Analysis Result</h3>
            <div className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm",
              analysisResult.isBlocked 
                ? "bg-red-500/20 border-red-500/50 text-red-400"
                : "bg-green-500/20 border-green-500/50 text-green-400"
            )}>
              {analysisResult.isBlocked ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  BLOCKED
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  SAFE
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Risk Score</label>
                <div className="flex items-center gap-3 mt-1">
                  <span className={clsx("text-3xl font-bold", getRiskColor(analysisResult.riskScore))}>
                    {analysisResult.riskScore}%
                  </span>
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    getRiskLevel(analysisResult.riskScore).color
                  )}>
                    {getRiskLevel(analysisResult.riskScore).level}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Threat Type</label>
                <p className="text-white font-semibold mt-1">{analysisResult.threatType}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Confidence</label>
                <p className="text-white font-semibold mt-1">{analysisResult.confidence}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Reasoning</label>
                <p className="text-gray-300 mt-1">{analysisResult.reasoning}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Indicators</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysisResult.indicators.map((indicator, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default TransactionAnalysisForm
