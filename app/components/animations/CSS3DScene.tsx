'use client'

import { useEffect, useState } from 'react'

export default function CSS3DScene() {
  const [scrollY, setScrollY] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 100)
      setMouseY((e.clientY / window.innerHeight - 0.5) * 100)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated Background Layers */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at ${50 + mouseX * 0.1}% ${50 + mouseY * 0.1}%, rgba(0, 255, 255, 0.4) 0%, transparent 70%),
            radial-gradient(circle at ${30 - mouseX * 0.05}% ${70 - mouseY * 0.05}%, rgba(0, 153, 255, 0.3) 0%, transparent 60%),
            radial-gradient(circle at ${70 + mouseX * 0.08}% ${30 + mouseY * 0.08}%, rgba(51, 51, 255, 0.2) 0%, transparent 50%)
          `,
          transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)`
        }}
      />

      {/* Floating Particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${(i * 7 + 10) % 90}%`,
            top: `${(i * 11 + 15) % 80}%`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            backgroundColor: `hsl(${180 + (i * 15) % 60}, 100%, ${60 + (i % 3) * 10}%)`,
            opacity: 0.6 + Math.sin(i) * 0.3,
            transform: `
              translateZ(${(i % 5) * 20}px) 
              translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px)
              translateX(${mouseX * (0.02 + (i % 2) * 0.01)}px)
            `,
            boxShadow: `0 0 ${8 + (i % 3) * 4}px currentColor`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${3 + (i % 3)}s`
          }}
        />
      ))}

      {/* 3D Geometric Shapes */}
      <div className="absolute inset-0 perspective-1000">
        {/* Rotating Cube */}
        <div 
          className="absolute top-1/4 left-1/4 w-16 h-16 preserve-3d animate-rotate-3d"
          style={{
            transform: `
              rotateX(${45 + scrollY * 0.1 + mouseY * 0.2}deg) 
              rotateY(${45 + scrollY * 0.15 + mouseX * 0.2}deg) 
              translateZ(${50}px)
            `
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 to-cyan-600/40 border-2 border-cyan-400/60 rounded-lg shadow-cyan-glow transform translateZ-8" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-cyan-600/30 border-2 border-cyan-400/50 rounded-lg shadow-cyan-glow transform rotateY-90 translateZ-8" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border-2 border-cyan-400/40 rounded-lg shadow-cyan-glow transform rotateX-90 translateZ-8" />
        </div>

        {/* Floating Sphere */}
        <div 
          className="absolute top-3/4 right-1/4 w-12 h-12 preserve-3d animate-float-sphere"
          style={{
            transform: `
              rotateX(${scrollY * 0.08 + mouseY * 0.15}deg) 
              rotateZ(${scrollY * 0.12 + mouseX * 0.15}deg) 
              translateZ(${30 + Math.sin(scrollY * 0.01) * 20}px)
            `
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400/50 to-blue-600/50 rounded-full border-2 border-blue-400/70 shadow-blue-glow animate-pulse" />
        </div>

        {/* Torus Ring */}
        <div 
          className="absolute bottom-1/4 left-1/3 w-20 h-20 preserve-3d animate-spin-torus"
          style={{
            transform: `
              rotateY(${scrollY * 0.2 + mouseX * 0.3}deg) 
              rotateX(${20 + mouseY * 0.1}deg) 
              translateZ(${40}px)
            `
          }}
        >
          <div className="w-full h-full border-4 border-purple-400/60 rounded-full shadow-purple-glow">
            <div className="w-3/5 h-3/5 border-2 border-purple-300/40 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Pyramid */}
        <div 
          className="absolute top-1/2 right-1/3 w-14 h-14 preserve-3d animate-rotate-pyramid"
          style={{
            transform: `
              rotateX(${30 + scrollY * 0.05}deg) 
              rotateY(${scrollY * 0.25 + mouseX * 0.2}deg) 
              translateZ(${60}px)
            `
          }}
        >
          <div className="pyramid-face pyramid-front bg-gradient-to-br from-emerald-400/40 to-emerald-600/40 border border-emerald-400/60 shadow-emerald-glow" />
          <div className="pyramid-face pyramid-right bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 border border-emerald-400/50 shadow-emerald-glow" />
          <div className="pyramid-face pyramid-back bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/40 shadow-emerald-glow" />
          <div className="pyramid-face pyramid-left bg-gradient-to-br from-emerald-400/25 to-emerald-600/25 border border-emerald-400/45 shadow-emerald-glow" />
        </div>
      </div>

      {/* Wave Layers */}
      <div className="absolute bottom-0 left-0 w-full h-40 overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full h-full opacity-20"
          style={{
            background: `
              linear-gradient(
                ${90 + scrollY * 0.05}deg,
                transparent 0%,
                #00ffff30 30%,
                #0099ff30 60%,
                transparent 100%
              )
            `,
            transform: `
              translateY(${Math.sin(scrollY * 0.01) * 15}px) 
              scaleY(${1 + Math.sin(scrollY * 0.008) * 0.2})
              skewX(${Math.sin(scrollY * 0.005) * 5}deg)
            `,
            borderRadius: '50% 50% 0 0'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-3/4 opacity-15"
          style={{
            background: `
              linear-gradient(
                ${120 + scrollY * 0.08}deg,
                transparent 0%,
                #0099ff25 40%,
                #3366ff25 70%,
                transparent 100%
              )
            `,
            transform: `
              translateY(${Math.sin(scrollY * 0.012 + 1) * 20}px) 
              scaleY(${1 + Math.sin(scrollY * 0.006 + 1) * 0.3})
              skewX(${Math.sin(scrollY * 0.007 + 1) * 3}deg)
            `,
            borderRadius: '60% 40% 0 0'
          }}
        />
      </div>

      {/* Interactive Light Orbs */}
      <div 
        className="absolute w-32 h-32 rounded-full opacity-40 animate-pulse-glow"
        style={{
          left: `${40 + mouseX * 0.3}%`,
          top: `${30 + mouseY * 0.3}%`,
          background: `radial-gradient(circle, #00ffff60 0%, #00ffff20 40%, transparent 70%)`,
          transform: `translateZ(${100 + scrollY * 0.1}px) scale(${1 + Math.sin(scrollY * 0.01) * 0.2})`,
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute w-24 h-24 rounded-full opacity-30 animate-pulse-glow"
        style={{
          right: `${30 - mouseX * 0.2}%`,
          bottom: `${40 - mouseY * 0.2}%`,
          background: `radial-gradient(circle, #0099ff50 0%, #0099ff15 50%, transparent 80%)`,
          transform: `translateZ(${80 + scrollY * 0.08}px) scale(${1 + Math.sin(scrollY * 0.008 + 2) * 0.3})`,
          filter: 'blur(0.5px)',
          animationDelay: '1s'
        }}
      />
    </div>
  )
}
