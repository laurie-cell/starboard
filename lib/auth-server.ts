import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Test mode: Set to true to bypass authentication for testing
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

// Server-side Supabase client for reading sessions from cookies
async function createServerClient() {
  const cookieStore = await cookies()

  // Use type assertion to bypass TypeScript error
  // The cookies option is valid at runtime but not in TypeScript types for this version
  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Cookie might already be set
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete({ name, ...options })
        } catch (error) {
          // Cookie might not exist
        }
      },
    },
  } as any)
}

export async function getSession() {
  // In test mode, return a mock session
  if (TEST_MODE) {
    return {
      session: {
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'test@example.com',
        },
      },
      error: null,
    }
  }

  const serverClient = await createServerClient()
  const { data: { session }, error } = await serverClient.auth.getSession()
  return { session, error }
}
