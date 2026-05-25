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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          invoice_id: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_city: string | null
          address_country: string
          address_postal_code: string | null
          address_street: string | null
          administrative_note: string | null
          archived: boolean
          archived_at: string | null
          billing_address_city: string | null
          billing_address_postal_code: string | null
          billing_address_street: string | null
          billing_email: string | null
          btw_number: string | null
          category: string
          company_kvk_number: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          default_service_id: string | null
          discount_type: string | null
          discount_value: number | null
          email: string
          id: string
          name: string
          payment_term_days: number | null
          phone: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_country?: string
          address_postal_code?: string | null
          address_street?: string | null
          administrative_note?: string | null
          archived?: boolean
          archived_at?: string | null
          billing_address_city?: string | null
          billing_address_postal_code?: string | null
          billing_address_street?: string | null
          billing_email?: string | null
          btw_number?: string | null
          category?: string
          company_kvk_number?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_service_id?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email: string
          id?: string
          name: string
          payment_term_days?: number | null
          phone?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_country?: string
          address_postal_code?: string | null
          address_street?: string | null
          administrative_note?: string | null
          archived?: boolean
          archived_at?: string | null
          billing_address_city?: string | null
          billing_address_postal_code?: string | null
          billing_address_street?: string | null
          billing_email?: string | null
          btw_number?: string | null
          category?: string
          company_kvk_number?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_service_id?: string | null
          discount_type?: string | null
          discount_value?: number | null
          email?: string
          id?: string
          name?: string
          payment_term_days?: number | null
          phone?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_default_service_id_fkey"
            columns: ["default_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          client_id: string | null
          created_at: string
          credit_note_number: string
          id: string
          issue_date: string
          original_invoice_id: string | null
          original_invoice_number: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          credit_note_number: string
          id?: string
          issue_date?: string
          original_invoice_id?: string | null
          original_invoice_number?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          credit_note_number?: string
          id?: string
          issue_date?: string
          original_invoice_id?: string | null
          original_invoice_number?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          service_id: string | null
          sort_order: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          service_id?: string | null
          sort_order?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          service_id?: string | null
          sort_order?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          auto_reminder_enabled: boolean
          client_id: string | null
          created_at: string
          discount_amount: number
          discount_type: string | null
          discount_value: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          last_reminder_sent_at: string | null
          mollie_payment_id: string | null
          mollie_payment_url: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_token: string | null
          po_number: string | null
          reminder_count: number
          reminder_days: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reminder_enabled?: boolean
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          last_reminder_sent_at?: string | null
          mollie_payment_id?: string | null
          mollie_payment_url?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_token?: string | null
          po_number?: string | null
          reminder_count?: number
          reminder_days?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reminder_enabled?: boolean
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          last_reminder_sent_at?: string | null
          mollie_payment_id?: string | null
          mollie_payment_url?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_token?: string | null
          po_number?: string | null
          reminder_count?: number
          reminder_days?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          archived: boolean
          archived_at: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          price_type: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          archived?: boolean
          archived_at?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          price_type?: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          archived?: boolean
          archived_at?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          price_type?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          client_id: string | null
          created_at: string
          date: string
          description: string
          hourly_rate: number | null
          hours: number
          id: string
          internal_note: string | null
          invoice_id: string | null
          service_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date: string
          description: string
          hourly_rate?: number | null
          hours: number
          id?: string
          internal_note?: string | null
          invoice_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          internal_note?: string | null
          invoice_id?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address_city: string | null
          address_country: string
          address_postal_code: string | null
          address_street: string | null
          allow_future_time_entries: boolean
          auto_reminder_enabled: boolean
          auto_save_concept: boolean
          bcc_email: string | null
          btw_vrijgesteld: boolean
          btw_vrijstelling_tekst: string
          company_name: string | null
          created_at: string
          email: string
          email_subject_template: string
          expo_push_token: string | null
          first_name: string
          iban: string | null
          id: string
          invoice_current_number: number
          invoice_prefix: string
          invoice_start_number: number
          kvk_number: string | null
          logo_url: string | null
          mollie_api_key_encrypted: string | null
          mollie_enabled: boolean
          mollie_payment_methods: string[]
          notification_preferences: Json
          onboarding_completed: boolean
          payment_term_days: number
          privacy_accepted_at: string | null
          round_hours_to_quarter: boolean
          show_discount_on_invoice: boolean
          show_hourly_amount: boolean
          show_internal_note_uren: boolean
          show_invoice_note: boolean
          show_invora_branding: boolean
          show_logo_on_timesheet: boolean
          show_po_number_field: boolean
          standard_invoice_note: string | null
          stripe_customer_id: string | null
          subscription_status: string
          terms_accepted_at: string | null
          trial_ends_at: string
          updated_at: string
          warn_old_time_entries: boolean
        }
        Insert: {
          address_city?: string | null
          address_country?: string
          address_postal_code?: string | null
          address_street?: string | null
          allow_future_time_entries?: boolean
          auto_reminder_enabled?: boolean
          auto_save_concept?: boolean
          bcc_email?: string | null
          btw_vrijgesteld?: boolean
          btw_vrijstelling_tekst?: string
          company_name?: string | null
          created_at?: string
          email: string
          email_subject_template?: string
          expo_push_token?: string | null
          first_name?: string
          iban?: string | null
          id: string
          invoice_current_number?: number
          invoice_prefix?: string
          invoice_start_number?: number
          kvk_number?: string | null
          logo_url?: string | null
          mollie_api_key_encrypted?: string | null
          mollie_enabled?: boolean
          mollie_payment_methods?: string[]
          notification_preferences?: Json
          onboarding_completed?: boolean
          payment_term_days?: number
          privacy_accepted_at?: string | null
          round_hours_to_quarter?: boolean
          show_discount_on_invoice?: boolean
          show_hourly_amount?: boolean
          show_internal_note_uren?: boolean
          show_invoice_note?: boolean
          show_invora_branding?: boolean
          show_logo_on_timesheet?: boolean
          show_po_number_field?: boolean
          standard_invoice_note?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          trial_ends_at?: string
          updated_at?: string
          warn_old_time_entries?: boolean
        }
        Update: {
          address_city?: string | null
          address_country?: string
          address_postal_code?: string | null
          address_street?: string | null
          allow_future_time_entries?: boolean
          auto_reminder_enabled?: boolean
          auto_save_concept?: boolean
          bcc_email?: string | null
          btw_vrijgesteld?: boolean
          btw_vrijstelling_tekst?: string
          company_name?: string | null
          created_at?: string
          email?: string
          email_subject_template?: string
          expo_push_token?: string | null
          first_name?: string
          iban?: string | null
          id?: string
          invoice_current_number?: number
          invoice_prefix?: string
          invoice_start_number?: number
          kvk_number?: string | null
          logo_url?: string | null
          mollie_api_key_encrypted?: string | null
          mollie_enabled?: boolean
          mollie_payment_methods?: string[]
          notification_preferences?: Json
          onboarding_completed?: boolean
          payment_term_days?: number
          privacy_accepted_at?: string | null
          round_hours_to_quarter?: boolean
          show_discount_on_invoice?: boolean
          show_hourly_amount?: boolean
          show_internal_note_uren?: boolean
          show_invoice_note?: boolean
          show_invora_branding?: boolean
          show_logo_on_timesheet?: boolean
          show_po_number_field?: boolean
          standard_invoice_note?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          trial_ends_at?: string
          updated_at?: string
          warn_old_time_entries?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_credit_note_number: {
        Args: { p_user_id: string; p_year?: number }
        Returns: string
      }
      generate_invoice_number: {
        Args: { p_user_id: string; p_year?: number }
        Returns: string
      }
      get_dashboard_stats: { Args: { p_user_id: string }; Returns: Json }
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
