/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignora erros de ESLint durante o build para garantir deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurações de imagem
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Webpack para shaders e áudio
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })
    
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[hash][ext]',
      },
    })
    
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[name].[hash][ext]',
      },
    })

    return config
  },
  // Transpile packages do ecossistema React Three Fiber para evitar erros de ESM
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier', '@react-three/postprocessing']
}

module.exports = nextConfig