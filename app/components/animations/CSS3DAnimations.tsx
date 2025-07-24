'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  z: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  speedZ: number
  color: string
}

export default function CSS3DAnimations() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Create floating particles
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 1000,
      size: Math.random() * 6 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      speedZ: Math.random() * 2 + 1,
      color: `hsl(${180 + Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`
    }))
    
    setParticles(newParticles)

    // Handle scroll
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX + 100) % 100,
        y: (particle.y + particle.speedY + 100) % 100,
        z: particle.z > 1000 ? 0 : particle.z + particle.speedZ,
        opacity: 0.2 + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
      })))
    }, 50)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 153, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(51, 51, 255, 0.2) 0%, transparent 50%)
          `,
          transform: `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.1}deg)`
        }}
      />

      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `
              translateZ(${particle.z}px) 
              translateY(${scrollY * 0.1}px)
              scale(${1 + Math.sin(Date.now() * 0.002 + particle.id) * 0.2})
            `,
            boxShadow: `
              0 0 ${particle.size * 2}px ${particle.color},
              0 0 ${particle.size * 4}px ${particle.color}40
            `,
            filter: 'blur(0.5px)',
            transition: 'all 0.1s ease-out'
          }}
        />
      ))}

      {/* 3D Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Rotating Cubes */}
        <div 
          className="absolute top-1/4 left-1/4 w-16 h-16 animate-spin-3d"
          style={{
            transform: `
              rotateX(${scrollY * 0.2}deg) 
              rotateY(${scrollY * 0.3}deg) 
              translateZ(${50 + scrollY * 0.1}px)
            `,
            background: 'linear-gradient(45deg, #00ffff40, #0099ff40)',
            border: '2px solid #00ffff80',
            borderRadius: '8px',
            boxShadow: '0 0 30px #00ffff40'
          }}
        />

        <div 
          className="absolute top-3/4 right-1/4 w-12 h-12 animate-bounce-3d"
          style={{
            transform: `
              rotateX(${-scrollY * 0.15}deg) 
              rotateZ(${scrollY * 0.25}deg) 
              translateZ(${30 + scrollY * 0.05}px)
            `,
            background: 'linear-gradient(135deg, #0099ff40, #3366ff40)',
            borderRadius: '50%',
            border: '2px solid #0099ff80',
            boxShadow: '0 0 25px #0099ff40'
          }}
        />

        <div 
          className="absolute bottom-1/4 left-1/3 w-20 h-8 animate-float-3d"
          style={{
            transform: `
              rotateY(${scrollY * 0.4}deg) 
              rotateZ(${scrollY * 0.1}deg) 
              translateZ(${20 + scrollY * 0.08}px)
            `,
            background: 'linear-gradient(90deg, #3366ff40, #6600ff40)',
            borderRadius: '20px',
            border: '2px solid #3366ff80',
            boxShadow: '0 0 20px #3366ff40'
          }}
        />
      </div>

      {/* Wave Effect */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32 opacity-20"
        style={{
          background: `
            linear-gradient(
              ${90 + scrollY * 0.1}deg,
              transparent 0%,
              #00ffff20 25%,
              #0099ff20 50%,
              #3366ff20 75%,
              transparent 100%
            )
          `,
          transform: `
            translateY(${Math.sin(scrollY * 0.01) * 20}px) 
            scaleY(${1 + Math.sin(scrollY * 0.005) * 0.3})
          `,
          borderRadius: '50% 50% 0 0'
        }}
      />

      {/* Floating Text Elements */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          transform: `
            translate(-50%, -50%) 
            translateZ(${100 + scrollY * 0.2}px) 
            rotateX(${scrollY * 0.05}deg)
          `,
          opacity: Math.max(0, 1 - scrollY * 0.002)
        }}
      >
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
          ✨
        </div>
      </div>
    </div>
  )
}
