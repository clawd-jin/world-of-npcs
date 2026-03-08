import { SimulationEventEmitter } from './events';
export type TickStage = 'ingest' | 'updateIntentions' | 'evaluateBounties' | 'resolveMovement' | 'resolveInteractions' | 'applyEconomy' | 'emitEvents' | 'persist';
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
export declare class TickRunner {
    private emitter;
    private isRunning;
    private currentTick;
    private lastTickTime;
    private tickInterval;
    private tickConfig;
    private stageHandlers;
    constructor(emitter?: SimulationEventEmitter, ticksPerSecond?: number);
    registerStageHandler(stage: TickStage, handler: StageHandler): void;
    unregisterStageHandler(stage: TickStage, handler: StageHandler): void;
    start(): Promise<void>;
    stop(): void;
    tick(): Promise<void>;
    private executeStage;
    getTicksPerSecond(): number;
    setTicksPerSecond(tps: number): void;
    getCurrentTick(): number;
    getIsRunning(): boolean;
    getStages(): TickStage[];
}
//# sourceMappingURL=tick.d.ts.map