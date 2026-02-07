// components/Revolver/RecoilAnimation.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { useGameState } from '@/stores/useGameState'
import * as THREE from 'three'

export function RecoilAnimation({ children }) {
  const groupRef = useRef()
  const phase = useGameState((s) => s.phase)
  const isFiring = phase === 'FIRING'
  
  const fireTimeRef = useRef(0)
  const shakeIntensityRef = useRef(0)
  
  // Primary recoil spring animation
  const { positionZ, rotationX } = useSpring({
    positionZ: isFiring ? -0.3 : 0,
    rotationX: isFiring ? 0.15 : 0,
    config: {
      tension: 300,
      friction: 20,
      mass: 1
    }
  })
  
  // Procedural noise shake during recoil
  useFrame((state, delta) => {
    if (isFiring && fireTimeRef.current < 0.3) {
      fireTimeRef.current += delta
      shakeIntensityRef.current = Math.max(0, 1 - fireTimeRef.current / 0.3)
      
      // Apply noise-based shake to camera
      const noise = Math.sin(fireTimeRef.current * 100) * 0.02 * shakeIntensityRef.current
      state.camera.rotation.x += noise
      state.camera.rotation.y += noise * 0.5
      state.camera.rotation.z += noise * 0.3
      
      // Muzzle flash position jitter
      if (groupRef.current) {
        groupRef.current.rotation.x += noise * 0.5
        groupRef.current.rotation.y += noise * 0.3
      }
    } else if (!isFiring) {
      fireTimeRef.current = 0
      shakeIntensityRef.current = 0
    }
  })
  
  return (
    <animated.group
      ref={groupRef}
      position-z={positionZ}
      rotation-x={rotationX}
    >
      {children}
      
      {/* Muzzle flash light */}
      {isFiring && (
        <pointLight
          position={[0, 0, 0.5]} // Barrel tip
          intensity={50}
          color="#FFA500"
          distance={3}
          decay={2}
        />
      )}
      
      {/* Secondary flash (powder burn) */}
      {isFiring && (
        <pointLight
          position={[0, 0, 0.3]}
          intensity={30}
          color="#FF6600"
          distance={2}
          decay={3}
        />
      )}
    </animated.group>
  )
}
