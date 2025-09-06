import { useState, useEffect } from 'react'

function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState({
    aiEngine: { status: 'online', latency: 47, load: 23 },
    blockchain: { status: 'online', latency: 12, load: 15 },
    apiGateway: { status: 'online', latency: 8, load: 31 }
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        aiEngine: {
          ...prev.aiEngine,
          latency: 40 + Math.floor(Math.random() * 20),
          load: 20 + Math.floor(Math.random() * 15)
        },
        blockchain: {
          ...prev.blockchain,
          latency: 8 + Math.floor(Math.random() * 10),
          load: 10 + Math.floor(Math.random() * 15)
        },
        apiGateway: {
          ...prev.apiGateway,
          latency: 5 + Math.floor(Math.random() * 8),
          load: 25 + Math.floor(Math.random() * 20)
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-400' : 'text-red-400'
  }

  const getStatusDot = (status) => {
    return status === 'online' ? 'bg-green-400' : 'bg-red-400'
  }

  const getLoadColor = (load) => {
    if (load < 30) return 'bg-green-500'
    if (load < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-6">System Status</h3>

      <div className="space-y-6">
        {/* AI Engine */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDot(systemHealth.aiEngine.status)}`}></div>
              <span className="font-medium">Akash AI Engine</span>
            </div>
            <span className={`text-sm ${getStatusColor(systemHealth.aiEngine.status)}`}>
              {systemHealth.aiEngine.status}
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Latency: {systemHealth.aiEngine.latency}ms
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getLoadColor(systemHealth.aiEngine.load)}`}
                style={{ width: `${systemHealth.aiEngine.load}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{systemHealth.aiEngine.load}%</span>
          </div>
        </div>

        {/* Blockchain */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDot(systemHealth.blockchain.status)}`}></div>
              <span className="font-medium">BlockDAG Network</span>
            </div>
            <span className={`text-sm ${getStatusColor(systemHealth.blockchain.status)}`}>
              {systemHealth.blockchain.status}
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Latency: {systemHealth.blockchain.latency}ms
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getLoadColor(systemHealth.blockchain.load)}`}
                style={{ width: `${systemHealth.blockchain.load}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{systemHealth.blockchain.load}%</span>
          </div>
        </div>

        {/* API Gateway */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDot(systemHealth.apiGateway.status)}`}></div>
              <span className="font-medium">GoFr API Gateway</span>
            </div>
            <span className={`text-sm ${getStatusColor(systemHealth.apiGateway.status)}`}>
              {systemHealth.apiGateway.status}
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Latency: {systemHealth.apiGateway.latency}ms
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getLoadColor(systemHealth.apiGateway.load)}`}
                style={{ width: `${systemHealth.apiGateway.load}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{systemHealth.apiGateway.load}%</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="font-medium mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Avg Response Time</div>
            <div className="font-medium text-green-400">52ms</div>
          </div>
          <div>
            <div className="text-gray-400">Uptime</div>
            <div className="font-medium text-green-400">99.97%</div>
          </div>
          <div>
            <div className="text-gray-400">Throughput</div>
            <div className="font-medium text-blue-400">10.2K TPS</div>
          </div>
          <div>
            <div className="text-gray-400">Accuracy</div>
            <div className="font-medium text-purple-400">99.97%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemStatus