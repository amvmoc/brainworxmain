import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is a super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super admin
    const { data: franchiseOwner, error: ownerError } = await supabase
      .from('franchise_owners')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (ownerError || !franchiseOwner?.is_super_admin) {
      throw new Error('Only super admins can create users');
    }

    const { email, password, name, uniqueLinkCode, role } = await req.json();

    if (!email || !password || !name || !uniqueLinkCode) {
      throw new Error('Missing required fields');
    }

    // Create user in auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      },
    });

    if (createError) {
      throw createError;
    }

    // Create franchise owner record
    const { error: insertError } = await supabase
      .from('franchise_owners')
      .insert({
        id: newUser.user.id,
        name,
        email,
        unique_link_code: uniqueLinkCode,
        is_super_admin: role === 'super_admin',
      });

    if (insertError) {
      // Rollback - delete the auth user
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});