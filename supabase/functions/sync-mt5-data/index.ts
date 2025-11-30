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

    const { account_id, period_type = 'weekly' } = await req.json();

    console.log('Syncing data for account:', account_id);

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

    // Check account deployment status
    const statusResponse = await fetch(
      `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaapi_account_id}`,
      {
        headers: { 'auth-token': metaapiToken },
      }
    );

    const statusData = await statusResponse.json();
    console.log('Account status:', statusData.state, statusData.connectionStatus);

    if (statusData.state !== 'DEPLOYED') {
      // Update status in database
      await supabaseClient
        .from('user_mt5_accounts')
        .update({ status: 'deploying' })
        .eq('id', account_id);

      return new Response(JSON.stringify({ 
        error: 'Account still deploying',
        state: statusData.state
      }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get account information (balance, equity)
    const accountInfoResponse = await fetch(
      `https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaapi_account_id}/account-information`,
      {
        headers: { 'auth-token': metaapiToken },
      }
    );

    let balance = 0;
    let equity = 0;

    if (accountInfoResponse.ok) {
      const accountInfo = await accountInfoResponse.json();
      balance = accountInfo.balance || 0;
      equity = accountInfo.equity || 0;
      console.log('Raw balance:', balance, 'Raw equity:', equity);
    }

    // Get trade history for lots calculation
    const now = new Date();
    let periodStart: Date;
    let periodEnd = now;

    if (period_type === 'weekly') {
      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - diff);
      periodStart.setHours(0, 0, 0, 0);
    } else {
      // Start of current month
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const historyResponse = await fetch(
      `https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaapi_account_id}/history-deals/time/${periodStart.toISOString()}/${periodEnd.toISOString()}`,
      {
        headers: { 'auth-token': metaapiToken },
      }
    );

    let lotsTraded = 0;
    let periodProfitLoss = 0;

    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('Trade history entries:', history.length);
      
      // Calculate total lots from closed deals
      for (const deal of history) {
        if (deal.type === 'DEAL_TYPE_BUY' || deal.type === 'DEAL_TYPE_SELL') {
          lotsTraded += deal.volume || 0;
        }
        if (deal.profit) {
          periodProfitLoss += deal.profit;
        }
      }
      console.log('Total lots traded:', lotsTraded, 'Period P/L:', periodProfitLoss);
    }

    // Convert values if cent account (divide by 100)
    if (account.is_cent_account) {
      balance = balance / 100;
      equity = equity / 100;
      periodProfitLoss = periodProfitLoss / 100;
      console.log('Converted for cent account - Balance:', balance, 'Equity:', equity, 'P/L:', periodProfitLoss);
    }

    // Calculate rebate
    const rebate = lotsTraded * (account.rebate_rate_per_lot || 0);
    console.log('Calculated rebate:', rebate);

    // Update account status
    await supabaseClient
      .from('user_mt5_accounts')
      .update({ status: 'connected' })
      .eq('id', account_id);

    // Upsert earnings record
    const periodStartStr = periodStart.toISOString().split('T')[0];
    const periodEndStr = periodEnd.toISOString().split('T')[0];

    const { data: earnings, error: earningsError } = await supabaseClient
      .from('user_account_earnings')
      .upsert({
        account_id,
        period_type,
        period_start: periodStartStr,
        period_end: periodEndStr,
        balance,
        equity,
        profit_loss: periodProfitLoss,
        lots_traded: lotsTraded,
        rebate,
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'account_id,period_type,period_start,period_end',
      })
      .select()
      .single();

    if (earningsError) {
      console.error('Earnings error:', earningsError);
    }

    console.log('Sync completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        balance,
        equity,
        profit_loss: periodProfitLoss,
        lots_traded: lotsTraded,
        rebate,
        period_start: periodStartStr,
        period_end: periodEndStr,
      }
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