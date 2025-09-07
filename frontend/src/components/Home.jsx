import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative md:pt-32 md:pb-24 py-16 overflow-hidden">
        <div className="container mx-auto px-4 lg:max-w-screen-xl">
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl">🛡️</span>
                </div>
                <p className="text-white text-xl m-0">
                  Real-time DeFi Transaction <span className="text-blue-400">Guard</span>
                </p>
              </div>
              <h1 className="font-medium lg:text-6xl md:text-5xl text-4xl text-white leading-tight mb-6">
                Protect your funds with on-chain AI and a validator firewall
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                Detect and block exploits before they execute. Live demo, live proof of protection, and an interactive dashboard once you connect your wallet.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-lg text-white text-lg font-medium hover:from-blue-700 hover:to-purple-700 py-3 px-6"
                >
                  Explore Dashboard
                </Link>
                <Link
                  to="/demo"
                  className="bg-transparent border border-blue-600 rounded-lg text-blue-400 text-lg font-medium hover:bg-blue-600/10 py-3 px-6"
                >
                  Try Live Demo
                </Link>
                <Link
                  to="/tech-proof"
                  className="bg-transparent border border-purple-600 rounded-lg text-purple-400 text-lg font-medium hover:bg-purple-600/10 py-3 px-6"
                >
                  View Live Proof
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-purple-600/20 blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FeatureCard title="AI Risk Engine" desc="Scores transactions in ms" emoji="🤖" />
                    <FeatureCard title="Validator Firewall" desc="Blocks malicious calls" emoji="🔥" />
                    <FeatureCard title="Live Threat Feed" desc="On-chain alerts" emoji="📡" />
                    <FeatureCard title="Proof of Protection" desc="Verifiable outcomes" emoji="✅" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-t border-gray-800/60">
        <div className="container mx-auto px-4 lg:max-w-screen-xl">
          <h2 className="text-2xl text-gray-200 mb-6">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Bullet title="Real-time screening" desc="Every tx inspected pre-execution to stop losses." />
            <Bullet title="Defense-in-depth" desc="On-chain guard + off-chain AI consensus." />
            <Bullet title="Developer friendly" desc="Drop-in guard for DEX and DeFi flows." />
          </div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ title, desc, emoji }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
    <div className="text-3xl mb-3">{emoji}</div>
    <div className="text-white text-lg font-semibold">{title}</div>
    <div className="text-gray-400 text-sm mt-1">{desc}</div>
  </div>
)

const Bullet = ({ title, desc }) => (
  <div className="rounded-xl border border-gray-800 bg-black p-5">
    <div className="text-white font-medium">{title}</div>
    <div className="text-gray-400 text-sm mt-1">{desc}</div>
  </div>
)

export default Home