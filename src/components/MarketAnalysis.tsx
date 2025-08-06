"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  lastUpdate: Date;
  trend: 'up' | 'down' | 'neutral';
}

interface AIInsight {
  id: string;
  type: 'signal' | 'alert' | 'opportunity' | 'warning';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  timestamp: Date;
}

export function MarketAnalysis() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: "R_10",
      name: "Volatility 10 Index",
      price: 2456.78,
      change: 12.34,
      changePercent: 0.51,
      volume: "1.2M",
      lastUpdate: new Date(),
      trend: 'up'
    },
    {
      symbol: "R_25",
      name: "Volatility 25 Index",
      price: 3789.45,
      change: -23.67,
      changePercent: -0.62,
      volume: "890K",
      lastUpdate: new Date(),
      trend: 'down'
    },
    {
      symbol: "R_50",
      name: "Volatility 50 Index",
      price: 4567.89,
      change: 45.12,
      changePercent: 1.00,
      volume: "1.5M",
      lastUpdate: new Date(),
      trend: 'up'
    },
    {
      symbol: "R_75",
      name: "Volatility 75 Index",
      price: 6234.56,
      change: -8.90,
      changePercent: -0.14,
      volume: "756K",
      lastUpdate: new Date(),
      trend: 'down'
    }
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'signal',
      title: 'Strong Buy Signal - R_10',
      description: 'AI analysis shows strong upward momentum with 89% confidence. Technical indicators align for potential 2-3% gain.',
      confidence: 89,
      timeframe: '1-4 hours',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Volatility Breakout Expected',
      description: 'Multiple volatility indices showing compression patterns. Breakout likely within next 30 minutes.',
      confidence: 76,
      timeframe: '30 minutes',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'warning',
      title: 'Market Volatility Spike',
      description: 'Increased volatility detected across all indices. Consider reducing position sizes temporarily.',
      confidence: 94,
      timeframe: 'Next 2 hours',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    // Simulate real-time market updates
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 20,
        change: item.change + (Math.random() - 0.5) * 5,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.2,
        lastUpdate: new Date(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number) => {
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'signal': return '🎯';
      case 'alert': return '⚠️';
      case 'opportunity': return '💡';
      case 'warning': return '🚨';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'signal': return 'text-green-400 border-green-400';
      case 'alert': return 'text-yellow-400 border-yellow-400';
      case 'opportunity': return 'text-blue-400 border-blue-400';
      case 'warning': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Overview Header */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">📊 Market Analysis</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Market Status</div>
            <Badge className="bg-green-600">Open</Badge>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Active Symbols</div>
            <div className="text-lg font-bold text-white">4</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">AI Signals</div>
            <div className="text-lg font-bold text-green-400">3 Active</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Market Sentiment</div>
            <Badge className="bg-yellow-600">Neutral</Badge>
          </div>
        </div>
      </Card>

      {/* Market Data & AI Insights Tabs */}
      <Tabs defaultValue="markets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="markets" className="text-slate-300">Live Markets</TabsTrigger>
          <TabsTrigger value="insights" className="text-slate-300">AI Insights</TabsTrigger>
          <TabsTrigger value="analysis" className="text-slate-300">Technical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.map((market, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{market.symbol}</h3>
                    <p className="text-sm text-slate-400">{market.name}</p>
                  </div>
                  <div className={`text-2xl ${market.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {market.trend === 'up' ? '📈' : '📉'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Price</span>
                    <span className="text-xl font-bold text-white">{formatPrice(market.price)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Change</span>
                    <div className="text-right">
                      <div className={`font-bold ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatChange(market.change)}
                      </div>
                      <div className={`text-sm ${market.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(market.changePercent)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Volume</span>
                    <span className="text-white">{market.volume}</span>
                  </div>

                  <div className="text-xs text-slate-500 text-right">
                    Updated: {market.lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {aiInsights.map((insight) => (
            <Alert key={insight.id} className={`border ${getInsightColor(insight.type)} bg-slate-800/50`}>
              <div className="flex items-start space-x-3">
                <div className="text-xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <Badge variant="outline" className={getInsightColor(insight.type)}>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  <AlertDescription className="text-slate-300 mb-2">
                    {insight.description}
                  </AlertDescription>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Timeframe: {insight.timeframe}</span>
                    <span>{insight.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">🔍 Pattern Recognition</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Double Top</span>
                  <Badge className="bg-red-600">Bearish</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Support Resistance</span>
                  <Badge className="bg-green-600">Bullish</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Trend Channel</span>
                  <Badge className="bg-blue-600">Neutral</Badge>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Technical Indicators</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">RSI (14)</span>
                  <span className="text-yellow-400">64.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">MACD</span>
                  <span className="text-green-400">Bullish</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Moving Average</span>
                  <span className="text-green-400">Above</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Volume Trend</span>
                  <span className="text-red-400">Declining</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
