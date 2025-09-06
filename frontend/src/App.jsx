import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Demo from './components/Demo'
import Navbar from './components/Navbar'
import { TransactionProvider } from './context/TransactionContext'

function App() {
  return (
    <TransactionProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </div>
      </Router>
    </TransactionProvider>
  )
}

export default App
