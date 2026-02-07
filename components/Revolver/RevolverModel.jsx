// components/Revolver/RevolverModel.jsx
import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated, config } from '@react-spring/three'
import * as THREE from 'three'
import { useGameState } from '@/stores/useGameState'
import { createSteelRoughnessMap } from '@/utils/textureGenerators'

export function RevolverModel() {
  const groupRef = useRef()
  const cylinderRef = useRef()
  const { scene, nodes, materials } = useGLTF('/models/taurus44.glb')
  
  const phase = useGameState((s) => s.phase)
  const bulletsLoaded = useGameState((s) => s.bulletsLoaded)
  const isFiring = useGameState((s) => s.phase === 'FIRING')
  
  // Cylinder swing-out animation
  const { cylinderSwing } = useSpring({
    cylinderSwing: phase === 'LOADING' ? Math.PI * 0.15 : 0,
    config: config.slow
  })
  
  // Cylinder rotation (60° per bullet)
  const { cylinderRotation } = useSpring({
    cylinderRotation: (bulletsLoaded * Math.PI) / 3,
    config: { 
      tension: 120, 
      friction: 14,
      mass: 2
    }
  })
  
  // Recoil animation
  const { recoilZ, recoilRotX } = useSpring({
    recoilZ: isFiring ? -0.3 : 0,
    recoilRotX: isFiring ? 0.15 : 0,
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
    }
  })
  
  // Material setup
  useEffect(() => {
    const roughnessMap = createSteelRoughnessMap()
    
    Object.entries(materials).forEach(([name, mat]) => {
      // Steel parts
      if (name.toLowerCase().includes('steel') || 
          name.toLowerCase().includes('barrel') ||
          name.toLowerCase().includes('frame')) {
        mat.metalness = 0.95
        mat.roughness = 0.15
        mat.roughnessMap = roughnessMap
        mat.envMapIntensity = 1.5
        mat.needsUpdate = true
      }
      
      // Grip/Wood parts
      if (name.toLowerCase().includes('grip') || 
          name.toLowerCase().includes('wood')) {
        mat.metalness = 0.0
        mat.roughness = 0.6
        mat.color = new THREE.Color('#3E2723')
        mat.needsUpdate = true
      }
      
      // Brass/Gold parts
      if (name.toLowerCase().includes('brass') ||
          name.toLowerCase().includes('trigger')) {
        mat.metalness = 0.9
        mat.roughness = 0.2
        mat.color = new THREE.Color('#B87333')
        mat.needsUpdate = true
      }
    })
    
    return () => {
      roughnessMap.dispose()
    }
  }, [materials])
  
  // Muzzle flash effect
  useFrame((state) => {
    if (isFiring && groupRef.current) {
      // Add procedural noise to camera
      const elapsed = state.clock.elapsedTime
      const noise = Math.sin(elapsed * 100) * 0.02
      state.camera.rotation.x += noise
      state.camera.rotation.y += noise * 0.5
    }
  })
  
  return (
    <animated.group 
      ref={groupRef}
      position-z={recoilZ}
      rotation-x={recoilRotX}
      position={[0, -0.2, 0]}
      rotation={[0, Math.PI, 0]} // Face camera
    >
      <primitive object={scene} />
      
      {/* Cylinder with independent rotation */}
      {nodes.Cylinder && (
        <animated.group
          position={nodes.Cylinder.position}
          rotation-y={cylinderSwing}
        >
          <animated.group rotation-z={cylinderRotation} ref={cylinderRef}>
            <primitive object={nodes.Cylinder} />
          </animated.group>
        </animated.group>
      )}
      
      {/* Muzzle Flash (when firing) */}
      {isFiring && (
        <pointLight
          position={[0, 0, 0.5]} // At barrel tip
          intensity={50}
          color="#FFA500"
          distance={3}
          decay={2}
        />
      )}
    </animated.group>
  )
}

// Preload the model
useGLTF.preload('/models/taurus44.glb')
