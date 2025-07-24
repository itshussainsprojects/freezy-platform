'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WavePlane({ scrollY }: { scrollY: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  // Custom shader for animated waves
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        color1: { value: new THREE.Color('#00ffff') },
        color2: { value: new THREE.Color('#0066ff') },
        color3: { value: new THREE.Color('#3333ff') },
      },
      vertexShader: `
        uniform float time;
        uniform float scrollOffset;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vUv = uv;
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Create wave effect
          float elevation = sin(modelPosition.x * 0.3 + time * 0.5) * 0.1;
          elevation += sin(modelPosition.z * 0.2 + time * 0.3) * 0.1;
          elevation += sin(modelPosition.x * 0.1 + modelPosition.z * 0.1 + time * 0.2) * 0.2;
          
          // Add scroll-based animation
          elevation += scrollOffset * 0.001;
          
          modelPosition.y += elevation;
          vElevation = elevation;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Create gradient based on elevation and UV
          float mixStrength = (vElevation + 0.25) * 2.0;
          mixStrength += sin(vUv.x * 10.0 + time) * 0.1;
          
          vec3 color = mix(color1, color2, vUv.x);
          color = mix(color, color3, mixStrength);
          
          // Add some transparency
          float alpha = 0.3 + vElevation * 2.0;
          alpha = clamp(alpha, 0.1, 0.6);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = time
      materialRef.current.uniforms.scrollOffset.value = scrollY
    }
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  )
}

export default function WaveSurface({ scrollY = 0 }: { scrollY?: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 5, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <WavePlane scrollY={scrollY} />
      </Canvas>
    </div>
  )
}
