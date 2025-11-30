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
      mt5_password, 
      mt5_server, 
      initial_investment, 
      rebate_rate_per_lot,
      is_cent_account 
    } = await req.json();

    console.log('Creating MetaAPI account for user:', user.id);
    console.log('MT5 Login:', mt5_login, 'Server:', mt5_server);

    // Create MetaAPI account
    const metaapiResponse = await fetch('https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': metaapiToken,
      },
      body: JSON.stringify({
        name: `${nickname} - ${user.id.slice(0, 8)}`,
        type: 'cloud',
        login: mt5_login,
        password: mt5_password,
        server: mt5_server,
        platform: 'mt5',
        magic: 0,
        quoteStreamingIntervalInSeconds: 2.5,
        reliability: 'regular',
      }),
    });

    if (!metaapiResponse.ok) {
      const errorText = await metaapiResponse.text();
      console.error('MetaAPI error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create MetaAPI account', details: errorText }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const metaapiAccount = await metaapiResponse.json();
    console.log('MetaAPI account created:', metaapiAccount.id);

    // Store account in database
    const { data: account, error: dbError } = await supabaseClient
      .from('user_mt5_accounts')
      .insert({
        user_id: user.id,
        nickname,
        mt5_login,
        mt5_password,
        mt5_server,
        metaapi_account_id: metaapiAccount.id,
        initial_investment,
        rebate_rate_per_lot,
        is_cent_account,
        status: 'deploying',
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

    // Deploy the account (async - will take 2-3 minutes)
    const deployResponse = await fetch(
      `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${metaapiAccount.id}/deploy`,
      {
        method: 'POST',
        headers: {
          'auth-token': metaapiToken,
        },
      }
    );

    if (!deployResponse.ok) {
      console.error('Deploy error:', await deployResponse.text());
    } else {
      console.log('Account deployment started');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      account,
      message: 'Account created and deployment started. It may take 2-3 minutes to connect.'
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