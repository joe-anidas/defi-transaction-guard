import { useState } from 'react'

const TroubleshootingGuide = () => {
  const [isOpen, setIsOpen] = useState(false)

  const steps = [
    {
      title: "1. Install MetaMask",
      description: "Ensure you have the MetaMask browser extension installed.",
      action: "Visit metamask.io to install"
    },
    {
      title: "2. Start Local Blockchain",
      description: "Run the Hardhat local blockchain for the demo.",
      code: "cd blockchain && npm run node"
    },
    {
      title: "3. Deploy Contracts",
      description: "Deploy smart contracts to your local network.",
      code: "cd blockchain && npm run deploy"
    },
    {
      title: "4. Add Localhost Network",
      description: "Add localhost network to MetaMask manually if auto-switch fails.",
      details: {
        "Network Name": "Localhost",
        "RPC URL": "http://127.0.0.1:8545",
        "Chain ID": "31337",
        "Currency Symbol": "ETH"
      }
    },
    {
      title: "5. Import Test Account",
      description: "Import a Hardhat test account with demo funds.",
      details: {
        "Private Key": "0xac0974bec39a34e36ba4a6b4d128ff934bacb478cbed5efcae784d7bf4f2ff80",
        "Note": "This account has 10,000 ETH for testing purposes"
      }
    },
    {
      title: "6. Setup Backend (GoFr API)",
      description: "Install dependencies and start the GoFr backend.",
      code: "cd backend && go mod tidy && go run main.go"
    },
    {
      title: "7. Start AI Service",
      description: "Install Python dependencies and start AI anomaly detection service.",
      code: "cd ai-service && pip install -r requirements.txt && python app.py"
    },
    {
      title: "8. Start Frontend Dashboard",
      description: "Launch the React frontend dashboard to monitor transactions.",
      code: "cd frontend && npm install && npm run dev"
    },
    {
      title: "9. Optional: Akash Deployment",
      description: "Deploy all services on Akash network for decentralized execution.",
      code: "./build-and-push-images.sh && ./deploy-to-akash.sh"
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
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🛠️ Setup & Troubleshooting Guide</h2>
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
            <h4 className="text-green-400 font-semibold mb-2">🎯 Quick Demo Commands</h4>
            <p className="text-green-300 text-sm">Fastest setup for local testing:</p>
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
