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
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🛡️</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Transaction Guard
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/demo"
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/demo' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Live Demo
          </Link>
          <Link
            to="/tech-proof"
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/tech-proof' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
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