'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUserProfile, createUserProfile, checkUsernameExists } from '@/lib/users'
import Navbar from '@/components/Navbar'
import PageBackground from '@/components/PageBackground'
import GlassSurface from '@/components/GlassSurface'

export default function SetUsernamePage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkProfile = async () => {
      const { session } = await getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await getUserProfile()
      if (profile) {
        // User already has a username, redirect to home
        router.push('/')
        return
      }

      setChecking(false)
    }
    checkProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setLoading(true)

    try {
      const usernameExists = await checkUsernameExists(username)
      if (usernameExists) {
        setError('Username already taken. Please choose another.')
        setLoading(false)
        return
      }

      const { error: createError } = await createUserProfile(username)
      if (createError) {
        setError(createError.message || 'Failed to create username')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
        <div className="max-w-md mx-auto">
          <div className="parchment-container" style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
            <h1 className="text-2xl font-light mb-2 starboard-title" style={{ color: '#f5f5f0', position: 'relative', zIndex: 1 }}>Choose Your Username</h1>
            <p className="mb-6" style={{ color: '#5a5a5a', opacity: 0.8, position: 'relative', zIndex: 1 }}>
              Your username will be displayed with your entries in the feed.
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
              className="p-6"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    pattern="[a-zA-Z0-9_]+"
                    className="w-full px-5 py-3 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(124, 151, 191, 0.3)',
                      color: '#5a5a5a'
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
                  <p className="text-xs mt-1" style={{ color: '#5a5a5a', opacity: 0.7 }}>
                    3+ characters, letters, numbers, and underscores only
                  </p>
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
                  className="w-full px-4 py-3 rounded-lg font-light transition-all disabled:opacity-50"
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
                  {loading ? 'Setting username...' : 'Continue'}
                </button>
              </form>
            </GlassSurface>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
