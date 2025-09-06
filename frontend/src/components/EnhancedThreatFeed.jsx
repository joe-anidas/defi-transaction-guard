import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { 
  AlertTriangle, 
  Shield, 
  Zap, 
  Target, 
  Droplets, 
  Sandwich,
  Bot,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react'

function EnhancedThreatFeed({ blocks }) {
  const [filteredBlocks, setFilteredBlocks] = useState(blocks)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBlocks(blocks)
    } else {
      setFilteredBlocks(blocks.filter(block => block.type === filter))
    }
  }, [blocks, filter])

  const getThreatIcon = (type) => {
    const icons = {
      'Flash Loan Attack': Zap,
      'Rug Pull Attempt': Target,
      'Governance Exploit': Shield,
      'Liquidity Drain': Droplets,
      'Sandwich Attack': Sandwich,
      'MEV Bot': Bot
    }
    return icons[type] || AlertTriangle
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 95) return 'text-red-400'
    if (confidence >= 90) return 'text-orange-400'
    return 'text-yellow-400'
  }

  const getThreatGradient = (type) => {
    const gradients = {
      'Flash Loan Attack': 'from-yellow-500 to-orange-500',
      'Rug Pull Attempt': 'from-red-500 to-pink-500',
      'Governance Exploit': 'from-purple-500 to-indigo-500',
      'Liquidity Drain': 'from-blue-500 to-cyan-500',
      'Sandwich Attack': 'from-orange-500 to-red-500',
      'MEV Bot': 'from-gray-500 to-gray-600'
    }
    return gradients[type] || 'from-red-500 to-red-600'
  }

  const getSeverityLevel = (confidence) => {
    if (confidence >= 95) return { level: 'CRITICAL', color: 'bg-red-500/20 border-red-500/50' }
    if (confidence >= 90) return { level: 'HIGH', color: 'bg-orange-500/20 border-orange-500/50' }
    return { level: 'MEDIUM', color: 'bg-yellow-500/20 border-yellow-500/50' }
  }

  const threatTypes = ['all', ...new Set(blocks.map(block => block.type))]

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-8">
        <motion.h3 
          className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Live Threat Feed
        </motion.h3>
        
        <motion.div 
          className="flex items-center space-x-3 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className="w-3 h-3 bg-green-400 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity 
            }}
          />
          <span className="text-sm text-green-400 font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Real-time
          </span>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <motion.div 
        className="flex flex-wrap gap-2 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {threatTypes.map((type) => (
          <motion.button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              filter === type
                ? "bg-white/20 text-white border-white/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type === 'all' ? 'All Threats' : type}
          </motion.button>
        ))}
      </motion.div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {filteredBlocks.map((block, index) => {
            const Icon = getThreatIcon(block.type)
            const severity = getSeverityLevel(block.confidence)
            
            return (
              <motion.div
                key={block.id}
                className="group relative flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  transition: { duration: 0.3 }
                }}
                layout
              >
                {/* Animated gradient background */}
                <motion.div 
                  className={clsx(
                    "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                    getThreatGradient(block.type)
                  )}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <div className="relative z-10 flex items-center space-x-6">
                  <motion.div 
                    className={clsx(
                      "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300",
                      getThreatGradient(block.type)
                    )}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-white text-xl">
                        {block.type}
                      </h4>
                      <motion.div 
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          severity.color
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {severity.level}
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-red-400" />
                        <span>Loss: <span className="font-bold text-red-400">${block.amount.toLocaleString()}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{block.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-right space-y-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-400">AI Confidence:</span>
                    <motion.span 
                      className={clsx(
                        "text-lg font-bold",
                        getConfidenceColor(block.confidence)
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                    >
                      {block.confidence}%
                    </motion.span>
                  </div>
                  
                  <motion.div 
                    className={clsx(
                      "flex items-center justify-end gap-2 px-4 py-2 rounded-full border font-bold text-sm",
                      "bg-red-500/10 border-red-500/30 text-red-400"
                    )}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      className="w-2 h-2 bg-red-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity 
                      }}
                    />
                    <span>BLOCKED</span>
                  </motion.div>
                </div>

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                  }}
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredBlocks.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div 
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity 
            }}
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-3">All Clear</h3>
          <p className="text-gray-300 text-lg mb-2">No threats detected recently</p>
          <p className="text-sm text-green-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Your funds are secure
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default EnhancedThreatFeed
