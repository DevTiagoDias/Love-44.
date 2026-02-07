// hooks/useHaptics.js
import { useCallback, useEffect, useState } from 'react'

/**
 * Hook for haptic feedback (vibration API)
 */
export function useHaptics() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  
  useEffect(() => {
    // Check if Vibration API is supported
    setIsSupported('vibrate' in navigator)
  }, [])
  
  /**
   * Trigger a simple vibration
   * @param {number} duration - Duration in milliseconds
   */
  const vibrate = useCallback((duration = 50) => {
    if (!isSupported || !isEnabled) return
    
    try {
      navigator.vibrate(duration)
    } catch (error) {
      console.warn('Vibration failed:', error)
    }
  }, [isSupported, isEnabled])
  
  /**
   * Trigger a pattern vibration
   * @param {Array<number>} pattern - Alternating vibrate/pause durations
   * Example: [100, 50, 100] = vibrate 100ms, pause 50ms, vibrate 100ms
   */
  const vibratePattern = useCallback((pattern) => {
    if (!isSupported || !isEnabled) return
    
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Pattern vibration failed:', error)
    }
  }, [isSupported, isEnabled])
  
  /**
   * Cancel ongoing vibration
   */
  const cancel = useCallback(() => {
    if (!isSupported) return
    
    try {
      navigator.vibrate(0)
    } catch (error) {
      console.warn('Cancel vibration failed:', error)
    }
  }, [isSupported])
  
  /**
   * Predefined haptic patterns
   */
  const patterns = {
    // Light tap
    tap: () => vibrate(50),
    
    // Double tap
    doubleTap: () => vibratePattern([50, 50, 50]),
    
    // Success confirmation
    success: () => vibratePattern([30, 50, 30]),
    
    // Error/warning
    error: () => vibratePattern([100, 50, 100, 50, 100]),
    
    // Loading bullet
    bulletLoad: () => vibrate(50),
    
    // Cylinder lock
    cylinderLock: () => vibratePattern([100, 50, 100]),
    
    // Gunshot
    gunshot: () => vibratePattern([200, 100, 200]),
    
    // Heavy impact
    impact: () => vibrate(150),
    
    // Subtle notification
    notification: () => vibratePattern([30, 50, 30, 50, 30])
  }
  
  return {
    isSupported,
    isEnabled,
    setIsEnabled,
    vibrate,
    vibratePattern,
    cancel,
    patterns
  }
}

/**
 * Hook for automatic haptic feedback based on events
 */
export function useAutoHaptics(eventMap) {
  const { patterns, isSupported } = useHaptics()
  
  useEffect(() => {
    if (!isSupported || !eventMap) return
    
    const handlers = {}
    
    Object.entries(eventMap).forEach(([event, pattern]) => {
      handlers[event] = () => {
        if (patterns[pattern]) {
          patterns[pattern]()
        }
      }
      
      window.addEventListener(event, handlers[event])
    })
    
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [eventMap, patterns, isSupported])
}

/**
 * Hook for gamepad haptics (rumble)
 */
export function useGamepadHaptics() {
  const [gamepads, setGamepads] = useState([])
  
  useEffect(() => {
    const updateGamepads = () => {
      const gp = navigator.getGamepads?.()
      if (gp) {
        setGamepads(Array.from(gp).filter(Boolean))
      }
    }
    
    window.addEventListener('gamepadconnected', updateGamepads)
    window.addEventListener('gamepaddisconnected', updateGamepads)
    
    const interval = setInterval(updateGamepads, 1000)
    
    return () => {
      window.removeEventListener('gamepadconnected', updateGamepads)
      window.removeEventListener('gamepaddisconnected', updateGamepads)
      clearInterval(interval)
    }
  }, [])
  
  const rumble = useCallback((intensity = 1.0, duration = 100) => {
    gamepads.forEach(gamepad => {
      if (gamepad.vibrationActuator) {
        gamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude: intensity * 0.5,
          strongMagnitude: intensity
        })
      }
    })
  }, [gamepads])
  
  return {
    hasGamepad: gamepads.length > 0,
    rumble
  }
}
