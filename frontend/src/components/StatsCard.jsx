function StatsCard({ title, value, subtitle, icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  }

  const trendColor = trend?.startsWith('+') ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {value}
        </h3>
        <p className="text-gray-400 text-sm">
          {title}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default StatsCard