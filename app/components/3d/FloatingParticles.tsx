'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles({ count = 1000 }) {
  const mesh = useRef<THREE.Points>(null!)
  const light = useRef<THREE.PointLight>(null!)

  // Generate random positions for particles
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // Random positions in a sphere
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      // Gradient colors from cyan to blue
      const t = Math.random()
      colors[i * 3] = 0 + t * 0.2 // R
      colors[i * 3 + 1] = 0.8 + t * 0.2 // G
      colors[i * 3 + 2] = 1 // B
    }
    
    return [positions, colors]
  }, [count])

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (mesh.current) {
      // Rotate the entire particle system
      mesh.current.rotation.x = time * 0.1
      mesh.current.rotation.y = time * 0.05
      
      // Animate individual particles
      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        // Add floating motion
        positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.001
        positions[i3] += Math.cos(time + i * 0.1) * 0.001
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <Points ref={mesh} positions={positions} colors={colors}>
      <PointMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles count={800} />
      </Canvas>
    </div>
  )
}
