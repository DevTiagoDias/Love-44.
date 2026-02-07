// components/Revelation/PhotoReveal.jsx
import { useTexture, Text3D, Center } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameState } from '@/stores/useGameState'

export function PhotoReveal() {
  const glassIntact = useGameState((s) => s.glassIntact)
  
  return (
    <group position={[0, 0, 1.8]}>
      {/* Romantic Photo */}
      <PhotoFrame />
      
      {/* Typography Message */}
      <Typography visible={!glassIntact} />
      
      {/* Ambient particles when revealed */}
      {!glassIntact && <FloatingParticles />}
    </group>
  )
}

function PhotoFrame() {
  const texture = useTexture('/images/romantic-photo.jpg', (tex) => {
    // Optimize texture
    tex.minFilter = THREE.LinearMipMapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
  })
  
  const glassIntact = useGameState((s) => s.glassIntact)
  
  // Fade in after glass breaks
  const meshRef = useRef()
  useFrame(() => {
    if (meshRef.current) {
      const targetOpacity = glassIntact ? 0.3 : 1.0
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        targetOpacity,
        0.05
      )
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.5, 3.5]} />
      <meshBasicMaterial 
        map={texture} 
        toneMapped={false}
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

function Typography({ visible }) {
  const groupRef = useRef()
  const materialRef = useRef()
  
  // Glow animation
  useFrame((state) => {
    if (!materialRef.current || !visible) return
    
    const time = state.clock.elapsedTime
    const pulse = Math.sin(time * 2) * 0.3 + 0.7
    
    materialRef.current.emissiveIntensity = pulse
    
    // Subtle float animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.02
    }
  })
  
  // Custom shader material for glow
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
  
  return (
    <group ref={groupRef} visible={visible} position={[0, -1.8, 0.1]}>
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
          Forever
          <primitive object={glowMaterial} attach="material" ref={materialRef} />
        </Text3D>
      </Center>
      
      {/* Point light behind text for backlight */}
      <pointLight
        position={[0, 0, -0.2]}
        intensity={2}
        color="#DC143C"
        distance={2}
      />
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef()
  const count = 50
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    
    for (let i = 0; i < count; i++) {
      // Random positions around the photo
      positions[i * 3] = (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      
      // Random velocities for float effect
      velocities.push({
        x: (Math.random() - 0.5) * 0.002,
        y: Math.random() * 0.003 + 0.002,
        z: (Math.random() - 0.5) * 0.001
      })
    }
    
    return { positions, velocities }
  }, [])
  
  useFrame(() => {
    if (!particlesRef.current) return
    
    const positions = particlesRef.current.geometry.attributes.position.array
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i].x
      positions[i * 3 + 1] += particles.velocities[i].y
      positions[i * 3 + 2] += particles.velocities[i].z
      
      // Reset particles that float too high
      if (positions[i * 3 + 1] > 3) {
        positions[i * 3 + 1] = -3
      }
      
      // Boundary wrapping
      if (Math.abs(positions[i * 3]) > 3) {
        positions[i * 3] *= -1
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={particlesRef}>
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
      />
    </points>
  )
}

// Preload textures
useTexture.preload('/images/romantic-photo.jpg')
