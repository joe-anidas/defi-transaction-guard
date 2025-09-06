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

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Threat Blocks</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Live Feed</span>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-600"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                {getThreatIcon(block.type)}
              </div>
              <div>
                <h4 className="font-medium text-white">
                  {block.type}
                </h4>
                <p className="text-sm text-gray-400">
                  Potential loss: ${block.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {block.time}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-400">Confidence:</span>
                <span className={`text-sm font-medium ${getConfidenceColor(block.confidence)}`}>
                  {block.confidence}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-400 font-medium uppercase">
                  BLOCKED
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🛡️</div>
          <p>No threats detected recently</p>
          <p className="text-sm">Your funds are secure</p>
        </div>
      )}
    </div>
  )
}

export default ThreatFeed