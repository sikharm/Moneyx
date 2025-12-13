import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const metaapiToken = Deno.env.get('METAAPI_TOKEN')!;

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      nickname, 
      mt5_login, 
      mt5_server, 
      initial_investment, 
      rebate_rate_per_lot,
      is_cent_account 
    } = await req.json();

    console.log('Creating MetaAPI account for user:', user.id);
    console.log('MT5 Login:', mt5_login, 'Server:', mt5_server);

    // Note: MetaAPI integration disabled - no longer collecting MT5 passwords
    // Accounts are now created manually with fake/test data only
    const metaapiAccountId = `manual-${Date.now()}`;

    // Store account in database (without password)
    const { data: account, error: dbError } = await supabaseClient
      .from('user_mt5_accounts')
      .insert({
        user_id: user.id,
        nickname,
        mt5_login,
        mt5_server,
        metaapi_account_id: metaapiAccountId,
        initial_investment,
        rebate_rate_per_lot,
        is_cent_account,
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save account', details: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Account saved to database:', account.id);

    return new Response(JSON.stringify({ 
      success: true, 
      account,
      message: 'Account created successfully.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});