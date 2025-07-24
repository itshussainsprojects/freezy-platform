'use client'

import { useEffect, useState, useRef } from 'react'

interface ScrollAnimationsProps {
  children: React.ReactNode
}

export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Parallax Background Elements */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
        {/* Floating Orbs with Parallax */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${15 + (i * 12) % 70}%`,
              top: `${20 + (i * 17) % 60}%`,
              width: `${20 + (i % 3) * 10}px`,
              height: `${20 + (i % 3) * 10}px`,
              background: `radial-gradient(circle, 
                hsl(${180 + (i * 20) % 60}, 100%, 60%) 0%, 
                hsl(${180 + (i * 20) % 60}, 100%, 40%) 50%, 
                transparent 70%
              )`,
              opacity: 0.4 + (i % 3) * 0.1,
              transform: `
                translateY(${scrollY * (0.2 + (i % 3) * 0.1)}px) 
                translateX(${Math.sin(scrollY * 0.001 + i) * 20}px)
                scale(${1 + Math.sin(scrollY * 0.002 + i) * 0.2})
              `,
              filter: 'blur(1px)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 2)}s`
            }}
          />
        ))}
      </div>

      {/* Scroll-triggered 3D Elements */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 perspective-1000"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      >
        {/* 3D Cubes that appear on scroll */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`cube-${i}`}
            className="absolute preserve-3d"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${30 + (i * 25) % 40}%`,
              width: '40px',
              height: '40px',
              opacity: Math.max(0, Math.min(1, (scrollY - i * 200) / 300)),
              transform: `
                rotateX(${45 + scrollY * 0.1 + i * 30}deg) 
                rotateY(${45 + scrollY * 0.15 + i * 45}deg) 
                translateZ(${50 + i * 20}px)
                scale(${0.5 + Math.min(1, (scrollY - i * 200) / 400)})
              `,
              transition: 'opacity 0.3s ease-out'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-cyan-600/30 border border-cyan-400/50 rounded shadow-cyan-glow transform translateZ-5" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/40 rounded shadow-cyan-glow transform rotateY-90 translateZ-5" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 to-cyan-600/15 border border-cyan-400/30 rounded shadow-cyan-glow transform rotateX-90 translateZ-5" />
          </div>
        ))}

        {/* Floating Rings */}
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`ring-${i}`}
            className="absolute"
            style={{
              right: `${10 + i * 20}%`,
              top: `${40 + i * 15}%`,
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              opacity: Math.max(0, Math.min(0.6, (scrollY - (i + 2) * 300) / 400)),
              transform: `
                rotateX(${scrollY * 0.08 + i * 60}deg) 
                rotateY(${scrollY * 0.12 + i * 90}deg) 
                translateZ(${30 + i * 15}px)
              `
            }}
          >
            <div 
              className="w-full h-full border-4 rounded-full animate-pulse"
              style={{
                borderColor: `hsl(${200 + i * 30}, 100%, 60%)`,
                boxShadow: `0 0 20px hsl(${200 + i * 30}, 100%, 60%)`
              }}
            >
              <div 
                className="w-1/2 h-1/2 border-2 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  borderColor: `hsl(${200 + i * 30}, 100%, 70%)`,
                  boxShadow: `0 0 10px hsl(${200 + i * 30}, 100%, 70%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Wave Distortion Effect */}
      <div 
        className="fixed bottom-0 left-0 w-full h-64 pointer-events-none z-0 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      >
        <div 
          className="absolute bottom-0 left-0 w-full h-full opacity-20"
          style={{
            background: `
              linear-gradient(
                ${45 + scrollY * 0.05}deg,
                transparent 0%,
                #00ffff20 20%,
                #0099ff20 40%,
                #3366ff20 60%,
                #6600ff20 80%,
                transparent 100%
              )
            `,
            transform: `
              translateY(${Math.sin(scrollY * 0.005) * 30}px) 
              scaleY(${1 + Math.sin(scrollY * 0.003) * 0.5})
              skewX(${Math.sin(scrollY * 0.002) * 10}deg)
            `,
            borderRadius: '50% 50% 0 0',
            filter: 'blur(2px)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-3/4 opacity-15"
          style={{
            background: `
              linear-gradient(
                ${-45 + scrollY * 0.03}deg,
                transparent 0%,
                #0099ff15 30%,
                #3366ff15 60%,
                transparent 100%
              )
            `,
            transform: `
              translateY(${Math.sin(scrollY * 0.007 + 1) * 25}px) 
              scaleY(${1 + Math.sin(scrollY * 0.004 + 1) * 0.4})
              skewX(${Math.sin(scrollY * 0.003 + 1) * 8}deg)
            `,
            borderRadius: '60% 40% 0 0',
            filter: 'blur(1px)'
          }}
        />
      </div>

      {/* Content with enhanced z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Hook for scroll-based animations
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      setScrollY(currentScrollY)
      setScrollProgress(Math.min(currentScrollY / maxScroll, 1))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollY, scrollProgress }
}
