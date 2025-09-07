import { useTransaction } from '../context/TransactionContext'
import StatsCard from './StatsCard'
import ThreatFeed from './ThreatFeed'
import SystemStatus from './SystemStatus'
import WalletConnection from './WalletConnection'

function Dashboard() {
  const { stats, recentBlocks } = useTransaction()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            DeFi Transaction Guard
          </h1>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Real-time exploit detection and prevention powered by AI • Secured by BlockDAG • Accelerated on Akash
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatsCard
          title="Transactions Screened"
          value={stats.transactionsScreened.toLocaleString()}
          subtitle="Real-time Analysis"
          icon="📊"
          trend="+12.5%"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Exploits Blocked"
          value={stats.exploitsBlocked}
          subtitle="Threats Prevented"
          icon="🛡️"
          trend="+3"
          gradient="from-red-500 to-pink-500"
        />
        <StatsCard
          title="Funds Protected"
          value={`$${(stats.fundsProtected / 1000000).toFixed(1)}M`}
          subtitle="Assets Secured"
          icon="💰"
          trend="+$200K"
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="AI Accuracy"
          value={`${(100 - stats.falsePositiveRate).toFixed(1)}%`}
          subtitle="Detection Rate"
          icon="🎯"
          trend="+0.01%"
          gradient="from-purple-500 to-indigo-500"
        />
      </div>

      {/* BDAG Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatsCard
          title="BDAG Validators"
          value="47"
          subtitle="Active Stakers"
          icon="🔗"
          trend="+5"
          gradient="from-indigo-500 to-purple-500"
        />
        <StatsCard
          title="Total BDAG Staked"
          value="1.2M"
          subtitle="Validator Stakes"
          icon="💎"
          trend="+50K"
          gradient="from-blue-500 to-indigo-500"
        />
        <StatsCard
          title="Akash GPU Nodes"
          value="12"
          subtitle="AI Processing"
          icon="🚀"
          trend="+2"
          gradient="from-green-500 to-teal-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Threat Feed */}
        <div className="lg:col-span-2">
          <ThreatFeed blocks={recentBlocks} />
        </div>

        {/* System Status */}
        <div className="space-y-8">
          <SystemStatus />
     
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50">
        <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Powered By
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">BD</span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg">BlockDAG</h4>
              <p className="text-gray-400">Smart Contract Enforcement</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg">Akash Network</h4>
              <p className="text-gray-400">AI Threat Detection</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">GF</span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-lg">GoFr Framework</h4>
              <p className="text-gray-400">Real-time APIs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard