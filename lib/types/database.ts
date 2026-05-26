export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string; name: string; slug: string; description: string | null
          capacity: number | null; area_sqm: number | null; floor: number | null
          color: string; hourly_rate: number; daily_rate: number
          is_active: boolean; sort_order: number; notes: string | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: {
          id?: string; name: string; slug: string; description?: string | null
          capacity?: number | null; area_sqm?: number | null; floor?: number | null
          color?: string; hourly_rate?: number; daily_rate?: number
          is_active?: boolean; sort_order?: number; notes?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
        Relationships: []
      }
      customers: {
        Row: {
          id: string; name: string; phone: string | null; email: string | null
          company: string | null; inn: string | null; source: string | null
          notes: string | null; tags: string[]; is_vip: boolean
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: {
          id?: string; name: string; phone?: string | null; email?: string | null
          company?: string | null; inn?: string | null; source?: string | null
          notes?: string | null; tags?: string[]; is_vip?: boolean
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
        Relationships: []
      }
      bookings: {
        Row: {
          id: string; location_id: string; customer_id: string | null
          created_by: string | null; title: string; description: string | null
          type: string; status: string; starts_at: string; ends_at: string
          setup_minutes: number; cleanup_minutes: number; all_day: boolean
          recurring_rule: string | null; recurring_parent_id: string | null
          base_price: number; discount_amount: number; final_price: number
          deposit_amount: number; deposit_paid_at: string | null
          guests_count: number | null; guests_notes: string | null
          color: string | null; notes: string | null; internal_notes: string | null
          created_at: string; updated_at: string; deleted_at: string | null
        }
        Insert: {
          id?: string; location_id: string; customer_id?: string | null
          created_by?: string | null; title: string; description?: string | null
          type: string; status?: string; starts_at: string; ends_at: string
          setup_minutes?: number; cleanup_minutes?: number; all_day?: boolean
          recurring_rule?: string | null; recurring_parent_id?: string | null
          base_price?: number; discount_amount?: number
          deposit_amount?: number; deposit_paid_at?: string | null
          guests_count?: number | null; guests_notes?: string | null
          color?: string | null; notes?: string | null; internal_notes?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: [
          { foreignKeyName: 'bookings_location_id_fkey'; columns: ['location_id']; referencedRelation: 'locations'; referencedColumns: ['id'] },
          { foreignKeyName: 'bookings_customer_id_fkey'; columns: ['customer_id']; referencedRelation: 'customers'; referencedColumns: ['id'] }
        ]
      }
      expenses: {
        Row: {
          id: string; booking_id: string | null; category: string
          amount: number; vendor: string | null; description: string | null
          date: string; receipt_url: string | null; created_by: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; booking_id?: string | null; category: string
          amount: number; vendor?: string | null; description?: string | null
          date: string; receipt_url?: string | null; created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
        Relationships: []
      }
      payments: {
        Row: {
          id: string; invoice_id: string | null; booking_id: string | null
          amount: number; method: string; is_deposit: boolean; is_refund: boolean
          paid_at: string; notes: string | null; created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string; invoice_id?: string | null; booking_id?: string | null
          amount: number; method: string; is_deposit?: boolean; is_refund?: boolean
          paid_at: string; notes?: string | null; created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
