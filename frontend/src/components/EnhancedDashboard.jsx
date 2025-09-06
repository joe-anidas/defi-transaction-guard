import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTransaction } from '../context/TransactionContext'
import { clsx } from 'clsx'
import { 
  Shield, 
  Activity, 
  DollarSign, 
  Target, 
  Link, 
  Gem, 
  Rocket,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react'
import EnhancedStatsCard from './EnhancedStatsCard'
import EnhancedThreatFeed from './EnhancedThreatFeed'
import EnhancedSystemStatus from './EnhancedSystemStatus'
import TransactionAnalysisForm from './TransactionAnalysisForm'

function EnhancedDashboard() {
  const { stats, recentBlocks } = useTransaction()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <motion.div 
          className="mb-12 text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center gap-4 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              DeFi Transaction Guard
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Real-time exploit detection and prevention powered by AI • Secured by BlockDAG • Accelerated on Akash
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div 
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-green-400 text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              System Online
            </span>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
        >
          <EnhancedStatsCard
            title="Transactions Screened"
            value={stats.transactionsScreened.toLocaleString()}
            subtitle="Real-time Analysis"
            icon={Activity}
            trend="+12.5%"
            gradient="from-blue-500 to-cyan-500"
            delay={0.1}
          />
          <EnhancedStatsCard
            title="Exploits Blocked"
            value={stats.exploitsBlocked}
            subtitle="Threats Prevented"
            icon={Shield}
            trend="+3"
            gradient="from-red-500 to-pink-500"
            delay={0.2}
          />
          <EnhancedStatsCard
            title="Funds Protected"
            value={`$${(stats.fundsProtected / 1000000).toFixed(1)}M`}
            subtitle="Assets Secured"
            icon={DollarSign}
            trend="+$200K"
            gradient="from-green-500 to-emerald-500"
            delay={0.3}
          />
          <EnhancedStatsCard
            title="AI Accuracy"
            value={`${(100 - stats.falsePositiveRate).toFixed(1)}%`}
            subtitle="Detection Rate"
            icon={Target}
            trend="+0.01%"
            gradient="from-purple-500 to-indigo-500"
            delay={0.4}
          />
        </motion.div>

        {/* BDAG Staking Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
        >
          <EnhancedStatsCard
            title="BDAG Validators"
            value="47"
            subtitle="Active Stakers"
            icon={Link}
            trend="+5"
            gradient="from-indigo-500 to-purple-500"
            delay={0.5}
          />
          <EnhancedStatsCard
            title="Total BDAG Staked"
            value="1.2M"
            subtitle="Validator Stakes"
            icon={Gem}
            trend="+50K"
            gradient="from-blue-500 to-indigo-500"
            delay={0.6}
          />
          <EnhancedStatsCard
            title="Akash GPU Nodes"
            value="12"
            subtitle="AI Processing"
            icon={Rocket}
            trend="+2"
            gradient="from-green-500 to-teal-500"
            delay={0.7}
          />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
        >
          {/* Enhanced Threat Feed */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <EnhancedThreatFeed blocks={recentBlocks} />
          </motion.div>

          {/* Enhanced System Status */}
          <motion.div variants={itemVariants}>
            <EnhancedSystemStatus />
          </motion.div>
        </motion.div>

        {/* Transaction Analysis Form */}
        <motion.div 
          className="mb-12"
          variants={itemVariants}
        >
          <TransactionAnalysisForm />
        </motion.div>

        {/* Enhanced Technology Stack */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.h3 
            className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Powered By
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "BlockDAG",
                description: "Smart Contract Enforcement",
                icon: "BD",
                gradient: "from-blue-500 to-blue-600",
                hoverColor: "hover:border-blue-500/50"
              },
              {
                name: "Akash Network",
                description: "AI Threat Detection",
                icon: "AI",
                gradient: "from-purple-500 to-purple-600",
                hoverColor: "hover:border-purple-500/50"
              },
              {
                name: "GoFr Framework",
                description: "Real-time APIs",
                icon: "GF",
                gradient: "from-green-500 to-green-600",
                hoverColor: "hover:border-green-500/50"
              }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                className={clsx(
                  "group flex items-center space-x-4 p-6 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300",
                  tech.hoverColor
                )}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
              >
                <motion.div 
                  className={clsx(
                    "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                    tech.gradient
                  )}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white font-bold text-lg">{tech.icon}</span>
                </motion.div>
                <div>
                  <h4 className="font-semibold text-white text-xl">{tech.name}</h4>
                  <p className="text-gray-400">{tech.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default EnhancedDashboard
