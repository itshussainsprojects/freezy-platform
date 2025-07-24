'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

function Card3D({ 
  position, 
  title, 
  color = '#00ffff',
  index = 0 
}: { 
  position: [number, number, number]
  title: string
  color?: string
  index?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const { viewport } = useThree()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current) {
      // Floating animation with different phases for each card
      meshRef.current.position.y = position[1] + Math.sin(time + index * 0.5) * 0.1
      meshRef.current.rotation.y = Math.sin(time * 0.3 + index) * 0.1
      
      // Scale on hover
      const targetScale = hovered ? 1.1 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <Float
      speed={1 + index * 0.2}
      rotationIntensity={0.1}
      floatIntensity={0.1}
    >
      <group position={position}>
        <RoundedBox
          ref={meshRef}
          args={[2, 1.2, 0.1]}
          radius={0.1}
          smoothness={4}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.8}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {title}
        </Text>
      </group>
    </Float>
  )
}

export default function Interactive3DCards({ 
  visible = false,
  cards = [
    { title: "Free Courses", position: [-3, 0, 0] as [number, number, number], color: "#00ffff" },
    { title: "Tools & Resources", position: [0, 0, 0] as [number, number, number], color: "#0099ff" },
    { title: "Job Opportunities", position: [3, 0, 0] as [number, number, number], color: "#0066ff" }
  ]
}: {
  visible?: boolean
  cards?: Array<{
    title: string
    position: [number, number, number]
    color?: string
  }>
}) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        {cards.map((card, index) => (
          <Card3D
            key={index}
            position={card.position}
            title={card.title}
            color={card.color}
            index={index}
          />
        ))}
      </Canvas>
    </div>
  )
}
