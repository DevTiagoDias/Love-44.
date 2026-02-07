// components/Scene/PostProcessing.jsx
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useGameState } from '@/stores/useGameState'
import { Vector2 } from 'three'

export function PostProcessing() {
  const phase = useGameState((s) => s.phase)
  const isFiring = phase === 'FIRING'
  
  return (
    <EffectComposer>
      {/* Bloom for metallic highlights */}
      <Bloom
        intensity={isFiring ? 1.2 : 0.4}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.9}
        radius={0.8}
        mipmapBlur
      />
      
      {/* Vignette for Neo-Noir feel */}
      <Vignette
        offset={0.3}
        darkness={0.8}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Film grain */}
      <Noise
        opacity={0.03}
        premultiply
        blendFunction={BlendFunction.OVERLAY}
      />
      
      {/* Chromatic aberration on impact */}
      {isFiring && (
        <ChromaticAberration
          offset={new Vector2(0.002, 0.002)}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  )
}
