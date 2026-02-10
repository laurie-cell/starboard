'use client'

import { useState, useEffect } from 'react'
import { createEntry } from '@/lib/posts'
import { getSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PageBackground from '@/components/PageBackground'
import GlassSurface from '@/components/GlassSurface'

export default function WritePage() {
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [anonymize, setAnonymize] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
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

      setCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const { error } = await createEntry(content.trim(), isPublic, anonymize)
      if (error) {
        setError(error.message || 'Failed to create entry')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-light mb-8 starboard-title" style={{ color: '#f5f5f0', position: 'relative', zIndex: 1 }}>Write Entry</h1>
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
            className="p-6"
            style={{ position: 'relative', zIndex: 1 }}
          >
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={12}
              className="w-full px-5 py-4 rounded-lg resize-none focus:outline-none transition-all write-textarea"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 1)',
                border: '1px solid rgba(124, 151, 191, 0.3)',
                color: '#5a5a5a',
                fontFamily: 'inherit'
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
            <div className="flex items-center gap-6 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#f5f5f0' }}
                />
                <span style={{ color: '#f5f5f0', fontSize: '14px' }}>
                  {isPublic ? 'Public' : 'Private'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymize}
                  onChange={(e) => setAnonymize(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#7c97bf' }}
                />
                <span style={{ color: '#f5f5f0', fontSize: '14px' }}>
                  Anonymize
                </span>
              </label>
            </div>
            {error && (
              <div className="text-sm" style={{ color: '#ff9999' }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-8 py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{
                backgroundColor: loading || !content.trim() ? 'rgba(124, 151, 191, 0.4)' : '#7c97bf',
                border: loading || !content.trim() ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                boxShadow: loading || !content.trim() ? 'none' : '0 4px 16px rgba(124, 151, 191, 0.4), 0 0 20px rgba(124, 151, 191, 0.2)',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                if (!loading && content.trim()) {
                  e.currentTarget.style.backgroundColor = '#6b87ad'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 151, 191, 0.5), 0 0 25px rgba(124, 151, 191, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && content.trim()) {
                  e.currentTarget.style.backgroundColor = '#7c97bf'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 151, 191, 0.4), 0 0 20px rgba(124, 151, 191, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </form>
        </GlassSurface>
        </div>
      </main>
    </PageBackground>
  )
}
