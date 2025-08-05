"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSiteUrl } from "@/lib/supabase";

export default function TestSiteUrlPage() {
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    runTests();
  }, []);

  const runTests = () => {
    const results = {
      timestamp: new Date().toISOString(),
      siteUrl: getSiteUrl(),
      envVar: process.env.NEXT_PUBLIC_SITE_URL,
      location: typeof window !== 'undefined' ? window.location.origin : 'server-side',
      expected: 'https://gmillibot.com',
      tests: {
        getSiteUrlWorks: false,
        envVarSet: false,
        correctDomain: false,
        notLocalhost: false
      }
    };

    // Test getSiteUrl function
    try {
      const siteUrl = getSiteUrl();
      results.tests.getSiteUrlWorks = !!siteUrl;
      results.tests.correctDomain = siteUrl === 'https://gmillibot.com';
      results.tests.notLocalhost = !siteUrl.includes('localhost');
    } catch (error) {
      console.error('getSiteUrl error:', error);
    }

    // Test environment variable
    results.tests.envVarSet = !!process.env.NEXT_PUBLIC_SITE_URL;

    setTestResults(results);
  };

  if (!mounted) {
    return null;
  }

  const allTestsPassed = testResults && Object.values(testResults.tests).every(Boolean);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', padding: '20px' }}>
      <nav style={{ backgroundColor: '#1E293B', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Gmilli AI
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#38BDF8', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
          🔍 Site URL Configuration Test
        </h1>

        <div style={{
          backgroundColor: allTestsPassed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${allTestsPassed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: allTestsPassed ? '#4ADE80' : '#F87171',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {allTestsPassed ? '✅' : '❌'}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {allTestsPassed ? 'Configuration Test PASSED' : 'Configuration Test FAILED'}
          </h2>
          <p style={{ fontSize: '1rem' }}>
            {allTestsPassed
              ? 'Email redirects should point to live domain (https://gmillibot.com)'
              : 'Email redirects may still point to localhost - configuration needs fixing'
            }
          </p>
        </div>

        {testResults && (
          <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#38BDF8', fontSize: '1.2rem', marginBottom: '1rem' }}>
              📊 Detailed Test Results
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {Object.entries(testResults.tests).map(([test, passed]) => (
                <div key={test} style={{
                  backgroundColor: passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  padding: '1rem',
                  borderRadius: '8px',
                  color: passed ? '#4ADE80' : '#F87171'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {passed ? '✅' : '❌'}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#0F172A', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              <h4 style={{ color: '#38BDF8', marginBottom: '1rem' }}>📋 Configuration Details</h4>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8' }}>getSiteUrl():</span>{' '}
                <span style={{ color: testResults.tests.correctDomain ? '#4ADE80' : '#F87171', fontWeight: 'bold' }}>
                  {testResults.siteUrl}
                </span>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8' }}>NEXT_PUBLIC_SITE_URL:</span>{' '}
                <span style={{ color: testResults.tests.envVarSet ? '#4ADE80' : '#F87171', fontWeight: 'bold' }}>
                  {testResults.envVar || 'NOT SET'}
                </span>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8' }}>Window Location:</span>{' '}
                <span style={{ color: '#60A5FA' }}>
                  {testResults.location}
                </span>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8' }}>Expected:</span>{' '}
                <span style={{ color: '#4ADE80', fontWeight: 'bold' }}>
                  {testResults.expected}
                </span>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #334155', fontSize: '0.7rem', color: '#9CA3AF' }}>
                Test run at: {testResults.timestamp}
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#38BDF8', marginBottom: '1rem' }}>🎯 What This Means</h4>

              {allTestsPassed ? (
                <div style={{ color: '#4ADE80', fontSize: '0.9rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    ✅ <strong>Great news!</strong> Your configuration is correct. Email confirmation and password reset links should now point to <strong>https://gmillibot.com</strong> instead of localhost.
                  </p>
                  <p>
                    The localhost redirect issue should be resolved. You can now test the email functionality with confidence.
                  </p>
                </div>
              ) : (
                <div style={{ color: '#F87171', fontSize: '0.9rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    ❌ <strong>Configuration issue detected.</strong> Email links may still point to localhost instead of the live domain.
                  </p>
                  <p>
                    Check the environment variables and deployment configuration to fix this issue.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
              <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '1rem', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>
                🔍 Test Password Reset
              </Link>
              <Link href="/signup" style={{ backgroundColor: '#059669', color: 'white', padding: '1rem', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>
                📝 Test Signup
              </Link>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={runTests}
                style={{ backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                🔄 Re-run Tests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
