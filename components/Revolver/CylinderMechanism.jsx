// components/Revolver/CylinderMechanism.jsx
import { useRef, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useGameState } from '@/stores/useGameState'
import { playSound } from '@/hooks/useAudioEngine'

export function CylinderMechanism({ cylinderNode }) {
  const groupRef = useRef()
  const bulletsLoaded = useGameState((s) => s.bulletsLoaded)
  const phase = useGameState((s) => s.phase)
  
  // Cylinder rotation (60° per bullet = π/3 radians)
  const { rotation } = useSpring({
    rotation: (bulletsLoaded * Math.PI) / 3,
    config: {
      tension: 120,
      friction: 14,
      mass: 2,
      clamp: false
    },
    onRest: () => {
      // Play mechanical click when rotation completes
      if (bulletsLoaded > 0 && bulletsLoaded < 6) {
        playSound('cylinderRotate', { volume: 0.3 })
      }
    }
  })
  
  // Cylinder swing-out animation
  const { swing } = useSpring({
    swing: phase === 'LOADING' ? Math.PI * 0.15 : 0, // 27° swing
    config: {
      tension: 80,
      friction: 20,
      mass: 1.5
    }
  })
  
  useEffect(() => {
    if (phase === 'READY') {
      // Heavy lock sound when cylinder closes
      setTimeout(() => {
        playSound('cylinderLock', { volume: 0.6 })
      }, 300)
    }
  }, [phase])
  
  if (!cylinderNode) return null
  
  return (
    <animated.group
      ref={groupRef}
      rotation-y={swing}
    >
      <animated.group rotation-z={rotation}>
        <primitive object={cylinderNode} />
      </animated.group>
    </animated.group>
  )
}
