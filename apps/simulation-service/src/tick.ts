// TickRunner class for world-of-npcs simulation

import { simulationEvents, SimulationEventEmitter, TickStartEvent, TickEndEvent } from './events';

export type TickStage = 
  | 'ingest'
  | 'updateIntentions'
  | 'evaluateBounties'
  | 'resolveMovement'
  | 'resolveInteractions'
  | 'applyEconomy'
  | 'emitEvents'
  | 'persist';

export interface TickConfig {
  ticksPerSecond: number;
  stages: TickStage[];
}

export interface TickContext {
  tickNumber: number;
  deltaTime: number;
  timestamp: number;
}

export type StageHandler = (context: TickContext) => Promise<void> | void;

export class TickRunner {
  private emitter: SimulationEventEmitter;
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private lastTickTime: number = 0;
  private tickInterval: NodeJS.Timeout | null = null;
  private tickConfig: TickConfig;
  private stageHandlers: Map<TickStage, StageHandler[]> = new Map();

  constructor(
    emitter: SimulationEventEmitter = simulationEvents,
    ticksPerSecond: number = 5
  ) {
    this.emitter = emitter;
    this.tickConfig = {
      ticksPerSecond: Math.max(4, Math.min(10, ticksPerSecond)),
      stages: [
        'ingest',
        'updateIntentions',
        'evaluateBounties',
        'resolveMovement',
        'resolveInteractions',
        'applyEconomy',
        'emitEvents',
        'persist'
      ]
    };

    // Initialize stage handlers map
    this.tickConfig.stages.forEach(stage => {
      this.stageHandlers.set(stage, []);
    });
  }

  registerStageHandler(stage: TickStage, handler: StageHandler): void {
    const handlers = this.stageHandlers.get(stage);
    if (handlers) {
      handlers.push(handler);
    }
  }

  unregisterStageHandler(stage: TickStage, handler: StageHandler): void {
    const handlers = this.stageHandlers.get(stage);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('TickRunner is already running');
      return;
    }

    this.isRunning = true;
    this.lastTickTime = Date.now();

    const intervalMs = 1000 / this.tickConfig.ticksPerSecond;

    this.tickInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.tick();
      }
    }, intervalMs);

    console.log(`TickRunner started at ${this.tickConfig.ticksPerSecond} ticks/second`);
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    console.log('TickRunner stopped');
  }

  async tick(): Promise<void> {
    const now = Date.now();
    const deltaTime = this.lastTickTime ? now - this.lastTickTime : 0;
    this.lastTickTime = now;

    const context: TickContext = {
      tickNumber: this.currentTick,
      deltaTime,
      timestamp: now
    };

    // Emit tick start event
    const tickStartEvent: TickStartEvent = {
      type: 'tick:start',
      timestamp: now,
      tick: this.currentTick,
      tickNumber: this.currentTick,
      data: {}
    };
    this.emitter.emit('tick:start', tickStartEvent);

    const tickStart = Date.now();

    try {
      // Execute each stage in order
      for (const stage of this.tickConfig.stages) {
        await this.executeStage(stage, context);
      }
    } catch (error) {
      console.error(`Error during tick ${this.currentTick}:`, error);
    }

    const tickDuration = Date.now() - tickStart;

    // Emit tick end event
    const tickEndEvent: TickEndEvent = {
      type: 'tick:end',
      timestamp: now,
      tick: this.currentTick,
      tickNumber: this.currentTick,
      duration: tickDuration,
      data: {}
    };
    this.emitter.emit('tick:end', tickEndEvent);

    this.currentTick++;
  }

  private async executeStage(stage: TickStage, context: TickContext): Promise<void> {
    const handlers = this.stageHandlers.get(stage);
    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        await handler(context);
      } catch (error) {
        console.error(`Error in stage ${stage}:`, error);
        // Continue with next handler even if one fails
      }
    }
  }

  getTicksPerSecond(): number {
    return this.tickConfig.ticksPerSecond;
  }

  setTicksPerSecond(tps: number): void {
    if (this.isRunning) {
      this.stop();
      this.tickConfig.ticksPerSecond = Math.max(4, Math.min(10, tps));
      this.start();
    } else {
      this.tickConfig.ticksPerSecond = Math.max(4, Math.min(10, tps));
    }
  }

  getCurrentTick(): number {
    return this.currentTick;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getStages(): TickStage[] {
    return [...this.tickConfig.stages];
  }
}
