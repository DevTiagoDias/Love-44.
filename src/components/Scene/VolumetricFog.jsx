// components/Scene/VolumetricFog.jsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform vec3 lightPositions[2];
  uniform vec3 lightColors[2];
  uniform vec3 cameraPosition;
  uniform float time;
  uniform float density;
  
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  // Simple 3D noise function
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(
        mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
        mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x),
        f.y
      ),
      mix(
        mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
        mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x),
        f.y
      ),
      f.z
    );
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = normalize(vWorldPosition - cameraPosition);
    
    float fog = 0.0;
    float stepSize = 0.3;
    int steps = 32;
    
    // Raymarch through volume
    for(int i = 0; i < steps; i++) {
      float t = float(i) * stepSize;
      vec3 pos = rayOrigin + rayDir * t;
      
      // Add animated noise for volumetric turbulence
      float turbulence = fbm(pos * 0.5 + vec3(time * 0.1, 0.0, 0.0));
      
      // Light 1: Silver rim light
      vec3 toLight1 = lightPositions[0] - pos;
      float dist1 = length(toLight1);
      vec3 lightDir1 = normalize(toLight1);
      
      // Inverse square falloff with god ray effect
      float lightContrib1 = (1.0 / (dist1 * dist1 + 0.5)) * 0.015;
      
      // Directional falloff (stronger when aligned with light)
      float dirFalloff1 = max(0.0, dot(lightDir1, -rayDir));
      lightContrib1 *= (1.0 + dirFalloff1 * 2.0);
      
      fog += lightContrib1 * lightColors[0] * turbulence;
      
      // Light 2: Crimson accent
      vec3 toLight2 = lightPositions[1] - pos;
      float dist2 = length(toLight2);
      vec3 lightDir2 = normalize(toLight2);
      
      float lightContrib2 = (1.0 / (dist2 * dist2 + 0.5)) * 0.01;
      float dirFalloff2 = max(0.0, dot(lightDir2, -rayDir));
      lightContrib2 *= (1.0 + dirFalloff2 * 2.0);
      
      fog += lightContrib2 * lightColors[1] * turbulence;
    }
    
    // Distance fade
    float viewDist = length(vViewPosition);
    float distanceFade = smoothstep(10.0, 2.0, viewDist);
    
    fog *= density * distanceFade;
    
    // Output with additive blending feel
    gl_FragColor = vec4(vec3(fog), min(fog, 0.8));
  }
`

export function VolumetricFog({ density = 1.0 }) {
  const materialRef = useRef()
  
  const uniforms = useMemo(() => ({
    lightPositions: { 
      value: [
        new THREE.Vector3(-5, 3, -2),
        new THREE.Vector3(4, 2, -3)
      ]
    },
    lightColors: {
      value: [
        new THREE.Color('#C0C0C0'), // Silver
        new THREE.Color('#8B0000')  // Crimson
      ]
    },
    cameraPosition: { value: new THREE.Vector3() },
    time: { value: 0 },
    density: { value: density }
  }), [density])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.cameraPosition.value.copy(state.camera.position)
    }
  })
  
  return (
    <mesh position={[0, 0, -5]} renderOrder={-1}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
