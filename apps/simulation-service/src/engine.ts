// SimulationEngine class for world-of-npcs Phase 1

import { 
  SimulationEventEmitter,
  simulationEvents,
  AgentState,
  Intention,
  Bounty,
  Position,
  AgentCreatedEvent,
  AgentUpdatedEvent,
  IntentionUpdatedEvent,
  BountyEvaluatedEvent,
  MovementResolvedEvent,
  InteractionEvent,
  EconomyEvent
} from './events';
import { TickRunner, TickContext, TickStage } from './tick';

export interface SimulationConfig {
  ticksPerSecond: number;
  maxAgents?: number;
  worldBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class SimulationEngine {
  private eventEmitter: SimulationEventEmitter;
  private tickRunner: TickRunner;
  private agents: Map<string, AgentState> = new Map();
  private pendingEvents: any[] = [];
  private bounties: Map<string, Bounty> = new Map();
  private config: SimulationConfig;

  constructor(
    config: SimulationConfig = { ticksPerSecond: 5 },
    eventEmitter: SimulationEventEmitter = simulationEvents
  ) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    this.tickRunner = new TickRunner(eventEmitter, config.ticksPerSecond);

    this.registerTickStages();
  }

  private registerTickStages(): void {
    // Ingest events stage
    this.tickRunner.registerStageHandler('ingest', async (context) => {
      await this.ingestEvents(context);
    });

    // Update intentions stage
    this.tickRunner.registerStageHandler('updateIntentions', async (context) => {
      await this.updateIntentions(context);
    });

    // Evaluate bounties stage
    this.tickRunner.registerStageHandler('evaluateBounties', async (context) => {
      await this.evaluateBounties(context);
    });

    // Resolve movement stage
    this.tickRunner.registerStageHandler('resolveMovement', async (context) => {
      await this.resolveMovement(context);
    });

    // Resolve interactions stage
    this.tickRunner.registerStageHandler('resolveInteractions', async (context) => {
      await this.resolveInteractions(context);
    });

    // Apply economy stage
    this.tickRunner.registerStageHandler('applyEconomy', async (context) => {
      await this.applyEconomy(context);
    });

    // Emit events stage
    this.tickRunner.registerStageHandler('emitEvents', async (context) => {
      await this.emitEvents(context);
    });

    // Persist stage
    this.tickRunner.registerStageHandler('persist', async (context) => {
      await this.persist(context);
    });
  }

  // === Agent State Management ===

  addAgent(agent: AgentState): void {
    if (this.agents.has(agent.id)) {
      console.warn(`Agent ${agent.id} already exists, updating instead`);
    }
    
    this.agents.set(agent.id, { ...agent });
    
    const event: AgentCreatedEvent = {
      type: 'agent:created',
      timestamp: Date.now(),
      tick: this.tickRunner.getCurrentTick(),
      agentId: agent.id,
      agentType: agent.type,
      initialState: { ...agent }
    };
    
    this.eventEmitter.emit('agent:created', event);
  }

  removeAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    this.agents.delete(agentId);
    this.eventEmitter.emit('agent:removed', {
      type: 'agent:removed',
      timestamp: Date.now(),
      tick: this.tickRunner.getCurrentTick(),
      agentId,
      data: { agent }
    });

