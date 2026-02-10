import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface UserProfile {
  id: string
  user_id: string
  username: string
  bio?: string | null
  profile_picture_url?: string | null
  created_at: string
}

export async function createUserProfile(username: string) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert([
      {
        user_id: user.id,
        username: username.toLowerCase().trim(),
      },
    ])
    .select()
    .single()

  return { data, error }
}

export async function getUserProfile() {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data, error }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username.toLowerCase().trim())
    .single()

  return !!data
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username.toLowerCase().trim())
    .single()

  return { data, error }
}

export async function updateUserProfile(updates: { bio?: string; profile_picture_url?: string | null }) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}
