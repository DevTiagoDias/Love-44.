// components/GlassPanel/GlassSystem.jsx
import { useRef, useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameState } from '@/stores/useGameState'
import { fractureGlass } from '@/utils/voronoiFracture'

export function GlassSystem() {
  const glassIntact = useGameState((s) => s.glassIntact)
  const impactPoint = useGameState((s) => s.impactPoint)
  
  return (
    <>
      {glassIntact ? (
        <IntactGlass />
      ) : (
        <FracturedGlass impactPoint={impactPoint} />
      )}
    </>
  )
}

function IntactGlass() {
  const meshRef = useRef()
  const { raycaster, camera } = useThree()
  const fireBullet = useGameState((s) => s.fireBullet)
  const phase = useGameState((s) => s.phase)
  
  const handleClick = (event) => {
    if (phase !== 'READY') return
    
    event.stopPropagation()
    
    // Get impact point from raycast
    raycaster.setFromCamera({ x: 0, y: 0 }, camera)
    const intersects = raycaster.intersectObject(meshRef.current)
    
    if (intersects.length > 0) {
      fireBullet(intersects[0].point)
    }
  }
  
  return (
    <mesh 
      ref={meshRef}
      position={[0, 0, 2]} 
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[3, 4, 1, 1]} />
      <MeshTransmissionMaterial
        transmission={1.0}
        thickness={0.5}
        roughness={0.05}
        chromaticAberration={0.06}
        anisotropy={0.3}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        ior={1.5}
        // Enhance refraction for photo distortion
        samples={16}
        resolution={1024}
      />
    </mesh>
  )
}

function FracturedGlass({ impactPoint }) {
  const shardRefs = useRef([])
  
  // Pre-compute Voronoi fracture
  const shards = useMemo(() => {
    return fractureGlass(3, 4, 120) // width, height, shard count
  }, [])
  
  // Apply radial impulse after shards spawn
  useEffect(() => {
    if (!impactPoint) return
    
    const timer = setTimeout(() => {
      applyRadialImpulse(shardRefs.current, impactPoint)
    }, 50)
    
    // Auto-sleep shards after settling
    const sleepTimer = setTimeout(() => {
      shardRefs.current.forEach(ref => {
        ref?.sleep()
      })
    }, 3000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(sleepTimer)
    }
  }, [impactPoint])
  
  return (
    <group>
      {shards.map((shard, i) => (
        <RigidBody
          key={i}
          position={[shard.center.x, shard.center.y, 2]}
          colliders="hull"
          linearDamping={0.5}
          angularDamping={0.8}
          canSleep={true}
          ref={(ref) => (shardRefs.current[i] = ref)}
        >
          <mesh 
            geometry={shard.geometry}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              transmission={0.95}
              thickness={0.1}
              roughness={0.1}
              opacity={0.6}
              transparent
              color="#E8F4F8"
              metalness={0.0}
              clearcoat={1}
              clearcoatRoughness={0.1}
              ior={1.5}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// Physics impulse calculation
function applyRadialImpulse(shardRefs, impactPoint, baseForce = 15) {
  const impact = new THREE.Vector3(
    impactPoint.x,
    impactPoint.y,
    impactPoint.z
  )
  
  shardRefs.forEach(rigidBody => {
    if (!rigidBody) return
    
    const translation = rigidBody.translation()
    const shardPos = new THREE.Vector3(
      translation.x,
      translation.y,
      translation.z
    )
    
    // Direction from impact to shard
    const direction = shardPos.clone().sub(impact).normalize()
    
    // Distance-based falloff
    const distance = shardPos.distanceTo(impact)
    const falloff = 1 / (1 + distance * 2)
    const magnitude = baseForce * falloff
    
    // Add random variation
    const randomVariation = 0.7 + Math.random() * 0.6
    const finalMagnitude = magnitude * randomVariation
    
    // Apply linear impulse
    rigidBody.applyImpulse({
      x: direction.x * finalMagnitude,
      y: direction.y * finalMagnitude,
      z: direction.z * finalMagnitude * 0.3 // Less forward motion
    }, true)
    
    // Apply torque impulse for spin
    const torqueMagnitude = finalMagnitude * 0.5
    rigidBody.applyTorqueImpulse({
      x: (Math.random() - 0.5) * torqueMagnitude,
      y: (Math.random() - 0.5) * torqueMagnitude,
      z: (Math.random() - 0.5) * torqueMagnitude
    }, true)
  })
}
