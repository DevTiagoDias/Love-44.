// utils/textureGenerators.js
import * as THREE from 'three'

/**
 * Generate procedural steel roughness map
 * Simulates fingerprints, micro-scratches, and wear patterns
 */
export function createSteelRoughnessMap(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Base roughness (0.15 = value 38 in 0-255 range)
  const baseRoughness = 38
  ctx.fillStyle = `rgb(${baseRoughness}, ${baseRoughness}, ${baseRoughness})`
  ctx.fillRect(0, 0, width, height)
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Layer 1: Subtle noise for micro-scratches
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20
    const value = Math.max(0, Math.min(255, baseRoughness + noise))
    data[i] = data[i+1] = data[i+2] = value
  }
  
  // Layer 2: Fingerprint patterns (organic swirls)
  const fingerprintCount = 3
  for (let f = 0; f < fingerprintCount; f++) {
    const centerX = Math.random() * width
    const centerY = Math.random() * height
    const radius = 50 + Math.random() * 100
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < radius) {
          const angle = Math.atan2(dy, dx)
          const pattern = Math.sin(dist * 0.3 + angle * 3) * 15
          const idx = (y * width + x) * 4
          
          const currentValue = data[idx]
          const newValue = Math.max(0, Math.min(255, currentValue + pattern))
          data[idx] = data[idx+1] = data[idx+2] = newValue
        }
      }
    }
  }
  
  // Layer 3: Directional wear lines
  const lineCount = 5
  for (let l = 0; l < lineCount; l++) {
    const y = Math.random() * height
    const angle = (Math.random() - 0.5) * 0.2 // Nearly horizontal
    const intensity = 10 + Math.random() * 15
    
    for (let x = 0; x < width; x++) {
      const yOffset = Math.tan(angle) * x
      const lineY = Math.floor(y + yOffset)
      
      if (lineY >= 0 && lineY < height) {
        for (let spread = -2; spread <= 2; spread++) {
          const targetY = lineY + spread
          if (targetY >= 0 && targetY < height) {
            const idx = (targetY * width + x) * 4
            const falloff = 1 - Math.abs(spread) / 3
            const value = Math.max(0, Math.min(255, data[idx] + intensity * falloff))
            data[idx] = data[idx+1] = data[idx+2] = value
          }
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.needsUpdate = true
  
  return texture
}

/**
 * Generate normal map for steel surface detail
 */
export function createSteelNormalMap(width = 512, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Base normal (pointing straight out = 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)'
  ctx.fillRect(0, 0, width, height)
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  // Add subtle surface variation
  for (let i = 0; i < data.length; i += 4) {
    const noiseX = (Math.random() - 0.5) * 10
    const noiseY = (Math.random() - 0.5) * 10
    
    data[i] = Math.max(0, Math.min(255, 128 + noiseX))     // R (X normal)
    data[i+1] = Math.max(0, Math.min(255, 128 + noiseY))   // G (Y normal)
    // data[i+2] stays 255 (Z normal - pointing out)
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  
  return texture
}

/**
 * Create scratched metal texture
 */
export function createScratchedMetalTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Dark metallic base
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, width, height)
  
  // Add scratches
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  
  for (let i = 0; i < 200; i++) {
    ctx.beginPath()
    const startX = Math.random() * width
    const startY = Math.random() * height
    const length = 20 + Math.random() * 100
    const angle = (Math.random() - 0.5) * Math.PI / 4
    
    ctx.moveTo(startX, startY)
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    )
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

/**
 * Create brushed metal anisotropic texture
 */
export function createBrushedMetalTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  // Gradient base
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#2a2a2a')
  gradient.addColorStop(0.5, '#3a3a3a')
  gradient.addColorStop(1, '#2a2a2a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Vertical brush strokes
  for (let x = 0; x < width; x += 2) {
    const opacity = 0.05 + Math.random() * 0.1
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fillRect(x, 0, 1, height)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  
  return texture
}

/**
 * Create noise texture for volumetric effects
 */
export function createNoiseTexture(width = 256, height = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255
    data[i] = data[i+1] = data[i+2] = value
    data[i+3] = 255
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  
  return texture
}

/**
 * Create custom matcap for non-PBR fallback
 */
export function createMatcapTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2
  
  // Radial gradient for sphere lighting
  const gradient = ctx.createRadialGradient(
    centerX * 0.7, centerY * 0.7, 0,
    centerX, centerY, radius
  )
  
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.3, '#cccccc')
  gradient.addColorStop(0.6, '#888888')
  gradient.addColorStop(1, '#333333')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}
