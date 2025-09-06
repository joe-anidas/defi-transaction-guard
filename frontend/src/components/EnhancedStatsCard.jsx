import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

function EnhancedStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient = 'from-blue-500 to-blue-600',
  delay = 0 
}) {
  const isPositiveTrend = trend?.startsWith('+')
  const trendValue = trend?.replace(/[+$-]/g, '') || '0'

  return (
    <motion.div
      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 2,
        transition: { duration: 0.3 }
      }}
    >
      {/* Animated gradient background */}
      <motion.div 
        className={clsx(
          "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          gradient
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
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            className={clsx(
              "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300",
              gradient
            )}
            whileHover={{ 
              rotate: 360,
              scale: 1.1 
            }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          
          {trend && (
            <motion.div 
              className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.4 }}
            >
              <motion.div 
                className={clsx(
                  "w-2 h-2 rounded-full",
                  isPositiveTrend ? "bg-green-400" : "bg-red-400"
                )}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity 
                }}
              />
              <div className="flex items-center gap-1">
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={clsx(
                  "text-sm font-bold",
                  isPositiveTrend ? "text-green-400" : "text-red-400"
                )}>
                  {trend}
                </span>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-2">
          <motion.h3 
            className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            {value}
          </motion.h3>
          
          <motion.p 
            className="text-gray-300 text-lg font-semibold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.4, duration: 0.4 }}
          >
            {title}
          </motion.p>
          
          <motion.p 
            className="text-gray-400 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5, duration: 0.4 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Progress bar for trend visualization */}
        {trend && (
          <motion.div 
            className="mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: delay + 0.6, duration: 0.8 }}
          >
            <motion.div
              className={clsx(
                "h-full rounded-full",
                isPositiveTrend ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-red-400 to-pink-400"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(parseFloat(trendValue) * 10, 100)}%` }}
              transition={{ delay: delay + 0.8, duration: 1, ease: "easeOut" }}
            />
          </motion.div>
        )}
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
          repeatDelay: 2,
        }}
      />
    </motion.div>
  )
}

export default EnhancedStatsCard
