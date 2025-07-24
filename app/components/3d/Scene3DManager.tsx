'use client'

import { useState, useEffect, Component, ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode; onError?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Dynamically import 3D components to avoid SSR issues
const FloatingParticles = dynamic(() => import('./FloatingParticles'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-0" />
})
const WaveSurface = dynamic(() => import('./WaveSurface'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-0" />
})
const Text3DScene = dynamic(() => import('./Text3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-10" />
})
const Interactive3DCards = dynamic(() => import('./Interactive3DCards'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-5" />
})
const GeometricShapes = dynamic(() => import('./GeometricShapes'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none z-0" />
})
const Fallback2D = dynamic(() => import('./Fallback2D'), { ssr: false })

interface Scene3DManagerProps {
  enableParticles?: boolean
  enableWaves?: boolean
  enable3DText?: boolean
  enableCards?: boolean
  enableShapes?: boolean
  scrollY?: number
}

export default function Scene3DManager({
  enableParticles = true,
  enableWaves = true,
  enable3DText = false,
  enableCards = false,
  enableShapes = true,
  scrollY = 0
}: Scene3DManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [currentScrollY, setCurrentScrollY] = useState(0)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebGLSupported(false)
      }
    } catch (e) {
      setWebGLSupported(false)
    }

    // Handle scroll events
    const handleScroll = () => {
      setCurrentScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render on server
  if (!mounted) return null

  // Fallback for unsupported browsers or errors
  if (!webGLSupported || error) {
    return <Fallback2D />
  }

  return (
    <div className="scene-3d">
      {/* Background Geometric Shapes */}
      {enableShapes && (
        <ErrorBoundary fallback={null} onError={() => setError(true)}>
          <GeometricShapes />
        </ErrorBoundary>
      )}

      {/* Wave Surface */}
      {enableWaves && (
        <ErrorBoundary fallback={null} onError={() => setError(true)}>
          <WaveSurface scrollY={currentScrollY} />
        </ErrorBoundary>
      )}

      {/* Floating Particles */}
      {enableParticles && (
        <ErrorBoundary fallback={null} onError={() => setError(true)}>
          <FloatingParticles />
        </ErrorBoundary>
      )}

      {/* 3D Text Effects */}
      {enable3DText && (
        <ErrorBoundary fallback={null} onError={() => setError(true)}>
          <Text3DScene
            visible={currentScrollY < 500}
            texts={[
              {
                text: "DISCOVER",
                position: [-3, 2, -2],
                color: "#00ffff",
                size: 0.6
              },
              {
                text: "RESOURCES",
                position: [3, -1, -2],
                color: "#0066ff",
                size: 0.6
              }
            ]}
          />
        </ErrorBoundary>
      )}

      {/* Interactive 3D Cards */}
      {enableCards && (
        <ErrorBoundary fallback={null} onError={() => setError(true)}>
          <Interactive3DCards
            visible={currentScrollY > 300 && currentScrollY < 1200}
            cards={[
              {
                title: "Free Courses",
                position: [-4, 0, -1],
                color: "#00ffff"
              },
              {
                title: "Tools & Resources",
                position: [0, 0, -1],
                color: "#0099ff"
              },
              {
                title: "Job Opportunities",
                position: [4, 0, -1],
                color: "#0066ff"
              }
            ]}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}

// Hook for controlling 3D scenes based on scroll position
export function use3DSceneControl() {
  const [scrollY, setScrollY] = useState(0)
  const [activeScene, setActiveScene] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY
      setScrollY(newScrollY)

      // Determine active scene based on scroll position
      if (newScrollY < 500) {
        setActiveScene('hero')
      } else if (newScrollY < 1200) {
        setActiveScene('features')
      } else if (newScrollY < 2000) {
        setActiveScene('stats')
      } else {
        setActiveScene('cta')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollY, activeScene }
}
