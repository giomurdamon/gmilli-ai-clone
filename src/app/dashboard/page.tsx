'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black"
      style={{
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      {/* Header */}
      <header className="bg-[#0a1525] border-b border-cyan-400/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-cyan-400">
            Gmilli AI Dashboard
          </div>
          <nav className="flex gap-4">
            <button className="px-4 py-2 text-gray-300 hover:text-cyan-400">
              Profile
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-[#0a1525] border border-cyan-400/30 rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Your Dashboard</h1>
          <p className="text-gray-300">Monitor your trading performance and manage your AI-powered strategies.</p>
        </div>

        {/* Tabs */}
        <div className="bg-[#0a1525] border border-cyan-400/30 rounded-lg shadow">
          <div className="border-b border-cyan-400/30">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-cyan-400 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('markets')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'markets'
                    ? 'border-b-2 border-cyan-400 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Markets
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-cyan-400 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Portfolio Overview</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-[#1a3a3a] border border-cyan-400/20 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Total Balance</h3>
                    <p className="text-2xl font-bold text-white">$12,547.82</p>
                  </div>
                  <div className="bg-[#1a3a3a] border border-cyan-400/20 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Today's P&L</h3>
                    <p className="text-2xl font-bold text-green-400">+$247.15</p>
                  </div>
                  <div className="bg-[#1a3a3a] border border-cyan-400/20 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Open Positions</h3>
                    <p className="text-2xl font-bold text-cyan-400">5</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'markets' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Market Data</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-[#1a3a3a] border border-cyan-400/20 rounded-lg">
                    <span className="font-medium text-white">EUR/USD</span>
                    <span className="text-green-400 font-mono">1.0845 ↗</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#1a3a3a] border border-cyan-400/20 rounded-lg">
                    <span className="font-medium text-white">GBP/USD</span>
                    <span className="text-red-400 font-mono">1.2734 ↘</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#1a3a3a] border border-cyan-400/20 rounded-lg">
                    <span className="font-medium text-white">USD/JPY</span>
                    <span className="text-green-400 font-mono">149.82 ↗</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">AI Analytics</h2>
                <div className="space-y-4">
                  <div className="bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                    <div className="font-semibold text-green-400">BUY Signal</div>
                    <div className="text-sm text-green-300">EUR/USD - Strong upward trend detected</div>
                  </div>
                  <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                    <div className="font-semibold text-red-400">SELL Signal</div>
                    <div className="text-sm text-red-300">GBP/USD - Resistance level reached</div>
                  </div>
                  <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="font-semibold text-yellow-400">HOLD Signal</div>
                    <div className="text-sm text-yellow-300">USD/JPY - Consolidation pattern</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
