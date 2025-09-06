function StatsCard({ title, value, subtitle, icon, trend, gradient = 'from-blue-500 to-blue-600' }) {
  const trendColor = trend?.startsWith('+') ? 'text-green-400' : 'text-red-400'

  return (
    <div className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
      {/* Gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${trend?.startsWith('+') ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className={`text-sm font-semibold ${trendColor}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {value}
          </h3>
          <p className="text-gray-300 text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-gray-500 text-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard