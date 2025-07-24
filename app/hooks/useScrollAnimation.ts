'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScrollAnimationConfig {
  threshold?: number
  rootMargin?: string
}

export function useScrollAnimation(config: ScrollAnimationConfig = {}) {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 'down' : 'up'
      
      setScrollY(currentScrollY)
      setScrollDirection(direction)
      
      // Calculate scroll progress (0 to 1)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(currentScrollY / maxScroll, 1)
      setScrollProgress(progress)
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    scrollY,
    scrollDirection,
    scrollProgress
  }
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px',
        ...options
      }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [elementRef, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Hook for scroll-triggered animations
export function useScrollTrigger(triggerPoint: number = 0.5) {
  const [isTriggered, setIsTriggered] = useState(false)
  const { scrollProgress } = useScrollAnimation()

  useEffect(() => {
    if (scrollProgress >= triggerPoint && !isTriggered) {
      setIsTriggered(true)
    }
  }, [scrollProgress, triggerPoint, isTriggered])

  return isTriggered
}

// Hook for parallax effects
export function useParallax(speed: number = 0.5) {
  const { scrollY } = useScrollAnimation()
  
  const parallaxOffset = scrollY * speed
  
  return {
    transform: `translateY(${parallaxOffset}px)`
  }
}
