export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_subscription_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_subscription_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_subscription_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_related_subscription_id_fkey"
            columns: ["related_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          category: Database["public"]["Enums"]["file_category"]
          created_at: string | null
          description: string | null
          download_count: number | null
          ea_mode: Database["public"]["Enums"]["ea_mode_type"] | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_public: boolean | null
          mime_type: string | null
          updated_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["file_category"]
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          ea_mode?: Database["public"]["Enums"]["ea_mode_type"] | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["file_category"]
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          ea_mode?: Database["public"]["Enums"]["ea_mode_type"] | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: []
      }
      investment_reports: {
        Row: {
          account_id: string
          balance: number
          created_at: string | null
          equity: number
          gross_loss: number
          gross_profit: number
          id: string
          net_profit: number
          profit_factor: number | null
          raw_summary: Json | null
          report_date: string
          report_period_end: string | null
          report_period_start: string | null
          total_lots: number
          total_trades: number
        }
        Insert: {
          account_id: string
          balance?: number
          created_at?: string | null
          equity?: number
          gross_loss?: number
          gross_profit?: number
          id?: string
          net_profit?: number
          profit_factor?: number | null
          raw_summary?: Json | null
          report_date: string
          report_period_end?: string | null
          report_period_start?: string | null
          total_lots?: number
          total_trades?: number
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string | null
          equity?: number
          gross_loss?: number
          gross_profit?: number
          id?: string
          net_profit?: number
          profit_factor?: number | null
          raw_summary?: Json | null
          report_date?: string
          report_period_end?: string | null
          report_period_start?: string | null
          total_lots?: number
          total_trades?: number
        }
        Relationships: [
          {
            foreignKeyName: "investment_reports_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          native_name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          native_name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      license_subscriptions: {
        Row: {
          account_id: string
          account_size: number | null
          broker: string | null
          created_at: string | null
          customer_id: number | null
          expire_date: string | null
          id: string
          license_type: string
          trading_system: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
          vps_expire_date: string | null
        }
        Insert: {
          account_id: string
          account_size?: number | null
          broker?: string | null
          created_at?: string | null
          customer_id?: number | null
          expire_date?: string | null
          id?: string
          license_type?: string
          trading_system?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          vps_expire_date?: string | null
        }
        Update: {
          account_id?: string
          account_size?: number | null
          broker?: string | null
          created_at?: string | null
          customer_id?: number | null
          expire_date?: string | null
          id?: string
          license_type?: string
          trading_system?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
          vps_expire_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          map_embed_url: string | null
          name: string
          phone: string | null
          tiktok_url: string | null
          trustpilot_url: string | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          map_embed_url?: string | null
          name: string
          phone?: string | null
          tiktok_url?: string | null
          trustpilot_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          map_embed_url?: string | null
          name?: string
          phone?: string | null
          tiktok_url?: string | null
          trustpilot_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_notifications: {
        Row: {
          id: string
          notification_type: string
          sent_at: string
          sent_via: string
          subscription_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          sent_at?: string
          sent_via: string
          subscription_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          sent_at?: string
          sent_via?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_preferences: {
        Row: {
          created_at: string
          default_currency: string
          display_mode: string
          id: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          display_mode?: string
          id?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          display_mode?: string
          id?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          trade_date: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          trade_date?: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          trade_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          created_at: string
          currency: string
          id: string
          initial_balance: number
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          nickname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          nickname?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_systems: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          language_code: string
          translation_key: string
          translation_value: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          language_code: string
          translation_key: string
          translation_value: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          language_code?: string
          translation_key?: string
          translation_value?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_account_earnings: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          equity: number
          id: string
          lots_traded: number
          period_end: string
          period_start: string
          period_type: string
          profit_loss: number
          rebate: number
          synced_at: string
        }
        Insert: {
          account_id: string
          balance?: number
          created_at?: string
          equity?: number
          id?: string
          lots_traded?: number
          period_end: string
          period_start: string
          period_type?: string
          profit_loss?: number
          rebate?: number
          synced_at?: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          equity?: number
          id?: string
          lots_traded?: number
          period_end?: string
          period_start?: string
          period_type?: string
          profit_loss?: number
          rebate?: number
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_account_earnings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_downloads: {
        Row: {
          downloaded_at: string | null
          file_id: string
          id: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string | null
          file_id: string
          id?: string
          user_id: string
        }
        Update: {
          downloaded_at?: string | null
          file_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_downloads_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mt5_accounts: {
        Row: {
          created_at: string
          id: string
          initial_investment: number
          is_cent_account: boolean
          last_balance: number | null
          last_report_date: string | null
          metaapi_account_id: string | null
          mt5_login: string | null
          mt5_server: string | null
          nickname: string
          rebate_rate_per_lot: number
          status: string
          total_lots_traded: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_investment?: number
          is_cent_account?: boolean
          last_balance?: number | null
          last_report_date?: string | null
          metaapi_account_id?: string | null
          mt5_login?: string | null
          mt5_server?: string | null
          nickname: string
          rebate_rate_per_lot?: number
          status?: string
          total_lots_traded?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_investment?: number
          is_cent_account?: boolean
          last_balance?: number | null
          last_report_date?: string | null
          metaapi_account_id?: string | null
          mt5_login?: string | null
          mt5_server?: string | null
          nickname?: string
          rebate_rate_per_lot?: number
          status?: string
          total_lots_traded?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          end_date: string
          id: string
          notes: string | null
          plan_duration: string
          product_key: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          plan_duration: string
          product_key: string
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          plan_duration?: string
          product_key?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_terms_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          terms_version?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { file_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ea_mode_type: "auto" | "hybrid"
      file_category:
        | "ea_files"
        | "documents"
        | "images"
        | "videos"
        | "set_files"
      subscription_status: "active" | "expiring_soon" | "expired" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      ea_mode_type: ["auto", "hybrid"],
      file_category: ["ea_files", "documents", "images", "videos", "set_files"],
      subscription_status: ["active", "expiring_soon", "expired", "cancelled"],
    },
  },
} as const
