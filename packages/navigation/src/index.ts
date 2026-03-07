/**
 * @world-of-npcs/navigation - Navigation and pathfinding system
 * 
 * Provides A* pathfinding between zones and movement resolution
 * for NPC agents
 */

// Re-export from pathfinder
export { 
  Pathfinder, 
  default as PathfinderDefault,
  type PathfinderConfig,
  type Position,
  type PathNode,
  type PathResult,
  type MovementWaypoint,
} from './pathfinder';

// Re-export from movement
export { 
  MovementResolver, 
  default as MovementResolverDefault,
  type MovementConfig,
  type AgentMovementState,
  type UpdateResult,
} from './movement';
