// utils/voronoiFracture.js
import * as THREE from 'three'

/**
 * Fracture a rectangle into Voronoi shards
 * @param {number} width - Glass panel width
 * @param {number} height - Glass panel height  
 * @param {number} shardCount - Number of fragments (80-150 recommended)
 * @returns {Array} Array of {geometry, center} objects
 */
export function fractureGlass(width, height, shardCount = 120) {
  const shards = []
  const sites = []
  
  // Generate random Voronoi sites
  for (let i = 0; i < shardCount; i++) {
    sites.push({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height
    })
  }
  
  // Simple Voronoi tessellation using Fortune's algorithm approximation
  const cells = computeVoronoiCells(sites, width, height)
  
  cells.forEach((cell, index) => {
    if (cell.vertices.length < 3) return // Skip degenerate cells
    
    // Create 3D shape from 2D polygon
    const shape = new THREE.Shape()
    
    cell.vertices.forEach((vertex, i) => {
      if (i === 0) {
        shape.moveTo(vertex.x, vertex.y)
      } else {
        shape.lineTo(vertex.x, vertex.y)
      }
    })
    shape.closePath()
    
    // Extrude to create thin 3D geometry
    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.001,
      bevelSegments: 1
    }
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    
    // Center geometry at origin for proper rotation
    geometry.computeBoundingBox()
    const center = new THREE.Vector3()
    geometry.boundingBox.getCenter(center)
    geometry.translate(-center.x, -center.y, -0.01)
    
    shards.push({
      geometry,
      center: {
        x: cell.site.x,
        y: cell.site.y
      }
    })
  })
  
  return shards
}

/**
 * Simplified Voronoi cell computation
 * Uses nearest-neighbor approach (not true Fortune's algorithm, but fast)
 */
function computeVoronoiCells(sites, width, height) {
  const cells = []
  const bounds = {
    minX: -width / 2,
    maxX: width / 2,
    minY: -height / 2,
    maxY: height / 2
  }
  
  sites.forEach((site, siteIndex) => {
    const vertices = []
    
    // Create bounding polygon for this site
    // For each edge of neighboring sites, find the perpendicular bisector
    sites.forEach((otherSite, otherIndex) => {
      if (siteIndex === otherIndex) return
      
      // Perpendicular bisector between this site and neighbor
      const midX = (site.x + otherSite.x) / 2
      const midY = (site.y + otherSite.y) / 2
      
      const dx = otherSite.x - site.x
      const dy = otherSite.y - site.y
      
      // Perpendicular direction
      const perpDx = -dy
      const perpDy = dx
      
      vertices.push({
        x: midX + perpDx * 0.1,
        y: midY + perpDy * 0.1
      })
    })
    
    // Clip to bounds and sort vertices
    vertices.push(
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
      { x: bounds.minX, y: bounds.maxY }
    )
    
    // Sort vertices by angle from site (to form convex polygon)
    const sortedVertices = vertices
      .filter(v => 
        v.x >= bounds.minX && v.x <= bounds.maxX &&
        v.y >= bounds.minY && v.y <= bounds.maxY
      )
      .sort((a, b) => {
        const angleA = Math.atan2(a.y - site.y, a.x - site.x)
        const angleB = Math.atan2(b.y - site.y, b.x - site.x)
        return angleA - angleB
      })
    
    // Use convex hull to get clean polygon
    const hull = computeConvexHull(sortedVertices)
    
    cells.push({
      site,
      vertices: hull.slice(0, 8) // Limit complexity
    })
  })
  
  return cells
}

/**
 * Graham scan for convex hull
 */
function computeConvexHull(points) {
  if (points.length < 3) return points
  
  // Find lowest point
  points.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y)
  const pivot = points[0]
  
  // Sort by polar angle
  const sorted = points.slice(1).sort((a, b) => {
    const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x)
    const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x)
    return angleA - angleB
  })
  
  const hull = [pivot, sorted[0]]
  
  for (let i = 1; i < sorted.length; i++) {
    let top = hull[hull.length - 1]
    let prev = hull[hull.length - 2]
    
    while (hull.length > 1 && ccw(prev, top, sorted[i]) <= 0) {
      hull.pop()
      top = hull[hull.length - 1]
      prev = hull[hull.length - 2]
    }
    
    hull.push(sorted[i])
  }
  
  return hull
}

function ccw(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

/**
 * Alternative: Use simple grid-based fracture for better performance
 */
export function fractureGlassGrid(width, height, cols = 10, rows = 12) {
  const shards = []
  const cellWidth = width / cols
  const cellHeight = height / rows
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -width / 2 + col * cellWidth
      const y = -height / 2 + row * cellHeight
      
      // Add randomization to vertices
      const jitter = 0.2
      const vertices = [
        { x: x + Math.random() * cellWidth * jitter, 
          y: y + Math.random() * cellHeight * jitter },
        { x: x + cellWidth - Math.random() * cellWidth * jitter, 
          y: y + Math.random() * cellHeight * jitter },
        { x: x + cellWidth - Math.random() * cellWidth * jitter, 
          y: y + cellHeight - Math.random() * cellHeight * jitter },
        { x: x + Math.random() * cellWidth * jitter, 
          y: y + cellHeight - Math.random() * cellHeight * jitter }
      ]
      
      const shape = new THREE.Shape()
      vertices.forEach((v, i) => {
        if (i === 0) shape.moveTo(v.x, v.y)
        else shape.lineTo(v.x, v.y)
      })
      shape.closePath()
      
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.02,
        bevelEnabled: false
      })
      
      shards.push({
        geometry,
        center: {
          x: x + cellWidth / 2,
          y: y + cellHeight / 2
        }
      })
    }
  }
  
  return shards
}
