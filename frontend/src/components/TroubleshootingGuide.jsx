import { useState } from 'react'

const TroubleshootingGuide = () => {
  const [isOpen, setIsOpen] = useState(false)

  const steps = [
    {
      title: "1. Install MetaMask",
      description: "Make sure you have MetaMask browser extension installed",
      action: "Visit metamask.io to install"
    },
    {
      title: "2. Start Local Blockchain",
      description: "Run the Hardhat local blockchain for the demo",
      code: "cd blockchain && npm run node"
    },
    {
      title: "3. Deploy Contracts",
      description: "Deploy the smart contracts to localhost",
      code: "cd blockchain && npm run deploy"
    },
    {
      title: "4. Add Localhost Network",
      description: "Add localhost network to MetaMask manually if auto-switch fails",
      details: {
        "Network Name": "Localhost",
        "RPC URL": "http://127.0.0.1:8545",
        "Chain ID": "31337",
        "Currency Symbol": "ETH"
      }
    },
    {
      title: "5. Import Test Account",
      description: "Import a Hardhat test account for demo funds",
      details: {
        "Private Key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "Note": "This is Hardhat's first test account with 10,000 ETH"
      }
    }
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
      >
        Need Help? 🛠️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🛠️ Setup Guide</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 mb-3">{step.description}</p>
                
                {step.code && (
                  <div className="bg-gray-900 rounded p-3 mb-3">
                    <code className="text-green-400 text-sm">{step.code}</code>
                  </div>
                )}
                
                {step.action && (
                  <p className="text-blue-400 text-sm">→ {step.action}</p>
                )}
                
                {step.details && (
                  <div className="bg-gray-900 rounded p-3 space-y-2">
                    {Object.entries(step.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded">
            <h4 className="text-green-400 font-semibold mb-2">🎯 Quick Demo Setup</h4>
            <p className="text-green-300 text-sm">
              For the fastest setup, run these commands in order:
            </p>
            <div className="bg-gray-900 rounded p-3 mt-2">
              <code className="text-green-400 text-sm block">
                cd blockchain && npm install && npm run node<br/>
                # In new terminal:<br/>
                npm run deploy && npm run verify
              </code>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
            >
              Got it! 👍
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TroubleshootingGuide