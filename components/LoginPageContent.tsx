'use client'

import dynamic from 'next/dynamic'
import AuthForm from './AuthForm'
import GlassSurface from './GlassSurface'
import FloatingParticles from './FloatingParticles'

const Dither = dynamic(() => import('./Dither'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a1929] z-0" />
  )
})

interface LoginPageContentProps {
  initialSignUp?: boolean
  confirmed?: boolean
  error?: string
}

export default function LoginPageContent({ initialSignUp = false, confirmed, error }: LoginPageContentProps) {
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
      <FloatingParticles count={30} />

      <div className="w-full max-w-lg relative z-10 flex justify-center">
        <GlassSurface
          width={500}
          height={500}
          borderRadius={250}
          brightness={60}
          opacity={0.85}
          blur={15}
          displace={0.3}
          distortionScale={-200}
          redOffset={0}
          greenOffset={8}
          blueOffset={15}
          mixBlendMode="screen"
          className="py-8 px-8 flex items-center justify-center"
          style={{
            minHeight: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="flex flex-col">
            <div className="text-center mb-8 px-2">
              <h1 className="text-4xl font-light mb-2 starboard-title" style={{ color: '#f5f5f0' }}>
                Welcome
              </h1>
              <p style={{ color: '#f5f5f0', opacity: 0.8 }}>Sign in to your diary</p>
            </div>

            {confirmed && (
              <div className="mb-4 rounded-lg p-4 text-sm mx-2" style={{
                backgroundColor: 'rgba(224, 242, 232, 0.2)',
                border: '1px solid rgba(196, 242, 241, 0.3)',
                color: '#f5f5f0',
                backdropFilter: 'blur(10px)'
              }}>
                Email confirmed! You can now sign in.
              </div>
            )}

            {error === 'confirmation_failed' && (
              <div className="mb-4 rounded-lg p-4 text-sm mx-2" style={{
                backgroundColor: 'rgba(255, 229, 229, 0.2)',
                border: '1px solid rgba(255, 204, 204, 0.3)',
                color: '#f5f5f0',
                backdropFilter: 'blur(10px)'
              }}>
                Confirmation failed. Please try signing in or request a new confirmation email.
              </div>
            )}

            <div className="px-2">
              <AuthForm initialSignUp={initialSignUp} />
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  )
}
