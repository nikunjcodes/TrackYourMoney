"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  shape: "circle" | "triangle" | "square" | "diamond" | "hexagon"
  rotation: number
  rotationSpeed: number
}

export default function GeometricParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateDimensions()

    // Create particles
    const particles: Particle[] = []
    const particleCount = 60
    const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"]
    const shapes: Particle["shape"][] = ["circle", "triangle", "square", "diamond", "hexagon"]

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 10 + 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.2 + 0.1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      })
    }

    // Draw a particle
    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 1

      switch (particle.shape) {
        case "circle":
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
        case "triangle":
          ctx.beginPath()
          ctx.moveTo(0, -particle.size)
          ctx.lineTo(-particle.size * 0.866, particle.size * 0.5)
          ctx.lineTo(particle.size * 0.866, particle.size * 0.5)
          ctx.closePath()
          ctx.fill()
          break
        case "square":
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          break
        case "diamond":
          ctx.beginPath()
          ctx.moveTo(0, -particle.size)
          ctx.lineTo(particle.size, 0)
          ctx.lineTo(0, particle.size)
          ctx.lineTo(-particle.size, 0)
          ctx.closePath()
          ctx.fill()
          break
        case "hexagon":
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6
            const x = particle.size * Math.cos(angle)
            const y = particle.size * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
          break
      }

      ctx.restore()
    }

    // Connect particles with lines
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 100, 255, ${0.05 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed

        // Bounce off edges
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size
        else if (particle.x < -particle.size) particle.x = canvas.width + particle.size

        if (particle.y > canvas.height + particle.size) particle.y = -particle.size
        else if (particle.y < -particle.size) particle.y = canvas.height + particle.size

        // Draw particle
        drawParticle(particle)
      })

      // Connect particles
      connectParticles()

      requestAnimationFrame(animate)
    }

    // Handle window resize
    const handleResize = () => {
      updateDimensions()
    }

    window.addEventListener("resize", handleResize)
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)" }}
    />
  )
}
