import { Agent, AgentState, Location, SkillProfile, RelationshipStats, Wallet, Permissions } from '@world-of-npcs/shared-types';

/**
 * Data transfer object for creating a new agent
 */
export interface CreateAgentDTO {
  ownerUserId: string
  providerType: string
  externalAgentId: string
  displayName: string
  avatarId: string
  role: string
  personalityProfile: object
  location: Location
  skillProfile: SkillProfile
  metadata?: object
}

/**
 * Data transfer object for updating agent state
 */
export interface UpdateAgentStateDTO {
  state: AgentState
  location?: Location
  taskId?: string | null
  bountyId?: string | null
  energy?: number
  mood?: string
}

/**
 * In-memory agent repository with CRUD operations
 */
export class AgentRepository {
  private agents: Map<string, Agent> = new Map()

  /**
   * Create a new agent
   */
  create(dto: CreateAgentDTO): Agent {
    const now = new Date()
    
    const agent: Agent = {
      id: this.generateId(),
      ownerUserId: dto.ownerUserId,
      providerType: dto.providerType,
      externalAgentId: dto.externalAgentId,
      displayName: dto.displayName,
      avatarId: dto.avatarId,
      role: dto.role,
      personalityProfile: dto.personalityProfile,
      currentState: 'idle',
      currentTaskId: null,
      currentBountyId: null,
      location: dto.location,
      energy: 100,
      mood: 'neutral',
      skillProfile: dto.skillProfile,
      relationshipStats: {
        totalRelationships: 0,
        averageFamiliarity: 0,
        averageTrust: 0,
        averageAffinity: 0,
      },
      wallet: {
        balance: 0,
        lifetimeEarnings: 0,
      },
      permissions: {
        canDeploy: true,
        canBountyHunt: true,
        canSocialize: true,
        canExplore: true,
      },
      metadata: dto.metadata || {},
      createdAt: now,
    }

    this.agents.set(agent.id, agent)
    return agent
  }

  /**
   * Get an agent by ID
   */
  getById(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  /**
   * Get all agents for a specific owner
   */
  getByOwner(ownerUserId: string): Agent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.ownerUserId === ownerUserId
    )
  }

  /**
   * Get all agents
   */
  getAll(): Agent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Update an existing agent
   */
  update(id: string, updates: Partial<Agent>): Agent | undefined {
    const agent = this.agents.get(id)
    if (!agent) {
      return undefined
    }

    const updatedAgent = { ...agent, ...updates }
    this.agents.set(id, updatedAgent)
    return updatedAgent
  }

  /**
   * Update agent state specifically
   */
  updateState(id: string, dto: UpdateAgentStateDTO): Agent | undefined {
    const agent = this.agents.get(id)
    if (!agent) {
      return undefined
    }

    const updatedAgent: Agent = {
      ...agent,
      currentState: dto.state,
      ...(dto.location && { location: dto.location }),
      ...(dto.taskId !== undefined && { currentTaskId: dto.taskId }),
      ...(dto.bountyId !== undefined && { currentBountyId: dto.bountyId }),
      ...(dto.energy !== undefined && { energy: dto.energy }),
      ...(dto.mood && { mood: dto.mood }),
    }

    this.agents.set(id, updatedAgent)
    return updatedAgent
  }

  /**
   * Delete an agent by ID
   */
  delete(id: string): boolean {
    return this.agents.delete(id)
  }

  /**
   * Check if an agent exists
   */
  exists(id: string): boolean {
    return this.agents.has(id)
  }

  /**
   * Get agents by state
   */
  getByState(state: AgentState): Agent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.currentState === state
    )
  }

  /**
   * Generate a unique agent ID
   */
  private generateId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
