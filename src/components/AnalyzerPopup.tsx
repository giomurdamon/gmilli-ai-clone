"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnalyzerPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TickData {
  ask: number;
  bid: number;
  epoch: number;
  id: string;
  pip_size: number;
  quote: number;
  symbol: string;
}

interface AccountBalance {
  balance: number;
  currency: string;
  display_balance: string;
  loginid: string;
}

interface UserAccount {
  loginid: string;
  currency: string;
  is_demo: number;
  is_virtual: number;
  landing_company_name: string;
}

interface TradeParams {
  contract_type: string;
  currency: string;
  amount: number;
  symbol: string;
  duration: number;
  duration_unit: string;
  basis: string;
}

interface DigitAIAnalysis {
  lastDigits: number[];
  evenCount: number;
  oddCount: number;
  evenPercentage: number;
  oddPercentage: number;
  prediction: 'EVEN' | 'ODD';
  confidence: number;
  pattern: string;
}

export function AnalyzerPopup({ isOpen, onClose }: AnalyzerPopupProps) {
  // Connection and API state
  const [apiToken, setApiToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isConnecting, setIsConnecting] = useState(false);

  // Trading state
  const [tradeType, setTradeType] = useState("DIGITEVEN");
  const [volatilityIndex, setVolatilityIndex] = useState("R_10");
  const [stakeAmount, setStakeAmount] = useState("1");
  const [duration, setDuration] = useState(5);

  // Account and balance
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);

  // Market data and analysis
  const [currentTick, setCurrentTick] = useState<TickData | null>(null);
  const [tickHistory, setTickHistory] = useState<TickData[]>([]);
  const [digitAIAnalysis, setDigitAIAnalysis] = useState<DigitAIAnalysis | null>(null);

  // DigitAI strategy state
  const [digitAIEnabled, setDigitAIEnabled] = useState(false);
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [tradesExecuted, setTradesExecuted] = useState(0);
  const [successfulTrades, setSuccessfulTrades] = useState(0);

  // Access control and loading
  const [accessStatus, setAccessStatus] = useState<{ canAccess: boolean; reason?: string } | null>(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Refs for API and intervals
  const derivAPIRef = useRef<any>(null);
  const digitAIIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoTradeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Utility functions
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const addError = useCallback((error: string) => {
    setErrors(prev => [error, ...prev.slice(0, 9)]);
    addLog(`ERROR: ${error}`);
  }, [addLog]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Initialize DerivAPI dynamically
  const initializeDerivAPI = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return null;

      const { DerivAPI } = await import('@/lib/derivAPI');

      const api = new DerivAPI({
        apiUrl: 'wss://ws.derivws.com/websockets/v3',
        appId: 1089,
        debug: true
      });

      // Set up event callbacks
      api.onConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'Connected' : 'Disconnected');
        addLog(`Connection ${connected ? 'established' : 'lost'}`);
      };

      api.onAuthChange = (authorized: boolean) => {
        setIsAuthorized(authorized);
        addLog(`Authorization ${authorized ? 'successful' : 'failed'}`);
      };

      api.onTickUpdate = (tick: TickData) => {
        setCurrentTick(tick);
        setTickHistory(prev => [tick, ...prev.slice(0, 99)]);
        addLog(`Tick: ${tick.quote} (${tick.symbol})`);
      };

      api.onBalanceUpdate = (newBalance: AccountBalance) => {
        setBalance(newBalance);
        addLog(`Balance updated: ${newBalance.display_balance} ${newBalance.currency}`);
      };

      api.onAccountChange = (accountInfo: UserAccount) => {
        setAccount(accountInfo);
        addLog(`Account: ${accountInfo.loginid} (${accountInfo.is_virtual ? 'Demo' : 'Real'})`);
      };

      api.onError = (error: string) => {
        addError(error);
      };

      api.onTradeResult = (result: any) => {
        if (result.buy) {
          setTradesExecuted(prev => prev + 1);
          addLog(`Trade executed: ${result.buy.longcode}`);
        }
      };

      return api;
    } catch (error) {
      addError(`Failed to initialize DerivAPI: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [addLog, addError]);

  // Check access permissions with real approval status
  useEffect(() => {
    const checkAccess = async () => {
      if (!isOpen) return;

      setIsLoadingAccess(true);
      addLog("🔍 Checking user access permissions...");

      try {
        // First check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
          setAccessStatus({
            canAccess: false,
            reason: 'Please sign up and login to access trading features.'
          });
          addLog("❌ No user session found");
          setIsLoadingAccess(false);
          return;
        }

        // Load clientAuth service to check approval status
        try {
          addLog("🔄 Loading authentication service...");
          const authModule = await import('@/lib/clientAuth');

          if (authModule?.clientAuthService) {
            addLog("✅ Auth service loaded, checking approval status...");

            // Use the canUserAccessAnalyzer method which checks approval_status
            const accessCheck = await authModule.clientAuthService.canUserAccessAnalyzer(true);

            if (accessCheck.canAccess) {
              setAccessStatus({ canAccess: true });
              addLog("✅ Access granted - User is approved for trading");
            } else {
              setAccessStatus({
                canAccess: false,
                reason: accessCheck.reason || 'Access denied - Admin approval required'
              });
              addLog(`❌ Access denied: ${accessCheck.reason}`);
            }
          } else {
            addLog("⚠️ Auth service not available, allowing access");
            setAccessStatus({ canAccess: true });
          }
        } catch (authError) {
          addError(`Auth service error: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
          addLog("⚠️ Auth check failed, allowing access as fallback");
          setAccessStatus({ canAccess: true });
        }
      } catch (error) {
        setAccessStatus({
          canAccess: false,
          reason: 'Unable to verify access permissions. Please try again.'
        });
        addError('Access verification failed');
        addLog("💥 Access check failed completely");
      }

      setIsLoadingAccess(false);
    };

    checkAccess();
  }, [isOpen, addLog, addError]);

  // Connect to Deriv API
  const connectToDerivAPI = useCallback(async () => {
    if (!apiToken.trim()) {
      addError("Please enter your API token");
      return;
    }

    setIsConnecting(true);
    clearErrors();

    try {
      if (!derivAPIRef.current) {
        const api = await initializeDerivAPI();
        if (!api) {
          throw new Error("Failed to initialize API");
        }
        derivAPIRef.current = api;
      }

      const success = await derivAPIRef.current.connect(apiToken);

      if (success) {
        addLog("Connected to Deriv API successfully");

        // Subscribe to market data
        setTimeout(() => {
          if (derivAPIRef.current && derivAPIRef.current.isConnectedToAPI()) {
            derivAPIRef.current.subscribeTicks(volatilityIndex);
            addLog(`Subscribed to ${volatilityIndex} market data`);
          }
        }, 2000);
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      addError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, [apiToken, volatilityIndex, initializeDerivAPI, addLog, addError, clearErrors]);

  // Disconnect from API
  const disconnectFromAPI = useCallback(() => {
    if (derivAPIRef.current) {
      derivAPIRef.current.disconnect();
      setIsConnected(false);
      setIsAuthorized(false);
      setCurrentTick(null);
      setBalance(null);
      setAccount(null);
      addLog("Disconnected from Deriv API");
    }
  }, [addLog]);

  // DigitAI Analysis Engine
  const analyzeDigitAI = useCallback(() => {
    if (tickHistory.length < 10) return;

    const lastDigits = tickHistory.slice(0, 50).map(tick => {
      const quote = tick.quote;
      return Math.floor(quote * Math.pow(10, tick.pip_size)) % 10;
    });

    const evenCount = lastDigits.filter(digit => digit % 2 === 0).length;
    const oddCount = lastDigits.length - evenCount;
    const evenPercentage = (evenCount / lastDigits.length) * 100;
    const oddPercentage = (oddCount / lastDigits.length) * 100;

    // Simple pattern detection
    let pattern = "Random";
    if (evenPercentage > 60) pattern = "Even Trend";
    else if (oddPercentage > 60) pattern = "Odd Trend";
    else if (Math.abs(evenPercentage - oddPercentage) < 10) pattern = "Balanced";

    // Prediction logic based on recent trends
    const recentDigits = lastDigits.slice(0, 10);
    const recentEvens = recentDigits.filter(d => d % 2 === 0).length;
    const recentOdds = recentDigits.length - recentEvens;

    let prediction: 'EVEN' | 'ODD' = 'EVEN';
    let confidence = 50;

    if (recentEvens > recentOdds + 2) {
      prediction = 'ODD';
      confidence = 60 + Math.min((recentEvens - recentOdds) * 5, 25);
    } else if (recentOdds > recentEvens + 2) {
      prediction = 'EVEN';
      confidence = 60 + Math.min((recentOdds - recentEvens) * 5, 25);
    }

    const analysis: DigitAIAnalysis = {
      lastDigits,
      evenCount,
      oddCount,
      evenPercentage,
      oddPercentage,
      prediction,
      confidence,
      pattern
    };

    setDigitAIAnalysis(analysis);
    addLog(`DigitAI: ${prediction} (${confidence}% confidence) - ${pattern}`);
  }, [tickHistory, addLog]);

  // Auto-trade execution
  const executeAutoTrade = useCallback(async () => {
    if (!derivAPIRef.current || !isAuthorized || !digitAIAnalysis || !autoTradeEnabled) {
      return;
    }

    try {
      const tradeParams: TradeParams = {
        contract_type: digitAIAnalysis.prediction === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD',
        currency: account?.currency || 'USD',
        amount: parseFloat(stakeAmount),
        symbol: volatilityIndex,
        duration: duration,
        duration_unit: 't',
        basis: 'stake'
      };

      addLog(`Executing auto-trade: ${tradeParams.contract_type} ${stakeAmount} ${tradeParams.currency}`);

      const result = await derivAPIRef.current.buyContract(tradeParams);

      if (result.buy) {
        addLog(`Auto-trade successful: Contract ${result.buy.contract_id}`);
      }
    } catch (error) {
      addError(`Auto-trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [derivAPIRef, isAuthorized, digitAIAnalysis, autoTradeEnabled, account, stakeAmount, volatilityIndex, duration, addLog, addError]);

  // Manual trade execution
  const executeTrade = useCallback(async () => {
    if (!derivAPIRef.current || !isAuthorized) {
      addError("Not connected or authorized");
      return;
    }

    try {
      const tradeParams: TradeParams = {
        contract_type: tradeType,
        currency: account?.currency || 'USD',
        amount: parseFloat(stakeAmount),
        symbol: volatilityIndex,
        duration: duration,
        duration_unit: 't',
        basis: 'stake'
      };

      addLog(`Executing trade: ${tradeParams.contract_type} ${stakeAmount} ${tradeParams.currency}`);

      const result = await derivAPIRef.current.buyContract(tradeParams);

      if (result.buy) {
        addLog(`Trade successful: Contract ${result.buy.contract_id}`);
        setTradesExecuted(prev => prev + 1);
      }
    } catch (error) {
      addError(`Trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [derivAPIRef, isAuthorized, tradeType, account, stakeAmount, volatilityIndex, duration, addLog, addError]);

  // Effects for DigitAI and auto-trading
  useEffect(() => {
    if (digitAIEnabled && tickHistory.length > 0) {
      if (digitAIIntervalRef.current) clearInterval(digitAIIntervalRef.current);

      digitAIIntervalRef.current = setInterval(() => {
        analyzeDigitAI();
      }, 2000);
    } else if (digitAIIntervalRef.current) {
      clearInterval(digitAIIntervalRef.current);
      digitAIIntervalRef.current = null;
    }

    return () => {
      if (digitAIIntervalRef.current) {
        clearInterval(digitAIIntervalRef.current);
      }
    };
  }, [digitAIEnabled, tickHistory.length, analyzeDigitAI]);

  useEffect(() => {
    if (autoTradeEnabled && digitAIAnalysis && digitAIAnalysis.confidence > 65) {
      if (autoTradeIntervalRef.current) clearInterval(autoTradeIntervalRef.current);

      autoTradeIntervalRef.current = setInterval(() => {
        executeAutoTrade();
      }, 30000); // Execute every 30 seconds
    } else if (autoTradeIntervalRef.current) {
      clearInterval(autoTradeIntervalRef.current);
      autoTradeIntervalRef.current = null;
    }

    return () => {
      if (autoTradeIntervalRef.current) {
        clearInterval(autoTradeIntervalRef.current);
      }
    };
  }, [autoTradeEnabled, digitAIAnalysis, executeAutoTrade]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      disconnectFromAPI();
      if (digitAIIntervalRef.current) clearInterval(digitAIIntervalRef.current);
      if (autoTradeIntervalRef.current) clearInterval(autoTradeIntervalRef.current);
    }
  }, [isOpen, disconnectFromAPI]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-[#0F2027] border border-teal-500/30 rounded-2xl p-6 w-full max-w-7xl max-h-[95vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">🚀 Advanced Trading Interface</h2>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {connectionStatus}
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-red-500/20"
          >
            ✕
          </Button>
        </div>

        {/* Access Status Check */}
        {isLoadingAccess ? (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-blue-300">Checking access permissions...</span>
            </div>
          </div>
        ) : accessStatus && !accessStatus.canAccess ? (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-400 text-xl">⚠️</div>
              <div>
                <h3 className="text-yellow-300 font-semibold mb-1">Account Approval Required</h3>
                <p className="text-yellow-200 text-sm">{accessStatus.reason}</p>
                <p className="text-yellow-200 text-sm mt-2">
                  You can still browse the interface, but trading features are disabled until approval.
                </p>
              </div>
            </div>
          </div>
        ) : accessStatus?.canAccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-green-400 text-xl">✅</div>
              <span className="text-green-300">Account approved - Full trading access enabled</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-red-400 text-xl">🚨</div>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-200 text-sm">{error}</p>
                  ))}
                </div>
              </div>
              <Button onClick={clearErrors} variant="ghost" className="text-red-400 hover:text-red-300">
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Connection & Account */}
          <div className="space-y-6">
            {/* API Connection Panel */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-teal-500/20">
              <h3 className="text-lg font-semibold text-teal-400 mb-4">🔗 Deriv API Connection</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Token
                  </label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter your API token"
                    disabled={isConnected}
                  />
                </div>

                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                  onClick={isConnected ? disconnectFromAPI : connectToDerivAPI}
                  disabled={isConnecting || (accessStatus ? !accessStatus.canAccess : false)}
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : isConnected ? 'Disconnect' : 'Connect to Deriv'}
                </Button>

                <div className="text-sm text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                      {connectionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorization:</span>
                    <span className={isAuthorized ? 'text-green-400' : 'text-red-400'}>
                      {isAuthorized ? 'Authorized' : 'Not Authorized'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            {account && (
              <div className="bg-[#1A3A3A] rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">👤 Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account ID:</span>
                    <span className="text-white">{account.loginid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency:</span>
                    <span className="text-white">{account.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={account.is_virtual ? 'text-yellow-400' : 'text-green-400'}>
                      {account.is_virtual ? 'Demo' : 'Real'}
                    </span>
                  </div>
                  {balance && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white font-bold">{balance.display_balance} {balance.currency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trading Statistics */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">📊 Trading Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{tradesExecuted}</div>
                  <div className="text-gray-400 text-xs">Total Trades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{successfulTrades}</div>
                  <div className="text-gray-400 text-xs">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {tradesExecuted > 0 ? Math.round((successfulTrades / tradesExecuted) * 100) : 0}%
                  </div>
                  <div className="text-gray-400 text-xs">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {digitAIAnalysis?.confidence || 0}%
                  </div>
                  <div className="text-gray-400 text-xs">AI Confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Market Data & DigitAI */}
          <div className="space-y-6">
            {/* Live Market Analysis */}
            {isConnected && currentTick && (
              <div className="bg-[#1A3A3A] rounded-lg p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-4">📈 Live Market Data</h3>
                <div className="text-center mb-4">
                  <div className="text-xs text-gray-400 mb-1">{volatilityIndex} - Real-Time</div>
                  <div className="text-3xl font-bold text-white">{currentTick.quote.toFixed(5)}</div>
                  <div className="text-sm text-gray-400">
                    Last Digit: <span className="text-yellow-400 font-bold text-lg">
                      {Math.floor(currentTick.quote * Math.pow(10, currentTick.pip_size)) % 10}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#2A4A4A] rounded p-2">
                    <div className="text-gray-400 mb-1">Ask</div>
                    <div className="text-green-400 font-bold">{currentTick.ask.toFixed(5)}</div>
                  </div>
                  <div className="bg-[#2A4A4A] rounded p-2">
                    <div className="text-gray-400 mb-1">Bid</div>
                    <div className="text-red-400 font-bold">{currentTick.bid.toFixed(5)}</div>
                  </div>
                  <div className="bg-[#2A4A4A] rounded p-2">
                    <div className="text-gray-400 mb-1">Ticks</div>
                    <div className="text-white font-bold">{tickHistory.length}</div>
                  </div>
                </div>
              </div>
            )}

            {/* DigitAI Analysis */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-400">🤖 DigitAI Analysis</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Auto Analysis:</span>
                  <button
                    onClick={() => setDigitAIEnabled(!digitAIEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      digitAIEnabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                    disabled={!isConnected}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      digitAIEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {digitAIAnalysis ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Next Prediction</div>
                    <div className={`text-2xl font-bold ${
                      digitAIAnalysis.prediction === 'EVEN' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {digitAIAnalysis.prediction}
                    </div>
                    <div className="text-sm text-gray-400">
                      Confidence: {digitAIAnalysis.confidence}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div className="bg-[#2A4A4A] rounded p-3">
                      <div className="text-blue-400 font-bold text-lg">{digitAIAnalysis.evenCount}</div>
                      <div className="text-gray-400">Even ({digitAIAnalysis.evenPercentage.toFixed(1)}%)</div>
                    </div>
                    <div className="bg-[#2A4A4A] rounded p-3">
                      <div className="text-orange-400 font-bold text-lg">{digitAIAnalysis.oddCount}</div>
                      <div className="text-gray-400">Odd ({digitAIAnalysis.oddPercentage.toFixed(1)}%)</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-400">Pattern:</div>
                    <div className="text-white font-medium">{digitAIAnalysis.pattern}</div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Last 10 Digits: {digitAIAnalysis.lastDigits.slice(0, 10).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🤖</div>
                  <div>Enable DigitAI analysis</div>
                  <div className="text-sm mt-1">Connect to market data first</div>
                </div>
              )}
            </div>

            {/* Auto Trading */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-red-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-400">🎯 Auto Trading</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Auto Trade:</span>
                  <button
                    onClick={() => setAutoTradeEnabled(!autoTradeEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoTradeEnabled ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                    disabled={!isAuthorized || !digitAIAnalysis || digitAIAnalysis.confidence < 65}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      autoTradeEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-400 space-y-2">
                <div>• Auto-trades execute when AI confidence &gt; 65%</div>
                <div>• Trades execute every 30 seconds</div>
                <div>• Uses current stake amount and duration</div>
                <div>• Based on DigitAI predictions</div>
              </div>
            </div>
          </div>

          {/* Right Column - Trading Controls */}
          <div className="space-y-6">
            {/* Trading Controls */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-teal-500/20">
              <h3 className="text-lg font-semibold text-teal-400 mb-6">⚙️ Trading Controls</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Type
                  </label>
                  <select
                    value={tradeType}
                    onChange={(e) => setTradeType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="CALL">CALL (Rise)</option>
                    <option value="PUT">PUT (Fall)</option>
                    <option value="DIGITEVEN">DIGIT EVEN</option>
                    <option value="DIGITODD">DIGIT ODD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volatility Index
                  </label>
                  <select
                    value={volatilityIndex}
                    onChange={(e) => setVolatilityIndex(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="R_10">Volatility 10 Index (R_10)</option>
                    <option value="R_25">Volatility 25 Index (R_25)</option>
                    <option value="R_50">Volatility 50 Index (R_50)</option>
                    <option value="R_75">Volatility 75 Index (R_75)</option>
                    <option value="R_100">Volatility 100 Index (R_100)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stake Amount ({account?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter stake amount"
                    min="1.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (Ticks)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={1}>1 Tick</option>
                    <option value={2}>2 Ticks</option>
                    <option value={3}>3 Ticks</option>
                    <option value={4}>4 Ticks</option>
                    <option value={5}>5 Ticks</option>
                    <option value={10}>10 Ticks</option>
                  </select>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg"
                  onClick={executeTrade}
                  disabled={!isAuthorized || !currentTick}
                >
                  🚀 Execute Trade
                </Button>

                {digitAIAnalysis && (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold"
                    onClick={() => {
                      setTradeType(digitAIAnalysis.prediction === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD');
                      setTimeout(executeTrade, 100);
                    }}
                    disabled={!isAuthorized || !currentTick}
                  >
                    🤖 Execute DigitAI Trade ({digitAIAnalysis.prediction})
                  </Button>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-[#1A3A3A] rounded-lg p-6 border border-gray-500/20">
              <h3 className="text-lg font-semibold text-gray-400 mb-4">📋 Activity Log</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs text-gray-400 font-mono">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-2xl mb-2">📋</div>
                    <div>No activity yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-blue-300 text-sm">
            <strong>🚀 Full Trading Interface Active!</strong> Real-time Deriv API integration with DigitAI analysis engine.
            All features are live and functional. Trade responsibly and manage your risk.
          </div>
        </div>
      </Card>
    </div>
  );
}
