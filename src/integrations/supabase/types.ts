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
      chemical_applications: {
        Row: {
          amount: string | null
          application_date: string
          applicator_type: string | null
          chemical_name: string
          created_at: string
          crop_id: string | null
          id: string
          is_approved: boolean | null
          reason: string | null
          user_id: string
        }
        Insert: {
          amount?: string | null
          application_date: string
          applicator_type?: string | null
          chemical_name: string
          created_at?: string
          crop_id?: string | null
          id?: string
          is_approved?: boolean | null
          reason?: string | null
          user_id: string
        }
        Update: {
          amount?: string | null
          application_date?: string
          applicator_type?: string | null
          chemical_name?: string
          created_at?: string
          crop_id?: string | null
          id?: string
          is_approved?: boolean | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chemical_applications_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "user_crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chemical_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_database: {
        Row: {
          common_names: string[] | null
          created_at: string
          crop_name: string
          id: string
          optimal_ph_max: number | null
          optimal_ph_min: number | null
          pest_risks: Json | null
          planting_regions: Json | null
          recommended_rotation: string[] | null
          soil_preference: string | null
        }
        Insert: {
          common_names?: string[] | null
          created_at?: string
          crop_name: string
          id?: string
          optimal_ph_max?: number | null
          optimal_ph_min?: number | null
          pest_risks?: Json | null
          planting_regions?: Json | null
          recommended_rotation?: string[] | null
          soil_preference?: string | null
        }
        Update: {
          common_names?: string[] | null
          created_at?: string
          crop_name?: string
          id?: string
          optimal_ph_max?: number | null
          optimal_ph_min?: number | null
          pest_risks?: Json | null
          planting_regions?: Json | null
          recommended_rotation?: string[] | null
          soil_preference?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          location_consent_given: boolean | null
          location_lat: number | null
          location_lon: number | null
          location_region: string | null
          name: string | null
          soil_report_data: Json | null
          soil_report_date: string | null
          soil_report_location: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          location_consent_given?: boolean | null
          location_lat?: number | null
          location_lon?: number | null
          location_region?: string | null
          name?: string | null
          soil_report_data?: Json | null
          soil_report_date?: string | null
          soil_report_location?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_consent_given?: boolean | null
          location_lat?: number | null
          location_lon?: number | null
          location_region?: string | null
          name?: string | null
          soil_report_data?: Json | null
          soil_report_date?: string | null
          soil_report_location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_crops: {
        Row: {
          area_unit: string | null
          area_value: number | null
          created_at: string
          crop_name: string
          field_lat: number | null
          field_lon: number | null
          field_name: string | null
          id: string
          irrigation_method: string | null
          notes: string | null
          planned_date: string | null
          planting_date: string | null
          planting_method: string | null
          recommendations: Json | null
          seed_source: string | null
          status: string
          suitability_verdict: string | null
          updated_at: string
          user_id: string
          variety: string | null
        }
        Insert: {
          area_unit?: string | null
          area_value?: number | null
          created_at?: string
          crop_name: string
          field_lat?: number | null
          field_lon?: number | null
          field_name?: string | null
          id?: string
          irrigation_method?: string | null
          notes?: string | null
          planned_date?: string | null
          planting_date?: string | null
          planting_method?: string | null
          recommendations?: Json | null
          seed_source?: string | null
          status: string
          suitability_verdict?: string | null
          updated_at?: string
          user_id: string
          variety?: string | null
        }
        Update: {
          area_unit?: string | null
          area_value?: number | null
          created_at?: string
          crop_name?: string
          field_lat?: number | null
          field_lon?: number | null
          field_name?: string | null
          id?: string
          irrigation_method?: string | null
          notes?: string | null
          planned_date?: string | null
          planting_date?: string | null
          planting_method?: string | null
          recommendations?: Json | null
          seed_source?: string | null
          status?: string
          suitability_verdict?: string | null
          updated_at?: string
          user_id?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_crops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
