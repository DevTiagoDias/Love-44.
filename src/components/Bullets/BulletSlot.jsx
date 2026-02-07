// components/Bullets/BulletSlot.jsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { useGameState } from '@/stores/useGameState'
import * as THREE from 'three'

export function BulletSlot({ position, index, onRef }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const chamberPositions = useGameState((s) => s.chamberPositions)
  const isFilled = chamberPositions[index]
  
  const { scale, emissiveIntensity } = useSpring({
    scale: isHovered && !isFilled ? 1.15 : 1,
    emissiveIntensity: isFilled ? 0.3 : 0,
    config: {
      tension: 200,
      friction: 20
    }
  })
  
  // Pulse animation for filled slots
  useFrame((state) => {
    if (meshRef.current && isFilled) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.95
      meshRef.current.scale.setScalar(pulse)
    }
  })
  
  // Store ref for raycasting
  if (onRef && meshRef.current) {
    onRef(meshRef.current, index)
  }
  
  return (
    <animated.group position={position} scale={scale}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => !isFilled && setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        userData={{ chamberIndex: index }}
      >
        {/* Slot ring */}
        <torusGeometry args={[0.08, 0.01, 16, 32]} />
        <animated.meshStandardMaterial
          color={isFilled ? '#FFD700' : '#666666'}
          metalness={0.8}
          roughness={0.3}
          emissive={isFilled ? '#FF6600' : '#000000'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Filled indicator */}
      {isFilled && (
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial
            color="#B87333"
            metalness={0.9}
            roughness={0.2}
            emissive="#FF6600"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
      
      {/* Empty slot guide (dashed circle) */}
      {!isFilled && (
        <lineSegments>
          <edgesGeometry
            args={[new THREE.TorusGeometry(0.06, 0.005, 8, 24)]}
          />
          <lineBasicMaterial color="#999999" opacity={0.5} transparent />
        </lineSegments>
      )}
      
      {/* Chamber number label */}
      <mesh position={[0.1, 0, 0.01]} rotation={[0, 0, -Math.PI / 2]}>
        <planeGeometry args={[0.02, 0.02]} />
        <meshBasicMaterial
          color="#CCCCCC"
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
    </animated.group>
  )
}
