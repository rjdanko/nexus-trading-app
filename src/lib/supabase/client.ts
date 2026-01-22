import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    // During build time, return a dummy client that will be replaced at runtime
    if (!supabaseUrl || !supabaseKey) {
        // This happens during static generation - return null client
        // The actual client will be created at runtime when env vars are available
        return createBrowserClient<Database>(
            'https://placeholder.supabase.co',
            'placeholder-key'
        )
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
