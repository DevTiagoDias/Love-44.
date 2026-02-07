# Ballistic Devotion - Deployment Guide

## Production Checklist

### 1. Asset Optimization

#### 3D Model (Taurus 44)
```bash
# Compress GLTF with Draco
npx gltfjsx public/models/taurus44.glb --draco

# Or use gltf-pipeline
gltf-pipeline -i taurus44.glb -o taurus44-compressed.glb -d
```

**Model Requirements**:
- Polygon count: Max 50k triangles
- Texture resolution: 2048x2048 (Base Color, Normal, Roughness)
- Format: GLB (binary) preferred
- **CRITICAL**: Ported barrel must be visible geometry

#### Textures
```bash
# Convert to KTX2 for better compression
npx gltf-transform etc1s input.glb output.glb

# Or use Basis Universal
basisu romantic-photo.jpg -output_file romantic-photo.ktx2 \
  -mipmap -y_flip -uastc -uastc_level 2
```

#### Audio Files
```bash
# Convert to multiple formats for browser compatibility
ffmpeg -i gunshot.wav -codec:a libmp3lame -b:a 128k gunshot.mp3
ffmpeg -i gunshot.wav -codec:a libopus -b:a 96k gunshot.opus
ffmpeg -i gunshot.wav -codec:a aac -b:a 128k gunshot.m4a

# Optimize file size
ffmpeg -i glass-shatter.wav -ar 44100 -ac 2 -b:a 96k glass-shatter.mp3
```

**Audio Specs**:
- Sample rate: 44.1kHz
- Bitrate: 96-128kbps
- Format: MP3 (primary), Opus (fallback)
- Normalization: -3dB peak

---

### 2. Performance Optimization

#### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    // Optimize Three.js tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/jsm': 'three/examples/jsm',
    }
    
    // Analyze bundle size
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html',
        })
      )
    }
    
    return config
  },
  
  // Headers for WASM (Rapier)
  async headers() {
    return [
      {
        source: '/:path*.wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

#### Component-Level Optimizations
```javascript
// Use React.memo for static components
export const PhotoReveal = React.memo(PhotoRevealComponent)

// Lazy load heavy components
const GlassSystem = dynamic(
  () => import('@/components/GlassPanel/GlassSystem'),
  { ssr: false }
)

// Preload critical assets
useEffect(() => {
  // Preload font
  const font = new FontLoader().load('/fonts/playfair-display.json')
  
  // Preload textures
  useTexture.preload('/images/romantic-photo.jpg')
  
  // Preload audio
  preloadAudio()
}, [])
```

#### Shader Optimization
```glsl
// Use precision mediump on mobile
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

// Reduce raymarch steps on low-end devices
#ifdef MOBILE
  const int steps = 16;
#else
  const int steps = 32;
#endif
```

---

### 3. Mobile Optimization

#### Detect Mobile & Adjust Quality
```javascript
// utils/deviceDetection.js
export const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export const getDeviceTier = () => {
  const gpu = getGPUInfo()
  const memory = navigator.deviceMemory || 4
  
  if (isMobile() && memory < 4) return 'LOW'
  if (isMobile() && memory >= 4) return 'MEDIUM'
  return 'HIGH'
}

// Apply in Scene
const deviceTier = getDeviceTier()

<Physics 
  timeStep={deviceTier === 'LOW' ? 1/30 : 1/60}
>
  <GlassShards 
    count={deviceTier === 'LOW' ? 60 : 120}
  />
</Physics>
```

#### Reduce Physics Complexity
```javascript
// For mobile, use simpler colliders
<RigidBody 
  colliders={isMobile() ? "cuboid" : "hull"}
  // ...
>
```

#### Touch Gestures
```javascript
// Add pinch-to-zoom prevention
useEffect(() => {
  const preventZoom = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }
  
  document.addEventListener('touchmove', preventZoom, { passive: false })
  
  return () => document.removeEventListener('touchmove', preventZoom)
}, [])
```

---

### 4. Hosting & Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
vercel env add NEXT_PUBLIC_ANALYTICS_ID production
```

**Vercel Configuration** (vercel.json):
```json
{
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800"
        }
      ]
    }
  ]
}
```

#### Cloudflare Pages (Alternative)
```bash
# Build command
npm run build

# Output directory
.next

