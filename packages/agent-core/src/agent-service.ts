import { Agent, AgentState, Location, SkillProfile } from '@world-of-npcs/shared-types'
import { AgentRepository, CreateAgentDTO, UpdateAgentStateDTO } from './agent-repository'

/**
 * Valid agent states for transitions
 */
const VALID_STATES: AgentState[] = [
  'spawning', 'walking', 'working', 'meeting', 'socializing',
  'exploring', 'resting', 'idle',
  'evaluating_bounties', 'claiming_bounty', 'bounty_working',
  'bounty_collaborating', 'learning', 'interrupted', 'offline'
]

/**
 * States that are considered "active" (not idle/resting)
 */
const ACTIVE_STATES: AgentState[] = [
  'walking', 'working', 'meeting', 'socializing',
  'exploring', 'evaluating_bounties', 'claiming_bounty',
  'bounty_working', 'bounty_collaborating', 'learning'
]

/**
 * States that are considered "available" for new tasks
 */
const AVAILABLE_STATES: AgentState[] = [
  'idle', 'resting', 'exploring', 'socializing', 'learning'
]

/**
 * Agent lifecycle events for tracking
 */
export interface AgentLifecycleEvent {
  agentId: string
  event: 'created' | 'state_changed' | 'task_started' | 'task_completed' | 'energy_depleted' | 'offline' | 'online'
  previousState?: AgentState
  newState: AgentState
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Agent service configuration
 */
export interface AgentServiceConfig {
  defaultEnergyDrain?: number
  lowEnergyThreshold?: number
}

/**
 * Agent service for managing agent lifecycle and state transitions
 */
export class AgentService {
  private repository: AgentRepository
  private lifecycleListeners: Array<(event: AgentLifecycleEvent) => void> = []
  private config: Required<AgentServiceConfig>

  constructor(repository?: AgentRepository, config?: AgentServiceConfig) {
    this.repository = repository || new AgentRepository()
    this.config = {
      defaultEnergyDrain: config?.defaultEnergyDrain ?? 5,
      lowEnergyThreshold: config?.lowEnergyThreshold ?? 20,
    }
  }

  /**
   * Create a new agent
   */
  createAgent(dto: CreateAgentDTO): Agent {
    const agent = this.repository.create(dto)
    this.emitLifecycleEvent({
      agentId: agent.id,
      event: 'created',
      newState: agent.currentState,
      timestamp: new Date(),
    })
    return agent
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return this.repository.getById(id)
  }

  /**
   * Get all agents for an owner
   */
  getAgentsByOwner(ownerUserId: string): Agent[] {
    return this.repository.getByOwner(ownerUserId)
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return this.repository.getAll()
  }

  /**
   * Update agent state with lifecycle management
   */
  updateAgentState(agentId: string, newState: AgentState, metadata?: Record<string, unknown>): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    // Validate state
    if (!this.isValidState(newState)) {
      throw new Error(`Invalid agent state: ${newState}`)
    }

    const previousState = agent.currentState

    // Handle energy-based transitions
    if (newState !== 'offline' && agent.energy <= this.config.lowEnergyThreshold && !ACTIVE_STATES.includes(newState)) {
      // Auto-transition to resting if energy is low and trying to do active work
      newState = 'resting'
    }

    const dto: UpdateAgentStateDTO = {
      state: newState,
    }

    const updatedAgent = this.repository.updateState(agentId, dto)
    
    if (updatedAgent) {
      this.emitLifecycleEvent({
        agentId,
        event: 'state_changed',
        previousState,
        newState,
        timestamp: new Date(),
        metadata,
      })

      // Emit specific events based on state
      if (newState === 'offline' && previousState !== 'offline') {
        this.emitLifecycleEvent({
          agentId,
          event: 'offline',
          previousState,
          newState,
          timestamp: new Date(),
        })
      } else if (previousState === 'offline' && newState !== 'offline') {
        this.emitLifecycleEvent({
          agentId,
          event: 'online',
          previousState,
          newState,
          timestamp: new Date(),
        })
      }
    }

    return updatedAgent
  }

