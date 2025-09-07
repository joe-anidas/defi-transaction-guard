import React from 'react'
import { useBlockchain } from '../hooks/useBlockchain'

function WalletDemo() {
  const {
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isLoading,
    error,
    chainId
  } = useBlockchain()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>BlockDAG Wallet Demo</h1>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '1rem', 
        marginBottom: '1rem', 
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '8px'
      }}>
        <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
        {chainId && <div><strong>Chain ID:</strong> {chainId}</div>}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Wallet Info */}
      {isConnected && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#e2e3e5',
          border: '1px solid #d6d8db',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Address:</strong> {formatAddress ? formatAddress(account) : account}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Full Address:</strong> <code style={{ fontSize: '0.9em' }}>{account}</code>
          </div>
          <div style={{ 
            fontSize: '1.2em', 
            fontWeight: 'bold',
            color: '#0066cc',
            padding: '0.5rem',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px'
          }}>
            <strong>Balance:</strong> {parseFloat(balance || 0).toFixed(6)} BDAG
          </div>
        </div>
      )}

      {/* Connect/Disconnect Button */}
      <button
        onClick={isConnected ? disconnectWallet : handleConnect}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: isLoading ? '#6c757d' : isConnected ? '#dc3545' : '#007bff',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          width: '100%'
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
          }
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        {isLoading ? (
          <span>🔄 Connecting...</span>
        ) : isConnected ? (
          '🔌 Disconnect Wallet'
        ) : (
          '🦊 Connect to BlockDAG'
        )}
      </button>

      {/* Network Info */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        fontSize: '0.9em'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Network Details</h3>
        <div><strong>Network:</strong> BlockDAG Primordial Testnet</div>
        <div><strong>Chain ID:</strong> 1043 (0x413)</div>
        <div><strong>RPC URL:</strong> https://rpc.primordial.bdagscan.com</div>
        <div><strong>Explorer:</strong> https://primordial.bdagscan.com</div>
        <div><strong>Currency:</strong> BDAG</div>
      </div>

      {/* Live Updates Info */}
      {isConnected && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          fontSize: '0.85em',
          color: '#0c5460'
        }}>
          ℹ️ Balance updates automatically every 5 seconds while connected
        </div>
      )}
    </div>
  )
}

export default WalletDemo