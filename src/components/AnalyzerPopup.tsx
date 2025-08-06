'use client';

interface AnalyzerPopupProps {
  onClose: () => void;
}

export function AnalyzerPopup({ onClose }: AnalyzerPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div
        className="bg-slate-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-auto shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          maxWidth: '1200px'
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b border-slate-600"
          style={{
            background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Trading Analyzer</h2>
              <p className="text-sky-200 text-sm">Connect to Deriv and manage your trading activities</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white text-3xl font-light"
              style={{ lineHeight: '1' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="p-6 grid grid-cols-2 gap-6">
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