  /**
   * Update agent location
   */
  updateAgentLocation(agentId: string, location: Location): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    return this.repository.updateState(agentId, {
      state: agent.currentState,
      location,
    })
  }

  /**
   * Assign a task to an agent
   */
  assignTask(agentId: string, taskId: string): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    if (!this.isAvailableForTask(agent)) {
      throw new Error(`Agent ${agentId} is not available for tasks (current state: ${agent.currentState})`)
    }

    const updatedAgent = this.repository.update(agentId, {
      currentTaskId: taskId,
      currentState: 'working',
    })

    if (updatedAgent) {
      this.emitLifecycleEvent({
        agentId,
        event: 'task_started',
        previousState: agent.currentState,
        newState: 'working',
        timestamp: new Date(),
        metadata: { taskId },
      })
    }

    return updatedAgent
  }

  /**
   * Complete a task for an agent
   */
  completeTask(agentId: string): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    const updatedAgent = this.repository.update(agentId, {
      currentTaskId: null,
      currentState: 'idle',
    })

    if (updatedAgent) {
      this.emitLifecycleEvent({
        agentId,
        event: 'task_completed',
        previousState: agent.currentState,
        newState: 'idle',
        timestamp: new Date(),
        metadata: { taskId: agent.currentTaskId },
      })
    }

    return updatedAgent
  }

  /**
   * Assign a bounty to an agent
   */
  assignBounty(agentId: string, bountyId: string): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    if (!this.isAvailableForTask(agent)) {
      throw new Error(`Agent ${agentId} is not available for bounty work (current state: ${agent.currentState})`)
    }

    return this.repository.update(agentId, {
      currentBountyId: bountyId,
      currentState: 'bounty_working',
    })
  }

  /**
   * Update agent energy (drain or restore)
   */
  updateEnergy(agentId: string, delta: number): Agent | undefined {
    const agent = this.repository.getById(agentId)
    if (!agent) {
      return undefined
    }

    const newEnergy = Math.max(0, Math.min(100, agent.energy + delta))
    const updatedAgent = this.repository.updateState(agentId, {
      state: agent.currentState,
      energy: newEnergy,
    })

    if (updatedAgent && newEnergy <= this.config.lowEnergyThreshold && agent.energy > this.config.lowEnergyThreshold) {
      this.emitLifecycleEvent({
        agentId,
        event: 'energy_depleted',
        previousState: agent.currentState,
        newState: agent.currentState,
        timestamp: new Date(),
        metadata: { energy: newEnergy },
      })
    }

    return updatedAgent
  }

  /**
   * Get agents that are available for tasks
   */
  getAvailableAgents(): Agent[] {
    return this.repository.getAll().filter((agent) => this.isAvailableForTask(agent))
  }

  /**
   * Get agents by state
   */
  getAgentsByState(state: AgentState): Agent[] {
    return this.repository.getByState(state)
  }

  /**
   * Check if an agent is valid for state transition
   */
  private isValidState(state: AgentState): boolean {
    return VALID_STATES.includes(state)
  }

  /**
   * Check if an agent is available for new tasks
   */
  private isAvailableForTask(agent: Agent): boolean {
    return AVAILABLE_STATES.includes(agent.currentState) && !agent.currentTaskId && !agent.currentBountyId
  }

  /**
   * Register a lifecycle event listener
   */
  onLifecycleEvent(listener: (event: AgentLifecycleEvent) => void): void {
    this.lifecycleListeners.push(listener)
  }

  /**
   * Remove a lifecycle event listener
   */
  offLifecycleEvent(listener: (event: AgentLifecycleEvent) => void): void {
    const index = this.lifecycleListeners.indexOf(listener)
    if (index > -1) {
      this.lifecycleListeners.splice(index, 1)
    }
  }

  /**
   * Emit a lifecycle event to all listeners
   */
  private emitLifecycleEvent(event: AgentLifecycleEvent): void {
    this.lifecycleListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Lifecycle listener error:', error)
      }
    })
  }

  /**
   * Delete an agent
   */
  deleteAgent(id: string): boolean {
    return this.repository.delete(id)
  }
}
