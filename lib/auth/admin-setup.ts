'use server';

import { supabase } from '@/lib/supabase/client';

/**
 * Creates an admin account for database testing and administration
 * RUN THIS ONCE to set up the admin account
 * 
 * Admin credentials:
 * Email: admin@propresenter.local
 * Password: AdminProPresenter123!
 */
export async function createAdminAccount() {
  try {
    // First, try to create the auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: 'admin@propresenter.local',
      password: 'AdminProPresenter123!',
      options: {
        data: {
          role: 'admin',
        },
      },
    });

    if (authError) {
      console.error(' Error creating admin auth user:', authError.message);
      return { error: authError.message };
    }

    if (!data.user) {
      return { error: 'Failed to create admin user' };
    }

    // Create the admin user record in the users table
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (userError) {
      console.error(' Error creating admin user record:', userError.message);
      return { error: userError.message };
    }

    return {
      success: true,
      message: 'Admin account created successfully',
      credentials: {
        email: 'admin@propresenter.local',
        password: 'AdminProPresenter123!',
      },
    };
  } catch (error: any) {
    console.error(' Admin setup error:', error);
    return { error: error.message };
  }
}

/**
 * Checks if an admin account exists
 */
export async function checkAdminExists() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      exists: !!data,
      admin: data,
    };
  } catch (error: any) {
    console.error(' Error checking admin:', error);
    return { exists: false, admin: null };
  }
}
