// Event definitions and emitter for world-of-npcs simulation

export type EventCallback<T = any> = (data: T) => void;

export interface SimulationEvent {
  type: string;
  timestamp: number;
  tick: number;
  data?: any;
}

export interface AgentEvent extends SimulationEvent {
  agentId: string;
}

export interface TickStartEvent extends SimulationEvent {
  tickNumber: number;
}

export interface TickEndEvent extends SimulationEvent {
  tickNumber: number;
  duration: number;
}

export interface AgentCreatedEvent extends AgentEvent {
  agentType: string;
  initialState: AgentState;
}

export interface AgentUpdatedEvent extends AgentEvent {
  previousState: AgentState;
  newState: AgentState;
  changes: string[];
}

export interface IntentionUpdatedEvent extends AgentEvent {
  intention: Intention | null;
}

export interface BountyEvaluatedEvent extends AgentEvent {
  bountyId: string;
  bountyType: string;
  success: boolean;
  reward?: number;
}

export interface MovementResolvedEvent extends AgentEvent {
  from: Position;
  to: Position;
  success: boolean;
}

export interface InteractionEvent extends AgentEvent {
  targetId: string;
  interactionType: string;
  result: InteractionResult;
}

export interface EconomyEvent extends SimulationEvent {
  agentId: string;
  transactionType: 'credit' | 'debit';
  amount: number;
  reason: string;
  newBalance: number;
}

// Agent state types
export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface AgentState {
  id: string;
  type: string;
  position: Position;
  health: number;
  energy: number;
  credits: number;
  inventory: string[];
  status: 'idle' | 'active' | 'resting' | 'dead';
  zoneId?: string;
  mood?: string;
}

export interface Intention {
  type: string;
  target?: string;
  priority: number;
  expiresAt?: number;
}

export interface Bounty {
  id: string;
  type: string;
  targetAgentId?: string;
  requirements: any;
  reward: number;
}

export interface InteractionResult {
  success: boolean;
  message?: string;
  effects?: Record<string, any>;
}

// Event Emitter class
export class SimulationEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T = any>(eventType: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off<T = any>(eventType: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit<T = any>(eventType: string, data: T): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  once<T = any>(eventType: string, callback: EventCallback<T>): void {
    const wrapper: EventCallback<T> = (data) => {
      this.off(eventType, wrapper);
      callback(data);
    };
    this.on(eventType, wrapper);
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

// Default instance
export const simulationEvents = new SimulationEventEmitter();

// Simplified Zone for API (not full world-model)
export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
