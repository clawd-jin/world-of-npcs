/**
 * MovementResolver - Handles agent movement and navigation
 * 
 * Manages agent movement along paths, interpolation,
 * and arrival detection
 */

import { Zone, getZoneById } from '@world-of-npcs/world-model';
import { 
  Pathfinder, 
  PathResult, 
  Position, 
  MovementWaypoint 
} from './pathfinder';

export interface AgentMovementState {
  agentId: string;
  currentZoneId: string;
  targetZoneId: string | null;
  position: Position;
  path: PathResult | null;
  currentWaypointIndex: number;
  progress: number; // 0-1 along current segment
  speed: number; // units per second
  isMoving: boolean;
  arrivedAtWaypoint: number | null;
}

export interface MovementConfig {
  /**
   * Default movement speed (units per second)
   */
  defaultSpeed?: number;
  
  /**
   * Distance threshold to consider waypoint reached
   */
  waypointThreshold?: number;
  
  /**
   * Enable smooth interpolation
   */
  smoothInterpolation?: boolean;
  
  /**
   * Callback when agent arrives at zone
   */
  onZoneArrival?: (agentId: string, zone: Zone) => void;
  
  /**
   * Callback when agent reaches waypoint
   */
  onWaypointReached?: (agentId: string, waypoint: MovementWaypoint) => void;
}

export interface UpdateResult {
  position: Position;
  currentZoneId: string;
  completed: boolean;
  zoneArrived: boolean;
}

/**
 * MovementResolver - handles agent movement along calculated paths
 */
export class MovementResolver {
  private pathfinder: Pathfinder;
  private agents: Map<string, AgentMovementState> = new Map();
  private config: Required<MovementConfig>;

  constructor(pathfinder: Pathfinder, config: MovementConfig = {}) {
    this.pathfinder = pathfinder;
    this.config = {
      defaultSpeed: config.defaultSpeed ?? 50,
      waypointThreshold: config.waypointThreshold ?? 5,
      smoothInterpolation: config.smoothInterpolation ?? true,
      onZoneArrival: config.onZoneArrival ?? (() => {}),
      onWaypointReached: config.onWaypointReached ?? (() => {}),
    };
  }

  /**
   * Start moving an agent to a target zone
   */
  startMovement(agentId: string, targetZoneId: string): PathResult {
    const agent = this.getOrCreateAgent(agentId);
    const targetZone = getZoneById(targetZoneId);
    
    if (!targetZone) {
      throw new Error(`Invalid target zone: ${targetZoneId}`);
    }
    
    // Calculate path from current position to target
    const path = this.pathfinder.findPath(agent.currentZoneId, targetZoneId);
    
    agent.targetZoneId = targetZoneId;
    agent.path = path;
    agent.currentWaypointIndex = 0;
    agent.progress = 0;
    agent.isMoving = true;
    agent.arrivedAtWaypoint = null;
    
    // Update position to first waypoint
    if (path.positions.length > 0) {
      agent.position = { ...path.positions[0] };
    }
    
    return path;
  }

