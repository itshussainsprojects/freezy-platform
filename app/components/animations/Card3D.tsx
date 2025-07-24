'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Card3DProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  linkText: string
  gradientClass: string
  iconBgClass: string
  linkColorClass: string
  index: number
}

export default function Card3D({
  icon,
  title,
  description,
  href,
  linkText,
  gradientClass,
  iconBgClass,
  linkColorClass,
  index
}: Card3DProps) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    setMouseX((e.clientX - centerX) / rect.width * 100)
    setMouseY((e.clientY - centerY) / rect.height * 100)
  }

  return (
    <div 
      ref={cardRef}
      className={`group relative perspective-1000 ${isVisible ? 'animate-card-rise' : 'opacity-0 translate-y-20'}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMouseX(0)
        setMouseY(0)
      }}
      style={{
        transform: `
          rotateX(${mouseY * 0.1}deg) 
          rotateY(${mouseX * 0.1}deg)
          translateZ(${isHovered ? 20 : 0}px)
        `,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {/* Floating Particles around Card */}
      {isHovered && Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-float-particle"
          style={{
            left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 80}%`,
            top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
            width: `${2 + (i % 2)}px`,
            height: `${2 + (i % 2)}px`,
            backgroundColor: `hsl(${180 + index * 30 + i * 10}, 100%, 60%)`,
            opacity: 0.7,
            transform: `translateZ(${30 + i * 5}px)`,
            boxShadow: `0 0 8px currentColor`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${2 + (i % 2)}s`
          }}
        />
      ))}

      {/* 3D Glow Background */}
      <div 
        className={`absolute inset-0 ${gradientClass} rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
        style={{
          transform: `
            translateZ(-10px) 
            scale(${isHovered ? 1.1 : 1})
            rotateX(${mouseY * 0.05}deg) 
            rotateY(${mouseX * 0.05}deg)
          `
        }}
      />

      {/* Main Card with 3D Transform */}
      <div 
        className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 preserve-3d"
        style={{
          transform: `
            translateZ(${isHovered ? 10 : 0}px)
            rotateX(${mouseY * 0.02}deg) 
            rotateY(${mouseX * 0.02}deg)
          `,
          boxShadow: `
            0 ${10 + mouseY * 0.1}px ${30 + Math.abs(mouseX * 0.2)}px rgba(0, 0, 0, 0.1),
            0 ${5 + mouseY * 0.05}px ${15 + Math.abs(mouseX * 0.1)}px rgba(0, 0, 0, 0.05),
            ${mouseX * 0.1}px ${mouseY * 0.1}px ${20}px rgba(0, 255, 255, 0.1)
          `
        }}
      >
        {/* 3D Icon Container */}
        <div 
          className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 ${iconBgClass} rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 glow-effect preserve-3d`}
          style={{
            transform: `
              translateZ(${isHovered ? 15 : 5}px)
              rotateX(${mouseY * 0.1}deg) 
              rotateY(${mouseX * 0.1}deg)
              scale(${isHovered ? 1.1 : 1})
            `,
            boxShadow: `
              0 0 20px rgba(0, 255, 255, 0.3),
              0 ${5 + mouseY * 0.1}px ${15 + Math.abs(mouseX * 0.1)}px rgba(0, 0, 0, 0.2)
            `
          }}
        >
          <div
            style={{
              transform: `
                translateZ(5px)
                rotateX(${mouseY * 0.05}deg) 
                rotateY(${mouseX * 0.05}deg)
              `
            }}
          >
            {icon}
          </div>
        </div>

        {/* 3D Title */}
        <h3 
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900"
          style={{
            transform: `
              translateZ(${isHovered ? 8 : 2}px)
              rotateX(${mouseY * 0.02}deg) 
              rotateY(${mouseX * 0.02}deg)
            `,
            textShadow: `
              ${mouseX * 0.02}px ${mouseY * 0.02}px 4px rgba(0, 0, 0, 0.1)
            `
          }}
        >
          {title}
        </h3>

        {/* 3D Description */}
        <p 
          className="text-gray-700 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed"
          style={{
            transform: `
              translateZ(${isHovered ? 6 : 1}px)
              rotateX(${mouseY * 0.01}deg) 
              rotateY(${mouseX * 0.01}deg)
            `
          }}
        >
          {description}
        </p>

        {/* 3D Link */}
        <Link
          href={href}
          className={`group/link inline-flex items-center ${linkColorClass} font-bold text-base sm:text-lg hover:scale-105 transition-all duration-300`}
          style={{
            transform: `
              translateZ(${isHovered ? 10 : 3}px)
              rotateX(${mouseY * 0.03}deg) 
              rotateY(${mouseX * 0.03}deg)
            `
          }}
        >
          {linkText}
          <ArrowRight 
            className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover/link:translate-x-2 transition-transform" 
            style={{
              transform: `translateZ(2px)`
            }}
          />
        </Link>
      </div>

      {/* 3D Reflection Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 rounded-2xl sm:rounded-3xl pointer-events-none"
        style={{
          transform: `
            translateZ(1px)
            rotateX(${mouseY * 0.01}deg) 
            rotateY(${mouseX * 0.01}deg)
          `,
          opacity: isHovered ? 0.3 : 0.1
        }}
      />
    </div>
  )
}
