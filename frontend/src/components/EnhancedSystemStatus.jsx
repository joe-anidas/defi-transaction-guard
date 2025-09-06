import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Activity, 
  Server, 
  Database,
  Cpu,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'

function EnhancedSystemStatus() {
  const [systemStats, setSystemStats] = useState({
    uptime: '99.97%',
    responseTime: '156ms',
    activeConnections: 1247,
    memoryUsage: '68%',
    cpuUsage: '45%',
    cacheHitRate: '94.2%'
  })

  const [services, setServices] = useState([
    { name: 'AI Service', status: 'online', latency: '142ms', icon: Cpu },
    { name: 'GoFr Backend', status: 'online', latency: '23ms', icon: Server },
    { name: 'BlockDAG Node', status: 'online', latency: '89ms', icon: Database },
    { name: 'Redis Cache', status: 'online', latency: '2ms', icon: Activity },
    { name: 'Prometheus', status: 'online', latency: '15ms', icon: TrendingUp }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  useEffect(() => {
    const interval = setInterval(refreshData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'offline': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 border-green-500/50'
      case 'degraded': return 'bg-yellow-500/20 border-yellow-500/50'
      case 'offline': return 'bg-red-500/20 border-red-500/50'
      default: return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-8">
        <motion.h3 
          className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          System Status
        </motion.h3>
        
        <motion.button
          onClick={refreshData}
          disabled={isRefreshing}
          className={clsx(
            "px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-300 flex items-center gap-2",
            isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
          )}
          whileHover={!isRefreshing ? { scale: 1.05 } : {}}
          whileTap={!isRefreshing ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
          >
            <Activity className="w-4 h-4" />
          </motion.div>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Overall Status */}
      <motion.div 
        className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>
            <div>
              <h4 className="text-xl font-bold text-white">All Systems Operational</h4>
              <p className="text-green-400 text-sm">All services running normally</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{systemStats.uptime}</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </motion.div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Response Time', value: systemStats.responseTime, icon: Clock, color: 'text-blue-400' },
          { label: 'Active Connections', value: systemStats.activeConnections.toLocaleString(), icon: Activity, color: 'text-purple-400' },
          { label: 'Memory Usage', value: systemStats.memoryUsage, icon: Database, color: 'text-orange-400' },
          { label: 'Cache Hit Rate', value: systemStats.cacheHitRate, icon: Zap, color: 'text-green-400' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className={clsx("p-2 rounded-lg bg-white/10", metric.color)}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">{metric.label}</div>
                <div className={clsx("text-lg font-bold", metric.color)}>{metric.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Service Status */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-4">Service Status</h4>
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            className={clsx(
              "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
              getStatusBg(service.status)
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <service.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">{service.name}</div>
                <div className="text-sm text-gray-400">Latency: {service.latency}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div
                className={clsx(
                  "w-2 h-2 rounded-full",
                  service.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                )}
                animate={service.status === 'online' ? { 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{ 
                  duration: 1.5, 
                  repeat: service.status === 'online' ? Infinity : 0 
                }}
              />
              <span className={clsx("text-sm font-medium", getStatusColor(service.status))}>
                {service.status.toUpperCase()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div 
        className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Trends
        </h4>
        
        <div className="space-y-3">
          {[
            { name: 'Response Time', value: 85, color: 'bg-blue-500' },
            { name: 'Throughput', value: 92, color: 'bg-green-500' },
            { name: 'Error Rate', value: 15, color: 'bg-red-500' },
            { name: 'Cache Efficiency', value: 94, color: 'bg-purple-500' }
          ].map((metric, index) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{metric.name}</span>
                <span className="text-white font-semibold">{metric.value}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={clsx("h-full rounded-full", metric.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: 1 + index * 0.2, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EnhancedSystemStatus
