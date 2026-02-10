import { supabase } from './supabase'

// Test mode: Set to true to bypass authentication for testing
// Set via environment variable: NEXT_PUBLIC_TEST_MODE=true
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export async function signUp(email: string, password: string, username?: string) {
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectUrl ? {
      emailRedirectTo: redirectUrl,
      data: {
        username: username?.toLowerCase().trim(),
      },
    } : undefined,
  })
  return { data, error }
}

export async function resendConfirmationEmail(email: string) {
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: redirectUrl ? {
      emailRedirectTo: redirectUrl,
    } : undefined,
  })
  return { error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  // In test mode, return a mock user with valid UUID format
  if (TEST_MODE) {
    return {
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
      },
      error: null,
    }
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getSession() {
  // In test mode, return a mock session with valid UUID format
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

  // Use client-side session reading (works in both server and client components)
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}
