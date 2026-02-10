import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup' or 'recovery'

  if (code) {
    const cookieStore = cookies()

    // Create Supabase client with type assertion to bypass TypeScript error
    // The cookies option is valid at runtime but not in TypeScript types for this version
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Successfully confirmed and signed in
      // Redirect to home - the session should be available
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    } else if (!error && type === 'signup') {
      // Email confirmed but no session yet - redirect to login with success message
      return NextResponse.redirect(new URL('/login?confirmed=true', requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=confirmation_failed', requestUrl.origin))
}