  /**
   * Stop agent movement
   */
  stopMovement(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.isMoving = false;
      agent.targetZoneId = null;
      agent.path = null;
    }
  }

  /**
   * Update agent position based on elapsed time
   * Call this each frame/tick with delta time
   */
  update(agentId: string, deltaMs: number): UpdateResult {
    const agent = this.agents.get(agentId);
    
    if (!agent || !agent.isMoving || !agent.path) {
      return {
        position: agent?.position ?? { x: 0, y: 0 },
        currentZoneId: agent?.currentZoneId ?? '',
        completed: true,
        zoneArrived: false,
      };
    }
    
    const deltaSeconds = deltaMs / 1000;
    const path = agent.path;
    
    // Calculate total path distance
    const totalDistance = path.totalDistance;
    
    if (totalDistance === 0) {
      // Already at destination
      const targetZone = getZoneById(agent.targetZoneId!);
      if (targetZone) {
        agent.currentZoneId = targetZone.id;
      }
      agent.isMoving = false;
      
      return {
        position: agent.position,
        currentZoneId: agent.currentZoneId,
        completed: true,
        zoneArrived: true,
      };
    }
    
    // Calculate distance to move this frame
    const distanceThisFrame = agent.speed * deltaSeconds;
    const progressIncrement = distanceThisFrame / totalDistance;
    
    // Update overall progress
    agent.progress = Math.min(1, agent.progress + progressIncrement);
    
    // Interpolate position
    if (this.config.smoothInterpolation) {
      agent.position = this.pathfinder.interpolatePath(
        path.positions,
        agent.progress
      );
    } else {
      // Step along waypoints
      agent.position = this.getSteppedPosition(agent, distanceThisFrame);
    }
    
    // Check for waypoint/zone arrival
    const zoneArrived = this.checkWaypointArrival(agent, path);
    
    // Check if path completed
    const completed = agent.progress >= 1;
    
    if (completed) {
      const targetZone = getZoneById(agent.targetZoneId!);
      if (targetZone) {
        agent.currentZoneId = targetZone.id;
        this.config.onZoneArrival(agentId, targetZone);
      }
      agent.isMoving = false;
    }
    
    return {
      position: agent.position,
      currentZoneId: agent.currentZoneId,
      completed,
      zoneArrived,
    };
  }

  /**
   * Check if agent has reached current waypoint
   */
  private checkWaypointArrival(
    agent: AgentMovementState, 
    path: PathResult
  ): boolean {
    const currentWaypointIndex = agent.currentWaypointIndex;
    
    if (currentWaypointIndex >= path.positions.length - 1) {
      return false; // Already at last waypoint
    }
    
    const currentWaypoint = path.positions[currentWaypointIndex];
    const distance = this.pathfinder.distance(agent.position, currentWaypoint);
    
    if (distance < this.config.waypointThreshold) {
      // Waypoint reached
      agent.currentWaypointIndex++;
      agent.arrivedAtWaypoint = Date.now();
      
      const waypoint: MovementWaypoint = {
        zone: path.path[agent.currentWaypointIndex],
        position: path.positions[agent.currentWaypointIndex],
        arrivedAt: agent.arrivedAtWaypoint,
      };
      
      this.config.onWaypointReached(agent.agentId, waypoint);
      return true;
    }
    
    return false;
  }

  /**
   * Get stepped position (non-interpolated movement)
   */
  private getSteppedPosition(
    agent: AgentMovementState, 
    distance: number
  ): Position {
    if (!agent.path) return agent.position;
    
    const path = agent.path;
    let remainingDistance = distance;
    
    for (let i = agent.currentWaypointIndex; i < path.positions.length - 1; i++) {
      const segmentStart = path.positions[i];
      const segmentEnd = path.positions[i + 1];
      const segmentLength = this.pathfinder.distance(segmentStart, segmentEnd);
      
      if (remainingDistance >= segmentLength) {
        remainingDistance -= segmentLength;
        agent.currentWaypointIndex = i + 1;
      } else {
        // Move along this segment
        const ratio = remainingDistance / segmentLength;
        return {
          x: segmentStart.x + (segmentEnd.x - segmentStart.x) * ratio,
          y: segmentStart.y + (segmentEnd.y - segmentStart.y) * ratio,
        };
      }
    }
    
    return path.positions[path.positions.length - 1];
  }

  /**
   * Get or create agent state
   */
  private getOrCreateAgent(agentId: string): AgentMovementState {
    let agent = this.agents.get(agentId);
    
    if (!agent) {
      agent = {
        agentId,
        currentZoneId: 'hq_office_floor', // Default start zone
        targetZoneId: null,
        position: { x: 0, y: 0 },
        path: null,
        currentWaypointIndex: 0,
        progress: 0,
        speed: this.config.defaultSpeed,
        isMoving: false,
        arrivedAtWaypoint: null,
      };
      this.agents.set(agentId, agent);
    }
    
    return agent;
  }

  /**
   * Get current agent state
   */
  getAgentState(agentId: string): AgentMovementState | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Set agent's current zone (teleport)
   */
  setAgentZone(agentId: string, zoneId: string): void {
    const agent = this.getOrCreateAgent(agentId);
    const zone = getZoneById(zoneId);
    
    if (!zone) {
      throw new Error(`Invalid zone: ${zoneId}`);
    }
    
    agent.currentZoneId = zoneId;
    agent.position = this.pathfinder.getZonePosition(zoneId);
  }

  /**
   * Set agent movement speed
   */
  setAgentSpeed(agentId: string, speed: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.speed = speed;
    }
  }

  /**
   * Remove agent from tracking
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Get all tracked agents
   */
  getAllAgents(): AgentMovementState[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if agent is currently moving
   */
  isAgentMoving(agentId: string): boolean {
    return this.agents.get(agentId)?.isMoving ?? false;
  }

  /**
   * Get remaining path distance
   */
  getRemainingDistance(agentId: string): number {
    const agent = this.agents.get(agentId);
    
    if (!agent || !agent.path) return 0;
    
    const remaining = 1 - agent.progress;
    return agent.path.totalDistance * remaining;
  }
}

export default MovementResolver;
