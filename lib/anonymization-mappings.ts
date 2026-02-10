import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface AnonymizationMapping {
  id: string
  user_id: string
  original: string
  pseudonym: string
  created_at: string
}

export async function getAnonymizationMappings() {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('anonymization_mappings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createAnonymizationMapping(original: string, pseudonym: string) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  // Normalize original for uniqueness check
  const normalizedOriginal = original.toLowerCase().trim()

  // Check if mapping already exists for this user
  const { data: existing } = await supabase
    .from('anonymization_mappings')
    .select('id')
    .eq('user_id', user.id)
    .eq('original', normalizedOriginal)
    .single()

  if (existing) {
    // Update existing mapping
    const { data, error } = await supabase
      .from('anonymization_mappings')
      .update({ pseudonym: pseudonym.trim() })
      .eq('id', existing.id)
      .select()
      .single()

    return { data, error }
  }

  // Create new mapping
  const { data, error } = await supabase
    .from('anonymization_mappings')
    .insert([
      {
        user_id: user.id,
        original: normalizedOriginal,
        pseudonym: pseudonym.trim(),
      },
    ])
    .select()
    .single()

  return { data, error }
}

export async function deleteAnonymizationMapping(id: string) {
  const { user } = await getCurrentUser()

  if (!user) {
    return { error: { message: 'Not authenticated' } }
  }

  const { error } = await supabase
    .from('anonymization_mappings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error }
}
