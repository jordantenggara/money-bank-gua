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
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          transaction_date: string
          type: "income" | "expense"
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          transaction_date?: string
          type: "income" | "expense"
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          transaction_date?: string
          type?: "income" | "expense"
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
      [_ in never]: never
    }
    Enums: {
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}