'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getAnonymizationMappings, createAnonymizationMapping, deleteAnonymizationMapping, AnonymizationMapping } from '@/lib/anonymization-mappings'
import Navbar from '@/components/Navbar'
import PageBackground from '@/components/PageBackground'
import GlassSurface from '@/components/GlassSurface'

export default function AnonymizationPage() {
  const [mappings, setMappings] = useState<AnonymizationMapping[]>([])
  const [original, setOriginal] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { session } = await getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { getUserProfile } = await import('@/lib/users')
      const { data: profile } = await getUserProfile()
      if (!profile) {
        router.push('/set-username')
        return
      }

      loadMappings()
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const loadMappings = async () => {
    const { data, error } = await getAnonymizationMappings()
    if (error) {
      setError(error.message)
    } else {
      setMappings(data || [])
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!original.trim() || !pseudonym.trim()) {
      setError('Both original name and pseudonym are required')
      return
    }

    if (original.toLowerCase().trim() === pseudonym.toLowerCase().trim()) {
      setError('Original and pseudonym must be different')
      return
    }

    setLoading(true)
    try {
      const { error } = await createAnonymizationMapping(original.trim(), pseudonym.trim())
      if (error) {
        setError(error.message || 'Failed to create mapping')
      } else {
        setOriginal('')
        setPseudonym('')
        await loadMappings()
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return

    const { error } = await deleteAnonymizationMapping(id)
    if (error) {
      setError(error.message || 'Failed to delete mapping')
    } else {
      await loadMappings()
    }
  }

  if (checkingAuth) {
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
          <h1 className="text-2xl font-light mb-8 starboard-title" style={{ color: '#f5f5f0', position: 'relative', zIndex: 1 }}>Anonymization</h1>
          <p className="mb-6" style={{ color: '#f5f5f0', opacity: 0.9, position: 'relative', zIndex: 1 }}>
            Create mappings to anonymize names in your entries. Matching is case-insensitive and permissive.
          </p>

          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={20}
            brightness={60}
            opacity={0.85}
            blur={15}
            displace={0.3}
            distortionScale={-200}
            redOffset={0}
            greenOffset={8}
            blueOffset={15}
            mixBlendMode="screen"
            className="p-6 mb-8"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Original name (e.g., John)"
                    value={original}
                    onChange={(e) => setOriginal(e.target.value)}
                    required
                    className="w-full px-5 py-3 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(124, 151, 191, 0.3)',
                      color: '#2a2a2a'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c97bf'
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 151, 191, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(124, 151, 191, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Pseudonym (e.g., Ethan)"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    required
                    className="w-full px-5 py-3 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(124, 151, 191, 0.3)',
                      color: '#2a2a2a'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c97bf'
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 151, 191, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(124, 151, 191, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-lg p-4 text-sm" style={{
                  backgroundColor: 'rgba(255, 229, 229, 0.6)',
                  border: '1px solid rgba(255, 204, 204, 0.8)',
                }}>
                  <p style={{ color: '#cc6666' }}>{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg font-light transition-all disabled:opacity-50"
                style={{
                  backgroundColor: loading ? '#e0e8f0' : '#7c97bf',
                  border: 'none',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#6b87ad'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#7c97bf'
                  }
                }}
              >
                {loading ? 'Adding...' : 'Add Mapping'}
              </button>
            </form>
          </GlassSurface>

          <div className="space-y-2" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="text-lg font-light mb-4 starboard-title" style={{ color: '#f5f5f0' }}>Your Mappings</h2>
            {mappings.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#f5f5f0', opacity: 0.8 }}>
                No mappings yet. Add your first mapping above.
              </div>
            ) : (
              <div className="space-y-2">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(124, 151, 191, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span style={{ color: '#2a2a2a', fontWeight: 500 }}>{mapping.original}</span>
                      <span style={{ color: '#7c97bf', opacity: 0.8 }}>→</span>
                      <span style={{ color: '#5a7aa0', fontWeight: 500 }}>{mapping.pseudonym}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(mapping.id)}
                      className="text-sm px-3 py-1 rounded transition-colors"
                      style={{
                        color: '#cc6666',
                        backgroundColor: 'rgba(255, 229, 229, 0.6)',
                        border: '1px solid rgba(255, 204, 204, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 204, 204, 0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 229, 229, 0.6)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