    return true;
  }

  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  updateAgent(agentId: string, updates: Partial<AgentState>): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    const previousState = { ...agent };
    const newState = { ...agent, ...updates };
    this.agents.set(agentId, newState);

    const changes = Object.keys(updates);
    
    const event: AgentUpdatedEvent = {
      type: 'agent:updated',
      timestamp: Date.now(),
      tick: this.tickRunner.getCurrentTick(),
      agentId,
      previousState,
      newState,
      changes
    };

    this.eventEmitter.emit('agent:updated', event);
    return true;
  }

  // === Event Ingestion ===

  queueEvent(event: any): void {
    this.pendingEvents.push(event);
  }

  private async ingestEvents(context: TickContext): Promise<void> {
    // Process all pending events
    while (this.pendingEvents.length > 0) {
      const event = this.pendingEvents.shift();
      await this.processEvent(event);
    }
  }

  private async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'agent:create':
        if (event.data?.agent) {
          this.addAgent(event.data.agent);
        }
        break;
      case 'agent:update':
        if (event.data?.agentId && event.data?.updates) {
          this.updateAgent(event.data.agentId, event.data.updates);
        }
        break;
      case 'agent:delete':
        if (event.data?.agentId) {
          this.removeAgent(event.data.agentId);
        }
        break;
      case 'bounty:create':
        if (event.data?.bounty) {
          this.addBounty(event.data.bounty);
        }
        break;
      default:
        // Pass through to custom handlers
        this.eventEmitter.emit(event.type, event.data);
    }
  }

  // === Intentions ===

  setAgentIntention(agentId: string, intention: Intention | null): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    const event: IntentionUpdatedEvent = {
      type: 'intention:updated',
      timestamp: Date.now(),
      tick: this.tickRunner.getCurrentTick(),
      agentId,
      intention
    };

    // Store intention on agent (extend type)
    (agent as any).intention = intention;
    this.eventEmitter.emit('intention:updated', event);
    return true;
  }

  private async updateIntentions(context: TickContext): Promise<void> {
    for (const agent of this.agents.values()) {
      const intention = (agent as any).intention as Intention | undefined;
      
      if (!intention) continue;

      // Check if intention has expired
      if (intention.expiresAt && intention.expiresAt <= context.timestamp) {
        this.setAgentIntention(agent.id, null);
        continue;
      }

      // Process different intention types
      switch (intention.type) {
        case 'move':
          // Movement is handled in resolveMovement stage
          break;
        case 'interact':
          // Interaction is handled in resolveInteractions stage
          break;
        case 'work':
          await this.processWorkIntention(agent, intention);
          break;
        case 'rest':
          await this.processRestIntention(agent);
          break;
      }
    }
  }

  private async processWorkIntention(agent: AgentState, intention: Intention): Promise<void> {
    // Deduct energy for work
    if (agent.energy >= 10) {
      this.updateAgent(agent.id, {
        energy: agent.energy - 10,
        credits: agent.credits + 5
      });
    }
  }

  private async processRestIntention(agent: AgentState): Promise<void> {
    if (agent.energy < 100) {
      this.updateAgent(agent.id, {
        energy: Math.min(100, agent.energy + 20),
        status: 'resting'
      });
    } else {
      this.updateAgent(agent.id, { status: 'active' });
      this.setAgentIntention(agent.id, null);
    }
  }

  // === Bounties ===

  addBounty(bounty: Bounty): void {
    this.bounties.set(bounty.id, bounty);
  }

  removeBounty(bountyId: string): boolean {
    return this.bounties.delete(bountyId);
  }

  private async evaluateBounties(context: TickContext): Promise<void> {
    for (const bounty of this.bounties.values()) {
      // Evaluate bounty for each active agent
      for (const agent of this.agents.values()) {
        if (agent.status === 'dead' || agent.status === 'resting') continue;

        const success = this.checkBountyRequirements(agent, bounty);
        
        const event: BountyEvaluatedEvent = {
          type: 'bounty:evaluated',
          timestamp: context.timestamp,
          tick: context.tickNumber,
          agentId: agent.id,
          bountyId: bounty.id,
          bountyType: bounty.type,
          success
        };

        if (success && bounty.reward > 0) {
          event.reward = bounty.reward;
          this.updateAgent(agent.id, {
            credits: agent.credits + bounty.reward
          });
        }

        this.eventEmitter.emit('bounty:evaluated', event);
      }
    }
  }

  private checkBountyRequirements(agent: AgentState, bounty: Bounty): boolean {
    // Placeholder for bounty requirement evaluation logic
    // In a real implementation, this would check various conditions
    return Math.random() > 0.5;
  }

  // === Movement ===

  moveAgent(agentId: string, targetPosition: Position): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Queue movement intention
    this.setAgentIntention(agentId, {
      type: 'move',
      target: JSON.stringify(targetPosition),
      priority: 1
    });

    return true;
  }

  private async resolveMovement(context: TickContext): Promise<void> {
    for (const agent of this.agents.values()) {
      const intention = (agent as any).intention as Intention | undefined;
      
      if (!intention || intention.type !== 'move') continue;

      const targetPos = intention.target ? JSON.parse(intention.target) : null;
      if (!targetPos) continue;

      const from = { ...agent.position };
      const to = this.calculateNewPosition(agent.position, targetPos);

      // Update position
      this.updateAgent(agent.id, { position: to });

      const event: MovementResolvedEvent = {
        type: 'movement:resolved',
        timestamp: context.timestamp,
        tick: context.tickNumber,
        agentId: agent.id,
        from,
        to,
        success: true
      };

      this.eventEmitter.emit('movement:resolved', event);

      // Clear intention after movement
      if (from.x === to.x && from.y === to.y) {
        this.setAgentIntention(agent.id, null);
      }
    }
  }

  private calculateNewPosition(from: Position, to: Position): Position {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 1) {
      return to;
    }

    // Move one unit towards target
    const ratio = 1 / distance;
    return {
      x: Math.round(from.x + dx * ratio),
      y: Math.round(from.y + dy * ratio),
      z: to.z ?? from.z
    };
  }

  // === Interactions ===

  interact(agentId: string, targetId: string, interactionType: string): boolean {
    const agent = this.agents.get(agentId);
    const target = this.agents.get(targetId);
    
    if (!agent || !target) {
      return false;
    }

    // Queue interaction intention
    this.setAgentIntention(agentId, {
      type: 'interact',
      target: targetId,
      priority: 2
    });

    return true;
  }

  private async resolveInteractions(context: TickContext): Promise<void> {
    for (const agent of this.agents.values()) {
      const intention = (agent as any).intention as Intention | undefined;
      
      if (!intention || intention.type !== 'interact' || !intention.target) continue;

      const targetId = intention.target;
      const target = this.agents.get(targetId);
      
      if (!target) continue;

      const result = this.calculateInteractionResult(agent, target);

      const event: InteractionEvent = {
        type: 'interaction:resolved',
        timestamp: context.timestamp,
        tick: context.tickNumber,
        agentId: agent.id,
        targetId,
        interactionType: 'generic',
        result
      };

      this.eventEmitter.emit('interaction:resolved', event);

      // Apply interaction effects
      if (result.success && result.effects) {
        if (result.effects.heal) {
          this.updateAgent(agent.id, {
            health: Math.min(100, agent.health + result.effects.heal)
          });
        }
        if (result.effects.damage) {
          this.updateAgent(target.id, {
            health: Math.max(0, target.health - result.effects.damage)
          });
        }
      }

      // Clear intention
      this.setAgentIntention(agent.id, null);
    }
  }

  private calculateInteractionResult(agent: AgentState, target: AgentState): any {
    // Simple interaction logic - in real implementation would be more complex
    return {
      success: true,
      message: 'Interaction completed',
      effects: {}
    };
  }

  // === Economy ===

  private async applyEconomy(context: TickContext): Promise<void> {
    for (const agent of this.agents.values()) {
      // Apply passive income/expenses based on agent status
      if (agent.status === 'active') {
        // Active agents earn small passive income
        const income = 1;
        this.updateAgent(agent.id, {
          credits: agent.credits + income
        });

        const event: EconomyEvent = {
          type: 'economy:transaction',
          timestamp: context.timestamp,
          tick: context.tickNumber,
          agentId: agent.id,
          transactionType: 'credit',
          amount: income,
          reason: 'passive_activity',
          newBalance: agent.credits + income
        };

        this.eventEmitter.emit('economy:transaction', event);
      }

      // Check for death from lack of resources
      if (agent.credits < 0) {
        this.updateAgent(agent.id, { status: 'dead' });
      }
    }
  }

  // === Event Emission ===

  private async emitEvents(context: TickContext): Promise<void> {
    // Emit simulation heartbeat
    this.eventEmitter.emit('simulation:heartbeat', {
      type: 'simulation:heartbeat',
      timestamp: context.timestamp,
      tick: context.tickNumber,
      data: {
        agentCount: this.agents.size,
        bountyCount: this.bounties.size
      }
    });
  }

  // === Persistence ===

  private async persist(context: TickContext): Promise<void> {
    // Placeholder for persistence logic
    // In a real implementation, this would save state to database
    // For now, we just log
    if (context.tickNumber % 10 === 0) {
      console.log(`[Tick ${context.tickNumber}] Persisted ${this.agents.size} agents`);
    }
  }

  // === Engine Control ===

  async start(): Promise<void> {
    console.log('Starting SimulationEngine...');
    await this.tickRunner.start();
    this.eventEmitter.emit('simulation:started', {
      type: 'simulation:started',
      timestamp: Date.now(),
      tick: 0,
      data: { config: this.config }
    });
  }

  stop(): void {
    console.log('Stopping SimulationEngine...');
    this.tickRunner.stop();
    this.eventEmitter.emit('simulation:stopped', {
      type: 'simulation:stopped',
      timestamp: Date.now(),
      tick: this.tickRunner.getCurrentTick(),
      data: {}
    });
  }

  // === Getters ===

  getEventEmitter(): SimulationEventEmitter {
    return this.eventEmitter;
  }

  getTickRunner(): TickRunner {
    return this.tickRunner;
  }

  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  getAgentCount(): number {
    return this.agents.size;
  }

  getBountyCount(): number {
    return this.bounties.size;
  }

}
