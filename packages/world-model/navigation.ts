/**
 * Navigation utilities for world-of-npcs
 * Includes pathfinding and zone transitions
 */

import { ZONES, Zone, getZoneById, getConnectedZones } from './zones';

export interface PathNode {
  zoneId: string;
  distance: number;
  parent: PathNode | null;
}

export interface NavigationPath {
  zones: Zone[];
  totalDistance: number;
  transitions: string[];
}

/**
 * Find the shortest path between two zones using BFS
 */
export function findPath(startZoneId: string, endZoneId: string): NavigationPath | null {
  const startZone = getZoneById(startZoneId);
  const endZone = getZoneById(endZoneId);
  
  if (!startZone || !endZone) {
    return null;
  }
  
  if (startZoneId === endZoneId) {
    return {
      zones: [startZone],
      totalDistance: 0,
      transitions: [],
    };
  }
  
  // BFS for shortest path
  const queue: PathNode[] = [{ zoneId: startZoneId, distance: 0, parent: null }];
  const visited = new Set<string>([startZoneId]);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.zoneId === endZoneId) {
      // Reconstruct path
      const path: Zone[] = [];
      const transitions: string[] = [];
      let node: PathNode | null = current;
      let prevZoneId: string | null = null;
      
      while (node) {
        const zone = getZoneById(node.zoneId);
        if (zone) {
          path.unshift(zone);
          if (prevZoneId) {
            transitions.push(`${prevZoneId} -> ${node.zoneId}`);
          }
          prevZoneId = node.zoneId;
        }
        node = node.parent;
      }
      
      return {
        zones: path,
        totalDistance: current.distance,
        transitions,
      };
    }
    
    const connected = getConnectedZones(current.zoneId);
    for (const zone of connected) {
      if (!visited.has(zone.id)) {
        visited.add(zone.id);
        queue.push({
          zoneId: zone.id,
          distance: current.distance + 1,
          parent: current,
        });
      }
    }
  }
  
  return null; // No path found
}

/**
 * Check if two zones are directly connected
 */
export function areZonesConnected(zoneId1: string, zoneId2: string): boolean {
  const zone1 = getZoneById(zoneId1);
  if (!zone1) return false;
  return zone1.connectedZones.includes(zoneId2);
}

/**
 * Get all zones reachable within a given number of hops
 */
export function getReachableZones(startZoneId: string, maxHops: number): Zone[] {
  const startZone = getZoneById(startZoneId);
  if (!startZone) return [];
  
  const reachable: Zone[] = [startZone];
  let currentLevel = [startZoneId];
  const visited = new Set<string>([startZoneId]);
  
  for (let hop = 1; hop <= maxHops; hop++) {
    const nextLevel: string[] = [];
    
    for (const zoneId of currentLevel) {
      const connected = getConnectedZones(zoneId);
      for (const zone of connected) {
        if (!visited.has(zone.id)) {
          visited.add(zone.id);
          reachable.push(zone);
          nextLevel.push(zone.id);
        }
      }
    }
    
    currentLevel = nextLevel;
    if (currentLevel.length === 0) break;
  }
  
  return reachable;
}

/**
 * Get the distance between two zones (number of hops)
 */
export function getZoneDistance(zoneId1: string, zoneId2: string): number {
  const path = findPath(zoneId1, zoneId2);
  return path?.totalDistance ?? -1;
}

/**
 * Get all possible zone transitions from a starting zone
 */
export function getZoneTransitions(startZoneId: string): { zone: Zone; distance: number }[] {
  const startZone = getZoneById(startZoneId);
  if (!startZone) return [];
  
  const transitions: { zone: Zone; distance: number }[] = [];
  const reachable = getReachableZones(startZoneId, 10); // Max reasonable distance
  
  for (const zone of reachable) {
    if (zone.id !== startZoneId) {
      const distance = getZoneDistance(startZoneId, zone.id);
      if (distance >= 0) {
        transitions.push({ zone, distance });
      }
    }
  }
  
  return transitions.sort((a, b) => a.distance - b.distance);
}

/**
 * Check if a zone transition is valid (HQ <-> City only via Delivery Bay)
 */
export function isValidTransition(fromZoneId: string, toZoneId: string): boolean {
  const fromZone = getZoneById(fromZoneId);
  const toZone = getZoneById(toZoneId);
  
  if (!fromZone || !toZone) return false;
  
  // Check if directly connected
  if (!areZonesConnected(fromZoneId, toZoneId)) return false;
  
  // Check for cross-location transitions (must go through Delivery Bay or Street)
  if (fromZone.location !== toZone.location) {
    // Must pass through delivery bay or street
    const validGateways = ['hq_delivery_bay', 'city_street'];
    return validGateways.includes(fromZoneId) || validGateways.includes(toZoneId);
  }
  
  return true;
}

/**
 * Find nearest zone of a specific type from a starting zone
 */
export function findNearestZone(startZoneId: string, targetType: string): Zone | null {
  const startZone = getZoneById(startZoneId);
  if (!startZone) return null;
  
  const path = findPath(startZoneId, targetType);
  return path?.zones[path.zones.length - 1] ?? null;
}

// Navigation helper for NPCs
export class Navigator {
  private currentZoneId: string;
  
  constructor(startingZoneId: string) {
    this.currentZoneId = startingZoneId;
  }
  
  getCurrentZone(): Zone | null {
    return getZoneById(this.currentZoneId);
  }
  
  moveTo(zoneId: string): NavigationPath | null {
    const path = findPath(this.currentZoneId, zoneId);
    if (path && path.zones.length > 1) {
      this.currentZoneId = zoneId;
    }
    return path;
  }
  
  canReach(zoneId: string): boolean {
    return findPath(this.currentZoneId, zoneId) !== null;
  }
  
  distanceTo(zoneId: string): number {
    return getZoneDistance(this.currentZoneId, zoneId);
  }
}
