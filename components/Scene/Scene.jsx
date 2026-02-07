// components/Scene/Scene.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { Suspense } from 'react'
import { useGameState } from '@/stores/useGameState'
import { RevolverModel } from '../Revolver/RevolverModel'
import { BulletLoadingUI } from '../Bullets/BulletLoadingUI'
import { GlassSystem } from '../GlassPanel/GlassSystem'
import { PhotoReveal } from '../Revelation/PhotoReveal'
import { VolumetricFog } from './VolumetricFog'

export default function Scene() {
  const { phase, bulletTime } = useGameState()
  
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        {/* Camera Setup */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0.5, 4]} 
          fov={50}
        />
        
        {/* Lighting - Neo-Noir Rim Setup */}
        <ambientLight intensity={0.05} />
        
        {/* Key Rim Light - Silver */}
        <spotLight
          position={[-5, 3, -2]}
          intensity={8}
          angle={0.6}
          penumbra={0.5}
          color="#C0C0C0"
          castShadow
        />
        
        {/* Accent Rim Light - Crimson */}
        <spotLight
          position={[4, 2, -3]}
          intensity={6}
          angle={0.5}
          penumbra={0.6}
          color="#8B0000"
        />
        
        {/* Fill Light - Very Subtle */}
        <pointLight
          position={[0, -2, 3]}
          intensity={0.8}
          color="#404040"
        />
        
        {/* Volumetric Atmosphere */}
        <VolumetricFog />
        
        {/* Physics World */}
        <Physics 
          gravity={[0, -9.81, 0]}
          timeStep={bulletTime ? 0.001 : 1/60}
        >
          <Suspense fallback={null}>
            {/* Hero Asset - Revolver */}
            <RevolverModel />
            
            {/* Glass Panel System */}
            <GlassSystem />
            
            {/* Revelation Content (Behind Glass) */}
            <PhotoReveal />
          </Suspense>
        </Physics>
        
        {/* Environment Map for Reflections */}
        <Environment preset="night" />
        
        {/* Post Processing */}
        <EffectComposer>
          <Bloom 
            intensity={0.4} 
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
          <Vignette 
            offset={0.3} 
            darkness={0.8}
          />
          <Noise 
            opacity={0.03}
            premultiply
          />
        </EffectComposer>
        
        {/* Camera Controls (Only during loading) */}
        {phase === 'LOADING' && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
      
      {/* Overlay UI for Bullet Loading */}
      {phase === 'LOADING' && <BulletLoadingUI />}
    </div>
  )
}
