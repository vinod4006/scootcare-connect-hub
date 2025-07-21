export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_mobile: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_mobile: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_mobile?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_names: string[] | null
          file_urls: string[] | null
          id: string
          message_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_names?: string[] | null
          file_urls?: string[] | null
          id?: string
          message_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_names?: string[] | null
          file_urls?: string[] | null
          id?: string
          message_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          keywords: string[] | null
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          question?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          courier_partner: string | null
          created_at: string
          customer_email: string | null
          customer_mobile: string
          customer_name: string
          delivery_address: Json
          estimated_delivery_date: string | null
          id: string
          order_amount: number
          order_number: string
          order_status: string
          payment_status: string
          scooter_color: string | null
          scooter_model: string
          special_instructions: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          courier_partner?: string | null
          created_at?: string
          customer_email?: string | null
          customer_mobile: string
          customer_name: string
          delivery_address: Json
          estimated_delivery_date?: string | null
          id?: string
          order_amount: number
          order_number: string
          order_status?: string
          payment_status?: string
          scooter_color?: string | null
          scooter_model: string
          special_instructions?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          courier_partner?: string | null
          created_at?: string
          customer_email?: string | null
          customer_mobile?: string
          customer_name?: string
          delivery_address?: Json
          estimated_delivery_date?: string | null
          id?: string
          order_amount?: number
          order_number?: string
          order_status?: string
          payment_status?: string
          scooter_color?: string | null
          scooter_model?: string
          special_instructions?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          mobile_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          chatbot_response: string
          conversation_id: string | null
          created_at: string
          id: string
          message_id: string | null
          original_question: string
          status: string
          support_query: string
          updated_at: string
          user_feedback: string | null
          user_mobile: string
        }
        Insert: {
          chatbot_response: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          original_question: string
          status?: string
          support_query: string
          updated_at?: string
          user_feedback?: string | null
          user_mobile: string
        }
        Update: {
          chatbot_response?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          original_question?: string
          status?: string
          support_query?: string
          updated_at?: string
          user_feedback?: string | null
          user_mobile?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
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
