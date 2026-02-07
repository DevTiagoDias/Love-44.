// shaders/volumetricFog.glsl
// Vertex Shader
export const volumetricFogVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader
export const volumetricFogFragmentShader = `
  uniform vec3 lightPositions[2];
  uniform vec3 lightColors[2];
  uniform vec3 cameraPosition;
  uniform float time;
  uniform float density;
  uniform float fogHeight;
  
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  // 3D Noise function (Perlin-like)
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
  
  // Fractional Brownian Motion for natural fog
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
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
      
      // Animated turbulence
      vec3 noiseCoord = pos * 0.5 + vec3(time * 0.1, 0.0, time * 0.05);
      float turbulence = fbm(noiseCoord);
      
      // Height falloff
      float heightFalloff = smoothstep(fogHeight, 0.0, abs(pos.y));
      
      // Light contribution from each source
      for(int j = 0; j < 2; j++) {
        vec3 toLight = lightPositions[j] - pos;
        float dist = length(toLight);
        vec3 lightDir = normalize(toLight);
        
        // Inverse square falloff
        float lightContrib = (1.0 / (dist * dist + 0.5)) * 0.015;
        
        // God ray effect (directional scattering)
        float dirFalloff = max(0.0, dot(lightDir, -rayDir));
        lightContrib *= (1.0 + dirFalloff * 2.0);
        
        // Combine with turbulence
        fog += lightContrib * turbulence * heightFalloff;
      }
    }
    
    // Distance fade
    float viewDist = length(vViewPosition);
    float distanceFade = smoothstep(10.0, 2.0, viewDist);
    
    fog *= density * distanceFade;
    
    // Add subtle color variation
    vec3 fogColor = mix(
      vec3(0.2, 0.2, 0.25), // Cool blue-grey
      vec3(0.3, 0.25, 0.2), // Warm brown-grey
      turbulence
    );
    
    gl_FragColor = vec4(fogColor * fog, min(fog, 0.8));
  }
`;
