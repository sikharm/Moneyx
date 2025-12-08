import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CURRENT_TERMS_VERSION = "1.0";

export const useTermsAcceptance = () => {
  const { user } = useAuth();
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAcceptance = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_terms_acceptance")
        .select("id, terms_version")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking terms acceptance:", error);
        return false;
      }

      // Check if user has accepted current version
      const accepted = data?.terms_version === CURRENT_TERMS_VERSION;
      setHasAccepted(accepted);
      return accepted;
    } catch (err) {
      console.error("Terms acceptance check error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveAcceptance = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_terms_acceptance")
        .upsert(
          {
            user_id: user.id,
            terms_version: CURRENT_TERMS_VERSION,
            accepted_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Error saving terms acceptance:", error);
        return false;
      }

      setHasAccepted(true);
      return true;
    } catch (err) {
      console.error("Terms acceptance save error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    hasAccepted,
    loading,
    checkAcceptance,
    saveAcceptance
  };
};
