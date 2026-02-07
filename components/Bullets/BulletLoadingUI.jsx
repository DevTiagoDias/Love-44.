// components/Bullets/BulletLoadingUI.jsx
import { useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { useGameState } from '@/stores/useGameState'

export function BulletLoadingUI() {
  const { bulletsLoaded, maxBullets, chamberPositions, loadBullet } = useGameState()
  const [draggingBullet, setDraggingBullet] = useState(null)
  
  const allLoaded = bulletsLoaded === maxBullets
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Instructions */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
        <h1 className="font-serif text-4xl text-gray-300 mb-2 tracking-wider">
          Ballistic Devotion
        </h1>
        <p className="text-gray-500 text-sm tracking-widest uppercase">
          {allLoaded 
            ? 'Click to reveal your message' 
            : `Load ammunition: ${bulletsLoaded}/6`
          }
        </p>
      </div>
      
      {/* Bullet inventory (bottom) */}
      {!allLoaded && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex gap-4">
            {Array.from({ length: maxBullets - bulletsLoaded }).map((_, i) => (
              <DraggableBullet
                key={`bullet-${i}`}
                index={i}
                onDragStart={() => setDraggingBullet(i)}
                onDragEnd={() => setDraggingBullet(null)}
                isDragging={draggingBullet === i}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Chamber slots (right side) */}
      {!allLoaded && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="flex flex-col gap-3">
            {chamberPositions.map((filled, index) => (
              <ChamberSlot
                key={`chamber-${index}`}
                index={index}
                filled={filled}
                onDrop={() => {
                  if (draggingBullet !== null) {
                    loadBullet(index)
                    setDraggingBullet(null)
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Loading progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {Array.from({ length: maxBullets }).map((_, i) => (
            <div
              key={`progress-${i}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < bulletsLoaded 
                  ? 'bg-red-600 shadow-lg shadow-red-500/50' 
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DraggableBullet({ index, onDragStart, onDragEnd, isDragging }) {
  const bind = useDrag(({ down }) => {
    if (down && !isDragging) {
      onDragStart()
    } else if (!down && isDragging) {
      onDragEnd()
    }
  })
  
  return (
    <div
      {...bind()}
      className={`
        w-12 h-20 bg-gradient-to-b from-yellow-600 to-yellow-800
        rounded-full cursor-grab active:cursor-grabbing
        shadow-lg hover:shadow-yellow-500/30
        transition-all duration-200
        ${isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'}
        relative overflow-hidden
      `}
      style={{
        touchAction: 'none'
      }}
    >
      {/* Bullet casing shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Bullet tip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full" />
      
      {/* Caliber marking */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-yellow-900 font-mono">
        .44
      </div>
    </div>
  )
}

function ChamberSlot({ index, filled, onDrop }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseUp={onDrop}
      onTouchEnd={onDrop}
      className={`
        w-16 h-16 rounded-full border-2
        transition-all duration-300
        ${filled 
          ? 'bg-yellow-600/20 border-yellow-600 shadow-lg shadow-yellow-500/30' 
          : isHovered
            ? 'bg-gray-800/50 border-gray-400 scale-110'
            : 'bg-gray-900/50 border-gray-600'
        }
        flex items-center justify-center
        relative overflow-hidden
      `}
    >
      {/* Chamber number */}
      <span className="text-gray-500 text-xs font-mono absolute top-1 right-2">
        {index + 1}
      </span>
      
      {/* Filled indicator */}
      {filled && (
        <div className="w-10 h-10 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
      
      {/* Empty slot guide */}
      {!filled && (
        <div className="w-8 h-8 border border-dashed border-gray-600 rounded-full" />
      )}
    </div>
  )
}
