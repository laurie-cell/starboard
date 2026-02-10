import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface Entry {
  id: string
  content: string
  created_at: string
  user_id: string
  is_public: boolean
  username?: string
  is_anonymized?: boolean
  original_content?: string // Store original if anonymized
}

export async function createEntry(content: string, isPublic: boolean = true, anonymize: boolean = false) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  let finalContent = content
  let originalContent: string | null = null
  let isAnonymized = false

  if (anonymize) {
    // Get user's anonymization mappings
    const { getAnonymizationMappings } = await import('@/lib/anonymization-mappings')
    const { anonymizeText } = await import('@/lib/anonymize')
    const { data: mappings } = await getAnonymizationMappings()

    if (mappings && mappings.length > 0) {
      originalContent = content
      finalContent = anonymizeText(content, mappings)
      isAnonymized = true
    }
  }

  const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  const entryData: any = {
    content: finalContent,
    user_id: user.id,
    is_public: isPublic,
    is_anonymized: isAnonymized,
  }

  if (originalContent) {
    entryData.original_content = originalContent
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([entryData])
    .select()
    .single()

  return { data, error }
}

export async function getEntries() {
  // Only get public entries for the feed
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !entries) {
    return { data: null, error }
  }

  // Get unique user IDs
  const userIds = [...new Set(entries.map(e => e.user_id))]

  // Fetch usernames for all users
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, username')
    .in('user_id', userIds)

  // Create a map of user_id -> username
  const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) || [])

  // Enrich entries with usernames
  const enrichedEntries = entries.map(entry => ({
    ...entry,
    username: usernameMap.get(entry.user_id) || 'Anonymous',
  }))

  return { data: enrichedEntries, error: null }
}

export async function getUserEntries() {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  // Get all entries for the current user
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !entries) {
    return { data: null, error }
  }

  // Get username for the current user
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('user_id', user.id)
    .single()

  // Enrich entries with username
  const enrichedEntries = entries.map(entry => ({
    ...entry,
    username: profile?.username || 'Anonymous',
  }))

  return { data: enrichedEntries, error: null }
}

export async function deleteEntry(entryId: string) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  // Delete the entry (RLS will ensure user can only delete their own entries)
  const { data, error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}

export async function getEntriesByUser(userId: string) {
  // Get public entries for a specific user
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !entries) {
    return { data: null, error }
  }

  // Get username for the user
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('user_id', userId)
    .single()

  // Enrich entries with username
  const enrichedEntries = entries.map(entry => ({
    ...entry,
    username: profile?.username || 'Anonymous',
  }))

  return { data: enrichedEntries, error: null }
}
