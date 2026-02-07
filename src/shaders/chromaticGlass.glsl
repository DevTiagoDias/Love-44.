// shaders/chromaticGlass.glsl
// Enhanced glass shader with chromatic aberration and dispersion

export const chromaticGlassVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const chromaticGlassFragmentShader = `
  uniform sampler2D tBackground;
  uniform vec3 cameraPosition;
  uniform float chromaticAberration;
  uniform float refractPower;
  uniform float ior;
  uniform float thickness;
  uniform float time;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  // Fresnel effect
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - abs(dot(viewDir, normal)), power);
  }
  
  // Chromatic dispersion for glass
  vec3 refractRGB(vec3 viewDir, vec3 normal, float ior) {
    // Different IOR for each color channel (dispersion)
    float iorR = ior - 0.02;
    float iorG = ior;
    float iorB = ior + 0.02;
    
    vec3 refractR = refract(viewDir, normal, 1.0 / iorR);
    vec3 refractG = refract(viewDir, normal, 1.0 / iorG);
    vec3 refractB = refract(viewDir, normal, 1.0 / iorB);
    
    return vec3(
      length(refractR),
      length(refractG),
      length(refractB)
    );
  }
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Calculate refraction
    vec3 refracted = refract(viewDir, normal, 1.0 / ior);
    
    // Chromatic aberration offset
    vec2 aberrationOffset = chromaticAberration * (vUv - 0.5);
    
    // Sample background with chromatic offset
    vec2 uvR = vUv + aberrationOffset;
    vec2 uvG = vUv;
    vec2 uvB = vUv - aberrationOffset;
    
    // Distortion based on surface normal
    float distortion = dot(normal, vec3(0, 0, 1)) * refractPower;
    uvR += normal.xy * distortion * 0.1;
    uvG += normal.xy * distortion * 0.08;
    uvB += normal.xy * distortion * 0.06;
    
    // Sample each color channel
    float r = texture2D(tBackground, uvR).r;
    float g = texture2D(tBackground, uvG).g;
    float b = texture2D(tBackground, uvB).b;
    
    vec3 refractedColor = vec3(r, g, b);
    
    // Fresnel for edge highlighting
    float fresnelValue = fresnel(viewDir, normal, 3.0);
    
    // Add subtle reflection
    vec3 reflected = reflect(viewDir, normal);
    vec3 reflectionColor = vec3(1.0) * fresnelValue * 0.2;
    
    // Thickness-based absorption
    vec3 absorption = vec3(0.9, 0.95, 1.0); // Slight blue tint
    vec3 absorbedColor = refractedColor * pow(absorption, vec3(thickness));
    
    // Combine refraction and reflection
    vec3 finalColor = mix(absorbedColor, reflectionColor, fresnelValue * 0.3);
    
    // Add subtle caustic effect
    float caustic = sin(vWorldPosition.x * 10.0 + time) * 
                    sin(vWorldPosition.y * 10.0 + time) * 0.05;
    finalColor += caustic * vec3(1.0, 0.95, 0.9);
    
    // Edge glow
    float edgeGlow = pow(1.0 - abs(dot(viewDir, normal)), 4.0);
    finalColor += edgeGlow * vec3(0.3, 0.4, 0.5) * 0.2;
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

// Simplified version for better performance
export const chromaticGlassFragmentShaderSimple = `
  uniform sampler2D tBackground;
  uniform float chromaticAberration;
  uniform float ior;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Simple chromatic offset
    vec2 offset = chromaticAberration * (vUv - 0.5);
    
    float r = texture2D(tBackground, vUv + offset).r;
    float g = texture2D(tBackground, vUv).g;
    float b = texture2D(tBackground, vUv - offset).b;
    
    vec3 color = vec3(r, g, b);
    
    // Basic fresnel
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
    color += fresnel * 0.1;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;
