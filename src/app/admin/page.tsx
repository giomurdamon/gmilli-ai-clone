"use client";

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://isgtdflvnxrwbbmketpy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ3RkZmx2bnhyd2JibWtldHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI4MjE1NCwiZXhwIjoyMDY5ODU4MTU0fQ.weMxHXb45RE0g1_9SVovymc328mymph8cXOgJtywsaw'
);

// Debug component for UI state visualization
const UIStateDebugger = ({ users, pendingUsers, approvedUsers }: any) => {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      rawUsersArray: users,
      rawUsersLength: users?.length || 0,
      pendingLength: pendingUsers?.length || 0,
      approvedLength: approvedUsers?.length || 0,
      userEmails: users?.map((u: any) => u.email) || [],
      pendingEmails: pendingUsers?.map((u: any) => u.email) || [],
      approvedEmails: approvedUsers?.map((u: any) => u.email) || [],
      hasGiokenUser: users?.some((u: any) => u.email === 'giokenbusiness@gmail.com') || false,
      giokenUserDetails: users?.find((u: any) => u.email === 'giokenbusiness@gmail.com') || null,
      allApprovalStatuses: users?.map((u: any) => ({ email: u.email, status: u.approval_status })) || [],
    };
    setDebugInfo(info);
    console.log('🔍 UI State Debug Update:', info);
  }, [users, pendingUsers, approvedUsers]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          backgroundColor: '#7C3AED',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🔍 Show Debug Panel
      </button>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1E1B4B',
      border: '2px solid #7C3AED',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '30px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#A855F7', margin: 0 }}>🔍 UI State Debugger</h3>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            backgroundColor: '#DC2626',
            color: 'white',
            padding: '4px 8px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          ✕ Hide
        </button>
      </div>

      <div style={{ color: '#C4B5FD' }}>
        <p><strong>🕐 Last Update:</strong> {debugInfo?.timestamp}</p>
        <p><strong>📊 Raw Users Count:</strong> {debugInfo?.rawUsersLength}</p>
        <p><strong>⏳ Pending Count:</strong> {debugInfo?.pendingLength}</p>
        <p><strong>✅ Approved Count:</strong> {debugInfo?.approvedLength}</p>
        <p><strong>🎯 Has Gioken User:</strong> {debugInfo?.hasGiokenUser ? '✅ YES' : '❌ NO'}</p>

        {debugInfo?.hasGiokenUser && (
          <div style={{ backgroundColor: '#059669', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>🎯 Gioken User Found:</p>
            <pre style={{ margin: 0, fontSize: '10px', color: 'white' }}>
              {JSON.stringify(debugInfo?.giokenUserDetails, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <p><strong>📧 All User Emails:</strong></p>
          <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px', maxHeight: '150px', overflow: 'auto' }}>
            {debugInfo?.userEmails?.map((email: string, idx: number) => (
              <div key={idx} style={{ color: email === 'giokenbusiness@gmail.com' ? '#10B981' : '#D1D5DB' }}>
                {idx + 1}. {email}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <p><strong>📋 Approval Status Breakdown:</strong></p>
          <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px', maxHeight: '150px', overflow: 'auto' }}>
            {debugInfo?.allApprovalStatuses?.map((user: any, idx: number) => (
              <div key={idx} style={{
                color: user.email === 'giokenbusiness@gmail.com' ? '#10B981' : '#D1D5DB',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{user.email}</span>
                <span style={{
                  color: user.status === 'pending' ? '#F59E0B' :
                        user.status === 'approved' ? '#10B981' : '#EF4444'
                }}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const refreshTime = new Date().toISOString();
      setLastRefresh(refreshTime);
      console.log('🔄 Loading users from database at:', refreshTime);

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        setError(error.message);
        return;
      }

      console.log('✅ Successfully loaded users:', data?.length || 0);
      console.log('📧 User details:', data?.map(u => `${u.email} (${u.approval_status})`));
      console.log('🔍 Full user data:', data);

      // Enhanced logging for giokenbusiness@gmail.com
      const giokenUser = data?.find(u => u.email === 'giokenbusiness@gmail.com');
      if (giokenUser) {
        console.log('🎯 FOUND giokenbusiness@gmail.com:', giokenUser);
      } else {
        console.log('❌ giokenbusiness@gmail.com NOT FOUND in results');
      }

      setUsers(data || []);
      setError("");
    } catch (err: any) {
      console.error('💥 Loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, email: string) => {
    try {
      setActionLoading(userId);
      console.log('✅ Approving user:', email);

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      console.log('✅ User approved successfully');
      await loadUsers(); // Reload data
      alert(`✅ ${email} approved successfully!`);
    } catch (err: any) {
      console.error('❌ Approval error:', err);
      alert(`Error approving user: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId: string, email: string) => {
    try {
      setActionLoading(userId);
      console.log('❌ Rejecting user:', email);

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          approval_status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      console.log('❌ User rejected successfully');
      await loadUsers(); // Reload data
      alert(`❌ ${email} rejected successfully!`);
    } catch (err: any) {
      console.error('❌ Rejection error:', err);
      alert(`Error rejecting user: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadUsers();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingUsers = users.filter(u => u.approval_status === 'pending');
  const approvedUsers = users.filter(u => u.approval_status === 'approved');

  // Live debug console logs
  useEffect(() => {
    console.log('🔄 UI State Update:', {
      totalUsers: users.length,
      pendingCount: pendingUsers.length,
      approvedCount: approvedUsers.length,
      userEmails: users.map(u => u.email),
      hasGioken: users.some(u => u.email === 'giokenbusiness@gmail.com')
    });
  }, [users, pendingUsers, approvedUsers]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F2027',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #333',
            borderTop: '3px solid #38BDF8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>🔄 Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F2027',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1A3A3A',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #38BDF8'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#38BDF8',
            margin: '0 0 15px 0',
            textAlign: 'center'
          }}>
            🎯 ENHANCED Debug Admin Dashboard
          </h1>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{
              backgroundColor: '#059669',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</div>
              <div>Total Users</div>
            </div>
            <div style={{
              backgroundColor: '#DC2626',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{pendingUsers.length}</div>
              <div>Pending Approval</div>
            </div>
            <div style={{
              backgroundColor: '#16A34A',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{approvedUsers.length}</div>
              <div>Approved</div>
            </div>
          </div>
          {lastRefresh && (
            <div style={{
              backgroundColor: '#1E40AF',
              padding: '10px',
              borderRadius: '6px',
              marginTop: '15px',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              🕐 Last Refresh: {new Date(lastRefresh).toLocaleString()}
            </div>
          )}
          {error && (
            <div style={{
              backgroundColor: '#DC2626',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              ❌ Error: {error}
            </div>
          )}
        </div>

        {/* UI State Debugger */}
        <UIStateDebugger users={users} pendingUsers={pendingUsers} approvedUsers={approvedUsers} />

        {/* Control Buttons */}
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={loadUsers}
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
            🔄 Force Refresh Data
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{
              backgroundColor: '#7C2D12',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔄 Hard Reload Page
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/users-debug');
                const data = await response.json();
                console.log('🔍 Debug API Response:', data);
                alert(`Debug API: Found ${data.debug?.totalUsers || 0} users. Check console for details.`);
              } catch (err) {
                console.error('Debug API error:', err);
                alert('Debug API failed - check console');
              }
            }}
            style={{
              backgroundColor: '#7C3AED',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔍 Test Debug API
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#0284C7',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🏠 Back to Site
          </button>
        </div>

        {/* Pending Users */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#FDE047',
            fontSize: '1.8rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⏳ Pending Approval ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <div style={{
              backgroundColor: '#7C2D12',
              border: '2px solid #DC2626',
              padding: '30px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#FCA5A5', fontSize: '1.2rem', margin: 0 }}>
                📭 No pending users found
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingUsers.map(user => (
                <div key={user.id} style={{
                  backgroundColor: '#92400E',
                  border: '1px solid #D97706',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: 'white',
                      fontSize: '1.2rem'
                    }}>
                      📧 {user.email}
                    </h3>
                    <p style={{
                      margin: '0 0 5px 0',
                      fontSize: '0.9rem',
                      color: '#FED7AA'
                    }}>
                      📅 Registered: {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: '#FDBA74'
                    }}>
                      🆔 ID: {user.id}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => approveUser(user.id, user.email)}
                      disabled={actionLoading === user.id}
                      style={{
                        backgroundColor: actionLoading === user.id ? '#6B7280' : '#059669',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {actionLoading === user.id ? '⏳' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => rejectUser(user.id, user.email)}
                      disabled={actionLoading === user.id}
                      style={{
                        backgroundColor: actionLoading === user.id ? '#6B7280' : '#DC2626',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {actionLoading === user.id ? '⏳' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Users */}
        <div>
          <h2 style={{
            color: '#4ADE80',
            fontSize: '1.8rem',
            marginBottom: '20px'
          }}>
            ✅ Approved Users ({approvedUsers.length})
          </h2>

          {approvedUsers.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>
              No approved users yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {approvedUsers.map(user => (
                <div key={user.id} style={{
                  backgroundColor: '#1A3A3A',
                  border: '1px solid #059669',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}>
                    📧 {user.email}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#94A3B8'
                  }}>
                    ✅ Approved: {user.approved_at ? new Date(user.approved_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
