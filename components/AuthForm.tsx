'use client'

import { useState, useEffect } from 'react'
import { signIn, signUp, resendConfirmationEmail } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AuthForm({ initialSignUp = false }: { initialSignUp?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(initialSignUp)

  useEffect(() => {
    setIsSignUp(initialSignUp)
  }, [initialSignUp])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Form submitted, isSignUp:', isSignUp)
    setError('')
    setLoading(true)
    setShowConfirmationMessage(false)

    try {
      if (isSignUp) {
        // Validate username
        if (!username.trim()) {
          setError('Username is required')
          setLoading(false)
          return
        }

        if (username.length < 3) {
          setError('Username must be at least 3 characters')
          setLoading(false)
          return
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          setError('Username can only contain letters, numbers, and underscores')
          setLoading(false)
          return
        }

        // Check if username exists
        const { checkUsernameExists } = await import('@/lib/users')
        const usernameExists = await checkUsernameExists(username)
        if (usernameExists) {
          setError('Username already taken. Please choose another.')
          setLoading(false)
          return
        }

        const { data, error } = await signUp(email, password, username)

        if (error) {
          // Handle rate limit errors
          if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setError('Email rate limit exceeded. Please wait a few minutes before trying again, or disable email confirmation in Supabase dashboard for development.')
          } else {
            setError(error.message)
          }
        } else {
          // Check if email confirmation is required
          if (data?.user && !data.session) {
            // Email confirmation required - try to create profile (may fail if user not fully created)
            try {
              const { createUserProfile } = await import('@/lib/users')
              await createUserProfile(username)
            } catch (err) {
              // Will be created after email confirmation or on first login
            }
            setShowConfirmationMessage(true)
          } else if (data?.user && data.session) {
            // User is immediately signed in - create profile
            try {
              const { createUserProfile } = await import('@/lib/users')
              await createUserProfile(username)
            } catch (err) {
              // Profile might already exist
            }
            router.push('/')
            router.refresh()
          } else {
            router.push('/')
            router.refresh()
          }
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) {
          // Provide more helpful error messages
          console.error('Sign in error:', error)
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.')
            setShowConfirmationMessage(true)
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setError('Email rate limit exceeded. Please wait a few minutes before trying again.')
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.')
          } else {
            setError(error.message || 'Failed to sign in. Please try again.')
          }
        } else {
          // Sign in successful - wait longer for session to be stored in cookies
          console.log('Sign in successful, waiting for session to persist...')

          // Wait a bit longer and verify session exists before redirecting
          setTimeout(async () => {
            const { supabase } = await import('@/lib/supabase')
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
              console.log('Session confirmed, redirecting...')
              // Use full page reload to ensure server sees the session
              window.location.href = '/'
            } else {
              console.error('Session not found, retrying...')
              // Retry once more after another delay
              setTimeout(() => {
                window.location.href = '/'
              }, 500)
            }
          }, 1000)
        }
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendingEmail(true)
    setError('')
    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          setError('Email rate limit exceeded. Please wait a few minutes before requesting another email.')
        } else {
          setError(error.message)
        }
      } else {
        setError('')
        alert('Confirmation email sent! Please check your inbox.')
      }
    } catch (err) {
      setError('Failed to resend email')
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isSignUp && (
          <div>
            <input
              type="text"
              placeholder="Username (required)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              className="w-full px-5 py-3 rounded-lg focus:outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f5f5f0'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#f5f5f0', opacity: 0.7 }}>
              3+ characters, letters, numbers, and underscores only
            </p>
          </div>
        )}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 rounded-lg focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f5f5f0',
              fontSize: '16px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 rounded-lg focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f5f5f0',
              fontSize: '16px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
        {error && (
          <div className="rounded-lg p-4 text-sm" style={{
            backgroundColor: 'rgba(255, 229, 229, 0.2)',
            border: '1px solid rgba(255, 204, 204, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ color: '#f5f5f0' }}>{error}</p>
            {error.includes('rate limit') && (
              <div className="mt-2 text-xs" style={{ color: '#f5f5f0', opacity: 0.8 }}>
                <p className="font-semibold mb-1">Quick fixes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Wait 5-10 minutes and try again</li>
                  <li>Disable email confirmation in Supabase Dashboard → Authentication → Settings (for development)</li>
                  <li>Manually confirm your email in Supabase Dashboard → Authentication → Users</li>
                </ul>
              </div>
            )}
          </div>
        )}
        {showConfirmationMessage && (
          <div className="rounded-lg p-4 text-sm" style={{
            backgroundColor: 'rgba(232, 244, 243, 0.2)',
            border: '1px solid rgba(196, 242, 241, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <p className="mb-2" style={{ color: '#f5f5f0' }}>
              Please check your email to confirm your account before signing in.
            </p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendingEmail}
              className="underline text-sm disabled:opacity-50 transition-opacity"
              style={{ color: '#f5f5f0' }}
              onMouseEnter={(e) => {
                if (!resendingEmail) e.currentTarget.style.opacity = '0.7'
              }}
              onMouseLeave={(e) => {
                if (!resendingEmail) e.currentTarget.style.opacity = '1'
              }}
            >
              {resendingEmail ? 'Sending...' : 'Resend confirmation email'}
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg font-light transition-all disabled:opacity-50"
          style={{
            backgroundColor: loading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#f5f5f0',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button
        onClick={() => {
          setIsSignUp(!isSignUp)
          setShowConfirmationMessage(false)
          setError('')
          setUsername('')
        }}
        className="mt-4 text-sm transition-opacity font-light"
        style={{ color: '#f5f5f0', opacity: 0.7 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}
