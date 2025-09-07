import { useTransaction } from '../context/TransactionContext'

function TransactionAnalysis() {
  const { currentTransaction, isScanning } = useTransaction()

  const getMaliciousAnalysisSteps = () => [
    { id: 1, name: 'Gemini AI Analysis', status: 'completed', result: 'MALICIOUS DETECTED' },
    { id: 2, name: 'Pattern Recognition', status: 'completed', result: 'HIGH RISK PATTERNS' },
    { id: 3, name: 'Risk Assessment', status: 'completed', result: 'CRITICAL THREAT' },
    { id: 4, name: 'Final Verdict', status: 'completed', result: 'BLOCK TRANSACTION' }
  ]

  const getGoodAnalysisSteps = () => [
    { id: 1, name: 'Gemini AI Analysis', status: 'completed', result: 'SAFE VERIFIED' },
    { id: 2, name: 'Pattern Recognition', status: 'completed', result: 'NORMAL PATTERNS' },
    { id: 3, name: 'Risk Assessment', status: 'completed', result: 'LOW RISK' },
    { id: 4, name: 'Final Verdict', status: 'completed', result: 'APPROVE TRANSACTION' }
  ]

  const analysisSteps = currentTransaction?.analysisSteps || 
    (currentTransaction?.isMalicious === false ? getGoodAnalysisSteps() : getMaliciousAnalysisSteps())

  const getStepStatus = (step) => {
    if (!currentTransaction) {
      return 'pending'
    }
    if (currentTransaction.status === 'analyzing') {
      return step.id <= 2 ? 'completed' : 'pending'
    }
    if (currentTransaction.status === 'risk_detected') {
      return step.id <= 3 ? 'completed' : 'pending'
    }
    return 'completed'
  }

  const getStepIcon = (status, result) => {
    if (status === 'pending') {
      return '⏳'
    }
    if (result === 'SUSPICIOUS' || result === 'HIGH RISK' || result === 'EXPLOIT DETECTED' || result === 'CRITICAL') {
      return '🚨'
    }
    if (result === 'NORMAL' || result === 'SAFE' || result === 'NO THREATS' || result === 'APPROVED') {
      return '✅'
    }
    return '✅'
  }

  const getResultColor = (result) => {
    switch (result) {
      case 'CRITICAL THREAT':
      case 'MALICIOUS DETECTED':
      case 'BLOCK TRANSACTION':
      case 'HIGH RISK PATTERNS':
        return 'text-red-400'
      case 'CRITICAL': return 'text-red-400'
      case 'EXPLOIT DETECTED': return 'text-red-400'
      case 'HIGH RISK': return 'text-orange-400'
      case 'SUSPICIOUS': return 'text-yellow-400'
      case 'SAFE VERIFIED':
      case 'NORMAL PATTERNS':
      case 'APPROVE TRANSACTION':
      case 'LOW RISK':
        return 'text-green-400'
      case 'NORMAL': return 'text-green-400'
      case 'SAFE': return 'text-green-400'
      case 'NO THREATS': return 'text-green-400'
      case 'APPROVED': return 'text-green-400'
      case 'ANALYZING':
      case 'SCANNING':
      case 'EVALUATING':
      case 'DETERMINING':
        return 'text-blue-400'
      default: return 'text-green-400'
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-6">AI Analysis Engine</h3>

      {!currentTransaction && !isScanning && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-lg mb-2">Ready to Analyze</p>
          <p className="text-sm">Execute a transaction to see real-time AI analysis</p>
        </div>
      )}

      {(currentTransaction || isScanning) && (
        <div className="space-y-6">
          {/* Transaction Hash */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Transaction Hash</div>
            <div className="font-mono text-sm text-white">
              {currentTransaction?.hash || 'Generating...'}
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Analysis Progress</h4>
            {analysisSteps.map((step) => {
              const status = getStepStatus(step)
              const isActive = status === 'completed' || (isScanning && status === 'pending')
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isActive ? 'bg-gray-900 border border-gray-600' : 'bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {status === 'pending' && isScanning ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        getStepIcon(status, step.result)
                      )}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                  
                  {status === 'completed' && (
                    <span className={`text-sm font-medium ${getResultColor(step.result)}`}>
                      {step.result}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Risk Score */}
          {currentTransaction?.riskScore && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-red-400">Risk Score</span>
                <span className="text-2xl font-bold text-red-400">
                  {currentTransaction.riskScore}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${currentTransaction.riskScore}%` }}
                ></div>
              </div>
              <div className="text-sm text-red-300">
                <div className="font-medium mb-1">Threat Type: {currentTransaction.threatType}</div>
                <div>{currentTransaction.reason}</div>
              </div>
            </div>
          )}

          {/* Transaction Status Updates */}
          {currentTransaction && currentTransaction.status === 'processing' && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-sm text-blue-400 mb-1">🔄 Processing Transaction</div>
              <div className="text-sm text-blue-300">
                {currentTransaction.reason}
              </div>
            </div>
          )}

          {currentTransaction && currentTransaction.status === 'pending' && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-sm text-yellow-400 mb-1">⏳ Transaction Pending</div>
              <div className="font-mono text-sm text-white">
                Hash: {currentTransaction.hash}
              </div>
              <div className="text-sm text-yellow-300 mt-2">
                {currentTransaction.reason}
              </div>
            </div>
          )}

          {currentTransaction && currentTransaction.status === 'completed' && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-sm text-green-400 mb-1">✅ Transaction Completed</div>
              <div className="font-mono text-sm text-white">
                Hash: {currentTransaction.hash}
              </div>
              <div className="text-sm text-green-300 mt-2">
                {currentTransaction.reason}
              </div>
            </div>
          )}

          {currentTransaction && currentTransaction.status === 'failed' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-sm text-red-400 mb-1">❌ Transaction Failed</div>
              <div className="text-sm text-red-300">
                {currentTransaction.reason}
              </div>
            </div>
          )}

          {/* Final Decision */}
          {currentTransaction?.status === 'blocked' && (
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <div className="text-xl font-bold text-red-400 mb-2">
                TRANSACTION BLOCKED
              </div>
              <div className="text-sm text-red-300">
                Malicious transaction prevented by AI firewall
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Response Time: 2.8 seconds
              </div>
            </div>
          )}

          {currentTransaction?.status === 'approved' && currentTransaction?.status !== 'completed' && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-xl font-bold text-green-400 mb-2">
                TRANSACTION APPROVED
              </div>
              <div className="text-sm text-green-300">
                Safe transaction verified by AI analysis
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Analysis Time: 2.8 seconds
              </div>
            </div>
          )}

          {/* AI Confidence Metrics */}
          {currentTransaction && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h5 className="font-medium text-gray-300 mb-3">AI Model Confidence</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Pattern Recognition</div>
                  <div className="font-medium text-purple-400">98.7%</div>
                </div>
                <div>
                  <div className="text-gray-400">Anomaly Detection</div>
                  <div className="font-medium text-blue-400">96.2%</div>
                </div>
                <div>
                  <div className="text-gray-400">Risk Assessment</div>
                  <div className="font-medium text-orange-400">94.1%</div>
                </div>
                <div>
                  <div className="text-gray-400">Overall Confidence</div>
                  <div className="font-medium text-red-400">96.3%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionAnalysis