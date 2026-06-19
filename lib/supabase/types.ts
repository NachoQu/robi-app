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
      activities: {
        Row: {
          answers: Json
          base_points: number
          bonus_points: number
          child_profile_id: string
          completed_at: string
          id: string
          video_id: string
        }
        Insert: {
          answers: Json
          base_points: number
          bonus_points: number
          child_profile_id: string
          completed_at?: string
          id?: string
          video_id: string
        }
        Update: {
          answers?: Json
          base_points?: number
          bonus_points?: number
          child_profile_id?: string
          completed_at?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          child_profile_id: string
          earned_at: string
          id: string
          video_id: string
        }
        Insert: {
          child_profile_id: string
          earned_at?: string
          id?: string
          video_id: string
        }
        Update: {
          child_profile_id?: string
          earned_at?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          age: number | null
          avatar: string
          created_at: string
          id: string
          name: string
          total_points: number
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar: string
          created_at?: string
          id?: string
          name: string
          total_points?: number
          user_id: string
        }
        Update: {
          age?: number | null
          avatar?: string
          created_at?: string
          id?: string
          name?: string
          total_points?: number
          user_id?: string
        }
        Relationships: []
      }
      parent_settings: {
        Row: {
          pin_hash: string | null
          user_id: string
        }
        Insert: {
          pin_hash?: string | null
          user_id: string
        }
        Update: {
          pin_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          id: string
          options: Json
          position: number
          question_text: string
          source_quote: string
          video_id: string
        }
        Insert: {
          correct_index: number
          id?: string
          options: Json
          position?: number
          question_text: string
          source_quote: string
          video_id: string
        }
        Update: {
          correct_index?: number
          id?: string
          options?: Json
          position?: number
          question_text?: string
          source_quote?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          child_profile_id: string
          id: string
          redeemed_at: string
          voucher_id: string
        }
        Insert: {
          child_profile_id: string
          id?: string
          redeemed_at?: string
          voucher_id: string
        }
        Update: {
          child_profile_id?: string
          id?: string
          redeemed_at?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      video_assignments: {
        Row: {
          assigned_at: string
          child_profile_id: string
          id: string
          video_id: string
        }
        Insert: {
          assigned_at?: string
          child_profile_id: string
          id?: string
          video_id: string
        }
        Update: {
          assigned_at?: string
          child_profile_id?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_assignments_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_assignments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          id: string
          reject_reason: string | null
          status: string
          title: string | null
          transcript: string | null
          user_id: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          reject_reason?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          user_id: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          id?: string
          reject_reason?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          user_id?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          description: string | null
          id: string
          is_active: boolean
          points_cost: number
          title: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean
          points_cost: number
          title: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean
          points_cost?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_activity: {
        Args: {
          p_answers: Json
          p_child: string
          p_correct: number
          p_video: string
        }
        Returns: {
          base_points: number
          bonus_points: number
          total_points: number
        }[]
      }
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
