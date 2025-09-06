import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './components/Home'
import NotFound from './components/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="flex justify-between items-center px-8 py-4 bg-slate-700 text-white">
          <div className="nav-brand">
            <Link to="/" className="text-white no-underline text-2xl font-bold hover:text-blue-300 transition-colors">My App</Link>
          </div>
          <ul className="flex list-none gap-8 m-0 p-0">
            <li><Link to="/" className="text-white no-underline px-4 py-2 rounded hover:bg-white hover:text-blue-600 transition-colors">Home</Link></li>
          </ul>
        </nav>

        <main className="p-8">
          <Routes>
            {/* Basic routes */}
            <Route path="/" element={<Home />} />
            
            {/* Redirect example */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
