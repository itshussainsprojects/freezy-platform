'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, Float } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedText3D({ 
  text, 
  position, 
  color = '#00ffff',
  size = 1 
}: { 
  text: string
  position: [number, number, number]
  color?: string
  size?: number 
}) {
  const textRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (textRef.current) {
      // Floating animation
      textRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2
      textRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
      
      // Glow effect by scaling
      const scale = 1 + Math.sin(time * 2) * 0.05
      textRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
    >
      <Center>
        <Text3D
          ref={textRef}
          font="/fonts/helvetiker_regular.typeface.json"
          size={size}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={position}
        >
          {text}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </Float>
  )
}

export default function Text3DScene({ 
  visible = false,
  texts = [
    { text: "DISCOVER", position: [-2, 1, 0] as [number, number, number], color: "#00ffff", size: 0.8 },
    { text: "RESOURCES", position: [2, -1, 0] as [number, number, number], color: "#0066ff", size: 0.8 }
  ]
}: {
  visible?: boolean
  texts?: Array<{
    text: string
    position: [number, number, number]
    color?: string
    size?: number
  }>
}) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        {texts.map((textConfig, index) => (
          <AnimatedText3D
            key={index}
            text={textConfig.text}
            position={textConfig.position}
            color={textConfig.color}
            size={textConfig.size}
          />
        ))}
      </Canvas>
    </div>
  )
}
