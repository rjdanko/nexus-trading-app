// Database Types for Supabase
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    default_risk_percent: number
                    default_account_balance: number
                    preferred_pairs: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    default_risk_percent?: number
                    default_account_balance?: number
                    preferred_pairs?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    default_risk_percent?: number
                    default_account_balance?: number
                    preferred_pairs?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            journal_entries: {
                Row: {
                    id: string
                    user_id: string
                    type: 'simple' | 'technical'
                    title: string
                    content: string | null
                    sentiment: 'bullish' | 'bearish' | 'neutral' | null
                    pair: string | null
                    entry_price: number | null
                    exit_price: number | null
                    stop_loss: number | null
                    take_profit: number | null
                    lot_size: number | null
                    result: 'win' | 'loss' | 'breakeven' | null
                    pnl: number | null
                    pnl_percentage: number | null
                    image_url: string | null
                    tags: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'simple' | 'technical'
                    title: string
                    content?: string | null
                    sentiment?: 'bullish' | 'bearish' | 'neutral' | null
                    pair?: string | null
                    entry_price?: number | null
                    exit_price?: number | null
                    stop_loss?: number | null
                    take_profit?: number | null
                    lot_size?: number | null
                    result?: 'win' | 'loss' | 'breakeven' | null
                    pnl?: number | null
                    pnl_percentage?: number | null
                    image_url?: string | null
                    tags?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'simple' | 'technical'
                    title?: string
                    content?: string | null
                    sentiment?: 'bullish' | 'bearish' | 'neutral' | null
                    pair?: string | null
                    entry_price?: number | null
                    exit_price?: number | null
                    stop_loss?: number | null
                    take_profit?: number | null
                    lot_size?: number | null
                    result?: 'win' | 'loss' | 'breakeven' | null
                    pnl?: number | null
                    pnl_percentage?: number | null
                    image_url?: string | null
                    tags?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "journal_entries_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
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
            entry_type: 'simple' | 'technical'
            sentiment_type: 'bullish' | 'bearish' | 'neutral'
            trade_result: 'win' | 'loss' | 'breakeven'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
export type NewJournalEntry = Database['public']['Tables']['journal_entries']['Insert']
export type UpdateJournalEntry = Database['public']['Tables']['journal_entries']['Update']
