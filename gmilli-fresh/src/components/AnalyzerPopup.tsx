'use client';

interface AnalyzerPopupProps {
  onClose: () => void;
}

export function AnalyzerPopup({ onClose }: AnalyzerPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Trading Interface</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Main Content - 2x2 Grid */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Market Analysis */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 text-blue-600">Market Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">EUR/USD</span>
                <span className="font-mono text-green-600">1.0845 ↗</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GBP/USD</span>
                <span className="font-mono text-red-600">1.2734 ↘</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">USD/JPY</span>
                <span className="font-mono text-green-600">149.82 ↗</span>
              </div>
              <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                Chart Visualization
              </div>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 text-green-600">Portfolio Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Balance</span>
                <span className="font-bold text-xl">$12,547.82</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Today's P&L</span>
                <span className="text-green-600 font-semibold">+$247.15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Open Positions</span>
                <span className="text-blue-600 font-semibold">5</span>
              </div>
              <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                Performance Graph
              </div>
            </div>
          </div>

          {/* AI Signals */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 text-purple-600">AI Trading Signals</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <div className="font-semibold text-green-700">BUY Signal</div>
                <div className="text-sm text-green-600">EUR/USD - Strong upward trend detected</div>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="font-semibold text-red-700">SELL Signal</div>
                <div className="text-sm text-red-600">GBP/USD - Resistance level reached</div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <div className="font-semibold text-yellow-700">HOLD Signal</div>
                <div className="text-sm text-yellow-600">USD/JPY - Consolidation pattern</div>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 text-orange-600">Risk Management</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Level</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Medium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Drawdown</span>
                <span className="text-red-600">-2.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stop Loss</span>
                <span className="text-gray-900">$11,800</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-center text-sm text-gray-600">Portfolio Health: 75%</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Start Trading
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
