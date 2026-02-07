'use client'

import dynamic from 'next/dynamic'

// Carrega o componente Scene dinamicamente.
// ssr: false é CRÍTICO porque o Three.js precisa do objeto 'window' que não existe no servidor.
const Scene = dynamic(() => import('@/components/Scene/Scene'), {
  ssr: false,
  loading: () => (
    // Ecrã de carregamento simples enquanto o JS e os modelos 3D baixam
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-[#C0C0C0]">
      <div className="font-serif text-xl tracking-[0.2em] animate-pulse">
        A CARREGAR...
      </div>
    </div>
  )
})

export default function Home() {
  return (
    // Contentor principal que ocupa todo o ecrã
    <main className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
      
      {/* Renderiza a Cena 3D */}
      <Scene />
      
      {/* Nota: A interface de utilizador (UI) para carregar as balas 
        já está incluída dentro do componente <Scene /> 
      */}
      
    </main>
  )
}