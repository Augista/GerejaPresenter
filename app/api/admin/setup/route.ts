import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 400 }
      );
    }

    // Create a Supabase client with service role key (server-side only)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the admin auth user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@propresenter.local',
      password: 'AdminProPresenter123!',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin',
      },
    });

    if (authError) {
      console.error(' Auth error:', authError);
      return NextResponse.json(
        { 
          error: authError.message,
          details: authError.status === 422 ? 'Admin account may already exist' : undefined
        },
        { status: authError.status || 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      );
    }

    console.log(' Admin user created:', authData.user.id);

    // Create the user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert([
        {
          id: authData.user.id,
          email: authData.user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error(' Profile error:', profileError);
      // Don't fail if profile creation fails - admin user exists
      // This might fail if users table doesn't exist yet, which is okay
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
      },
      credentials: {
        email: 'admin@propresenter.local',
        password: 'AdminProPresenter123!',
      },
    });
  } catch (error: any) {
    console.error(' Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set up admin account' },
      { status: 500 }
    );
  }
}
