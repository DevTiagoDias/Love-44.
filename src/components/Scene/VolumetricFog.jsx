import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    // Calcula a posição do vértice no mundo
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = `
  // NOTA: cameraPosition é injetado automaticamente pelo Three.js
  // uniform vec3 cameraPosition; <--- REMOVIDO PARA CORRIGIR O ERRO
  
  uniform float time;
  uniform float density;
  uniform vec3 fogColor;
  
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Função simples de ruído 3D
  float random(vec3 st) {
    return fract(sin(dot(st.xyz, vec3(12.9898,78.233,45.5432))) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(random(i), random(i + vec3(1.0, 0.0, 0.0)), f.x),
            mix(random(i + vec3(0.0, 1.0, 0.0)), random(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
        mix(mix(random(i + vec3(0.0, 0.0, 1.0)), random(i + vec3(1.0, 0.0, 1.0)), f.x),
            mix(random(i + vec3(0.0, 1.0, 1.0)), random(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.02;
    f += 0.2500 * noise(p); p *= 2.03;
    f += 0.1250 * noise(p); p *= 2.01;
    return f;
  }

  void main() {
    // Direção do raio da câmera até o fragmento
    vec3 rayDir = normalize(vWorldPosition - cameraPosition);
    float rayLen = length(vWorldPosition - cameraPosition);
    
    // Raymarching simplificado
    float fogAmount = 0.0;
    const int STEPS = 10; // Passos reduzidos para performance
    float stepSize = min(rayLen, 10.0) / float(STEPS);
    vec3 currentPos = cameraPosition;
    
    for(int i = 0; i < STEPS; i++) {
        currentPos += rayDir * stepSize;
        // Ruído em movimento
        float n = fbm(currentPos * 0.5 + vec3(0.0, time * 0.1, 0.0));
        // Apenas acumula se estiver dentro da "caixa" da neblina (ajuste visual)
        fogAmount += n * density;
    }
    
    // Suavização
    fogAmount = clamp(fogAmount / float(STEPS) * 2.0, 0.0, 0.8);
    
    gl_FragColor = vec4(fogColor, fogAmount);
  }
`

export function VolumetricFog() {
  const meshRef = useRef()
  const { clock } = useThree()
  
  // Criação dos uniforms
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      density: { value: 0.8 },
      fogColor: { value: new THREE.Color('#1a1a1a') }
    }),
    []
  )

  // Atualiza o tempo a cada frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[10, 10, 10]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.BackSide} // Renderiza o interior do cubo
        uniforms={uniforms}
      />
    </mesh>
  )
}