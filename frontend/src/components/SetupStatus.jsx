import { useState, useEffect } from 'react'
import { checkBlockchainStatus, getSetupInstructions } from '../utils/blockchainStatus'

const SetupStatus = () => {
  const [status, setStatus] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkStatus()
    // Check status every 10 seconds
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const result = await checkBlockchainStatus()
      setStatus(result)
    } catch (error) {
      console.error('Error checking blockchain status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  if (!status) return null

  const instructions = getSetupInstructions(status)
  const isReady = status.isRunning && status.contractsDeployed

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'} ${isChecking ? 'animate-pulse' : ''}`}></div>
          <div>
            <p className="text-sm font-medium text-white">
              {isReady ? '✅ Demo Ready' : '⚠️ Setup Required'}
            </p>
            <p className="text-xs text-gray-400">
              {status.isRunning ? `Blockchain running (${status.networkId})` : 'Blockchain not running'}
              {status.isRunning && (status.contractsDeployed ? ' • Contracts deployed' : ' • Contracts not deployed')}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-900 rounded">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {instruction.step}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{instruction.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{instruction.description}</p>
                {instruction.command && (
                  <div className="mt-2 bg-black rounded p-2">
                    <code className="text-green-400 text-xs">{instruction.command}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={checkStatus}
              disabled={isChecking}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
            >
              {isChecking ? 'Checking...' : 'Refresh Status'}
            </button>
            
            {!isReady && (
              <p className="text-xs text-yellow-400">
                💡 Run commands in separate terminal windows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SetupStatus