# Environment variables
NODE_VERSION=18
NEXT_TELEMETRY_DISABLED=1
```

---

### 5. Analytics & Tracking

#### Google Analytics Events
```javascript
// Track user progression
gtag('event', 'bullet_loaded', {
  event_category: 'engagement',
  event_label: `bullet_${bulletsLoaded}`
})

gtag('event', 'cylinder_closed', {
  event_category: 'milestone',
  value: 1
})

gtag('event', 'glass_shattered', {
  event_category: 'completion',
  value: 1
})

// Track time to completion
gtag('event', 'timing_complete', {
  name: 'load_bullets',
  value: timeElapsed,
  event_category: 'timing'
})
```

#### Performance Monitoring
```javascript
// Use Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics({ name, delta, id }) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(delta),
    event_label: id,
    non_interaction: true,
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

### 6. SEO & Metadata

#### _app.jsx / layout.jsx
```javascript
export const metadata = {
  title: 'Ballistic Devotion - An Interactive Romance',
  description: 'A cinematic WebGL experience exploring love through the lens of Neo-Noir aesthetics',
  openGraph: {
    title: 'Ballistic Devotion',
    description: 'Interactive romance experience',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ballistic Devotion',
    description: 'Interactive romance experience',
    images: ['/og-image.jpg'],
  },
}
```

#### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

---

### 7. Testing Checklist

- [ ] Desktop Chrome (Windows/Mac)
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Tablet (iPad)
- [ ] Low-end mobile (< 4GB RAM)
- [ ] Test on 3G connection
- [ ] Test WebGL 2.0 fallback
- [ ] Test audio on muted autoplay browsers
- [ ] Test haptics on iOS/Android
- [ ] Verify Rapier WASM loads correctly
- [ ] Check bundle size (< 1MB gzipped)
- [ ] Lighthouse score > 90
- [ ] No console errors in production

---

### 8. Performance Targets

**Initial Load**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

**Runtime**:
- Desktop: 60 FPS sustained
- Mobile (High-tier): 45-60 FPS
- Mobile (Low-tier): 30 FPS minimum

**Bundle Size**:
- Main bundle: < 500KB gzipped
- Three.js + R3F: ~150KB gzipped
- Rapier WASM: ~500KB
- Total initial: < 1.2MB

---

### 9. Accessibility

```jsx
// Add screen reader descriptions
<div 
  role="application" 
  aria-label="Interactive romance experience"
>
  <canvas aria-hidden="true" />
  
  <div className="sr-only">
    <h1>Ballistic Devotion</h1>
    <p>
      This is an interactive 3D experience. Use your mouse or touch 
      to load bullets into the revolver, then click to reveal your message.
    </p>
  </div>
</div>

// Keyboard controls for accessibility
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && phase === 'READY') {
      fireBullet(new THREE.Vector3(0, 0, 2))
    }
  }
  
  window.addEventListener('keypress', handleKeyPress)
  return () => window.removeEventListener('keypress', handleKeyPress)
}, [phase])
```

---

### 10. Error Handling

```javascript
// WebGL detection
if (!WebGLDetector.isWebGL2Available()) {
  return (
    <div className="fallback">
      <h1>WebGL 2.0 Required</h1>
      <p>Please update your browser or enable WebGL</p>
    </div>
  )
}

// Error boundary for Three.js
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary 
  fallback={<FallbackUI />}
  onError={(error) => {
    console.error('3D Scene error:', error)
    gtag('event', 'exception', {
      description: error.message,
      fatal: true
    })
  }}
>
  <Scene />
</ErrorBoundary>
```

---

## Final Deployment Commands

```bash
# 1. Install dependencies
npm install

# 2. Optimize assets (run scripts)
npm run optimize-assets

# 3. Test production build locally
npm run build
npm start

# 4. Analyze bundle
ANALYZE=true npm run build

# 5. Deploy to Vercel
vercel --prod

# 6. Verify deployment
curl -I https://your-domain.vercel.app
```

---

## Post-Launch Monitoring

1. **Sentry** for error tracking
2. **Google Analytics** for user behavior
3. **Cloudflare Analytics** for traffic
4. **Lighthouse CI** for regression testing
5. **Bundle Analyzer** for bundle size monitoring

Estimated total project size: **~3MB** (including all assets)
Recommended hosting: **Vercel** (Edge Network, automatic HTTPS, zero-config)
