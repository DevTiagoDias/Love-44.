// components/GlassPanel/GlassShards.jsx
import { useMemo, useRef, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useGameState } from '@/stores/useGameState'
import { fractureGlass } from '@/utils/voronoiFracture'
import { applyRadialImpulse } from './ImpactPhysics'

export function GlassShards({ position = [0, 0, 2], size = [3, 4] }) {
  const shardRefs = useRef([])
  const glassIntact = useGameState((s) => s.glassIntact)
  const impactPoint = useGameState((s) => s.impactPoint)
  
  // Pre-compute fracture pattern
  const shards = useMemo(() => {
    return fractureGlass(size[0], size[1], 120)
  }, [size])
  
  // Apply physics impulse after shards spawn
  useEffect(() => {
    if (!glassIntact && impactPoint) {
      const timer = setTimeout(() => {
        applyRadialImpulse(shardRefs.current, impactPoint, 15)
      }, 50)
      
      // Put shards to sleep after settling
      const sleepTimer = setTimeout(() => {
        shardRefs.current.forEach(ref => {
          if (ref && ref.sleep) {
            ref.sleep()
          }
        })
      }, 3000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(sleepTimer)
      }
    }
  }, [glassIntact, impactPoint])
  
  if (glassIntact) return null
  
  return (
    <group position={position}>
      {shards.map((shard, i) => (
        <RigidBody
          key={`shard-${i}`}
          position={[shard.center.x, shard.center.y, 0]}
          colliders="hull"
          linearDamping={0.5}
          angularDamping={0.8}
          canSleep={true}
          ref={(ref) => {
            if (ref) shardRefs.current[i] = ref
          }}
        >
          <mesh
            geometry={shard.geometry}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              // Glass properties
              transmission={0.95}
              thickness={0.1}
              roughness={0.1}
              ior={1.5}
              
              // Visual properties
              color="#E8F4F8"
              metalness={0.0}
              opacity={0.6}
              transparent
              
              // Surface finish
              clearcoat={1}
              clearcoatRoughness={0.1}
              
              // Side visibility
              side={2} // THREE.DoubleSide
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}
