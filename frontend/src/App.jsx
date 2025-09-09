import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import Demo from './components/Demo'
import TechProof from './components/TechProof'
import Navbar from './components/Navbar'
import TroubleshootingGuide from './components/TroubleshootingGuide'
import { TransactionProvider } from './context/TransactionContext'

function App() {
  useEffect(() => {
    // Prevent scroll lock and dragging issues
    const preventDrag = (e) => {
      if (e.target.tagName === 'IMG' || e.target.draggable) {
        e.preventDefault()
      }
    }

    const preventScrollLock = (e) => {
      if (e.ctrlKey || e.metaKey) {
        return
      }
    }

    document.addEventListener('dragstart', preventDrag)
    document.addEventListener('selectstart', preventScrollLock)
    
    // Only prevent context menu on specific elements (images, etc.)
    const preventContextMenu = (e) => {
      if (e.target.tagName === 'IMG' || e.target.draggable) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', preventContextMenu)

    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.removeEventListener('dragstart', preventDrag)
      document.removeEventListener('selectstart', preventScrollLock)
      document.removeEventListener('contextmenu', preventContextMenu)
    }
  }, [])

  return (
    <TransactionProvider>
      <Router>
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,107,0.05),transparent_50%)]"></div>
          </div>

          <div className="relative z-10">
            <Navbar />
        
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/tech-proof" element={<TechProof />} />
            </Routes>
            <TroubleshootingGuide />
          </div>
        </div>
      </Router>
    </TransactionProvider>
  )
}

export default App
