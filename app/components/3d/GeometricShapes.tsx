'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedCube({ position, color, size = 1, speed = 1 }: {
  position: [number, number, number]
  color: string
  size?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * speed * 0.5
      meshRef.current.rotation.y = time * speed * 0.3
      meshRef.current.rotation.z = time * speed * 0.1
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  )
}

function AnimatedSphere({ position, color, size = 1, speed = 1 }: {
  position: [number, number, number]
  color: string
  size?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * speed * 0.2
      meshRef.current.rotation.y = time * speed * 0.4
      
      // Pulsing effect
      const scale = 1 + Math.sin(time * speed * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.1} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

function AnimatedTorus({ position, color, size = 1, speed = 1 }: {
  position: [number, number, number]
  color: string
  size?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * speed * 0.3
      meshRef.current.rotation.y = time * speed * 0.6
      meshRef.current.rotation.z = time * speed * 0.2
    }
  })

  return (
    <Float speed={speed * 1.2} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[size, size * 0.4, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}

export default function GeometricShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        {/* Cubes */}
        <AnimatedCube position={[-6, 3, -5]} color="#00ffff" size={0.8} speed={0.8} />
        <AnimatedCube position={[6, -2, -3]} color="#0099ff" size={1.2} speed={1.2} />
        <AnimatedCube position={[-4, -4, -8]} color="#0066ff" size={0.6} speed={0.6} />
        
        {/* Spheres */}
        <AnimatedSphere position={[5, 4, -6]} color="#00ccff" size={0.7} speed={1.0} />
        <AnimatedSphere position={[-7, -1, -4]} color="#3366ff" size={0.9} speed={0.7} />
        <AnimatedSphere position={[2, -5, -7]} color="#6600ff" size={0.5} speed={1.3} />
        
        {/* Torus */}
        <AnimatedTorus position={[0, 6, -10]} color="#00e6ff" size={0.8} speed={0.9} />
        <AnimatedTorus position={[-8, 2, -9]} color="#4d79ff" size={0.6} speed={1.1} />
        <AnimatedTorus position={[7, -6, -5]} color="#8000ff" size={0.7} speed={0.8} />
      </Canvas>
    </div>
  )
}
