import { SimulationEventEmitter, AgentState, Intention, Bounty } from './events';
import { TickRunner } from './tick';
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
export declare class SimulationEngine {
    private eventEmitter;
    private tickRunner;
    private agents;
    private pendingEvents;
    private bounties;
    private config;
    constructor(config?: SimulationConfig, eventEmitter?: SimulationEventEmitter);
    private registerTickStages;
    getAllAgents(): AgentState[];
    updateAgent(agentId: string, updates: Partial<AgentState>): boolean;
    queueEvent(event: any): void;
    private ingestEvents;
    private processEvent;
    setAgentIntention(agentId: string, intention: Intention | null): boolean;
    private updateIntentions;
    private processWorkIntention;
    private processRestIntention;
    addBounty(bounty: Bounty): void;
    removeBounty(bountyId: string): boolean;
    private evaluateBounties;
    private checkBountyRequirements;
    private resolveMovement;
    private calculateNewPosition;
    interact(agentId: string, targetId: string, interactionType: string): boolean;
    private resolveInteractions;
    private calculateInteractionResult;
    private applyEconomy;
    private emitEvents;
    private persist;
    start(): Promise<void>;
    stop(): void;
    getEventEmitter(): SimulationEventEmitter;
    getTickRunner(): TickRunner;
    getConfig(): SimulationConfig;
    getAgentCount(): number;
    getBountyCount(): number;
    getAgents(): AgentState[];
    getAgentsInZone(zoneId: string): AgentState[];
    updateAgentState(agentId: string, state: string): boolean;
    updateAgentMood(agentId: string, mood: string): boolean;
    isRunning(): boolean;
}
//# sourceMappingURL=engine.d.ts.map