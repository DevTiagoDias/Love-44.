// components/GlassPanel/ImpactPhysics.jsx
import * as THREE from 'three'

/**
 * Apply radial impulse to glass shards from impact point
 * @param {Array} shardRefs - Array of Rapier RigidBody refs
 * @param {THREE.Vector3} impactPoint - Point of bullet impact
 * @param {number} baseForce - Base explosion force magnitude
 */
export function applyRadialImpulse(shardRefs, impactPoint, baseForce = 15) {
  if (!impactPoint || !shardRefs || shardRefs.length === 0) return
  
  const impact = new THREE.Vector3(
    impactPoint.x,
    impactPoint.y,
    impactPoint.z
  )
  
  shardRefs.forEach((rigidBody, index) => {
    if (!rigidBody) return
    
    try {
      const translation = rigidBody.translation()
      const shardPos = new THREE.Vector3(
        translation.x,
        translation.y,
        translation.z
      )
      
      // Calculate direction from impact to shard
      const direction = shardPos.clone().sub(impact).normalize()
      
      // Distance-based falloff (closer = stronger force)
      const distance = shardPos.distanceTo(impact)
      const falloff = 1 / (1 + distance * 2)
      
      // Add random variation for natural look
      const randomVariation = 0.7 + Math.random() * 0.6
      const magnitude = baseForce * falloff * randomVariation
      
      // Angle-based variation (shards in front get more forward motion)
      const angleFromCenter = Math.abs(Math.atan2(shardPos.y - impact.y, shardPos.x - impact.x))
      const forwardBoost = 1 + (1 - angleFromCenter / Math.PI) * 0.5
      
      // Apply linear impulse
      rigidBody.applyImpulse({
        x: direction.x * magnitude,
        y: direction.y * magnitude,
        z: direction.z * magnitude * 0.3 * forwardBoost // Less Z motion, more XY
      }, true)
      
      // Apply torque impulse for realistic spinning
      const torqueMagnitude = magnitude * 0.5
      rigidBody.applyTorqueImpulse({
        x: (Math.random() - 0.5) * torqueMagnitude,
        y: (Math.random() - 0.5) * torqueMagnitude,
        z: (Math.random() - 0.5) * torqueMagnitude
      }, true)
      
    } catch (error) {
      console.warn(`Failed to apply impulse to shard ${index}:`, error)
    }
  })
}

/**
 * Calculate shockwave effect for secondary objects
 */
export function calculateShockwave(position, impactPoint, maxRadius = 5) {
  const distance = position.distanceTo(impactPoint)
  
  if (distance > maxRadius) return 0
  
  // Inverse square falloff
  const intensity = Math.max(0, 1 - (distance / maxRadius) ** 2)
  
  return intensity
}

/**
 * Apply impulse to a single rigid body
 */
export function applySingleImpulse(rigidBody, force, position = null) {
  if (!rigidBody) return
  
  if (position) {
    rigidBody.applyImpulseAtPoint(
      { x: force.x, y: force.y, z: force.z },
      { x: position.x, y: position.y, z: position.z },
      true
    )
  } else {
    rigidBody.applyImpulse(
      { x: force.x, y: force.y, z: force.z },
      true
    )
  }
}

/**
 * Calculate ballistic trajectory
 */
export function calculateTrajectory(origin, direction, distance) {
  const trajectory = []
  const steps = 20
  const gravity = -9.81
  
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * distance
    const pos = new THREE.Vector3(
      origin.x + direction.x * t,
      origin.y + direction.y * t - 0.5 * gravity * t * t,
      origin.z + direction.z * t
    )
    trajectory.push(pos)
  }
  
  return trajectory
}
