'use client';

import { useState } from 'react';
import { AnalyzerPopup } from '@/components/AnalyzerPopup';
import Link from 'next/link';

export default function HomePage() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  // FORCE NETLIFY CACHE BUST - Updated 2025-08-06

  return (
    <div className="relative min-h-screen bg-[#0F172A]">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="backdrop-blur-xl bg-slate-900/50 border-blue-900/20 border-b transition-colors duration-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link className="flex items-center space-x-2" href="/">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">
                  G
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
                  Gmilli AI
                </span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link className="hover:text-sky-400 transition-colors text-gray-300" href="/">
                  Home
                </Link>
                <div className="flex items-center space-x-4">
                  <Link href="/login">
                    <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
              {/* Hero Section */}
              <section className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
                  Gmilli AI Trading Assistant
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Advanced AI-powered trading analysis and automation platform
                </p>
                <button
                  onClick={() => setShowAnalyzer(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </button>
              </section>

              {/* Features Section */}
              <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-sky-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                      <p className="text-gray-300">
                        Advanced machine learning algorithms analyze market patterns and provide intelligent trading insights.
                      </p>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
                      <p className="text-gray-300">
                        Access live market data and real-time analytics to make informed trading decisions.
                      </p>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Automated Trading</h3>
                      <p className="text-gray-300">
                        Set up automated trading strategies with customizable risk management and profit targets.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="text-center">
                <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
                  <p className="text-gray-300 mb-6">
                    Join thousands of traders using AI-powered insights to maximize their profits.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
                        Create Account
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
                        Sign In
                      </button>
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Analyzer Popup */}
      {showAnalyzer && (
        <AnalyzerPopup onClose={() => setShowAnalyzer(false)} />
      )}
    </div>
  );
}
