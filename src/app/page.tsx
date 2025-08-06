'use client';

import { useState } from 'react';
import { AnalyzerPopup } from '@/components/AnalyzerPopup';
import Link from 'next/link';

export default function HomePage() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  // FORCE NETLIFY CACHE BUST - Updated 2025-08-06

  return (
    <div
      className="relative min-h-screen bg-[#0F172A]"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative'
      }}
    >
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -10
        }}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.1)_0%,_transparent_50%)]"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(56,189,248,0.1) 0%, transparent 50%)'
          }}
        ></div>
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
                <h1
                  className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3rem)',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                    background: 'linear-gradient(to right, #38BDF8, #3B82F6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textAlign: 'center'
                  }}
                >
                  Gmilli AI Trading Assistant
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Advanced AI-powered trading analysis and automation platform
                </p>
                <button
                  onClick={() => setShowAnalyzer(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: '#0284C7',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  Get Started
                </button>
              </section>

              {/* Features Section */}
              <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div
                    className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-12 h-12 bg-sky-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'rgba(2, 132, 199, 0.2)',
                          borderRadius: '12px',
                          margin: '0 auto 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                      <p className="text-gray-300">
                        Advanced machine learning algorithms analyze market patterns and provide intelligent trading insights.
                      </p>
                    </div>
                  </div>

                  <div
                    className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-12 h-12 bg-green-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          borderRadius: '12px',
                          margin: '0 auto 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="text-2xl">📈</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
                      <p className="text-gray-300">
                        Access live market data and real-time analytics to make informed trading decisions.
                      </p>
                    </div>
                  </div>

                  <div
                    className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-12 h-12 bg-purple-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'rgba(147, 51, 234, 0.2)',
                          borderRadius: '12px',
                          margin: '0 auto 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
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
                <div
                  className="backdrop-blur-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-2xl mx-auto"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    borderRadius: '16px',
                    padding: '32px',
                    maxWidth: '672px',
                    margin: '0 auto'
                  }}
                >
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
                  <p className="text-gray-300 mb-6">
                    Join thousands of traders using AI-powered insights to maximize their profits.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          padding: '12px 32px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      >
                        Create Account
                      </button>
                    </Link>
                    <Link href="/login">
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: '#4B5563',
                          color: 'white',
                          padding: '12px 32px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      >
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
