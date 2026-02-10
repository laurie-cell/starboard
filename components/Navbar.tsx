'use client'

import Link from 'next/link'
import GlassSurface from './GlassSurface'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20" style={{ padding: '8px' }}>
      <div className="w-full px-4" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', overflow: 'visible' }}>
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={15}
            brightness={60}
            opacity={0.85}
            blur={15}
            displace={0.3}
            distortionScale={-200}
            redOffset={0}
            greenOffset={8}
            blueOffset={15}
            mixBlendMode="screen"
            className="px-6 py-4 navbar-glass"
          >
          <div className="flex items-center justify-between" style={{ position: 'relative' }}>
            <Link href="/" className="text-xl font-light navbar-brand starboard-title" style={{ color: '#f5f5f0' }}>
              Starboard
            </Link>
            <div className="flex items-center gap-6" style={{ position: 'relative', zIndex: 100 }}>
              <Link
                href="/"
                className="transition-opacity font-light"
                style={{ color: '#f5f5f0' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Feed
              </Link>
              <Link
                href="/my-entries"
                className="transition-opacity font-light"
                style={{ color: '#f5f5f0' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                My Entries
              </Link>
              <Link
                href="/write"
                className="transition-opacity font-light"
                style={{ color: '#f5f5f0' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Write
              </Link>
              <Link
                href="/anonymization"
                className="transition-opacity font-light"
                style={{ color: '#f5f5f0' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Anonymization
              </Link>
              <ProfileDropdown />
            </div>
          </div>
        </GlassSurface>
        </div>
      </div>
    </nav>
  )
}
