export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      questionnaire_junction: {
        Row: {
          id: number
          priority: number | null
          question_id: number | null
          questionnaire_id: number | null
        }
        Insert: {
          id: number
          priority?: number | null
          question_id?: number | null
          questionnaire_id?: number | null
        }
        Update: {
          id?: number
          priority?: number | null
          question_id?: number | null
          questionnaire_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_junction_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_junction_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_questionnaires: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: {
          id: number
          question: Json | null
        }
        Insert: {
          id: number
          question?: Json | null
        }
        Update: {
          id?: number
          question?: Json | null
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          id: number
          is_admin: boolean | null
          password: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_admin?: boolean | null
          password?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_admin?: boolean | null
          password?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_response: {
        Row: {
          created_at: string
          id: number
          questionnaire_junction_id: number
          response: string[]
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          questionnaire_junction_id: number
          response: string[]
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          questionnaire_junction_id?: number
          response?: string[]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_response_questionnaire_junction_id_fkey"
            columns: ["questionnaire_junction_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_junction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_response_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
