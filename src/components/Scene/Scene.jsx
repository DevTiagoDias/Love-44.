// components/Scene/Scene.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei' // Environment removido daqui pois está sendo usado no componente Environment.jsx
import { Physics } from '@react-three/rapier'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three' // Import THREE
import { useGameState } from '@/stores/useGameState'
import { RevolverModel } from '../Revolver/RevolverModel'
import { BulletLoadingUI } from '../Bullets/BulletLoadingUI'
import { GlassSystem } from '../GlassPanel/GlassSystem'
import { PhotoReveal } from '../Revelation/PhotoReveal'
import { VolumetricFog } from './VolumetricFog'
import { Environment } from './Environment' // Importar o componente Environment local

export default function Scene() {
  const { phase, bulletTime } = useGameState()
  
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        shadows
        // DPR (Device Pixel Ratio): [min, max]
        // Aumentado para [1, 3] para suportar telas 4K/Retina com nitidez máxima
        dpr={[1, 3]} 
        gl={{ 
          antialias: true, // Garante bordas lisas
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          // Preserva o buffer de desenho para screenshots se necessário, e ajuda na nitidez em alguns browsers
          preserveDrawingBuffer: true 
        }}
      >
        {/* Camera Setup */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0.5, 4]} 
          fov={50}
        />
        
        {/* Componente de Ambiente e Luzes */}
        <Environment />
        
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
        
        {/* Post Processing - Cuidado: Bloom muito forte pode "borrar" a imagem */}
        <EffectComposer disableNormalPass>
          <Bloom 
            intensity={0.4} 
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            // MipmapBlur ajuda na performance mas pode suavizar demais. 
            // Se ainda achar borrado, tente remover ou ajustar o kernelSize.
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