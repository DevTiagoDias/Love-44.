// components/GlassPanel/IntactGlass.jsx
import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useGameState } from '@/stores/useGameState'
import * as THREE from 'three'

export function IntactGlass({ position = [0, 0, 2], size = [3, 4] }) {
  const meshRef = useRef()
  const { raycaster, camera } = useThree()
  const [isHovered, setIsHovered] = useState(false)
  
  const fireBullet = useGameState((s) => s.fireBullet)
  const phase = useGameState((s) => s.phase)
  const glassIntact = useGameState((s) => s.glassIntact)
  
  // Subtle glass stress animation
  useFrame((state) => {
    if (meshRef.current && isHovered) {
      const time = state.clock.elapsedTime
      meshRef.current.material.distortion = 0.1 + Math.sin(time * 2) * 0.02
    }
  })
  
  const handleClick = (event) => {
    if (phase !== 'READY') return
    
    event.stopPropagation()
    
    // Calculate exact impact point
    raycaster.setFromCamera({ x: 0, y: 0 }, camera)
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      const impactPoint = intersects[0].point
      fireBullet(impactPoint)
    }
  }
  
  if (!glassIntact) return null
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={() => {
        setIsHovered(true)
        if (phase === 'READY') {
          document.body.style.cursor = 'crosshair'
        }
      }}
      onPointerLeave={() => {
        setIsHovered(false)
        document.body.style.cursor = 'default'
      }}
      receiveShadow
    >
      <planeGeometry args={size} />
      <MeshTransmissionMaterial
        // Core transmission properties
        transmission={1.0}
        thickness={0.5}
        roughness={0.05}
        ior={1.5}
        
        // Chromatic aberration for realism
        chromaticAberration={0.06}
        anisotropy={0.3}
        
        // Subtle distortion
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0}
        
        // Surface quality
        clearcoat={1}
        clearcoatRoughness={0.1}
        
        // Render quality
        samples={16}
        resolution={1024}
        
        // Tone mapping
        toneMapped={false}
        
        // Transparency
        transparent
        opacity={0.95}
      />
    </mesh>
  )
}
