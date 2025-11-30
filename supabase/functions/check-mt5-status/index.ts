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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { account_id } = await req.json();

    // Get account from database
    const { data: account, error: accountError } = await supabaseClient
      .from('user_mt5_accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check account deployment status
    const statusResponse = await fetch(
      `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaapi_account_id}`,
      {
        headers: { 'auth-token': metaapiToken },
      }
    );

    const statusData = await statusResponse.json();
    console.log('Account status:', statusData.state, statusData.connectionStatus);

    let newStatus = account.status;
    if (statusData.state === 'DEPLOYED' && statusData.connectionStatus === 'CONNECTED') {
      newStatus = 'connected';
    } else if (statusData.state === 'DEPLOYED') {
      newStatus = 'deployed';
    } else if (statusData.state === 'DEPLOYING') {
      newStatus = 'deploying';
    } else {
      newStatus = 'error';
    }

    // Update status in database
    if (newStatus !== account.status) {
      await supabaseClient
        .from('user_mt5_accounts')
        .update({ status: newStatus })
        .eq('id', account_id);
    }

    return new Response(JSON.stringify({
      status: newStatus,
      state: statusData.state,
      connectionStatus: statusData.connectionStatus,
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