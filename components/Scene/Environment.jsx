// components/Scene/Environment.jsx
import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei'

export function Environment() {
  return (
    <>
      {/* Ambient base */}
      <ambientLight intensity={0.05} color="#ffffff" />
      
      {/* Key Rim Light - Silver (Left) */}
      <spotLight
        position={[-5, 3, -2]}
        intensity={8}
        angle={0.6}
        penumbra={0.5}
        color="#C0C0C0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />
      
      {/* Accent Rim Light - Crimson (Right) */}
      <spotLight
        position={[4, 2, -3]}
        intensity={6}
        angle={0.5}
        penumbra={0.6}
        color="#8B0000"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Subtle Fill Light (Bottom) */}
      <pointLight
        position={[0, -2, 3]}
        intensity={0.8}
        color="#404040"
        distance={8}
        decay={2}
      />
      
      {/* Back Light for Depth */}
      <pointLight
        position={[0, 1, -5]}
        intensity={1.5}
        color="#1a1a1a"
        distance={10}
        decay={2}
      />
      
      {/* HDR Environment for Reflections */}
      <DreiEnvironment
        preset="night"
        background={false}
        blur={0.8}
      >
        {/* Custom lightformers for metallic reflections */}
        <Lightformer
          intensity={2}
          rotation-x={Math.PI / 2}
          position={[0, 4, -9]}
          scale={[10, 1, 1]}
          color="#C0C0C0"
        />
        
        <Lightformer
          intensity={1}
          rotation-x={Math.PI / 2}
          position={[0, 4, 9]}
          scale={[10, 1, 1]}
          color="#8B0000"
        />
      </DreiEnvironment>
    </>
  )
}
