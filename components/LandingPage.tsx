'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import GlassSurface from './GlassSurface'
import FloatingParticles from './FloatingParticles'

const Dither = dynamic(() => import('./Dither'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a1929] z-0" />
  )
})

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dither Background */}
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Dither
          waveColor={[0.5, 0.7, 1]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.2}
          colorNum={7.9}
          waveAmplitude={0.31}
          waveFrequency={2.8}
          waveSpeed={0.01}
        />
      </div>

      {/* Optional overlay for better text readability */}
      <div className="fixed inset-0 bg-black/10 z-[1]" />

      {/* Floating Particles */}
      <FloatingParticles count={80} />

      <div className="w-full max-w-4xl text-center relative z-10">
        {/* Starboard Title with Glass Effect */}
        <div className="inline-block mb-16">
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={30}
            brightness={60}
            opacity={0.85}
            blur={15}
            displace={0.3}
            distortionScale={-200}
            redOffset={0}
            greenOffset={8}
            blueOffset={15}
            mixBlendMode="screen"
            className="px-12 py-8"
            style={{
              display: 'inline-block',
            }}
          >
            <h1 className="text-7xl md:text-9xl starboard-title" style={{ color: '#f5f5f0', letterSpacing: '0.05em' }}>
              Starboard
            </h1>
          </GlassSurface>
        </div>

        {/* Buttons with Glass Effect */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/login" className="no-underline">
            <GlassSurface
              width="auto"
              height={56}
              borderRadius={50}
              brightness={60}
              opacity={0.85}
              blur={15}
              displace={0.3}
              distortionScale={-200}
              redOffset={0}
              greenOffset={8}
              blueOffset={15}
              mixBlendMode="screen"
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={{
                padding: '0 32px',
                minWidth: '160px',
                color: '#f5f5f0',
              }}
            >
              <span className="text-lg font-medium">Log In</span>
            </GlassSurface>
          </Link>
          <Link href="/login?signup=true" className="no-underline">
            <GlassSurface
              width="auto"
              height={56}
              borderRadius={50}
              brightness={60}
              opacity={0.85}
              blur={15}
              displace={0.3}
              distortionScale={-200}
              redOffset={0}
              greenOffset={8}
              blueOffset={15}
              mixBlendMode="screen"
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={{
                padding: '0 32px',
                minWidth: '160px',
                color: '#f5f5f0',
              }}
            >
              <span className="text-lg font-medium">Sign Up</span>
            </GlassSurface>
          </Link>
        </div>
      </div>
    </div>
  )
}
