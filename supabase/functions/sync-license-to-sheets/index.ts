import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting license sync to Google Sheets...");

    // Get Google credentials from secrets
    const googleCredentials = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS');
    
    if (!googleCredentials) {
      console.error("Missing Google Sheets credentials");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Sheets credentials not configured. Please add GOOGLE_SHEETS_CREDENTIALS secret.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, try to get sheet ID from app_settings table
    let sheetId: string | null = null;
    
    const { data: settingData, error: settingError } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'google_sheet_id')
      .maybeSingle();

    if (!settingError && settingData?.setting_value) {
      sheetId = settingData.setting_value;
      console.log("Using Sheet ID from app_settings");
    } else {
      // Fallback to environment variable/secret
      sheetId = Deno.env.get('GOOGLE_SHEET_ID') || null;
      console.log("Using Sheet ID from environment secret");
    }

    if (!sheetId) {
      console.error("Missing Google Sheet ID");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Sheet ID not configured. Please configure it in Admin > Subscriptions > Settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all licenses
    const { data: licenses, error: fetchError } = await supabase
      .from('license_subscriptions')
      .select('*')
      .order('account_id', { ascending: true });

    if (fetchError) {
      console.error("Error fetching licenses:", fetchError);
      throw new Error(`Failed to fetch licenses: ${fetchError.message}`);
    }

    console.log(`Found ${licenses?.length || 0} licenses to sync`);

    // Parse Google credentials
    let credentials;
    try {
      credentials = JSON.parse(googleCredentials);
    } catch (e) {
      console.error("Failed to parse Google credentials:", e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Google Sheets credentials format. Please provide valid JSON.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create JWT for Google Sheets API
    const accessToken = await getGoogleAccessToken(credentials);

    // Prepare data for Google Sheets
    // Header row + data rows
    const values = [
      ['AccountID', 'LicenseType', 'ExpireDate', 'Broker', 'Username', 'TradingSystem', 'AccountSize', 'VPS ExpireDate', 'Customer ID'],
      ...(licenses || []).map(license => [
        license.account_id || '',
        license.license_type || '',
        license.expire_date || '',
        license.broker || '',
        license.user_name || '',
        license.trading_system || '',
        license.account_size?.toString() || '0',
        license.vps_expire_date || '',
        license.customer_id?.toString() || '0'
      ])
    ];

    // Clear existing data and write new data
    const range = 'Sheet1!A:I';
    
    // Clear the sheet first
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:clear`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Write new data
    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Google Sheets API error:", errorText);
      throw new Error(`Failed to update Google Sheet: ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log("Successfully synced to Google Sheets:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${licenses?.length || 0} licenses to Google Sheets`,
        updatedCells: result.updatedCells
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error("Sync error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate Google OAuth2 access token from service account credentials
async function getGoogleAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // Token valid for 1 hour

  // Create JWT header and payload
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const privateKey = credentials.private_key;
  const signature = await signWithRSA(signatureInput, privateKey);
  const encodedSignature = base64UrlEncode(signature);

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64UrlEncode(str: string | ArrayBuffer): string {
  let base64: string;
  if (typeof str === 'string') {
    base64 = btoa(str);
  } else {
    const bytes = new Uint8Array(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signWithRSA(data: string, privateKeyPem: string): Promise<ArrayBuffer> {
  // Import the private key
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the data
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(data)
  );

  return signature;
}
