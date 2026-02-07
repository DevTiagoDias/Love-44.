// hooks/useRapierPhysics.js
import { useEffect, useRef } from 'react'
import { useRapier } from '@react-three/rapier'

/**
 * Custom hook for Rapier physics utilities
 */
export function useRapierPhysics() {
  const { world, rapier } = useRapier()
  const timeScaleRef = useRef(1)
  
  /**
   * Set physics time scale (for bullet time effect)
   */
  const setTimeScale = (scale) => {
    timeScaleRef.current = scale
    // Note: R3F Rapier handles this via timeStep prop
  }
  
  /**
   * Perform a raycast in the physics world
   */
  const raycast = (origin, direction, maxDistance = 100) => {
    if (!world || !rapier) return null
    
    const ray = new rapier.Ray(origin, direction)
    const hit = world.castRay(ray, maxDistance, true)
    
    if (hit) {
      return {
        distance: hit.toi,
        point: origin.clone().add(direction.multiplyScalar(hit.toi)),
        normal: hit.normal
      }
    }
    
    return null
  }
  
  /**
   * Query all bodies in a sphere
   */
  const queryBodiesInSphere = (center, radius) => {
    if (!world) return []
    
    const bodies = []
    
    world.forEachCollider((collider) => {
      const translation = collider.translation()
      const distance = Math.sqrt(
        (translation.x - center.x) ** 2 +
        (translation.y - center.y) ** 2 +
        (translation.z - center.z) ** 2
      )
      
      if (distance <= radius) {
        bodies.push(collider.parent())
      }
    })
    
    return bodies
  }
  
  /**
   * Apply explosion force to all bodies in radius
   */
  const applyExplosion = (center, radius, force) => {
    const bodies = queryBodiesInSphere(center, radius)
    
    bodies.forEach((body) => {
      const translation = body.translation()
      const direction = {
        x: translation.x - center.x,
        y: translation.y - center.y,
        z: translation.z - center.z
      }
      
      const distance = Math.sqrt(
        direction.x ** 2 + direction.y ** 2 + direction.z ** 2
      )
      
      if (distance === 0) return
      
      const normalizedDir = {
        x: direction.x / distance,
        y: direction.y / distance,
        z: direction.z / distance
      }
      
      const falloff = 1 - (distance / radius)
      const magnitude = force * falloff
      
      body.applyImpulse({
        x: normalizedDir.x * magnitude,
        y: normalizedDir.y * magnitude,
        z: normalizedDir.z * magnitude
      }, true)
    })
  }
  
  /**
   * Get all rigid bodies in the world
   */
  const getAllBodies = () => {
    if (!world) return []
    
    const bodies = []
    world.forEachRigidBody((body) => {
      bodies.push(body)
    })
    
    return bodies
  }
  
  /**
   * Pause/resume physics
   */
  const setPaused = (paused) => {
    // Handled by Physics component paused prop
    console.log(`Physics ${paused ? 'paused' : 'resumed'}`)
  }
  
  return {
    world,
    rapier,
    setTimeScale,
    raycast,
    queryBodiesInSphere,
    applyExplosion,
    getAllBodies,
    setPaused
  }
}

/**
 * Hook to track rigid body velocity
 */
export function useBodyVelocity(bodyRef) {
  const velocityRef = useRef({ x: 0, y: 0, z: 0 })
  
  useEffect(() => {
    if (!bodyRef.current) return
    
    const interval = setInterval(() => {
      const linvel = bodyRef.current.linvel()
      velocityRef.current = {
        x: linvel.x,
        y: linvel.y,
        z: linvel.z
      }
    }, 16) // ~60fps
    
    return () => clearInterval(interval)
  }, [bodyRef])
  
  return velocityRef
}

/**
 * Hook to detect collisions
 */
export function useCollisionDetection(bodyRef, onCollision) {
  const { world } = useRapier()
  
  useEffect(() => {
    if (!bodyRef.current || !world) return
    
    const checkCollisions = () => {
      world.contactPairsWith(bodyRef.current, (otherBody) => {
        onCollision?.(otherBody)
      })
    }
    
    const interval = setInterval(checkCollisions, 100)
    
    return () => clearInterval(interval)
  }, [bodyRef, world, onCollision])
}
