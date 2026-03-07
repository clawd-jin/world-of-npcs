// Point/Coordinates
export interface Point {
  x: number
  y: number
}

// World object types
export type WorldObjectType = 'desk' | 'chair' | 'whiteboard' | 'meeting_table' | 'terminal' | 'bench' | 'bounty_board'

// World object
export interface WorldObject {
  id: string
  type: WorldObjectType
  position: Point
  animationAnchors: Point[]
}

// Zone transition
export interface ZoneTransition {
  targetZoneId: string
  position: Point
  direction: string
}

// Zone configuration
export interface ZoneConfig {
  walkable: boolean
  objects: WorldObject[]
  spawnPoints: Point[]
  transitions: ZoneTransition[]
  ambientRules: string[]
}

// Zone type
export type ZoneType = 'hq_interior' | 'hq_room' | 'city_street' | 'city_shop' | 'city_park' | 'city_transit' | 'city_leisure'

// Main Zone interface
export interface Zone {
  id: string
  worldId: string
  name: string
  type: ZoneType
  configJson: ZoneConfig
}
