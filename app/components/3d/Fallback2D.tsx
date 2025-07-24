'use client'

import { useEffect, useState } from 'react'

export default function Fallback2D() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    opacity: number
    speed: number
  }>>([])

  useEffect(() => {
    // Create 2D particles as fallback
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 2 + 0.5
    }))
    
    setParticles(newParticles)

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y > 100 ? -5 : particle.y + particle.speed * 0.1,
        opacity: 0.2 + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
      })))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 2D Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
      
      {/* 2D Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px rgba(0, 255, 255, 0.5)`,
            transition: 'all 0.1s ease-out'
          }}
        />
      ))}
      
      {/* 2D Geometric Shapes */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-cyan-400/30 rotate-45 animate-spin-slow" />
      <div className="absolute top-3/4 right-1/4 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce-slow" />
      <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-purple-400/30 transform rotate-12 animate-pulse" />
    </div>
  )
}
