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

// GET /api/admin/users-debug - Debug endpoint to test user loading
export async function GET() {
  try {
    console.log('🔍 Admin Debug API: Starting user query...')
    console.log('🔑 Service key available:', !!supabaseServiceKey)
    console.log('🌐 Supabase URL:', supabaseUrl)

    if (!supabaseAdmin) {
      console.error('❌ Admin client not created')
      return NextResponse.json({
        success: false,
        error: 'Admin client not configured',
        debug: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          serviceKeyLength: supabaseServiceKey?.length || 0
        }
      }, { status: 500 })
    }

    // Test the exact query the admin panel uses
    const { data: allUsers, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        supabaseError: error,
        debug: {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details
        }
      }, { status: 500 })
    }

    console.log(`✅ Successfully loaded ${allUsers?.length || 0} users`)

    // Separate users by approval status
    const approvedUsers = allUsers?.filter(user => user.approval_status === 'approved') || []
    const pendingUsers = allUsers?.filter(user => user.approval_status === 'pending') || []
    const rejectedUsers = allUsers?.filter(user => user.approval_status === 'rejected') || []

    const debugInfo = {
      totalUsers: allUsers?.length || 0,
      approvedCount: approvedUsers.length,
      pendingCount: pendingUsers.length,
      rejectedCount: rejectedUsers.length,
      recentUsers: allUsers?.slice(0, 5).map(u => ({
        email: u.email,
        approval_status: u.approval_status,
        created_at: u.created_at
      })) || [],
      hasGiokenUser: allUsers?.some(u => u.email === 'giokenbusiness@gmail.com') || false
    }

    console.log('📊 Debug info:', debugInfo)

    return NextResponse.json({
      success: true,
      users: allUsers || [],
      approvedUsers,
      pendingUsers,
      rejectedUsers,
      debug: debugInfo
    })

  } catch (error: any) {
    console.error('💥 Admin Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      debug: {
        errorType: error.constructor.name,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
