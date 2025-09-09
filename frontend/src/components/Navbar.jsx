import { Link, useLocation } from 'react-router-dom'
import { useBlockchain } from '../context/BlockchainContext'
import logo from '../assets/logo.png'

function Navbar() {
  const location = useLocation()
  const { 
    isConnected, 
    account, 
    balance,
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    isLoading,
    error 
  } = useBlockchain()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (e) {
      // swallow; error already surfaced in hook state
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (e) {
      console.error('Error disconnecting wallet:', e)
    }
  }

  // Format balance for display
  const displayBalance = balance ? parseFloat(balance).toFixed(4) : '0.0000'

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-800/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
           
          <img 
  src={logo} 
  alt="icon" 
  className="w-10 h-10 object-contain border-2 border-white rounded-md" 
/>

            
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DeFi-Guard
              </span>
              <div className="text-xs text-gray-400 -mt-1">Stop the Hack Before It Happens</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/dashboard'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/demo"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/demo'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            Live Demo
          </Link>
          <Link
            to="/tech-proof"
            className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
              location.pathname === '/tech-proof'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:transform hover:scale-105'
            }`}
          >
            🏆 Tech Proof
          </Link>         

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {error && !isConnected && (
              <span className="text-red-400 text-sm max-w-xs truncate" title={error}>
                {error}
              </span>
            )}
            
            {/* Network Indicator */}
            {/* {isConnected && (
              <div className="flex items-center space-x-2 bg-purple-900/50 px-3 py-2 rounded-lg border border-purple-500/30">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-300">BlockDAG</span>
              </div>
            )} */}

            {/* Balance Display */}
            {/* {isConnected && (
              <div className="flex items-center space-x-2 bg-blue-900/50 px-3 py-2 rounded-lg border border-blue-500/30">
                <span className="text-sm text-blue-300">{displayBalance} BDAG</span>
              </div>
            )} */}

  
        

            {/* Connect/Disconnect Button */}
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isLoading}
              className={`relative px-6 py-2 rounded-lg font-medium transition-all text-white group min-w-[140px] ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : isConnected
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transform hover:scale-105'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg 
                    className="w-4 h-4 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  <span className="font-mono text-sm">{formatAddress(account)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Connect Wallet</span>
                </div>
              )}
              
          
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar