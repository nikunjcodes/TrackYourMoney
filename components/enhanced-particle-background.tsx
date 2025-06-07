"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

const colors = [
  "rgba(37, 99, 235, 0.6)", // blue-600
  "rgba(29, 78, 216, 0.6)", // blue-700
  "rgba(30, 64, 175, 0.6)", // blue-800
  "rgba(30, 58, 138, 0.6)", // blue-900
]

export default function EnhancedParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Create particles
    const createParticles = (canvas: HTMLCanvasElement) => {
      const particles: Particle[] = []
      const particleCount = Math.min(window.innerWidth * window.innerHeight / 12000, 80) // Slightly fewer particles for cleaner look

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5, // Smaller particles
          speedX: (Math.random() - 0.5) * 0.3, // Slower movement
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.3 + 0.1, // Lower opacity
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
      return particles
    }

    particlesRef.current = createParticles(canvas)

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)" // Slower fade for longer trails
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150 // Increased interaction radius

        if (distance < maxDistance) {
          const angle = Math.atan2(dy, dx)
          const force = (maxDistance - distance) / maxDistance
          particle.x -= Math.cos(angle) * force * 1.5 // Gentler repulsion
          particle.y -= Math.sin(angle) * force * 1.5
        }

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle with glow effect
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Create gradient for particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
        
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.opacity
        ctx.fill()

        // Draw connections with gradient
        particlesRef.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) { // Increased connection distance
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            )
            gradient.addColorStop(0, particle.color)
            gradient.addColorStop(1, otherParticle.color)

            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = gradient
            ctx.globalAlpha = (1 - distance / 120) * 0.15 // More subtle connections
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // Reset global alpha
      ctx.globalAlpha = 1

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{
          background: "rgb(0, 0, 0)", // Solid black background
        }}
      />
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: "rgba(37, 99, 235, 0.03)", // Very subtle blue overlay
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: "rgba(37, 99, 235, 0.02)", // Very subtle blue overlay
        }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  )
}
