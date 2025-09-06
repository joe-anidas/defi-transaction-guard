import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../utils/cn'
import EnhancedDashboard from './EnhancedDashboard'
import Demo from './Demo'
import TechProof from './TechProof'
import Navbar from './Navbar'
import NetworkStatus from './NetworkStatus'
import SetupStatus from './SetupStatus'
import TroubleshootingGuide from './TroubleshootingGuide'
import { TransactionProvider } from '../context/TransactionContext'

function EnhancedApp() {
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
    document.addEventListener('contextmenu', (e) => e.preventDefault())

    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.removeEventListener('dragstart', preventDrag)
      document.removeEventListener('selectstart', preventScrollLock)
      document.removeEventListener('contextmenu', (e) => e.preventDefault())
    }
  }, [])

  return (
    <TransactionProvider>
      <Router>
        <motion.div 
          className="min-h-screen bg-black text-white overflow-x-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Enhanced Animated Background */}
          <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,107,0.05),transparent_50%)]"></div>
            
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <Navbar />
            
            <div className="container mx-auto px-4 py-4">
              <SetupStatus />
              <NetworkStatus />
            </div>
            
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <EnhancedDashboard />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/demo" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Demo />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/tech-proof" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TechProof />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
            
            <TroubleshootingGuide />
          </div>
        </motion.div>
      </Router>
    </TransactionProvider>
  )
}

export default EnhancedApp
