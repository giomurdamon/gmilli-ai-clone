'use client';

import Link from 'next/link';

export default function AnalyzerPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Navigation */}
      <nav
        className="backdrop-blur-xl bg-slate-900/50 border-blue-900/20 border-b transition-colors duration-200"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link className="flex items-center space-x-2" href="/">
              <div
                className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#0EA5E9',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                G
              </div>
              <span
                className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #38BDF8, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginLeft: '8px'
                }}
              >
                Gmilli AI
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                className="hover:text-sky-400 transition-colors text-gray-300"
                href="/"
                style={{ color: '#D1D5DB', textDecoration: 'none' }}
              >
                Home
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#0284C7',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div
          className="p-6 mb-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)'
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Trading Analyzer</h1>
          <p className="text-sky-200">Connect to Deriv and manage your trading activities</p>
        </div>

        {/* Trading Interface - 2 Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Deriv API Connection */}
            <div
              className="rounded-lg p-6"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <h3 className="text-lg font-semibold text-white">Deriv API Connection</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-red-400">Disconnected</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">API Token</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="flex-1 px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white"
                      placeholder="Enter your API token"
                      style={{ backgroundColor: '#334155' }}
                    />
                    <button
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Get API Token
                    </button>
                  </div>
                </div>

                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                  style={{ fontSize: '16px' }}
                >
                  Connect to Deriv
                </button>

                <div className="text-sm text-gray-300 space-y-1">
                  <p>To get your API token:</p>
                  <p>1. Log in to your <span className="text-green-400">Deriv account</span></p>
                  <p>2. Go to Settings &gt; API Token</p>
                  <p>3. Create a new token with "Trade" permission</p>
                  <p>4. Copy and paste the token here</p>
                </div>

                <p className="text-sm text-gray-400">
                  New to Deriv? <span className="text-green-400 underline cursor-pointer">Sign up for free here and enjoy a 30% bonus on your first deposit</span>
                </p>
              </div>
            </div>

            {/* Trading Strategies */}
            <div
              className="rounded-lg p-6"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">📊</span>
                  <h3 className="text-lg font-semibold text-white">Trading Strategies</h3>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded text-orange-200"
                  style={{ backgroundColor: 'rgba(251, 146, 60, 0.8)' }}
                >
                  Connect to activate
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'DigitAI', desc: 'Even/Odd digit analysis', icon: '⚡', color: 'text-green-400' },
                  { name: 'Unibot', desc: 'Rise/Fall predictions', icon: '🔮', color: 'text-blue-400' },
                  { name: 'TradeX', desc: 'Matches/Differs analysis', icon: '📈', color: 'text-purple-400' },
                  { name: 'OptimaX', desc: 'Over/Under digit trading', icon: '🎯', color: 'text-orange-400' },
                  { name: 'Accumulator Bot', desc: 'Accumulators trading', icon: '💰', color: 'text-emerald-400' },
                  { name: 'Auto R5', desc: 'Touch/No Touch strategies', icon: '🤖', color: 'text-pink-400' }
                ].map((strategy, index) => (
                  <div
                    key={strategy.name}
                    className="flex items-center justify-between p-3 rounded"
                    style={{ backgroundColor: 'rgba(51, 65, 85, 0.6)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg ${strategy.color}`}>{strategy.icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{strategy.name}</div>
                        <div className="text-xs text-gray-400">{strategy.desc}</div>
                      </div>
                    </div>
                    <div className="relative">
                      {index === 5 ? (
                        // Different toggle style for Auto R5
                        <div
                          className="w-12 h-6 rounded border cursor-pointer flex items-center justify-center"
                          style={{ backgroundColor: '#374151', border: '1px solid #6B7280' }}
                        >
                          <div
                            className="w-8 h-4 rounded"
                            style={{ backgroundColor: '#4B5563' }}
                          ></div>
                        </div>
                      ) : (
                        // Regular toggle switch
                        <div
                          className="w-12 h-6 rounded-full cursor-pointer relative"
                          style={{ backgroundColor: '#4B5563' }}
                        >
                          <div
                            className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"
                            style={{ transform: 'translateX(0px)' }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Signal Generator */}
          <div
            className="rounded-lg p-6"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold text-green-400 mb-6">Signal Generator</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Trade Type</label>
                <select
                  className="w-full px-4 py-3 rounded text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  <option value="Rise/Fall">Rise/Fall</option>
                  <option value="Higher/Lower">Higher/Lower</option>
                  <option value="Matches/Differs">Matches/Differs</option>
                  <option value="Even/Odd">Even/Odd</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Volatility Index</label>
                <select
                  className="w-full px-4 py-3 rounded text-white"
                  style={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                >
                  <option value="Volatility 10 Index">Volatility 10 Index</option>
                  <option value="Volatility 25 Index">Volatility 25 Index</option>
                  <option value="Volatility 50 Index">Volatility 50 Index</option>
                  <option value="Volatility 75 Index">Volatility 75 Index</option>
                  <option value="Volatility 100 Index">Volatility 100 Index</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                  style={{ fontSize: '16px' }}
                >
                  Generate Signal
                </button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold"
                  style={{ fontSize: '16px' }}
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
