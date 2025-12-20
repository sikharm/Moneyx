import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "moneyxwhale@gmail.com";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting check-expiring-subscriptions function...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate date 7 days from now
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    console.log(`Checking for subscriptions expiring on: ${sevenDaysStr}`);

    // Find subscriptions expiring in exactly 7 days
    const { data: expiringSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*, profiles!user_subscriptions_user_id_fkey(email, full_name)')
      .eq('end_date', sevenDaysStr)
      .in('status', ['active', 'expiring_soon']);

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring in 7 days`);

    // Find expired subscriptions that need status update
    const { data: expiredSubscriptions, error: expiredError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .lt('end_date', todayStr)
      .neq('status', 'expired')
      .neq('status', 'cancelled');

    if (expiredError) {
      console.error("Error fetching expired subscriptions:", expiredError);
    } else if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      // Update expired subscriptions
      const { error: updateExpiredError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'expired' })
        .in('id', expiredSubscriptions.map(s => s.id));

      if (updateExpiredError) {
        console.error("Error updating expired subscriptions:", updateExpiredError);
      } else {
        console.log(`Updated ${expiredSubscriptions.length} subscriptions to expired status`);
      }
    }

    // Find subscriptions that should be marked as expiring_soon (within 7 days)
    const { data: soonToExpire, error: soonError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .gte('end_date', todayStr)
      .lte('end_date', sevenDaysStr)
      .eq('status', 'active');

    if (soonError) {
      console.error("Error fetching soon-to-expire subscriptions:", soonError);
    } else if (soonToExpire && soonToExpire.length > 0) {
      const { error: updateSoonError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'expiring_soon' })
        .in('id', soonToExpire.map(s => s.id));

      if (updateSoonError) {
        console.error("Error updating expiring_soon subscriptions:", updateSoonError);
      } else {
        console.log(`Updated ${soonToExpire.length} subscriptions to expiring_soon status`);
      }
    }

    // Process notifications for subscriptions expiring in exactly 7 days
    const results = {
      processed: 0,
      emailsSent: 0,
      notificationsCreated: 0,
      errors: [] as string[],
    };

    for (const subscription of expiringSubscriptions || []) {
      try {
        // Check if notification was already sent for this subscription
        const { data: existingNotification } = await supabase
          .from('subscription_notifications')
          .select('id')
          .eq('subscription_id', subscription.id)
          .eq('notification_type', 'seven_day_warning')
          .maybeSingle();

        if (existingNotification) {
          console.log(`Notification already sent for subscription ${subscription.id}`);
          continue;
        }

        const userProfile = subscription.profiles;
        const userName = userProfile?.full_name || userProfile?.email || 'Unknown User';
        const userEmail = userProfile?.email || 'Unknown Email';
        
        const productNames: Record<string, string> = {
          m1: 'MoneyX M1',
          m2: 'MoneyX M2 (MaxProfit)',
          cm3: 'MoneyX C-M3 (Correlation)',
          nm4: 'MoneyX N-M4 (Non-stop)',
          g1: 'MoneyX G1',
        };
        const productName = productNames[subscription.product_key] || subscription.product_key.toUpperCase();

        // Send email notification
        console.log(`Sending email notification for ${userName}'s subscription...`);
        
        const emailResponse = await resend.emails.send({
          from: "MoneyX <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `⚠️ MoneyX - Subscription Expiring in 7 Days`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
                .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
                .label { color: #666; font-size: 12px; text-transform: uppercase; }
                .value { font-size: 16px; font-weight: bold; color: #333; }
                .warning { color: #f59e0b; }
                .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⚠️ Subscription Expiring Soon</h1>
                </div>
                <div class="content">
                  <p>Hi Admin,</p>
                  <p>The following subscription will expire in <strong class="warning">7 days</strong>:</p>
                  
                  <div class="info-box">
                    <p><span class="label">👤 User</span><br><span class="value">${userName}</span></p>
                    <p><span class="label">📧 Email</span><br><span class="value">${userEmail}</span></p>
                    <p><span class="label">📦 Product</span><br><span class="value">${productName}</span></p>
                    <p><span class="label">📅 Expiry Date</span><br><span class="value">${subscription.end_date}</span></p>
                    <p><span class="label">⏳ Days Remaining</span><br><span class="value warning">7 days</span></p>
                  </div>
                  
                  <p>Please reach out to the user to discuss renewal options.</p>
                </div>
                <div class="footer">
                  <p>MoneyX Subscription Management System</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log("Email sent successfully:", emailResponse);
        results.emailsSent++;

        // Create in-app notification
        const { error: notifError } = await supabase
          .from('admin_notifications')
          .insert({
            title: 'Subscription Expiring in 7 Days',
            message: `${userName}'s ${productName} subscription expires on ${subscription.end_date}`,
            type: 'subscription_expiring',
            related_subscription_id: subscription.id,
          });

        if (notifError) {
          console.error("Error creating notification:", notifError);
        } else {
          results.notificationsCreated++;
        }

        // Log that notification was sent
        const { error: logError } = await supabase
          .from('subscription_notifications')
          .insert({
            subscription_id: subscription.id,
            notification_type: 'seven_day_warning',
            sent_via: 'both',
          });

        if (logError) {
          console.error("Error logging notification:", logError);
        }

        results.processed++;
      } catch (err) {
        const errorMsg = `Error processing subscription ${subscription.id}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log("Check completed:", results);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.processed} subscriptions, sent ${results.emailsSent} emails, created ${results.notificationsCreated} notifications`,
      results,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in check-expiring-subscriptions:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});