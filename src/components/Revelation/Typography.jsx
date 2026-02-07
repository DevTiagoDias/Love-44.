// components/Revelation/Typography.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import { useGameState } from '@/stores/useGameState'
import * as THREE from 'three'

export function Typography({ position = [0, -1.8, 0.1], text = "Forever" }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const glassIntact = useGameState((s) => s.glassIntact)
  const visible = !glassIntact
  
  // Custom glowing material
  const glowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#DC143C', // Crimson
      emissive: '#DC143C',
      emissiveIntensity: 0.7,
      metalness: 0.3,
      roughness: 0.2,
      toneMapped: false
    })
  }, [])
  
  // Animation loop
  useFrame((state) => {
    if (!visible) return
    
    const time = state.clock.elapsedTime
    
    // Pulsing glow
    if (materialRef.current) {
      const pulse = Math.sin(time * 2) * 0.3 + 0.7
      materialRef.current.emissiveIntensity = pulse
    }
    
    // Subtle float
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.02
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05
    }
  })
  
  if (!visible) return null
  
  return (
    <>
      <group ref={groupRef} position={position}>
        <Center>
          <Text3D
            font="/fonts/playfair-display.json"
            size={0.35}
            height={0.05}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.01}
            bevelSize={0.005}
            bevelSegments={5}
          >
            {text}
            <primitive
              object={glowMaterial}
              attach="material"
              ref={materialRef}
            />
          </Text3D>
        </Center>
        
        {/* Backlight for dramatic effect */}
        <pointLight
          position={[0, 0, -0.2]}
          intensity={2}
          color="#DC143C"
          distance={2}
          decay={2}
        />
        
        {/* Secondary rim light */}
        <pointLight
          position={[0, 0.5, -0.1]}
          intensity={1}
          color="#FF69B4"
          distance={1.5}
          decay={2}
        />
      </group>
      
      {/* Ambient glow particles */}
      <GlowParticles visible={visible} position={position} />
    </>
  )
}

function GlowParticles({ visible, position }) {
  const particlesRef = useRef()
  const count = 30
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.001,
        y: Math.random() * 0.002 + 0.001,
        z: (Math.random() - 0.5) * 0.001
      })
    }
    
    return { positions, velocities }
  }, [])
  
  useFrame(() => {
    if (!particlesRef.current || !visible) return
    
    const positions = particlesRef.current.geometry.attributes.position.array
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i].x
      positions[i * 3 + 1] += particles.velocities[i].y
      positions[i * 3 + 2] += particles.velocities[i].z
      
      // Reset when too high
      if (positions[i * 3 + 1] > position[1] + 1.5) {
        positions[i * 3 + 1] = position[1] - 0.5
      }
      
      // Wrap X
      if (Math.abs(positions[i * 3] - position[0]) > 1.5) {
        positions[i * 3] = position[0] + (Math.random() - 0.5) * 2
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!visible) return null
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#DC143C"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
