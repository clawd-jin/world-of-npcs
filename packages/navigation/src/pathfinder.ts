/**
 * Pathfinder - A* pathfinding and zone navigation
 * 
 * Provides pathfinding between zones using A* algorithm
 * and movement interpolation for smooth navigation
 */

import { Zone, getZoneById, getConnectedZones } from '@world-of-npcs/world-model';

export interface Position {
  x: number;
  y: number;
}

export interface PathNode {
  zoneId: string;
  position: Position;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export interface PathResult {
  path: Zone[];
  positions: Position[];
  totalDistance: number;
}

export interface MovementWaypoint {
  zone: Zone;
  position: Position;
  arrivedAt?: number;
}

/**
 * Configuration for pathfinding
 */
export interface PathfinderConfig {
  /**
   * Maximum number of zones to traverse (prevents infinite loops)
   */
  maxZones?: number;
  
  /**
   * Heuristic function for A* (defaults to zone count distance)
   */
  heuristic?: (from: Zone, to: Zone) => number;
  
  /**
   * Cost multiplier for different zone transitions
   */
  transitionCost?: (from: Zone, to: Zone) => number;
  
  /**
   * Zone positions for interpolation
   */
  zonePositions?: Record<string, Position>;
}

const DEFAULT_ZONE_POSITIONS: Record<string, Position> = {
  // HQ Interior
  hq_office_floor: { x: 0, y: 0 },
  hq_meeting_room: { x: 50, y: 0 },
  hq_lounge: { x: 0, y: 50 },
  hq_lab: { x: 100, y: 0 },
  hq_kitchen: { x: 0, y: 100 },
  hq_delivery_bay: { x: 150, y: 50 },
  hq_hallways: { x: 50, y: 50 },
  // City
  city_street: { x: 200, y: 50 },
  city_shop: { x: 250, y: 0 },
  city_park: { x: 250, y: 100 },
  city_transit: { x: 300, y: 50 },
  city_leisure: { x: 300, y: 100 },
};

/**
 * Pathfinder class - handles A* pathfinding between zones
 */
export class Pathfinder {
  private config: Required<PathfinderConfig>;
  
  constructor(config: PathfinderConfig = {}) {
    this.config = {
      maxZones: config.maxZones ?? 20,
      heuristic: config.heuristic ?? this.defaultHeuristic,
      transitionCost: config.transitionCost ?? (() => 1),
      zonePositions: config.zonePositions ?? DEFAULT_ZONE_POSITIONS,
    };
  }

  /**
   * Default heuristic: number of zones to traverse
   */
  private defaultHeuristic = (from: Zone, to: Zone): number => {
    const path = this.findZonePath(from.id, to.id);
    return path.length;
  };

  /**
   * Get position for a zone
   */
  getZonePosition(zoneId: string): Position {
    return this.config.zonePositions[zoneId] ?? { x: 0, y: 0 };
  }

  /**
   * Set position for a zone
   */
  setZonePosition(zoneId: string, position: Position): void {
    this.config.zonePositions[zoneId] = position;
  }

  /**
   * Find a path between two zones using A*
   */
  findPath(fromZoneId: string, toZoneId: string): PathResult {
    const fromZone = getZoneById(fromZoneId);
    const toZone = getZoneById(toZoneId);
    
    if (!fromZone || !toZone) {
      throw new Error(`Invalid zone(s): ${fromZoneId} -> ${toZoneId}`);
    }
    
    if (fromZoneId === toZoneId) {
      return {
        path: [fromZone],
        positions: [this.getZonePosition(fromZoneId)],
        totalDistance: 0,
      };
    }
    
    const zonePath = this.findZonePath(fromZoneId, toZoneId);
    
    if (!zonePath || zonePath.length === 0) {
      throw new Error(`No path found from ${fromZoneId} to ${toZoneId}`);
    }
    
    const positions = zonePath.map(zone => this.getZonePosition(zone.id));
    const totalDistance = this.calculatePathDistance(positions);
    
    return {
      path: zonePath,
      positions,
      totalDistance,
    };
  }

