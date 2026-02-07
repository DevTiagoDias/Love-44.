// components/Bullets/BulletDragDrop.jsx
import { useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { useGameState } from '@/stores/useGameState'

export function BulletDragDrop({ position, index, chamberSlots }) {
  const bulletRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const { camera, raycaster, size } = useThree()
  const loadBullet = useGameState((s) => s.loadBullet)
  
  const [{ scale, positionOffset }, api] = useSpring(() => ({
    scale: 1,
    positionOffset: [0, 0, 0]
  }))
  
  const bind = useDrag(
    ({ active, xy: [x, y] }) => {
      setIsDragging(active)
      
      if (active) {
        // Convert screen coordinates to world position
        const mouse = new THREE.Vector2(
          (x / size.width) * 2 - 1,
          -(y / size.height) * 2 + 1
        )
        
        raycaster.setFromCamera(mouse, camera)
        
        // Project onto plane at bullet's Z position
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -position[2])
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(plane, intersection)
        
        if (intersection) {
          api.start({
            positionOffset: [
              intersection.x - position[0],
              intersection.y - position[1],
              0.5 // Lift slightly when dragging
            ]
          })
        }
      } else {
        // On release, check if over a chamber slot
        const mouse = new THREE.Vector2(
          (x / size.width) * 2 - 1,
          -(y / size.height) * 2 + 1
        )
        
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(chamberSlots)
        
        if (intersects.length > 0) {
          const chamberIndex = intersects[0].object.userData.chamberIndex
          loadBullet(chamberIndex)
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(50)
          }
        }
        
        // Reset position
        api.start({
          positionOffset: [0, 0, 0]
        })
      }
    },
    { pointerEvents: true }
  )
  
  // Hover animation
  useFrame(() => {
    if (bulletRef.current && isHovering && !isDragging) {
      bulletRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.001
    }
  })
  
  return (
    <animated.group
      position={position}
      position-x={positionOffset.to((x) => position[0] + x)}
      position-y={positionOffset.to((_, y) => position[1] + y)}
      position-z={positionOffset.to((_, __, z) => position[2] + z)}
    >
      <animated.group scale={scale}>
        <group
          ref={bulletRef}
          {...bind()}
          onPointerEnter={() => {
            setIsHovering(true)
            api.start({ scale: 1.1 })
            document.body.style.cursor = 'grab'
          }}
          onPointerLeave={() => {
            setIsHovering(false)
            if (!isDragging) {
              api.start({ scale: 1 })
              document.body.style.cursor = 'default'
            }
          }}
        >
          {/* Bullet casing (brass) */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.08, 16]} />
            <meshStandardMaterial
              color="#B87333"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          
          {/* Bullet projectile (lead) */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <capsuleGeometry args={[0.018, 0.03, 8, 16]} />
            <meshStandardMaterial
              color="#696969"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          
          {/* Primer (bottom) */}
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.008, 16]} />
            <meshStandardMaterial
              color="#D4AF37"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          
          {/* Caliber marking */}
          <mesh position={[0, -0.02, 0.023]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.04, 0.01]} />
            <meshBasicMaterial color="#8B4513" transparent opacity={0.7} />
          </mesh>
        </group>
      </animated.group>
    </animated.group>
  )
}
