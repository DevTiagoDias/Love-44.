// stores/useGameState.js
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useGameState = create(
  subscribeWithSelector((set, get) => ({
    // Phase Management
    phase: 'LOADING', // LOADING | READY | FIRING | BULLET_TIME | REVEALED
    
    // Bullet Loading State
    bulletsLoaded: 0,
    maxBullets: 6,
    chamberPositions: Array(6).fill(false),
    cylinderRotation: 0,
    
    // Physics State
    bulletTime: false,
    glassIntact: true,
    impactPoint: null,
    
    // Audio State
    soundEnabled: true,
    
    // Actions
    loadBullet: (chamberIndex) => {
      const state = get()
      
      // Validation
      if (state.chamberPositions[chamberIndex]) {
        console.warn('Chamber already loaded')
        return
      }
      
      if (state.phase !== 'LOADING') {
        console.warn('Not in loading phase')
        return
      }
      
      const newPositions = [...state.chamberPositions]
      newPositions[chamberIndex] = true
      const loaded = newPositions.filter(Boolean).length
      
      set({
        chamberPositions: newPositions,
        bulletsLoaded: loaded,
        cylinderRotation: (loaded * Math.PI) / 3, // 60° per bullet
        phase: loaded === 6 ? 'READY' : 'LOADING'
      })
      
      // Sound feedback
      if (state.soundEnabled) {
        import('@/hooks/useAudioEngine').then(({ playSound }) => {
          playSound('bulletInsert')
        })
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      // Auto-close cylinder when full
      if (loaded === 6) {
        setTimeout(() => {
          set({ phase: 'READY' })
          if (state.soundEnabled) {
            import('@/hooks/useAudioEngine').then(({ playSound }) => {
              playSound('cylinderLock')
            })
          }
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }
        }, 600) // Delay for animation
      }
    },
    
    fireBullet: (impactPoint) => {
      const state = get()
      
      if (state.phase !== 'READY') {
        console.warn('Cannot fire - not ready')
        return
      }
      
      set({
        phase: 'FIRING',
        impactPoint
      })
      
      // Audio sequence
      if (state.soundEnabled) {
        import('@/hooks/useAudioEngine').then(({ playGunshot }) => {
          playGunshot()
        })
      }
      
      // Haptic feedback (strong)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
      
      // Transition to bullet time
      setTimeout(() => {
        set({ 
          bulletTime: true,
          glassIntact: false
        })
        
        // Glass shatter sound
        if (state.soundEnabled) {
          setTimeout(() => {
            import('@/hooks/useAudioEngine').then(({ playSound }) => {
              playSound('glassShatter')
            })
          }, 100)
        }
      }, 50)
      
      // Exit bullet time
      setTimeout(() => {
        set({ 
          bulletTime: false,
          phase: 'REVEALED'
        })
      }, 2000)
    },
    
    resetExperience: () => {
      set({
        phase: 'LOADING',
        bulletsLoaded: 0,
        chamberPositions: Array(6).fill(false),
        cylinderRotation: 0,
        bulletTime: false,
        glassIntact: true,
        impactPoint: null
      })
    },
    
    toggleSound: () => {
      set({ soundEnabled: !get().soundEnabled })
    }
  }))
)

// Subscriptions for debugging/analytics
useGameState.subscribe(
  (state) => state.phase,
  (phase, prevPhase) => {
    console.log(`Phase transition: ${prevPhase} → ${phase}`)
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'phase_change', {
        from: prevPhase,
        to: phase
      })
    }
  }
)

useGameState.subscribe(
  (state) => state.bulletsLoaded,
  (loaded) => {
    console.log(`Bullets loaded: ${loaded}/6`)
    
    if (loaded === 6 && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'fully_loaded', {
        event_category: 'engagement'
      })
    }
  }
)
