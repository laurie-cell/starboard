'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { getUserProfile, UserProfile } from '@/lib/users'
import Image from 'next/image'

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await getUserProfile()
      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
      router.push('/login')
      router.refresh()
      return
    }

    await signOut()
    router.push('/login')
    router.refresh()
  }

  const handleProfileClick = () => {
    if (profile?.username) {
      router.push(`/profile/${profile.username}`)
    }
    setIsOpen(false)
  }

  const handleEditProfile = () => {
    router.push('/profile/edit')
    setIsOpen(false)
  }

  if (loading || !profile) {
    return (
      <div
        className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: 'rgba(124, 151, 191, 0.3)' }}
      >
        <span style={{ color: '#f5f5f0', fontSize: '18px' }}>?</span>
      </div>
    )
  }

  const profilePictureUrl = profile.profile_picture_url || null
  const initials = profile.username?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer"
        style={{
          borderColor: isOpen ? '#7c97bf' : 'rgba(124, 151, 191, 0.3)',
          backgroundColor: profilePictureUrl ? 'transparent' : 'rgba(124, 151, 191, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#7c97bf'
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'rgba(124, 151, 191, 0.3)'
          }
        }}
      >
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 151, 191, 0.3)' }}>
            <span style={{ color: '#f5f5f0', fontSize: '18px', fontWeight: 500 }}>{initials}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124, 151, 191, 0.3)',
            minWidth: '180px',
            zIndex: 1000,
            position: 'absolute'
          }}
        >
          <div className="py-2">
            <button
              onClick={handleEditProfile}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: '#5a5a5a' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(124, 151, 191, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: '#5a5a5a' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 229, 229, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
