'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { getProfileByUsername, getUserProfile, updateUserProfile, UserProfile } from '@/lib/users'
import { getEntriesByUser, Entry } from '@/lib/posts'
import { supabase } from '@/lib/supabase'
import EntryCard from '@/components/EntryCard'
import Navbar from '@/components/Navbar'
import PageBackground from '@/components/PageBackground'
import GlassSurface from '@/components/GlassSurface'

export default function UserProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()
  const username = params?.username as string

  useEffect(() => {
    const loadData = async () => {
      // Check auth first
      const { session } = await getSession()
      if (!session) {
        router.push('/login')
        return
      }

      if (!username) {
        setError('Invalid username')
        setIsLoading(false)
        return
      }

      // Check if viewing own profile
      const { user } = await getCurrentUser()
      const { data: ownProfile } = await getUserProfile()
      const viewingOwnProfile = ownProfile?.username.toLowerCase() === username.toLowerCase()

      // Load profile
      const { data: profileData, error: profileError } = await getProfileByUsername(username)
      if (profileError || !profileData) {
        setError('User not found')
        setIsLoading(false)
        return
      }

      setProfile(profileData)
      setIsOwnProfile(viewingOwnProfile)
      setBio(profileData.bio || '')

      // Load user's public entries
      const { data: entriesData, error: entriesError } = await getEntriesByUser(profileData.user_id)
      if (entriesError) {
        setError(entriesError.message)
      } else {
        setEntries(entriesData)
      }
      setIsLoading(false)
    }
    loadData()
  }, [username, router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        setError('Not authenticated')
        setUploading(false)
        return
      }

      if (profile?.profile_picture_url) {
        const oldUrl = profile.profile_picture_url
        const fileName = oldUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('profile-pictures').remove([`${user.id}/${fileName}`])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        setError(uploadError.message || 'Failed to upload image')
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      if (urlData?.publicUrl) {
        const { error: updateError } = await updateUserProfile({
          profile_picture_url: urlData.publicUrl
        })

        if (updateError) {
          setError(updateError.message || 'Failed to update profile')
        } else {
          setProfile({ ...profile!, profile_picture_url: urlData.publicUrl })
        }
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePicture = async () => {
    if (!profile?.profile_picture_url) return

    setUploading(true)
    setError('')

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        setError('Not authenticated')
        setUploading(false)
        return
      }

      const oldUrl = profile.profile_picture_url
      const fileName = oldUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('profile-pictures').remove([`${user.id}/${fileName}`])
      }

      const { error: updateError } = await updateUserProfile({
        profile_picture_url: null
      })

      if (updateError) {
        setError(updateError.message || 'Failed to remove picture')
      } else {
        setProfile({ ...profile, profile_picture_url: null })
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await updateUserProfile({ bio: bio.trim() || null })
      if (updateError) {
        setError(updateError.message || 'Failed to update profile')
      } else {
        setProfile({ ...profile!, bio: bio.trim() || null })
        setIsEditing(false)
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setBio(profile?.bio || '')
    setIsEditing(false)
    setError('')
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

  if (error || !profile) {
    return (
      <PageBackground>
        <Navbar />
        <main className="w-full px-4" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
          <div className="parchment-container" style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
            <div className="text-center py-12" style={{ color: '#f5f5f0' }}>
              {error || 'User not found'}
            </div>
          </div>
        </main>
      </PageBackground>
    )
  }

  const initials = profile.username?.charAt(0).toUpperCase() || '?'
  const dateJoined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <PageBackground>
      <Navbar />
      <main className="w-full px-4" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="parchment-container" style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
          {!isEditing ? (
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={20}
              brightness={40}
              opacity={0.7}
              blur={15}
              displace={0.3}
              distortionScale={-200}
              redOffset={0}
              greenOffset={8}
              blueOffset={15}
              mixBlendMode="screen"
              backgroundOpacity={0.3}
              className="p-8 mb-8"
              style={{
                position: 'relative',
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-4 mb-4"
                  style={{
                    borderColor: 'rgba(124, 151, 191, 0.8)',
                    backgroundColor: profile.profile_picture_url ? 'transparent' : 'rgba(124, 151, 191, 0.6)',
                    opacity: 1
                  }}
                >
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                      style={{ opacity: 1 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 151, 191, 0.6)', opacity: 1 }}>
                      <span style={{ color: '#f5f5f0', fontSize: '36px', fontWeight: 500, opacity: 1 }}>{initials}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-light mb-2 starboard-title" style={{ color: '#f5f5f0', opacity: 1 }}>
                  @{profile.username}
                </h1>
                <p className="text-sm mb-4" style={{ color: '#f5f5f0', opacity: 1 }}>
                  Joined {dateJoined}
                </p>
                {profile.bio && (
                  <p className="text-center max-w-md mb-6" style={{ color: '#f5f5f0', opacity: 1 }}>
                    {profile.bio}
                  </p>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: '#7c97bf',
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(124, 151, 191, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#6b87ad'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c97bf'
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </GlassSurface>
          ) : (
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
              <div className="flex flex-col items-center space-y-6">
                <div className="flex flex-col items-center">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 mb-4 cursor-pointer transition-all"
                    style={{
                      borderColor: 'rgba(124, 151, 191, 0.5)',
                      backgroundColor: profile.profile_picture_url ? 'transparent' : 'rgba(124, 151, 191, 0.3)'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c97bf'
                      e.currentTarget.style.opacity = '0.8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(124, 151, 191, 0.5)'
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {profile.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 151, 191, 0.3)' }}>
                        <span style={{ color: '#f5f5f0', fontSize: '48px', fontWeight: 500 }}>{initials}</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: '#7c97bf',
                        color: '#ffffff',
                        border: 'none'
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Change Picture'}
                    </button>
                    {profile.profile_picture_url && (
                      <button
                        type="button"
                        onClick={handleRemovePicture}
                        disabled={uploading}
                        className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                        style={{
                          backgroundColor: 'rgba(255, 229, 229, 0.7)',
                          color: '#cc6666',
                          border: '1px solid rgba(255, 204, 204, 0.8)'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <label className="block mb-2 text-sm" style={{ color: '#f5f5f0' }}>
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-5 py-4 rounded-lg resize-none focus:outline-none transition-all"
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
                  <p className="text-xs mt-1" style={{ color: '#f5f5f0', opacity: 0.7 }}>
                    {bio.length}/500 characters
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg p-4 text-sm w-full max-w-md" style={{
                    backgroundColor: 'rgba(255, 229, 229, 0.6)',
                    border: '1px solid rgba(255, 204, 204, 0.8)',
                    color: '#cc6666'
                  }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 text-lg"
                    style={{
                      backgroundColor: loading ? 'rgba(124, 151, 191, 0.4)' : '#7c97bf',
                      border: 'none',
                      color: '#ffffff',
                      boxShadow: loading ? 'none' : '0 4px 16px rgba(124, 151, 191, 0.4)'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-lg font-light transition-all"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#f5f5f0'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassSurface>
          )}

          <h2 className="text-xl font-light mb-6 starboard-title" style={{ color: '#f5f5f0' }}>
            Public Entries
          </h2>

          {entries && entries.length === 0 && (
            <div className="text-center py-12" style={{ color: '#f5f5f0', opacity: 0.7 }}>
              No public entries yet.
            </div>
          )}

          <div className="space-y-4">
            {entries?.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
