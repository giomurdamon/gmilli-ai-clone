'use client';

interface AnalyzerPopupProps {
  onClose: () => void;
}

export function AnalyzerPopup({ onClose }: AnalyzerPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0a1525] border border-cyan-400/40 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="border-b border-cyan-400/30 p-6 flex justify-between items-center bg-[#0f1e2e]">
          <h2 className="text-2xl font-bold text-white">Real-Time Trading Interface</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Main Content - 2x2 Grid */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Enhanced Deriv API Connection */}
          <div className="bg-[#1a3a3a] rounded-lg p-6 border border-cyan-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">🔗 Enhanced Deriv API Connection</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-red-400">Disconnected</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Ticks:</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Contracts:</span>
                <span className="text-white">0</span>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">API Token (Required)</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded bg-[#2a4a4a] border border-cyan-400/30 text-white text-center"
                  placeholder="••••••••••••"
                />
              </div>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded font-semibold mb-2">
                Get API Token
              </button>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded font-semibold">
                Connect to Deriv
              </button>
            </div>
          </div>

          {/* Enhanced Signal Generator */}
          <div className="bg-[#1a3a3a] rounded-lg p-6 border border-cyan-400/30">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Enhanced Signal Generator</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contract Type</label>
                <select className="w-full px-4 py-2 rounded bg-[#2a4a4a] border border-cyan-400/30 text-white">
                  <option value="CALL (Rise)">CALL (Rise)</option>
                  <option value="PUT (Fall)">PUT (Fall)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Volatility Index</label>
                <select className="w-full px-4 py-2 rounded bg-[#2a4a4a] border border-cyan-400/30 text-white">
                  <option value="Volatility 10 Index (R_10)">Volatility 10 Index (R_10)</option>
                  <option value="Volatility 25 Index (R_25)">Volatility 25 Index (R_25)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Stake Amount (USD)</label>
                <input
                  type="number"
                  defaultValue="1"
                  className="w-full px-4 py-2 rounded bg-[#2a4a4a] border border-cyan-400/30 text-white"
                />
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded font-semibold">
                  Place Trade
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold">
                  Clear History
                </button>
              </div>
            </div>
          </div>

          {/* AI Trading Strategies */}
          <div className="bg-[#1a3a3a] rounded-lg p-6 border border-cyan-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">🤖 AI Trading Strategies</h3>
              <div className="bg-orange-600 text-white text-xs px-2 py-1 rounded">Connect to activate</div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'DigitAI', desc: 'Real-time VDOM analysis', color: 'bg-green-600', initial: 'D' },
                { name: 'Unibot', desc: 'Neural ML predictions', color: 'bg-blue-600', initial: 'U' },
                { name: 'TradeX', desc: 'Advanced pattern analysis', color: 'bg-purple-600', initial: 'X' },
                { name: 'OptimaX', desc: 'Optimized high frequency trading', color: 'bg-orange-600', initial: 'O' }
              ].map((strategy) => (
                <div key={strategy.name} className="flex items-center justify-between p-3 bg-[#2a4a4a] rounded border border-cyan-400/20">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${strategy.color} rounded flex items-center justify-center text-white font-bold`}>
                      {strategy.initial}
                    </div>
                    <div>
                      <div className="text-white font-medium">{strategy.name}</div>
                      <div className="text-xs text-gray-400">{strategy.desc}</div>
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-gray-600 cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full m-0.5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Trade History */}
          <div className="bg-[#1a3a3a] rounded-lg p-6 border border-cyan-400/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">Enhanced Trade History</h3>
              <div className="text-red-400 text-sm">⚠️</div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Net Profit/Loss</div>
                  <div className="text-lg font-bold text-cyan-400">+0.00 USD</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Win Rate</div>
                  <div className="text-lg font-bold text-emerald-400">0% (0/0)</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">0</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">0</div>
                  <div className="text-xs text-gray-400">Losses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">0</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-6xl text-gray-600 mb-2">📊</div>
                <div className="text-gray-400 font-medium">No trades executed yet</div>
                <div className="text-xs text-gray-500 mt-1">Connect to Deriv and place your first real trade!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mx-6 mb-6 bg-orange-900/30 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400">⚠️</span>
            <span className="text-orange-300 text-sm">
              Invalid API token format. Token should be at least 20 characters. - {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
