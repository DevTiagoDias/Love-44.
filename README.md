# 🎯 Ballistic Devotion

> A cinematic Neo-Noir WebGL interactive experience exploring romance through metaphor

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-blue)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Overview

**Ballistic Devotion** is an immersive web-based interactive experience that combines cutting-edge WebGL graphics, realistic physics simulation, and cinematic storytelling. Inspired by Romeo + Juliet's aesthetic, it transforms a firearm into a symbol of passionate devotion.

### Key Features

- 🎨 **Neo-Noir Aesthetics** - High-contrast rim lighting with volumetric fog
- ⚙️ **Realistic Physics** - Rapier WASM-based rigid body simulation
- 🔫 **Interactive Revolver** - Load bullets with drag-and-drop mechanics
- 💥 **Dynamic Glass Fracture** - Voronoi tessellation with 120+ shards
- 🎵 **Layered Audio** - Composite gunshot with mechanical precision
- 📱 **Mobile Optimized** - Haptic feedback and adaptive quality settings
- ✨ **Romantic Revelation** - Photo and typography emerge from shattered glass

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Modern browser with WebGL 2.0 support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ballistic-devotion.git
cd ballistic-devotion

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience.

## 📁 Project Structure

```
src/
├── components/
│   ├── Scene/
│   │   ├── Scene.jsx                 # Main R3F Canvas wrapper
│   │   ├── Environment.jsx           # Lighting & atmosphere
│   │   ├── VolumetricFog.jsx        # Custom volumetric fog shader
│   │   └── PostProcessing.jsx       # Film grain, bloom, vignette
│   ├── Revolver/
│   │   ├── RevolverModel.jsx        # GLTF loader + material setup
│   │   ├── CylinderMechanism.jsx    # Rotating chamber logic
│   │   └── RecoilAnimation.jsx      # Procedural kickback
│   ├── Bullets/
│   │   ├── BulletDragDrop.jsx       # DnD interaction
│   │   └── BulletSlot.jsx           # Chamber slot component
│   ├── GlassPanel/
│   │   ├── IntactGlass.jsx          # Pre-shatter state
│   │   ├── GlassShards.jsx          # Voronoi fractured pieces
│   │   └── ImpactPhysics.jsx        # Rapier impulse logic
│   └── Revelation/
│       ├── PhotoReveal.jsx          # Behind-glass content
│       └── Typography.jsx           # "Forever" text shader
├── stores/
│   └── useGameState.js              # Zustand state machine
├── hooks/
│   ├── useRapierPhysics.js         # Physics utilities
│   ├── useAudioEngine.js           # Howler.js wrapper
│   └── useHaptics.js               # Vibration API
├── shaders/
│   ├── volumetricFog.glsl          # Raymarched fog
│   └── chromaticGlass.glsl         # Enhanced transmission
└── utils/
    ├── voronoiFracture.js          # Glass tessellation
    └── ballistics.js               # Raycast + impulse math
```

## 🎮 User Flow

1. **Loading Phase** - User drags .44 Magnum bullets into cylinder chambers
2. **Cylinder Rotation** - Each bullet triggers 60° rotation with spring animation
3. **Ready State** - After 6 bullets, cylinder locks with heavy mechanical sound
4. **Fire Action** - Click to shoot, camera shakes with procedural recoil
5. **Bullet Time** - Physics slows to 10% as glass fractures radially
6. **Revelation** - Romantic photo and "Forever" typography revealed

## 🛠️ Technical Stack

### Core Technologies

- **Framework**: Next.js 14 (React 18)
- **3D Engine**: React Three Fiber (R3F)
- **Physics**: @react-three/rapier (WASM)
- **State**: Zustand
- **Animation**: @react-spring/three
- **Post-Processing**: @react-three/postprocessing
- **Audio**: Howler.js
- **Styling**: Tailwind CSS

### Performance Features

- **Device Tier Detection** - Adaptive shard count (60-120)
- **Lazy Loading** - Code splitting for heavy components
- **Asset Optimization** - Draco compression for GLTF
- **Texture Compression** - KTX2/Basis Universal
- **Bundle Size** - < 1MB gzipped initial load

## 🎨 Asset Requirements

### 3D Model
- **File**: `public/models/taurus44.glb`
- **Format**: GLTF/GLB with Draco compression
- **Polygons**: < 50k triangles
- **Textures**: 2048×2048 (BaseColor, Normal, Roughness)
- **Critical**: Visible ported barrel

### Audio Files
- **Formats**: MP3 (primary), Opus (fallback)
- **Sample Rate**: 44.1kHz
- **Bitrate**: 96-128kbps
- **Files Needed**:
  - `bullet-insert.mp3` - Mechanical click (150ms)
  - `cylinder-rotate.mp3` - Smooth whir (300ms)
  - `cylinder-lock.mp3` - Heavy clack (400ms)
  - `gunshot-composite.mp3` - Layered explosion (3s)
  - `glass-shatter.mp3` - Crystalline break (2s)

### Images
- **Photo**: `public/images/romantic-photo.jpg` (2048×2048)
- **Font**: `public/fonts/playfair-display.json` (Three.js JSON)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Key variables:
- `NEXT_PUBLIC_PHYSICS_QUALITY` - "low" | "medium" | "high"
- `NEXT_PUBLIC_SHARD_COUNT` - Number of glass fragments (60-120)
- `NEXT_PUBLIC_ENABLE_AUDIO` - Toggle audio system

### Device Quality Tiers

- **LOW** (< 4GB RAM): 60 shards, 30fps, cuboid colliders
- **MEDIUM** (4-8GB RAM): 90 shards, 45fps, hull colliders
- **HIGH** (> 8GB RAM): 120 shards, 60fps, precise colliders

## 📊 Performance Targets

| Metric | Desktop | Mobile (High) | Mobile (Low) |
|--------|---------|---------------|--------------|
| FPS | 60 | 45-60 | 30+ |
| FCP | < 1.5s | < 2.0s | < 3.0s |
| LCP | < 2.5s | < 3.5s | < 4.5s |
| TTI | < 3.5s | < 5.0s | < 6.5s |

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Manual Build

```bash
# Create production build
npm run build

# Start production server
npm start

# Analyze bundle size
ANALYZE=true npm run build
```

### Docker (Optional)

```bash
docker build -t ballistic-devotion .
docker run -p 3000:3000 ballistic-devotion
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Lint code
npm run lint

# Type check (if using TypeScript)
npm run type-check
```

### Browser Testing Checklist

- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)
- [ ] WebGL 2.0 fallback
- [ ] Audio autoplay handling
- [ ] Haptic feedback (mobile)

## 🐛 Troubleshooting

### Common Issues

**WebGL Context Lost**
```javascript
// Handled automatically by R3F, but you can add:
<Canvas onContextLost={() => window.location.reload()} />
```

**Rapier WASM Not Loading**
- Check `next.config.js` headers for `.wasm` files
- Verify `@react-three/rapier` is installed correctly
- Ensure server sends correct MIME type

**Audio Not Playing**
- Check browser autoplay policies
- User interaction required for audio on iOS
- Verify audio files are in `/public/audio/`

## 📝 License

MIT © 2024 Ballistic Devotion Team

## 🙏 Acknowledgments

- Romeo + Juliet (1996) for aesthetic inspiration
- Three.js community for incredible tools
- Rapier physics engine team

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📞 Support

- 📧 Email: support@ballisticdevotion.com
- 🐦 Twitter: @BallisticDev
- 💬 Discord: [Join Server](https://discord.gg/ballistic)

---

**Made with ❤️ and high-caliber devotion**