  /**
   * A* zone-to-zone pathfinding
   */
  private findZonePath(fromZoneId: string, toZoneId: string): Zone[] {
    const openSet: Set<string> = new Set([fromZoneId]);
    const closedSet: Set<string> = new Set();
    
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map([[fromZoneId, 0]]);
    const fScore: Map<string, number> = new Map();
    
    const fromZone = getZoneById(fromZoneId)!;
    const toZone = getZoneById(toZoneId)!;
    fScore.set(fromZoneId, this.config.heuristic(fromZone, toZone));
    
    let iterations = 0;
    const maxIterations = this.config.maxZones * this.config.maxZones;
    
    while (openSet.size > 0) {
      if (iterations++ > maxIterations) {
        throw new Error('Pathfinding exceeded maximum iterations');
      }
      
      // Get node with lowest fScore
      let current: string | null = null;
      let lowestF = Infinity;
      
      for (const nodeId of openSet) {
        const f = fScore.get(nodeId) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = nodeId;
        }
      }
      
      if (!current) break;
      
      // Found the goal
      if (current === toZoneId) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.delete(current);
      closedSet.add(current);
      
      const currentZone = getZoneById(current);
      if (!currentZone) continue;
      
      const neighbors = getConnectedZones(current);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.id)) continue;
        
        const tentativeG = (gScore.get(current) ?? Infinity) + 
          this.config.transitionCost(currentZone, neighbor);
        
        if (!openSet.has(neighbor.id)) {
          openSet.add(neighbor.id);
        } else if (tentativeG >= (gScore.get(neighbor.id) ?? Infinity)) {
          continue;
        }
        
        cameFrom.set(neighbor.id, current);
        gScore.set(neighbor.id, tentativeG);
        
        const h = this.config.heuristic(neighbor, toZone);
        fScore.set(neighbor.id, tentativeG + h);
      }
    }
    
    return []; // No path found
  }

  /**
   * Reconstruct path from A* results
   */
  private reconstructPath(cameFrom: Map<string, string>, current: string): Zone[] {
    const path: Zone[] = [];
    let nodeId: string | undefined = current;
    
    while (nodeId) {
      const zone = getZoneById(nodeId);
      if (zone) {
        path.unshift(zone);
      }
      nodeId = cameFrom.get(nodeId);
    }
    
    return path;
  }

  /**
   * Calculate total distance of a path
   */
  private calculatePathDistance(positions: Position[]): number {
    let distance = 0;
    
    for (let i = 1; i < positions.length; i++) {
      distance += this.distance(positions[i - 1], positions[i]);
    }
    
    return distance;
  }

  /**
   * Calculate distance between two positions (Euclidean)
   */
  distance(a: Position, b: Position): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Interpolate position along a path
   */
  interpolatePath(
    positions: Position[],
    progress: number
  ): Position {
    if (positions.length === 0) {
      return { x: 0, y: 0 };
    }
    
    if (positions.length === 1) {
      return positions[0];
    }
    
    // Clamp progress to valid range
    progress = Math.max(0, Math.min(1, progress));
    
    // Scale progress to path segments
    const totalSegments = positions.length - 1;
    const scaledProgress = progress * totalSegments;
    
    const segmentIndex = Math.floor(scaledProgress);
    const segmentProgress = scaledProgress - segmentIndex;
    
    if (segmentIndex >= totalSegments) {
      return positions[positions.length - 1];
    }
    
    const start = positions[segmentIndex];
    const end = positions[segmentIndex + 1];
    
    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress,
    };
  }

  /**
   * Get movement waypoints for a path
   */
  getWaypoints(path: PathResult): MovementWaypoint[] {
    return path.path.map((zone, index) => ({
      zone,
      position: path.positions[index],
    }));
  }
}

export default Pathfinder;
