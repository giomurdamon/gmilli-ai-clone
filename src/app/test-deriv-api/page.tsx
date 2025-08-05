"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DerivAPI } from "@/lib/derivAPI";

export default function TestDerivAPIPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const derivAPI = useRef<DerivAPI | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Initialize Deriv API for testing
  useEffect(() => {
    if (!derivAPI.current) {
      derivAPI.current = new DerivAPI({
        apiUrl: 'wss://ws.derivws.com/websockets/v3',
        appId: 1089,
        debug: true
      });

      // Set up event handlers for testing
      derivAPI.current.onConnectionChange = (connected) => {
        setIsConnected(connected);
        addLog(`Connection ${connected ? 'established' : 'lost'}`);
      };

      derivAPI.current.onAuthChange = (authorized) => {
        setIsAuthorized(authorized);
        addLog(`Authorization ${authorized ? 'successful' : 'failed'}`);
      };

      derivAPI.current.onTickUpdate = (tick) => {
        addLog(`Tick received: ${tick.symbol} = ${tick.quote.toFixed(tick.pip_size)}`);
      };

      derivAPI.current.onTradeResult = (result) => {
        addLog(`Trade executed: Contract ID ${result.buy?.contract_id}`);
      };

      derivAPI.current.onError = (error) => {
        addLog(`ERROR: ${error}`);
      };

      derivAPI.current.onBalanceUpdate = (balance) => {
        addLog(`Balance updated: ${balance.display_balance} ${balance.currency}`);
      };

      derivAPI.current.onAccountChange = (account) => {
        addLog(`Account info: ${account.loginid} (${account.is_virtual ? 'Demo' : 'Real'})`);
      };
    }

    return () => {
      if (derivAPI.current) {
        derivAPI.current.disconnect();
      }
    };
  }, []);

  // Test connection
  const testConnection = async () => {
    if (!apiToken.trim()) {
      addLog("ERROR: API token is required");
      return;
    }

    addLog("Testing connection...");
    setIsTestingInProgress(true);

    try {
      if (derivAPI.current) {
        const connected = await derivAPI.current.connect(apiToken);
        setTestResults(prev => ({ ...prev, connection: connected }));
        addLog(`Connection test: ${connected ? 'PASSED' : 'FAILED'}`);
      }
    } catch (error) {
      addLog(`Connection test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, connection: false }));
    } finally {
      setIsTestingInProgress(false);
    }
  };

  // Test tick subscription
  const testTickSubscription = async () => {
    if (!isConnected || !derivAPI.current) {
      addLog("ERROR: Not connected to API");
      return;
    }

    addLog("Testing tick subscription for R_10...");
    try {
      await derivAPI.current.subscribeTicks("R_10");
      addLog("Tick subscription test: PASSED");
      setTestResults(prev => ({ ...prev, tickSubscription: true }));
    } catch (error) {
      addLog(`Tick subscription test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, tickSubscription: false }));
    }
  };

  // Test multiple subscriptions
  const testMultipleSubscriptions = async () => {
    if (!isConnected || !derivAPI.current) {
      addLog("ERROR: Not connected to API");
      return;
    }

    addLog("Testing multiple symbol subscriptions...");
    const symbols = ["R_10", "R_25", "R_50"];

    try {
      for (const symbol of symbols) {
        await derivAPI.current.subscribeTicks(symbol);
        addLog(`Subscribed to ${symbol}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between subscriptions
      }
      setTestResults(prev => ({ ...prev, multipleSubscriptions: true }));
      addLog("Multiple subscriptions test: PASSED");
    } catch (error) {
      addLog(`Multiple subscriptions test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, multipleSubscriptions: false }));
    }
  };

  // Test unsubscription
  const testUnsubscription = async () => {
    if (!isConnected || !derivAPI.current) {
      addLog("ERROR: Not connected to API");
      return;
    }

    addLog("Testing unsubscription...");
    try {
      await derivAPI.current.unsubscribeTicks("R_25");
      addLog("Unsubscription test: PASSED");
      setTestResults(prev => ({ ...prev, unsubscription: true }));
    } catch (error) {
      addLog(`Unsubscription test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, unsubscription: false }));
    }
  };

  // Test demo trade
  const testDemoTrade = async () => {
    if (!isConnected || !isAuthorized || !derivAPI.current) {
      addLog("ERROR: Not connected or not authorized");
      return;
    }

    addLog("Testing demo trade execution...");
    try {
      const tradeParams = {
        contract_type: "DIGITEVEN",
        currency: "USD",
        amount: 0.35,
        symbol: "R_10",
        duration: 5,
        duration_unit: "t",
        basis: "stake"
      };

      const result = await derivAPI.current.buyContract(tradeParams);
      addLog(`Demo trade test: PASSED - Contract ID: ${result.buy?.contract_id}`);
      setTestResults(prev => ({ ...prev, demoTrade: true }));
    } catch (error) {
      addLog(`Demo trade test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, demoTrade: false }));
    }
  };

  // Test reconnection
  const testReconnection = async () => {
    if (!derivAPI.current) {
      addLog("ERROR: API not initialized");
      return;
    }

    addLog("Testing reconnection...");
    try {
      await derivAPI.current.forceReconnect();
      addLog("Reconnection test: PASSED");
      setTestResults(prev => ({ ...prev, reconnection: true }));
    } catch (error) {
      addLog(`Reconnection test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, reconnection: false }));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    if (!apiToken.trim()) {
      addLog("ERROR: API token is required for testing");
      return;
    }

    setIsTestingInProgress(true);
    addLog("🚀 Starting comprehensive API testing...");

    // Clear previous results
    setTestResults({});

    // Run tests in sequence
    await testConnection();
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isConnected) {
      await testTickSubscription();
      await new Promise(resolve => setTimeout(resolve, 3000));

      await testMultipleSubscriptions();
      await new Promise(resolve => setTimeout(resolve, 3000));

      await testUnsubscription();
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (isAuthorized) {
        await testDemoTrade();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await testReconnection();
    }

    setIsTestingInProgress(false);
    addLog("🎉 All tests completed!");
  };

  // Get connection status
  const getConnectionStatus = () => {
    if (derivAPI.current) {
      return derivAPI.current.getConnectionStatus();
    }
    return null;
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">🧪 Deriv API Testing Dashboard</h1>
          <p className="text-gray-400 text-center">Comprehensive testing suite for real-time Deriv API features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="space-y-6">
            {/* API Token Input */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deriv API Token (Demo Account Recommended)
                  </label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A4A4A] border border-teal-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter your demo API token"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p>Get your token from: <a href="https://app.deriv.com/account/api-token" target="_blank" className="text-teal-400 hover:underline">Deriv Dashboard</a></p>
                </div>
              </div>
            </Card>

            {/* Connection Status */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">Connection Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Connected:</span>
                  <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Authorized:</span>
                  <span className={`font-bold ${isAuthorized ? 'text-green-400' : 'text-red-400'}`}>
                    {isAuthorized ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                {connectionStatus && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Active Subscriptions:</span>
                      <span className="font-bold text-blue-400">{connectionStatus.activeSubscriptions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Active Contracts:</span>
                      <span className="font-bold text-blue-400">{connectionStatus.activeContracts}</span>
                    </div>
                    {connectionStatus.account && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Account Type:</span>
                        <span className={`font-bold ${connectionStatus.account.is_virtual ? 'text-green-400' : 'text-orange-400'}`}>
                          {connectionStatus.account.is_virtual ? '🎮 Demo' : '💰 Real'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Test Controls */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">Test Controls</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={testConnection}
                  disabled={isTestingInProgress}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Test Connection
                </Button>
                <Button
                  onClick={testTickSubscription}
                  disabled={!isConnected || isTestingInProgress}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Test Ticks
                </Button>
                <Button
                  onClick={testMultipleSubscriptions}
                  disabled={!isConnected || isTestingInProgress}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Test Multiple
                </Button>
                <Button
                  onClick={testUnsubscription}
                  disabled={!isConnected || isTestingInProgress}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Test Unsub
                </Button>
                <Button
                  onClick={testDemoTrade}
                  disabled={!isAuthorized || isTestingInProgress}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Test Trade
                </Button>
                <Button
                  onClick={testReconnection}
                  disabled={isTestingInProgress}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Test Reconnect
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  onClick={runAllTests}
                  disabled={isTestingInProgress}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3"
                >
                  {isTestingInProgress ? 'Running Tests...' : '🚀 Run All Tests'}
                </Button>
              </div>
            </Card>

            {/* Test Results */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">Test Results</h2>
              <div className="space-y-2">
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{test.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className={`font-bold ${result ? 'text-green-400' : 'text-red-400'}`}>
                      {result ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                ))}
                {Object.keys(testResults).length === 0 && (
                  <div className="text-gray-500 text-center py-4">No tests run yet</div>
                )}
              </div>
            </Card>
          </div>

          {/* Live Logs */}
          <div className="space-y-6">
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-teal-400">Live Logs</h2>
                <Button
                  onClick={clearLogs}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                >
                  Clear
                </Button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No logs yet. Run some tests!</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.includes('ERROR') ? 'text-red-400' :
                      log.includes('PASSED') ? 'text-green-400' :
                      log.includes('FAILED') ? 'text-red-400' :
                      log.includes('Tick received') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">Quick Links</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => window.open('https://app.deriv.com/account/api-token', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Deriv API Token
                </Button>
                <Button
                  onClick={() => window.location.href = '/debug-access'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Debug Access Issues
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Back to Main Site
                </Button>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="bg-[#1E293B] border border-teal-500/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-teal-400">Testing Instructions</h2>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>1.</strong> Get a demo API token from Deriv</p>
                <p><strong>2.</strong> Enter the token above</p>
                <p><strong>3.</strong> Click "Run All Tests" for comprehensive testing</p>
                <p><strong>4.</strong> Watch the live logs for detailed feedback</p>
                <p><strong>5.</strong> Check test results for pass/fail status</p>
                <p className="text-yellow-400 mt-3">
                  <strong>Note:</strong> Use demo accounts only for testing!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
