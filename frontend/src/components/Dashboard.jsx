import { useTransaction } from '../context/TransactionContext'
import StatsCard from './StatsCard'
import ThreatFeed from './ThreatFeed'
import SystemStatus from './SystemStatus'

function Dashboard() {
  const { stats, recentBlocks } = useTransaction()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          DeFi Transaction Guard
        </h1>
        <p className="text-gray-400">
          Real-time exploit detection and prevention powered by AI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Transactions Screened"
          value={stats.transactionsScreened.toLocaleString()}
          subtitle="Today"
          icon="📊"
          trend="+12.5%"
        />
        <StatsCard
          title="Exploits Blocked"
          value={stats.exploitsBlocked}
          subtitle="Today"
          icon="🛡️"
          trend="+3"
          color="red"
        />
        <StatsCard
          title="Funds Protected"
          value={`$${(stats.fundsProtected / 1000000).toFixed(1)}M`}
          subtitle="Today"
          icon="💰"
          trend="+$200K"
          color="green"
        />
        <StatsCard
          title="False Positive Rate"
          value={`${stats.falsePositiveRate}%`}
          subtitle="Last 30 days"
          icon="🎯"
          trend="-0.01%"
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Threat Feed */}
        <div className="lg:col-span-2">
          <ThreatFeed blocks={recentBlocks} />
        </div>

        {/* System Status */}
        <div>
          <SystemStatus />
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mt-12 bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Powered By</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BD</span>
            </div>
            <div>
              <h4 className="font-medium">BlockDAG</h4>
              <p className="text-sm text-gray-400">Smart Contract Enforcement</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h4 className="font-medium">Akash Network</h4>
              <p className="text-sm text-gray-400">AI Threat Detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">GF</span>
            </div>
            <div>
              <h4 className="font-medium">GoFr Framework</h4>
              <p className="text-sm text-gray-400">Real-time APIs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard