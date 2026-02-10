'use client'

import { useEffect, useRef, useState } from 'react'
import './DitherBackground.css'

interface DitherBackgroundProps {
  waveSpeed?: number
  waveFrequency?: number
  waveAmplitude?: number
  waveColor?: number[]
  colorNum?: number
  pixelSize?: number
  enableMouseInteraction?: boolean
  mouseRadius?: number
}

export default function DitherBackground({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = [0.1, 0.2, 0.4],
  colorNum = 4,
  pixelSize = 2,
  enableMouseInteraction = true,
  mouseRadius = 1
}: DitherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Convert RGB 0-1 to 0-255
  const r = Math.round(waveColor[0] * 255)
  const g = Math.round(waveColor[1] * 255)
  const b = Math.round(waveColor[2] * 255)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Bayer dithering matrix (8x8)
    const bayerMatrix = [
      [0, 48, 12, 60, 3, 51, 15, 63],
      [32, 16, 44, 28, 35, 19, 47, 31],
      [8, 56, 4, 52, 11, 59, 7, 55],
      [40, 24, 36, 20, 43, 27, 39, 23],
      [2, 50, 14, 62, 1, 49, 13, 61],
      [34, 18, 46, 30, 33, 17, 45, 29],
      [10, 58, 6, 54, 9, 57, 5, 53],
      [42, 26, 38, 22, 41, 25, 37, 21]
    ]

    let time = 0

    // Perlin noise-like function using simple noise
    const noise = (x: number, y: number): number => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      return (n - Math.floor(n)) * 2 - 1
    }

    const fbm = (x: number, y: number, octaves: number = 4): number => {
      let value = 0
      let amplitude = 1
      let frequency = waveFrequency
      for (let i = 0; i < octaves; i++) {
        value += amplitude * Math.abs(noise(x * frequency, y * frequency))
        frequency *= waveFrequency
        amplitude *= waveAmplitude
      }
      return value
    }

    const pattern = (x: number, y: number): number => {
      const p2x = x - time * waveSpeed
      const p2y = y - time * waveSpeed
      return fbm(x, y) + fbm(p2x, p2y) * 0.5
    }

    const dither = (x: number, y: number, value: number): number => {
      const bx = Math.floor(x / pixelSize) % 8
      const by = Math.floor(y / pixelSize) % 8
      const threshold = (bayerMatrix[by][bx] / 64.0) - 0.25
      const step = 1.0 / (colorNum - 1)
      const dithered = value + threshold * step
      const bias = 0.2
      const clamped = Math.max(0, Math.min(1, dithered - bias))
      return Math.floor(clamped * (colorNum - 1) + 0.5) / (colorNum - 1)
    }

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      const centerX = width / 2
      const centerY = height / 2
      const aspectRatio = width / height

      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          const nx = (x / width - 0.5) * aspectRatio
          const ny = y / height - 0.5

          let f = pattern(nx, ny)

          if (enableMouseInteraction) {
            const mouseX = (mousePosRef.current.x / width - 0.5) * aspectRatio
            const mouseY = mousePosRef.current.y / height - 0.5
            const dist = Math.sqrt((nx - mouseX) ** 2 + (ny - mouseY) ** 2)
            const effect = 1.0 - Math.min(1.0, dist / (mouseRadius * 0.1))
            f -= 0.5 * effect
          }

          const ditheredValue = dither(x, y, f)
          const colorValue = Math.max(0, Math.min(1, ditheredValue))

          const pixelR = Math.round(r * colorValue)
          const pixelG = Math.round(g * colorValue)
          const pixelB = Math.round(b * colorValue)

          for (let py = 0; py < pixelSize && y + py < height; py++) {
            for (let px = 0; px < pixelSize && x + px < width; px++) {
              const idx = ((y + py) * width + (x + px)) * 4
              data[idx] = pixelR
              data[idx + 1] = pixelG
              data[idx + 2] = pixelB
              data[idx + 3] = 255
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      time += 0.01
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [waveSpeed, waveFrequency, waveAmplitude, r, g, b, colorNum, pixelSize, enableMouseInteraction, mouseRadius])

  useEffect(() => {
    if (!enableMouseInteraction) return

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableMouseInteraction])

  return (
    <canvas
      ref={canvasRef}
      className="dither-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#0a1929'
      }}
    />
  )
}
