import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Demo from './components/Demo'
import TechProof from './components/TechProof'
import Navbar from './components/Navbar'
import NetworkStatus from './components/NetworkStatus'
import SetupStatus from './components/SetupStatus'
import TroubleshootingGuide from './components/TroubleshootingGuide'
import { TransactionProvider } from './context/TransactionContext'

function App() {
  return (
    <TransactionProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <div className="container mx-auto px-4 py-4">
            <SetupStatus />
            <NetworkStatus />
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/tech-proof" element={<TechProof />} />
          </Routes>
          <TroubleshootingGuide />
        </div>
      </Router>
    </TransactionProvider>
  )
}

export default App
