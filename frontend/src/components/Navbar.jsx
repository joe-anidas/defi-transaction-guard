import { Link, useLocation } from 'react-router-dom'
import { useBlockchain } from '../hooks/useBlockchain'

function Navbar() {
  const location = useLocation()
  const { 
    isConnected, 
    account, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    isLoading,
    error 
  } = useBlockchain()

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-800/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DeFi Guard
              </span>
              <div className="text-xs text-gray-400 -mt-1">Real-time Protection</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/demo"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/demo' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            Live Demo
          </Link>
          <Link
            to="/tech-proof"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/tech-proof' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            🏆 Tech Proof
          </Link>         

          {/* Wallet Connection */}
          {isConnected ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-900 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-300">{formatAddress(account)}</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {error && (
                <span className="text-red-400 text-sm max-w-xs truncate" title={error}>
                  {error}
                </span>
              )}
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                }`}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar