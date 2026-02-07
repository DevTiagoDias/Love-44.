// hooks/useAudioEngine.js
import { Howl, Howler } from 'howler'
import { useEffect, useRef } from 'react'

// Audio file paths
const AUDIO_PATHS = {
  bulletInsert: '/audio/bullet-insert.mp3',
  cylinderRotate: '/audio/cylinder-rotate.mp3',
  cylinderLock: '/audio/cylinder-lock.mp3',
  gunshot: '/audio/gunshot-composite.mp3',
  glassShatter: '/audio/glass-shatter.mp3',
  glassCreak: '/audio/glass-creaking.mp3'
}

// Sound instances (singleton)
let sounds = null

function initializeSounds() {
  if (sounds) return sounds
  
  sounds = {
    // Bullet loading - short mechanical click
    bulletInsert: new Howl({
      src: [AUDIO_PATHS.bulletInsert],
      volume: 0.4,
      preload: true,
      html5: false
    }),
    
    // Cylinder rotation - smooth mechanical whir
    cylinderRotate: new Howl({
      src: [AUDIO_PATHS.cylinderRotate],
      volume: 0.3,
      preload: true
    }),
    
    // Cylinder lock - heavy metallic clack
    cylinderLock: new Howl({
      src: [AUDIO_PATHS.cylinderLock],
      volume: 0.6,
      preload: true
    }),
    
    // Composite gunshot with layers
    gunshot: new Howl({
      src: [AUDIO_PATHS.gunshot],
      volume: 0.8,
      preload: true,
      sprite: {
        // Define time-based layers within single file
        mechanical: [0, 200],        // 0-200ms: Hammer strike
        powder: [200, 800],           // 200-1000ms: Powder ignition
        reverb: [1000, 3000]          // 1000-4000ms: Echo tail
      }
    }),
    
    // Glass shatter - high frequency crystalline
    glassShatter: new Howl({
      src: [AUDIO_PATHS.glassShatter],
      volume: 0.7,
      preload: true
    }),
    
    // Glass stress creaking (optional atmospheric)
    glassCreak: new Howl({
      src: [AUDIO_PATHS.glassCreak],
      volume: 0.2,
      loop: false,
      preload: true
    })
  }
  
  return sounds
}

/**
 * Play a simple sound
 */
export function playSound(soundName, options = {}) {
  const soundLibrary = initializeSounds()
  
  if (!soundLibrary[soundName]) {
    console.warn(`Sound "${soundName}" not found`)
    return null
  }
  
  const { volume = 1.0, rate = 1.0 } = options
  
  const id = soundLibrary[soundName].play()
  soundLibrary[soundName].volume(volume, id)
  soundLibrary[soundName].rate(rate, id)
  
  return id
}

/**
 * Play layered gunshot sequence
 */
export function playGunshot() {
  const soundLibrary = initializeSounds()
  
  // Layer 1: Mechanical (immediate)
  soundLibrary.gunshot.play('mechanical')
  
  // Layer 2: Powder explosion (slight delay)
  setTimeout(() => {
    soundLibrary.gunshot.play('powder')
  }, 50)
  
  // Layer 3: Reverb tail (longer delay)
  setTimeout(() => {
    soundLibrary.gunshot.play('reverb')
  }, 150)
}

/**
 * React hook for audio management
 */
export function useAudioEngine() {
  const soundsRef = useRef(null)
  
  useEffect(() => {
    // Initialize on mount
    soundsRef.current = initializeSounds()
    
    // Cleanup on unmount
    return () => {
      if (soundsRef.current) {
        Object.values(soundsRef.current).forEach(sound => {
          sound.unload()
        })
      }
    }
  }, [])
  
  const play = (soundName, options) => {
    return playSound(soundName, options)
  }
  
  const playLayered = (soundName) => {
    if (soundName === 'gunshot') {
      return playGunshot()
    }
    return play(soundName)
  }
  
  const setMasterVolume = (volume) => {
    Howler.volume(volume)
  }
  
  const mute = () => {
    Howler.mute(true)
  }
  
  const unmute = () => {
    Howler.mute(false)
  }
  
  return {
    play,
    playLayered,
    playGunshot,
    setMasterVolume,
    mute,
    unmute,
    sounds: soundsRef.current
  }
}

/**
 * Preload all audio assets
 */
export function preloadAudio() {
  return new Promise((resolve) => {
    const soundLibrary = initializeSounds()
    
    let loadedCount = 0
    const totalSounds = Object.keys(soundLibrary).length
    
    Object.values(soundLibrary).forEach(sound => {
      sound.once('load', () => {
        loadedCount++
        if (loadedCount === totalSounds) {
          console.log('All audio assets loaded')
          resolve()
        }
      })
    })
  })
}

/**
 * Audio placeholder generation (for development without assets)
 */
export function generatePlaceholderAudio() {
  // Create synthetic click sound
  const createClick = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const duration = 0.1
    const sampleRate = audioContext.sampleRate
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 50)
    }
    
    return buffer
  }
  
  console.warn('Using placeholder audio - replace with real assets')
  
  // For development: return silent/minimal sounds
  return {
    bulletInsert: createClick(),
    cylinderRotate: createClick(),
    cylinderLock: createClick(),
    gunshot: createClick(),
    glassShatter: createClick()
  }
}
