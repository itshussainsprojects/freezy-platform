'use client'

import { useEffect, useState, useRef } from 'react'

interface Interactive3DTextProps {
  text: string
  className?: string
  glowColor?: string
}

export default function Interactive3DText({ 
  text, 
  className = "", 
  glowColor = "#00ffff" 
}: Interactive3DTextProps) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        setMouseX((e.clientX - centerX) / rect.width * 100)
        setMouseY((e.clientY - centerY) / rect.height * 100)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const letters = text.split('')

  return (
    <div 
      ref={textRef}
      className={`relative inline-block perspective-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `
          rotateX(${mouseY * 0.1}deg) 
          rotateY(${mouseX * 0.1}deg)
          scale(${isHovered ? 1.05 : 1})
        `,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {/* Main Text with 3D Effect */}
      <div className="relative preserve-3d">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="inline-block preserve-3d relative"
            style={{
              transform: `
                translateZ(${isHovered ? 20 + index * 2 : 10}px)
                rotateY(${mouseX * 0.05 + index * 2}deg)
                rotateX(${mouseY * 0.03}deg)
              `,
              transition: `transform 0.3s ease-out`,
              transitionDelay: `${index * 0.02}s`,
              textShadow: `
                0 0 10px ${glowColor}80,
                0 0 20px ${glowColor}60,
                0 0 30px ${glowColor}40,
                ${mouseX * 0.1}px ${mouseY * 0.1}px 20px ${glowColor}30
              `
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
            
            {/* 3D Depth Layers */}
            <span 
              className="absolute inset-0 -z-10"
              style={{
                transform: 'translateZ(-2px)',
                color: `${glowColor}60`,
                filter: 'blur(0.5px)'
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
            <span 
              className="absolute inset-0 -z-20"
              style={{
                transform: 'translateZ(-4px)',
                color: `${glowColor}40`,
                filter: 'blur(1px)'
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
            <span 
              className="absolute inset-0 -z-30"
              style={{
                transform: 'translateZ(-6px)',
                color: `${glowColor}20`,
                filter: 'blur(1.5px)'
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </span>
        ))}
      </div>

      {/* Floating Particles around Text */}
      {isHovered && Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-around pointer-events-none"
          style={{
            left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 60}%`,
            top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 40}%`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            backgroundColor: glowColor,
            opacity: 0.6,
            transform: `
              translateZ(${30 + i * 5}px)
              rotate(${i * 30}deg)
              translateX(${Math.sin(Date.now() * 0.001 + i) * 10}px)
            `,
            boxShadow: `0 0 10px ${glowColor}`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${2 + (i % 2)}s`
          }}
        />
      ))}

      {/* Glow Effect Background */}
      <div 
        className="absolute inset-0 -z-40 rounded-lg opacity-30"
        style={{
          background: `
            radial-gradient(
              ellipse at ${50 + mouseX * 0.3}% ${50 + mouseY * 0.3}%,
              ${glowColor}40 0%,
              ${glowColor}20 30%,
              transparent 70%
            )
          `,
          transform: `
            scale(${isHovered ? 1.2 : 1})
            translateZ(-10px)
          `,
          transition: 'all 0.3s ease-out',
          filter: 'blur(20px)'
        }}
      />
    </div>
  )
}

// Component for animated word reveal
export function AnimatedWordReveal({ 
  words, 
  className = "",
  delay = 100 
}: { 
  words: string[]
  className?: string
  delay?: number 
}) {
  const [visibleWords, setVisibleWords] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleWords(prev => {
        if (prev < words.length) {
          return prev + 1
        }
        return 0 // Reset animation
      })
    }, delay * 10)

    return () => clearInterval(timer)
  }, [words.length, delay])

  return (
    <div className={`inline-block ${className}`}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block mr-4"
          style={{
            opacity: index < visibleWords ? 1 : 0,
            transform: `
              translateY(${index < visibleWords ? 0 : 20}px)
              scale(${index < visibleWords ? 1 : 0.8})
            `,
            transition: `all 0.5s ease-out`,
            transitionDelay: `${index * delay}ms`
          }}
        >
          <Interactive3DText 
            text={word} 
            glowColor={`hsl(${180 + index * 20}, 100%, 60%)`}
          />
        </span>
      ))}
    </div>
  )
}
