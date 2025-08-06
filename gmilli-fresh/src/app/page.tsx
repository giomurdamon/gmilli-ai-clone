'use client';

import { useState } from 'react';
import { AnalyzerPopup } from '@/components/AnalyzerPopup';

export default function HomePage() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            Gmilli AI
          </div>
          <nav className="flex gap-4">
            <button className="px-4 py-2 text-gray-600 hover:text-blue-600">
              Home
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Login
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Gmilli AI Trading Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced AI-powered trading analysis and automation platform
          </p>

          <button
            onClick={() => setShowAnalyzer(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Advanced machine learning algorithms analyze market patterns and provide intelligent trading insights.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
            <p className="text-gray-600">
              Access live market data and real-time analytics to make informed trading decisions.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Automated Trading</h3>
            <p className="text-gray-600">
              Set up automated trading strategies with customizable risk management and profit targets.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of traders using AI-powered insights to maximize their profits.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Create Account
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">
              Sign In
            </button>
          </div>
        </div>
      </main>

      {/* Analyzer Popup */}
      {showAnalyzer && (
        <AnalyzerPopup onClose={() => setShowAnalyzer(false)} />
      )}
    </div>
  );
}
