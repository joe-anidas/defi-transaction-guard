function ThreatFeed({ blocks }) {
  const getThreatIcon = (type) => {
    const icons = {
      'Flash Loan Attack': '⚡',
      'Rug Pull Attempt': '🎯',
      'Governance Exploit': '🏛️',
      'Liquidity Drain': '💧',
      'Sandwich Attack': '🥪',
      'MEV Bot': '🤖'
    }
    return icons[type] || '🚨'
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

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Live Threat Feed
        </h3>
        <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400 font-medium">Real-time</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="group relative flex items-center justify-between p-5 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 hover:transform hover:scale-[1.01]"
          >
            {/* Gradient border effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getThreatGradient(block.type)} rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${getThreatGradient(block.type)} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                {getThreatIcon(block.type)}
              </div>
              <div>
                <h4 className="font-semibold text-white text-lg mb-1">
                  {block.type}
                </h4>
                <p className="text-sm text-gray-300 mb-1">
                  Potential loss: <span className="font-semibold text-red-400">${block.amount.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {block.time}
                </p>
              </div>
            </div>

            <div className="relative z-10 text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-400">AI Confidence:</span>
                <span className={`text-sm font-bold ${getConfidenceColor(block.confidence)}`}>
                  {block.confidence}%
                </span>
              </div>
              <div className="flex items-center justify-end space-x-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-400 font-bold uppercase">
                  BLOCKED
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
            🛡️
          </div>
          <p className="text-gray-300 text-lg font-medium mb-2">All Clear</p>
          <p className="text-gray-500">No threats detected recently</p>
          <p className="text-sm text-green-400 mt-2">Your funds are secure</p>
        </div>
      )}
    </div>
  )
}

export default ThreatFeed