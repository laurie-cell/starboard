'use client'

import { useEffect, useRef } from 'react'
import './FloatingParticles.css'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  glow: number
  points: 4 | 8 // 4-pointed or 8-pointed star
  isLarge: boolean // Larger stars with brighter centers
}

export default function FloatingParticles({ count = 30 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < count; i++) {
        const isLarge = Math.random() < 0.3 // 30% chance of being large
        const baseSize = isLarge ? Math.random() * 4 + 3 : Math.random() * 3 + 1 // Large: 3-7px, Small: 1-4px
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: baseSize,
          speedX: (Math.random() - 0.5) * 0.3, // Slow horizontal movement
          speedY: (Math.random() - 0.5) * 0.2 - 0.1, // Slow upward drift
          opacity: isLarge ? Math.random() * 0.4 + 0.6 : Math.random() * 0.6 + 0.3, // Large: 0.6-1.0, Small: 0.3-0.9
          glow: isLarge ? Math.random() * 12 + 8 : Math.random() * 8 + 4, // Large: 8-20px, Small: 4-12px
          points: Math.random() < 0.4 ? 8 : 4, // 40% chance of 8-pointed star
          isLarge
        })
      }
    }

    initParticles()

    // Function to draw a 4-pointed star (more prominent/sharp)
    const drawStar4 = (
      x: number,
      y: number,
      outerRadius: number,
      innerRadius: number,
      fillStyle: string | CanvasGradient
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()

      // Draw 4-pointed star (8 points total: 4 outer, 4 inner)
      // Make inner radius smaller for sharper, more prominent points
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * i) / 4 - Math.PI / 2 // Start from top
        const radius = i % 2 === 0 ? outerRadius : innerRadius * 0.5 // Smaller inner radius for sharper points
        const px = Math.cos(angle) * radius
        const py = Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }

      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
      ctx.restore()
    }

    // Function to draw an 8-pointed star (up/down/left/right more prominent)
    const drawStar8 = (
      x: number,
      y: number,
      outerRadius: number,
      innerRadius: number,
      fillStyle: string | CanvasGradient
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()

      // Draw 8-pointed star (16 points total: 8 outer, 8 inner)
      // Up/down/left/right points are longer (every 4th point)
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * i) / 8 - Math.PI / 2 // Start from top
        let radius: number
        if (i % 2 === 0) {
          // Outer points - make cardinal directions (up/down/left/right) longer
          const isCardinal = i % 4 === 0
          radius = isCardinal ? outerRadius * 1.2 : outerRadius
        } else {
          // Inner points
          radius = innerRadius * 0.6
        }
        const px = Math.cos(angle) * radius
        const py = Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }

      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Outer glow radius for the star
        const outerGlowRadius = particle.glow
        const outerStarRadius = particle.size * 2.5 // Outer points of star
        const innerStarRadius = particle.size * 0.8 // Inner points of star

        // Draw outer glow with gradient
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          outerGlowRadius
        )

        // White/amber colors with bright white center (brighter for large stars)
        const centerOpacity = particle.isLarge ? particle.opacity : particle.opacity * 0.8
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${centerOpacity})`) // Bright white core
        glowGradient.addColorStop(0.2, `rgba(255, 255, 220, ${particle.opacity * 0.7})`) // Warm white
        glowGradient.addColorStop(0.4, `rgba(255, 220, 100, ${particle.opacity * 0.6})`) // Yellow-white
        glowGradient.addColorStop(0.6, `rgba(255, 193, 7, ${particle.opacity * 0.4})`) // Amber
        glowGradient.addColorStop(1, `rgba(255, 193, 7, 0)`) // Transparent edge

        // Draw glow as circular background
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, outerGlowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Draw star shape with gradient
        const starGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          outerStarRadius
        )
        starGradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity})`) // Pure white center
        starGradient.addColorStop(0.3, `rgba(255, 255, 240, ${particle.opacity * 0.9})`) // Warm white
        starGradient.addColorStop(0.6, `rgba(255, 220, 100, ${particle.opacity * 0.7})`) // Yellow-white
        starGradient.addColorStop(1, `rgba(255, 193, 7, ${particle.opacity * 0.5})`) // Amber edges

        // Draw the appropriate star shape
        if (particle.points === 8) {
          drawStar8(particle.x, particle.y, outerStarRadius, innerStarRadius, starGradient)
        } else {
          drawStar4(particle.x, particle.y, outerStarRadius, innerStarRadius, starGradient)
        }

        // Draw bright white center sparkle (larger and brighter for large stars)
        const centerSize = particle.isLarge ? particle.size * 1.2 : particle.size * 0.8
        const centerInnerSize = particle.isLarge ? particle.size * 0.5 : particle.size * 0.3
        const centerOpacityValue = particle.isLarge ? particle.opacity : particle.opacity * 0.9

        const centerGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          centerSize
        )
        centerGradient.addColorStop(0, `rgba(255, 255, 255, ${centerOpacityValue})`) // Pure white center
        centerGradient.addColorStop(0.5, `rgba(255, 255, 240, ${particle.opacity * 0.6})`) // Slight warm tint
        centerGradient.addColorStop(1, `rgba(255, 255, 240, 0)`) // Fade out

        if (particle.points === 8) {
          drawStar8(particle.x, particle.y, centerSize, centerInnerSize, centerGradient)
        } else {
          drawStar4(particle.x, particle.y, centerSize, centerInnerSize, centerGradient)
        }

        // Extra bright white core for large stars
        if (particle.isLarge) {
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="floating-particles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  )
}
