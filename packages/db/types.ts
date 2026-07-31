// Generated from the Supabase schema (project my-statuscope-app) via `generate_typescript_types`.
// Regenerate after any migration (see the db-types-sync skill). Do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          actor_identity_id: string | null
          entity_ref: string | null
          entity_type: string | null
          event_type: string
          id: string
          ingested_at: string
          occurred_at: string
          org_id: string
          payload: Json
          project_id: string
          provider: string
        }
        Insert: {
          actor_identity_id?: string | null
          entity_ref?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ingested_at?: string
          occurred_at: string
          org_id: string
          payload: Json
          project_id: string
          provider: string
        }
        Update: {
          actor_identity_id?: string | null
          entity_ref?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ingested_at?: string
          occurred_at?: string
          org_id?: string
          payload?: Json
          project_id?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_identity_id_fkey"
            columns: ["actor_identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          org_id: string | null
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          org_id: string
          primary_email: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          org_id: string
          primary_email?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          org_id?: string
          primary_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_links: {
        Row: {
          external_handle: string
          id: string
          identity_id: string
          provider: string
        }
        Insert: {
          external_handle: string
          id?: string
          identity_id: string
          provider: string
        }
        Update: {
          external_handle?: string
          id?: string
          identity_id?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_links_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token_enc: string
          created_at: string
          external_account_id: string | null
          id: string
          org_id: string
          provider: string
          refresh_token_enc: string | null
          scopes: string[] | null
          status: string
          token_expires_at: string | null
        }
        Insert: {
          access_token_enc: string
          created_at?: string
          external_account_id?: string | null
          id?: string
          org_id: string
          provider: string
          refresh_token_enc?: string | null
          scopes?: string[] | null
          status?: string
          token_expires_at?: string | null
        }
        Update: {
          access_token_enc?: string
          created_at?: string
          external_account_id?: string | null
          id?: string
          org_id?: string
          provider?: string
          refresh_token_enc?: string | null
          scopes?: string[] | null
          status?: string
          token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      project_integrations: {
        Row: {
          config: Json | null
          integration_id: string
          project_id: string
        }
        Insert: {
          config?: Json | null
          integration_id: string
          project_id: string
        }
        Update: {
          config?: Json | null
          integration_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          external_ref: Json | null
          id: string
          name: string
          org_id: string
          settings: Json | null
        }
        Insert: {
          created_at?: string
          external_ref?: Json | null
          id?: string
          name: string
          org_id: string
          settings?: Json | null
        }
        Update: {
          created_at?: string
          external_ref?: Json | null
          id?: string
          name?: string
          org_id?: string
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          cadence: string
          created_at: string
          day_of_week: number | null
          enabled: boolean
          id: string
          org_id: string
          project_id: string
          time_local: string | null
          timezone: string
        }
        Insert: {
          cadence: string
          created_at?: string
          day_of_week?: number | null
          enabled?: boolean
          id?: string
          org_id: string
          project_id: string
          time_local?: string | null
          timezone: string
        }
        Update: {
          cadence?: string
          created_at?: string
          day_of_week?: number | null
          enabled?: boolean
          id?: string
          org_id?: string
          project_id?: string
          time_local?: string | null
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      report_versions: {
        Row: {
          audience: string
          content_json: Json | null
          content_md: string
          created_at: string
          edited_by: string | null
          id: string
          is_current: boolean
          report_id: string
        }
        Insert: {
          audience: string
          content_json?: Json | null
          content_md: string
          created_at?: string
          edited_by?: string | null
          id?: string
          is_current?: boolean
          report_id: string
        }
        Update: {
          audience?: string
          content_json?: Json | null
          content_md?: string
          created_at?: string
          edited_by?: string | null
          id?: string
          is_current?: boolean
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          approved_at: string | null
          cost_cents: number | null
          created_at: string
          digest: Json | null
          generated_by: string | null
          id: string
          org_id: string
          period_end: string | null
          period_start: string | null
          project_id: string
          sent_at: string | null
          state: string
        }
        Insert: {
          approved_at?: string | null
          cost_cents?: number | null
          created_at?: string
          digest?: Json | null
          generated_by?: string | null
          id?: string
          org_id: string
          period_end?: string | null
          period_start?: string | null
          project_id: string
          sent_at?: string | null
          state?: string
        }
        Update: {
          approved_at?: string | null
          cost_cents?: number | null
          created_at?: string
          digest?: Json | null
          generated_by?: string | null
          id?: string
          org_id?: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string
          sent_at?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_flags: {
        Row: {
          entity_ref: string | null
          evidence: Json
          first_detected_at: string
          id: string
          org_id: string
          project_id: string
          resolved_at: string | null
          rule_id: string
          severity: string
          status: string
        }
        Insert: {
          entity_ref?: string | null
          evidence: Json
          first_detected_at?: string
          id?: string
          org_id: string
          project_id: string
          resolved_at?: string | null
          rule_id: string
          severity: string
          status?: string
        }
        Update: {
          entity_ref?: string | null
          evidence?: Json
          first_detected_at?: string
          id?: string
          org_id?: string
          project_id?: string
          resolved_at?: string | null
          rule_id?: string
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_flags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string
          created_at: string
          display_name: string | null
          email: string
          id: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
