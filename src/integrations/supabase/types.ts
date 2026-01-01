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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_training_data: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          training_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          training_type?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          training_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_training_data_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          about_company: string | null
          about_user: string | null
          agent_type: string
          allow_text_only_posts: boolean | null
          auto_generate_images: boolean | null
          created_at: string
          id: string
          last_post_at: string | null
          name: string
          posting_frequency: string
          posting_goal: string | null
          posts_created: number
          preferred_image_style: string | null
          preferred_posting_days: number[] | null
          preferred_time_window_end: string | null
          preferred_time_window_start: string | null
          sample_posts: string[] | null
          status: string
          target_audience: string | null
          tone_of_voice: string | null
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_company?: string | null
          about_user?: string | null
          agent_type?: string
          allow_text_only_posts?: boolean | null
          auto_generate_images?: boolean | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          name: string
          posting_frequency?: string
          posting_goal?: string | null
          posts_created?: number
          preferred_image_style?: string | null
          preferred_posting_days?: number[] | null
          preferred_time_window_end?: string | null
          preferred_time_window_start?: string | null
          sample_posts?: string[] | null
          status?: string
          target_audience?: string | null
          tone_of_voice?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_company?: string | null
          about_user?: string | null
          agent_type?: string
          allow_text_only_posts?: boolean | null
          auto_generate_images?: boolean | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          name?: string
          posting_frequency?: string
          posting_goal?: string | null
          posts_created?: number
          preferred_image_style?: string | null
          preferred_posting_days?: number[] | null
          preferred_time_window_end?: string | null
          preferred_time_window_start?: string | null
          sample_posts?: string[] | null
          status?: string
          target_audience?: string | null
          tone_of_voice?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_training_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          update_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          update_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          update_type?: string
          user_id?: string
        }
        Relationships: []
      }
      client_ai_profiles: {
        Row: {
          account_status: string
          business_name: string | null
          created_at: string
          description: string | null
          goals: string[] | null
          id: string
          industry: string | null
          is_complete: boolean
          posting_frequency: string | null
          target_audience: string | null
          tone_of_voice: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          business_name?: string | null
          created_at?: string
          description?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          is_complete?: boolean
          posting_frequency?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          business_name?: string | null
          created_at?: string
          description?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          is_complete?: boolean
          posting_frequency?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_accounts: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string | null
          created_at: string
          followers_count: number | null
          headline: string | null
          id: string
          is_connected: boolean
          linkedin_user_id: string | null
          profile_name: string | null
          profile_photo_url: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string
          followers_count?: number | null
          headline?: string | null
          id?: string
          is_connected?: boolean
          linkedin_user_id?: string | null
          profile_name?: string | null
          profile_photo_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string
          followers_count?: number | null
          headline?: string | null
          id?: string
          is_connected?: boolean
          linkedin_user_id?: string | null
          profile_name?: string | null
          profile_photo_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_analytics: {
        Row: {
          comments: number
          created_at: string
          engagement_rate: number
          id: string
          impressions: number
          likes: number
          post_id: string
          recorded_at: string
          shares: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          post_id: string
          recorded_at?: string
          shares?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments?: number
          created_at?: string
          engagement_rate?: number
          id?: string
          impressions?: number
          likes?: number
          post_id?: string
          recorded_at?: string
          shares?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          agent_id: string | null
          ai_model: string
          content: string
          created_at: string
          error_message: string | null
          guidance: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          linkedin_post_id: string | null
          post_length: string
          posted_at: string | null
          retry_count: number
          scheduled_at: string | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          ai_model: string
          content: string
          created_at?: string
          error_message?: string | null
          guidance?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          linkedin_post_id?: string | null
          post_length?: string
          posted_at?: string | null
          retry_count?: number
          scheduled_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          ai_model?: string
          content?: string
          created_at?: string
          error_message?: string | null
          guidance?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          linkedin_post_id?: string | null
          post_length?: string
          posted_at?: string | null
          retry_count?: number
          scheduled_at?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          advanced_analytics_enabled: boolean
          autonomous_posting_enabled: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          image_generation_enabled: boolean
          max_agents: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          priority_execution: boolean
          show_branding: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_analytics_enabled?: boolean
          autonomous_posting_enabled?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          image_generation_enabled?: boolean
          max_agents?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          priority_execution?: boolean
          show_branding?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_analytics_enabled?: boolean
          autonomous_posting_enabled?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          image_generation_enabled?: boolean
          max_agents?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          priority_execution?: boolean
          show_branding?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_plan: "free" | "pro" | "business"
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
      subscription_plan: ["free", "pro", "business"],
    },
  },
} as const
