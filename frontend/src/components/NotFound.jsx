import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link 
        to="/"
        className="inline-block px-6 py-3 bg-blue-500 text-white no-underline rounded-md hover:bg-blue-600 transition-colors font-medium"
      >
        Go back to Home
      </Link>
    </div>
  )
}

export default NotFound