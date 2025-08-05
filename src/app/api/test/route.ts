import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test API called');

    // Basic environment check
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      netlifyEnv: process.env.NETLIFY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseVars: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
      allEnvKeys: Object.keys(process.env).length
    };

    console.log('🧪 Environment check:', envCheck);

    return NextResponse.json({
      status: 'API_WORKING',
      message: 'Test endpoint is functional',
      timestamp: new Date().toISOString(),
      environment: envCheck
    });

  } catch (error) {
    console.error('🧪 Test API error:', error);

    return NextResponse.json({
      status: 'API_ERROR',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
