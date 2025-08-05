import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// GET /api/verify-database - Comprehensive database verification
export async function GET() {
  try {
    console.log('🔍 Database Verification: Starting comprehensive check...')

    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        serviceKeyLength: supabaseServiceKey?.length || 0,
        urlDomain: supabaseUrl?.split('//')[1]?.split('.')[0] || 'unknown'
      },
      tests: {},
      errors: []
    }

    // Test 1: Basic connection
    try {
      console.log('🧪 Test 1: Basic connection test...')
      const { data: connectionTest, error: connectionError } = await supabaseAdmin
        .from('user_profiles')
        .select('count')
        .limit(1)

      results.tests.basicConnection = {
        success: !connectionError,
        error: connectionError?.message || null,
        result: connectionTest
      }
    } catch (error: any) {
      results.tests.basicConnection = {
        success: false,
        error: error.message,
        result: null
      }
      results.errors.push('Basic connection failed: ' + error.message)
    }

    // Test 2: Count all users
    try {
      console.log('🧪 Test 2: Count all users...')
      const { count, error: countError } = await supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      results.tests.userCount = {
        success: !countError,
        error: countError?.message || null,
        totalUsers: count || 0
      }
    } catch (error: any) {
      results.tests.userCount = {
        success: false,
        error: error.message,
        totalUsers: 0
      }
      results.errors.push('User count failed: ' + error.message)
    }

    // Test 3: Load all users with full data
    try {
      console.log('🧪 Test 3: Load all users with full data...')
      const { data: allUsers, error: usersError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      results.tests.allUsersQuery = {
        success: !usersError,
        error: usersError?.message || null,
        usersCount: allUsers?.length || 0,
        users: allUsers || []
      }

      // Detailed user analysis
      if (allUsers && allUsers.length > 0) {
        results.userAnalysis = {
          totalUsers: allUsers.length,
          statusBreakdown: {
            pending: allUsers.filter(u => u.approval_status === 'pending').length,
            approved: allUsers.filter(u => u.approval_status === 'approved').length,
            rejected: allUsers.filter(u => u.approval_status === 'rejected').length,
            other: allUsers.filter(u => !['pending', 'approved', 'rejected'].includes(u.approval_status)).length
          },
          recentUsers: allUsers.slice(0, 5).map(u => ({
            email: u.email,
            approval_status: u.approval_status,
            created_at: u.created_at,
            id: u.id
          })),
          allEmails: allUsers.map(u => u.email),
          hasGiokenUser: allUsers.some(u => u.email === 'giokenbusiness@gmail.com'),
          giokenUserData: allUsers.find(u => u.email === 'giokenbusiness@gmail.com') || null
        }
      }

    } catch (error: any) {
      results.tests.allUsersQuery = {
        success: false,
        error: error.message,
        usersCount: 0,
        users: []
      }
      results.errors.push('All users query failed: ' + error.message)
    }

    // Test 4: Check specific email (giokenbusiness@gmail.com)
    try {
      console.log('🧪 Test 4: Check specific email...')
      const { data: specificUser, error: specificError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('email', 'giokenbusiness@gmail.com')
        .single()

      results.tests.specificEmailCheck = {
        success: !specificError,
        error: specificError?.message || null,
        userFound: !!specificUser,
        userData: specificUser || null
      }
    } catch (error: any) {
      results.tests.specificEmailCheck = {
        success: false,
        error: error.message,
        userFound: false,
        userData: null
      }
    }

    // Test 5: RLS Policy Check
    try {
      console.log('🧪 Test 5: RLS Policy check...')
      const { data: rlsCheck, error: rlsError } = await supabaseAdmin
        .rpc('check_rls_policies')

      results.tests.rlsPolicyCheck = {
        success: !rlsError,
        error: rlsError?.message || null,
        result: rlsCheck
      }
    } catch (error: any) {
      results.tests.rlsPolicyCheck = {
        success: false,
        error: 'RLS check function not available or failed: ' + error.message,
        result: null
      }
    }

    // Test 6: Auth users check
    try {
      console.log('🧪 Test 6: Auth users check...')
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

      results.tests.authUsersCheck = {
        success: !authError,
        error: authError?.message || null,
        authUsersCount: authUsers?.users?.length || 0,
        authUsers: authUsers?.users?.slice(0, 5).map(u => ({
          email: u.email,
          created_at: u.created_at,
          id: u.id,
          email_confirmed_at: u.email_confirmed_at
        })) || []
      }
    } catch (error: any) {
      results.tests.authUsersCheck = {
        success: false,
        error: error.message,
        authUsersCount: 0,
        authUsers: []
      }
    }

    // Summary
    const successfulTests = Object.values(results.tests).filter((test: any) => test.success).length
    const totalTests = Object.keys(results.tests).length

    results.summary = {
      successfulTests,
      totalTests,
      overallSuccess: successfulTests === totalTests,
      successRate: `${successfulTests}/${totalTests}`,
      hasErrors: results.errors.length > 0,
      errorCount: results.errors.length
    }

    console.log('🔍 Database Verification Complete:', results.summary)

    return NextResponse.json({
      success: true,
      verification: results
    })

  } catch (error: any) {
    console.error('💥 Database verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Verification failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
