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

    const { account_id } = await req.json();
    console.log('Redeploying account:', account_id);

    // Get account from database
    const { data: account, error: accountError } = await supabaseClient
      .from('user_mt5_accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      console.error('Account not found:', accountError);
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns this account
    if (account.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!account.metaapi_account_id) {
      return new Response(JSON.stringify({ error: 'No MetaAPI account linked' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call MetaAPI deploy endpoint
    console.log('Calling MetaAPI deploy for:', account.metaapi_account_id);
    const deployResponse = await fetch(
      `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaapi_account_id}/deploy`,
      {
        method: 'POST',
        headers: { 'auth-token': metaapiToken },
      }
    );

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('MetaAPI deploy error:', deployResponse.status, errorText);
      
      // If already deployed, that's fine
      if (deployResponse.status === 409) {
        console.log('Account already deployed, checking status...');
      } else if (deployResponse.status === 403 && errorText.includes('top up')) {
        // MetaAPI quota/billing issue
        return new Response(JSON.stringify({ 
          error: 'MetaAPI quota exceeded',
          message: 'Please top up your MetaAPI account to deploy trading accounts.',
          requires_billing: true
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: 'Failed to redeploy account',
          details: errorText 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Deploy request sent, updating status to deploying');

    // Update status in database
    await supabaseClient
      .from('user_mt5_accounts')
      .update({ status: 'deploying' })
      .eq('id', account_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Redeploy initiated. Please check status in a few minutes.',
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
