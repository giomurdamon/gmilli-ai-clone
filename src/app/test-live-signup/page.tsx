"use client";

import { useState } from "react";
import { signUp } from "../../lib/clientAuth";

export default function LiveSignupTestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Generate random test user
  const generateTestUser = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now().toString().slice(-4);
    setEmail(`test.user.${randomId}.${timestamp}@testdomain.com`);
    setPassword("TestPassword123!");
    setFullName(`Test User ${randomId.toUpperCase()}`);
  };

  const handleTestSignup = async () => {
    if (!email || !password || !fullName) {
      alert("Please fill all fields or generate a test user");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      console.log("🧪 LIVE TEST: Starting signup for:", email);
      console.log("🧪 LIVE TEST: Full name:", fullName);

      const startTime = new Date().toISOString();
      const response = await signUp(email, password, fullName);
      const endTime = new Date().toISOString();

      const testResult = {
        success: true,
        startTime,
        endTime,
        duration: `${new Date(endTime).getTime() - new Date(startTime).getTime()}ms`,
        response,
        email,
        fullName,
        instructions: [
          "✅ Signup completed successfully",
          "🔄 Now check the admin panel for this user",
          "📱 Open admin panel in new tab",
          "🔍 Look for the email: " + email,
          "⏰ User should appear in pending section",
          "🎯 Use debug panel to verify data loading"
        ]
      };

      setResult(testResult);
      console.log("🧪 LIVE TEST RESULT:", testResult);

      // Auto-open admin panel
      if (!adminPanelOpen) {
        const adminWindow = window.open('/admin', '_blank');
        setAdminPanelOpen(true);
        setTimeout(() => setAdminPanelOpen(false), 5000);
      }

    } catch (error: any) {
      console.error("🧪 LIVE TEST ERROR:", error);
      setResult({
        success: false,
        error: error.message,
        email,
        fullName,
        troubleshooting: [
          "❌ Signup failed",
          "🔍 Check console for detailed errors",
          "📋 Verify email format is correct",
          "🔐 Check if user already exists",
          "🔧 Review database connection"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdminPanel = () => {
    window.open('/admin', '_blank');
    setAdminPanelOpen(true);
    setTimeout(() => setAdminPanelOpen(false), 3000);
  };

  const runFullDiagnostic = async () => {
    console.log("🔍 Running full diagnostic...");

    try {
      // Test debug API
      const debugResponse = await fetch('/api/admin/users-debug');
      const debugData = await debugResponse.json();
      console.log("🔍 Debug API Response:", debugData);

      // Test main admin API
      const adminResponse = await fetch('/api/admin/users');
      const adminData = await adminResponse.json();
      console.log("🔍 Admin API Response:", adminData);

      alert(`Diagnostic Complete!\nDebug API: ${debugData.success ? '✅' : '❌'}\nAdmin API: ${adminResponse.ok ? '✅' : '❌'}\nSee console for details.`);

    } catch (error) {
      console.error("🔍 Diagnostic Error:", error);
      alert("Diagnostic failed - check console");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F2027',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1A3A3A',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #38BDF8'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#38BDF8',
            margin: '0 0 15px 0',
            textAlign: 'center'
          }}>
            🧪 Live Admin Panel Testing
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#94A3B8',
            textAlign: 'center',
            margin: 0
          }}>
            Test signup → Admin panel updates in real-time
          </p>
        </div>

        {/* Control Panel */}
        <div style={{
          backgroundColor: '#1E40AF',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#60A5FA', margin: '0 0 20px 0' }}>🎮 Test Controls</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={generateTestUser}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              🎲 Generate Test User
            </button>
            <button
              onClick={openAdminPanel}
              disabled={adminPanelOpen}
              style={{
                backgroundColor: adminPanelOpen ? '#6B7280' : '#7C3AED',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: adminPanelOpen ? 'not-allowed' : 'pointer'
              }}
            >
              {adminPanelOpen ? '🔄 Admin Panel Opened' : '🎯 Open Admin Panel'}
            </button>
            <button
              onClick={runFullDiagnostic}
              style={{
                backgroundColor: '#DC2626',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              🔍 Run Diagnostic
            </button>
          </div>
        </div>

        {/* Test Form */}
        <div style={{
          backgroundColor: '#1A3A3A',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#FDE047', margin: '0 0 25px 0' }}>📝 Test User Signup</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB' }}>
              📧 Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test.user@example.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #374151',
                borderRadius: '8px',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB' }}>
              👤 Full Name:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Test User Name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #374151',
                borderRadius: '8px',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB' }}>
              🔐 Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password123!"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #374151',
                borderRadius: '8px',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleTestSignup}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#6B7280' : '#059669',
              color: 'white',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Testing Signup...' : '🚀 Run Live Test'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{
            backgroundColor: result.success ? '#1F2937' : '#7F1D1D',
            border: `2px solid ${result.success ? '#059669' : '#DC2626'}`,
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h2 style={{
              color: result.success ? '#10B981' : '#F87171',
              margin: '0 0 20px 0'
            }}>
              {result.success ? '✅ Test Results' : '❌ Test Failed'}
            </h2>

            <div style={{ fontSize: '14px', color: '#D1D5DB', fontFamily: 'monospace' }}>
              <p><strong>📧 Email:</strong> {result.email}</p>
              <p><strong>👤 Name:</strong> {result.fullName}</p>
              {result.success && (
                <>
                  <p><strong>⏱️ Duration:</strong> {result.duration}</p>
                  <p><strong>🕐 Start:</strong> {new Date(result.startTime).toLocaleString()}</p>
                  <p><strong>🕐 End:</strong> {new Date(result.endTime).toLocaleString()}</p>
                </>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#FDE047', margin: '0 0 10px 0' }}>
                {result.success ? '📋 Next Steps:' : '🔧 Troubleshooting:'}
              </h3>
              <ul style={{ color: '#D1D5DB', paddingLeft: '20px' }}>
                {(result.instructions || result.troubleshooting || []).map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>{item}</li>
                ))}
              </ul>
            </div>

            {result.response && (
              <details style={{ marginTop: '20px' }}>
                <summary style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  🔍 View Raw Response Data
                </summary>
                <pre style={{
                  backgroundColor: '#111827',
                  padding: '15px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#E5E7EB',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: '#7C2D12',
          border: '1px solid #D97706',
          padding: '25px',
          borderRadius: '12px'
        }}>
          <h2 style={{ color: '#FCD34D', margin: '0 0 15px 0' }}>📖 How to Use This Test</h2>
          <ol style={{ color: '#FED7AA', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Click "Generate Test User" to create random test data</li>
            <li style={{ marginBottom: '8px' }}>Click "Open Admin Panel" to open admin dashboard in new tab</li>
            <li style={{ marginBottom: '8px' }}>Click "Run Live Test" to create the test user</li>
            <li style={{ marginBottom: '8px' }}>Switch to admin panel tab to verify user appears</li>
            <li style={{ marginBottom: '8px' }}>Use debug panel in admin to inspect data loading</li>
            <li style={{ marginBottom: '8px' }}>Monitor console logs for detailed debugging info</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
