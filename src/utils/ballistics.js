// utils/ballistics.js
import * as THREE from 'three'

/**
 * Calculate bullet trajectory with gravity
 * @param {THREE.Vector3} origin - Starting position
 * @param {THREE.Vector3} direction - Initial direction (normalized)
 * @param {number} velocity - Initial velocity (m/s)
 * @param {number} gravity - Gravity constant (default -9.81)
 * @param {number} steps - Number of trajectory points
 * @returns {Array<THREE.Vector3>} Array of positions along trajectory
 */
export function calculateTrajectory(origin, direction, velocity = 400, gravity = -9.81, steps = 50) {
  const trajectory = []
  const timeStep = 0.01 // 10ms increments
  
  for (let i = 0; i <= steps; i++) {
    const t = i * timeStep
    
    // Kinematic equation: p = p0 + v*t + 0.5*a*t^2
    const pos = new THREE.Vector3(
      origin.x + direction.x * velocity * t,
      origin.y + direction.y * velocity * t + 0.5 * gravity * t * t,
      origin.z + direction.z * velocity * t
    )
    
    trajectory.push(pos)
  }
  
  return trajectory
}

/**
 * Perform raycast from camera through screen point
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Camera} camera
 * @param {THREE.Vector2} screenPoint - Normalized screen coordinates (-1 to 1)
 * @param {Array<THREE.Object3D>} targets - Objects to test against
 * @returns {Object|null} Intersection data
 */
export function raycastFromScreen(raycaster, camera, screenPoint, targets) {
  raycaster.setFromCamera(screenPoint, camera)
  const intersects = raycaster.intersectObjects(targets, true)
  
  if (intersects.length > 0) {
    return {
      point: intersects[0].point,
      normal: intersects[0].face?.normal || new THREE.Vector3(0, 0, 1),
      distance: intersects[0].distance,
      object: intersects[0].object,
      uv: intersects[0].uv
    }
  }
  
  return null
}

/**
 * Calculate impact impulse vector
 * @param {THREE.Vector3} impactPoint
 * @param {THREE.Vector3} targetPoint
 * @param {number} force
 * @returns {THREE.Vector3} Impulse vector
 */
export function calculateImpulse(impactPoint, targetPoint, force) {
  const direction = new THREE.Vector3()
    .subVectors(targetPoint, impactPoint)
    .normalize()
  
  return direction.multiplyScalar(force)
}

/**
 * Calculate radial impulse from explosion point
 * @param {THREE.Vector3} explosionPoint
 * @param {THREE.Vector3} targetPoint
 * @param {number} maxForce
 * @param {number} radius
 * @returns {Object} { impulse: Vector3, magnitude: number }
 */
export function calculateRadialImpulse(explosionPoint, targetPoint, maxForce, radius) {
  const direction = new THREE.Vector3()
    .subVectors(targetPoint, explosionPoint)
  
  const distance = direction.length()
  direction.normalize()
  
  // Falloff based on distance
  const falloff = Math.max(0, 1 - (distance / radius))
  const magnitude = maxForce * falloff * falloff // Quadratic falloff
  
  return {
    impulse: direction.multiplyScalar(magnitude),
    magnitude,
    distance
  }
}

/**
 * Calculate ricochet angle
 * @param {THREE.Vector3} incomingDir - Incoming bullet direction
 * @param {THREE.Vector3} surfaceNormal - Surface normal at impact
 * @param {number} restitution - Bounciness (0-1)
 * @returns {THREE.Vector3} Ricochet direction
 */
export function calculateRicochet(incomingDir, surfaceNormal, restitution = 0.3) {
  const reflected = new THREE.Vector3()
    .copy(incomingDir)
    .reflect(surfaceNormal)
  
  // Add some randomness for realism
  const randomOffset = new THREE.Vector3(
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2
  )
  
  return reflected
    .add(randomOffset)
    .normalize()
    .multiplyScalar(restitution)
}

/**
 * Calculate muzzle velocity for specific caliber
 * @param {string} caliber - Ammunition type
 * @returns {number} Velocity in m/s
 */
export function getMuzzleVelocity(caliber) {
  const velocities = {
    '9mm': 360,
    '.45ACP': 260,
    '.44Magnum': 440,
    '.357Magnum': 440,
    '5.56NATO': 990,
    '7.62NATO': 840,
    '.50BMG': 900,
    '12gauge': 400
  }
  
  return velocities[caliber] || 400
}

/**
 * Calculate bullet drop at distance
 * @param {number} distance - Distance in meters
 * @param {number} velocity - Muzzle velocity
 * @param {number} gravity - Gravity constant
 * @returns {number} Drop in meters
 */
export function calculateBulletDrop(distance, velocity, gravity = 9.81) {
  const time = distance / velocity
  return 0.5 * gravity * time * time
}

/**
 * Calculate penetration depth
 * @param {number} velocity - Impact velocity
 * @param {string} material - Target material type
 * @returns {number} Penetration depth in meters
 */
export function calculatePenetration(velocity, material) {
  const resistance = {
    glass: 0.5,
    wood: 2.0,
    drywall: 1.0,
    steel: 10.0,
    concrete: 8.0,
    flesh: 0.3
  }
  
  const r = resistance[material] || 5.0
  
  // Simplified penetration formula
  return (velocity * velocity) / (2 * r * 1000)
}

/**
 * Create bullet trail particles
 * @param {THREE.Vector3} start
 * @param {THREE.Vector3} end
 * @param {number} particleCount
 * @returns {Array<THREE.Vector3>} Particle positions
 */
export function createBulletTrail(start, end, particleCount = 20) {
  const particles = []
  
  for (let i = 0; i <= particleCount; i++) {
    const t = i / particleCount
    const pos = new THREE.Vector3().lerpVectors(start, end, t)
    
    // Add slight randomness
    pos.x += (Math.random() - 0.5) * 0.01
    pos.y += (Math.random() - 0.5) * 0.01
    pos.z += (Math.random() - 0.5) * 0.01
    
    particles.push(pos)
  }
  
  return particles
}

/**
 * Calculate energy transfer on impact
 * @param {number} mass - Projectile mass (kg)
 * @param {number} velocity - Impact velocity (m/s)
 * @returns {number} Kinetic energy in joules
 */
export function calculateKineticEnergy(mass, velocity) {
  return 0.5 * mass * velocity * velocity
}

/**
 * Calculate recoil force
 * @param {number} bulletMass - Bullet mass (kg)
 * @param {number} muzzleVelocity - Velocity (m/s)
 * @param {number} gunMass - Gun mass (kg)
 * @returns {number} Recoil velocity (m/s)
 */
export function calculateRecoil(bulletMass, muzzleVelocity, gunMass) {
  // Conservation of momentum: m1*v1 = m2*v2
  return (bulletMass * muzzleVelocity) / gunMass
}

/**
 * Test line of sight between two points
 * @param {THREE.Vector3} start
 * @param {THREE.Vector3} end
 * @param {Array<THREE.Object3D>} obstacles
 * @param {THREE.Raycaster} raycaster
 * @returns {boolean} True if line of sight is clear
 */
export function hasLineOfSight(start, end, obstacles, raycaster) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const distance = direction.length()
  direction.normalize()
  
  raycaster.set(start, direction)
  raycaster.far = distance
  
  const intersects = raycaster.intersectObjects(obstacles, true)
  
  return intersects.length === 0
}
