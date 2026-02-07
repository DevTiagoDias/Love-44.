'use client'

import dynamic from 'next/dynamic'

// Evita erros de renderização estática
export const dynamicMode = 'force-dynamic';

const Scene = dynamic(() => import('@/components/Scene/Scene'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div className="animate-pulse">A CARREGAR EXPERIÊNCIA...</div>
    </div>
  )
})

export default function Home() {
  // Usamos style={{...}} para garantir que funciona mesmo sem o Tailwind carregar
  return (
    <main style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      overflow: 'hidden' 
    }}>
      <Scene />
    </main>
  )
}