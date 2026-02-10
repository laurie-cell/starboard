'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUserEntries, deleteEntry, Entry } from '@/lib/posts'
import EntryCard from '@/components/EntryCard'
import Navbar from '@/components/Navbar'
import PageBackground from '@/components/PageBackground'

export default function MyEntriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      // Check auth first
      const { session } = await getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Check if user has username
      const { getUserProfile } = await import('@/lib/users')
      const { data: profile } = await getUserProfile()
      if (!profile) {
        router.push('/set-username')
        return
      }

      // Load user entries
      const { data, error: entriesError } = await getUserEntries()
      if (entriesError) {
        setError(entriesError.message)
      } else {
        setEntries(data)
      }
      setIsLoading(false)
    }
    loadData()
  }, [router])

  const handleDelete = async (entryId: string) => {
    setDeletingId(entryId)
    setError(null)

    const { error: deleteError } = await deleteEntry(entryId)

    if (deleteError) {
      setError(deleteError.message || 'Failed to delete entry')
      setDeletingId(null)
    } else {
      // Remove the entry from the local state
      setEntries(prevEntries => prevEntries?.filter(e => e.id !== entryId) || null)
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div style={{ color: '#f5f5f0' }}>Loading...</div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <Navbar />
      <main className="w-full px-4" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="parchment-container" style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
          <h1 className="text-2xl font-light mb-8 starboard-title" style={{ color: '#f5f5f0', position: 'relative', zIndex: 1 }}>My Entries</h1>
          {error && (
            <div className="rounded-lg p-4 mb-4" style={{
              backgroundColor: 'rgba(255, 229, 229, 0.6)',
              border: '1px solid rgba(255, 204, 204, 0.8)',
              color: '#cc6666',
              position: 'relative',
              zIndex: 1
            }}>
              Error loading entries: {error}
            </div>
          )}
          {entries && entries.length === 0 && (
            <div className="text-center py-12" style={{ color: '#5a5a5a', position: 'relative', zIndex: 1 }}>
              No entries yet. <a href="/write" className="hover:underline" style={{ color: '#7c97bf' }}>Write your first entry</a>
            </div>
          )}
          <div className="space-y-4" style={{ position: 'relative', zIndex: 1 }}>
            {entries?.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                showPrivacyLabel={true}
                showDecodeButton={true}
                isOwnEntry={true}
                showDeleteButton={true}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
