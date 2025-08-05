import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAuthEnabled } from '@/lib/supabase'

// GET /api/admin/users - Get all users
export async function GET() {
  try {
    console.log('📋 Admin API: Fetching all users...');

    if (!isAuthEnabled || !supabaseAdmin) {
      console.log('⚠️ Admin API: Auth not enabled or admin client not available');
      return NextResponse.json({
        success: false,
        error: 'Authentication not configured',
        users: []
      }, { status: 503 });
    }

    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Admin API: Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error: ' + error.message,
        users: []
      }, { status: 500 });
    }

    console.log(`✅ Admin API: Successfully fetched ${users?.length || 0} users`);

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    });
  } catch (error: any) {
    console.error('💥 Admin API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      users: []
    }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    console.log(`👑 Admin API: ${action} user request for:`, userId);

    if (!isAuthEnabled || !supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Authentication not configured'
      }, { status: 503 });
    }

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId or action'
      }, { status: 400 });
    }

    let updates: any = {};

    if (action === 'approve') {
      updates = {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        status: 'active'
      };
    } else if (action === 'reject') {
      updates = {
        approval_status: 'rejected',
        approved_at: null,
        status: 'suspended'
      };
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "approve" or "reject"'
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API: Update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error: ' + error.message
      }, { status: 500 });
    }

    console.log(`✅ Admin API: Successfully ${action}ed user:`, userId);

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
      user: data
    });
  } catch (error: any) {
    console.error('💥 Admin API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
