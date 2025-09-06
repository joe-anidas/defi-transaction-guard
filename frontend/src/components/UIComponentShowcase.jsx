import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { cn } from '../utils/cn'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Menu, 
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Minus,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'

function UIComponentShowcase() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('buttons')
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New threat detected', type: 'warning', time: '2m ago' },
    { id: 2, message: 'System update available', type: 'info', time: '1h ago' },
    { id: 3, message: 'Transaction blocked successfully', type: 'success', time: '3h ago' }
  ])

  const { register, handleSubmit, formState: { errors } } = useForm()

  const tabs = [
    { id: 'buttons', label: 'Buttons', icon: CheckCircle },
    { id: 'forms', label: 'Forms', icon: Edit },
    { id: 'cards', label: 'Cards', icon: Star },
    { id: 'modals', label: 'Modals', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            UI Component Showcase
          </h1>
          <p className="text-gray-300 text-xl">
            Modern, accessible components built with React, Tailwind CSS, Framer Motion, and Headless UI
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-8 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border",
                selectedTab === tab.id
                  ? "bg-white/20 text-white border-white/30 shadow-lg"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {selectedTab === 'buttons' && <ButtonsShowcase />}
          {selectedTab === 'forms' && <FormsShowcase />}
          {selectedTab === 'cards' && <CardsShowcase />}
          {selectedTab === 'modals' && <ModalsShowcase />}
          {selectedTab === 'notifications' && <NotificationsShowcase notifications={notifications} />}
        </motion.div>
      </div>
    </motion.div>
  )
}

// Buttons Showcase
function ButtonsShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Buttons</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary Buttons */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">Primary</h3>
          <div className="space-y-3">
            <motion.button
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Primary Button
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Success Button
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Danger Button
            </motion.button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">Secondary</h3>
          <div className="space-y-3">
            <motion.button
              className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Outline Button
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 bg-white/5 text-gray-300 font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ghost Button
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Link Button
            </motion.button>
          </div>
        </div>

        {/* Icon Buttons */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">With Icons</h3>
          <div className="space-y-3">
            <motion.button
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Item
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Download
            </motion.button>
            
            <motion.button
              className="w-full px-6 py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Forms Showcase
function FormsShowcase() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Forms</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.form 
          className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Contact Form</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              placeholder="Enter your message"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Send Message
          </motion.button>
        </motion.form>

        <motion.div 
          className="space-y-6 p-6 bg-white/5 rounded-2xl border border-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Search & Filters</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              placeholder="Search transactions..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Risk Level</label>
            <div className="space-y-2">
              {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="riskLevel"
                    value={level.toLowerCase()}
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 focus:ring-blue-500/50"
                  />
                  <span className="text-gray-300">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Threat Types</label>
            <div className="space-y-2">
              {['Flash Loan', 'Rug Pull', 'MEV Attack', 'Governance Exploit'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500/50"
                  />
                  <span className="text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Cards Showcase
function CardsShowcase() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Cards</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Transaction Analysis',
            description: 'Real-time AI-powered threat detection',
            icon: CheckCircle,
            gradient: 'from-blue-500 to-cyan-500',
            stats: '1,247',
            trend: '+12.5%'
          },
          {
            title: 'System Health',
            description: 'Monitor system performance and uptime',
            icon: AlertCircle,
            gradient: 'from-green-500 to-emerald-500',
            stats: '99.97%',
            trend: '+0.01%'
          },
          {
            title: 'Security Alerts',
            description: 'Latest security threats and incidents',
            icon: Bell,
            gradient: 'from-red-500 to-pink-500',
            stats: '23',
            trend: '-5'
          }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotateY: 2 }}
          >
            <motion.div 
              className={cn(
                "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                card.gradient
              )}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={cn(
                    "w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300",
                    card.gradient
                  )}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{card.stats}</div>
                  <div className="text-sm text-gray-400">{card.trend}</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Modals Showcase
function ModalsShowcase() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Modals & Dialogs</h2>
      
      <div className="flex flex-wrap gap-4">
        <motion.button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Open Modal
        </motion.button>
      </div>

      {/* Modal */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Confirm Action</h3>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to perform this action? This cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Notifications Showcase
function NotificationsShowcase({ notifications }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">Notifications</h2>
      
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              notification.type === 'success' && "bg-green-500/20 text-green-400",
              notification.type === 'warning' && "bg-yellow-500/20 text-yellow-400",
              notification.type === 'info' && "bg-blue-500/20 text-blue-400"
            )}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium">{notification.message}</p>
              <p className="text-gray-400 text-sm">{notification.time}</p>
            </div>
            
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default UIComponentShowcase
