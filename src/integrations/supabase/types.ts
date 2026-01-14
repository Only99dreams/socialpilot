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
      app_settings: {
        Row: {
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          business_id: string
          business_profile: Json | null
          created_at: string
          id: string
          last_learning_at: string | null
          mode: Database["public"]["Enums"]["agent_mode"] | null
          status: Database["public"]["Enums"]["agent_status"] | null
          updated_at: string
        }
        Insert: {
          business_id: string
          business_profile?: Json | null
          created_at?: string
          id?: string
          last_learning_at?: string | null
          mode?: Database["public"]["Enums"]["agent_mode"] | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          business_profile?: Json | null
          created_at?: string
          id?: string
          last_learning_at?: string | null
          mode?: Database["public"]["Enums"]["agent_mode"] | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          brand_keywords: string[] | null
          brand_tone: Database["public"]["Enums"]["brand_tone"] | null
          created_at: string
          id: string
          industry: string | null
          name: string
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          brand_keywords?: string[] | null
          brand_tone?: Database["public"]["Enums"]["brand_tone"] | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          brand_keywords?: string[] | null
          brand_tone?: Database["public"]["Enums"]["brand_tone"] | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          ai_generated: boolean | null
          business_id: string
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          business_id: string
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          business_id?: string
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          business_id: string
          created_at: string
          id: string
          is_connected: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          business_id: string
          created_at?: string
          id?: string
          is_connected?: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          business_id?: string
          created_at?: string
          id?: string
          is_connected?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"]
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          business_id: string
          id: string
          plan: string
          status: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          business_id: string
          id?: string
          plan?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          business_id?: string
          id?: string
          plan?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          sort_order?: number
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_mode: "autopilot" | "review"
      agent_status: "inactive" | "learning" | "active" | "paused"
      app_role: "admin" | "moderator" | "user"
      brand_tone:
        | "professional"
        | "friendly"
        | "luxury"
        | "playful"
        | "bold"
        | "minimal"
      social_platform:
        | "instagram"
        | "facebook"
        | "twitter"
        | "linkedin"
        | "tiktok"
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
      agent_mode: ["autopilot", "review"],
      agent_status: ["inactive", "learning", "active", "paused"],
      app_role: ["admin", "moderator", "user"],
      brand_tone: [
        "professional",
        "friendly",
        "luxury",
        "playful",
        "bold",
        "minimal",
      ],
      social_platform: [
        "instagram",
        "facebook",
        "twitter",
        "linkedin",
        "tiktok",
      ],
    },
  },
} as const
