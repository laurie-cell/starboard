'use client'

import dynamic from 'next/dynamic'
import FloatingParticles from './FloatingParticles'

const Dither = dynamic(() => import('./Dither'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a1929] z-0" />
  )
})

export default function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
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
      <FloatingParticles count={30} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
