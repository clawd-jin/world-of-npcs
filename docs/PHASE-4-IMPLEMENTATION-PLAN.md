# Phase 4: OpenClaw Integration - Implementation Plan

**For:** Nibbler  
**Created:** 2026-03-07  
**Status:** Ready for Implementation

---

## Executive Summary

This plan details the implementation of Phase 4: OpenClaw Integration for the World of NPCs project. The integration will connect the world's NPCs to real OpenClaw agents, enabling AI-powered autonomous behavior.

**Key Dependencies:** Phase 1 (Simulation Core), Phase 3 (Bounty System)  
**Estimated Timeline:** 2-3 weeks  
**Risk Level:** Medium

---

## 1. Architecture Overview

### Current State
- Agent model already has `providerType` and `externalAgentId` fields
- AgentCore service handles agent lifecycle with state machine
- Demo routes already show CLI-based agent interaction
- OpenClaw CLI available with `agents`, `message`, `gateway` commands

### Target State
- ExternalAgentProvider abstraction for multi-provider support
- OpenClaw-specific adapter implementation
- Real-time agent status sync via Gateway WebSocket
- Task assignment and completion flow with external agents

---

## 2. Packages to Create

### 2.1 `@world-of-npcs/external-agent-providers` (New Package)
**Location:** `packages/external-agent-providers`  
**Purpose:** Base abstraction for external agent providers

**Structure:**
```
external-agent-providers/
├── src/
│   ├── index.ts                    # Exports
│   ├── types.ts                    # Provider types & interfaces
│   ├── base-provider.ts            # Abstract base class
│   └── events.ts                   # Event types
├── package.json
└── tsconfig.json
```

**Interfaces to Define:**
```typescript
// Register agent input
interface RegisterAgentInput {
  externalAgentId: string
  displayName: string
  capabilities?: string[]
  metadata?: Record<string, unknown>
}

// Registered agent output
interface RegisteredAgent {
  internalId: string
  externalId: string
  providerAgentId: string
  status: 'active' | 'inactive'
  registeredAt: Date
}

// Task assignment input
interface ExternalTaskInput {
  taskId: string
  title: string
  description: string
  priority: number
  payload?: Record<string, unknown>
}

// Task acknowledgment
interface TaskAck {
  taskId: string
  accepted: boolean
  externalTaskId?: string
  estimatedDuration?: number
}

// External agent status
interface ExternalAgentStatus {
  agentId: string
  status: 'idle' | 'working' | 'waiting' | 'error'
  currentTaskId?: string
  progress?: number
  lastUpdate: Date
  error?: string
}

// Event handler type
type EventHandler = (event: ProviderEvent) => void

// Provider event types
type ProviderEvent = 
  | AgentStateChangeEvent
  | TaskProgressEvent
  | TaskCompleteEvent
  | AgentErrorEvent

interface AgentStateChangeEvent {
  type: 'agent_state_changed'
  agentId: string
  previousState: string
  newState: string
  timestamp: Date
}

interface TaskProgressEvent {
  type: 'task_progress'
  taskId: string
  progress: number
  message?: string
  timestamp: Date
}

interface TaskCompleteEvent {
  type: 'task_completed'
  taskId: string
  result: unknown
  timestamp: Date
}

interface AgentErrorEvent {
  type: 'agent_error'
  agentId: string
  error: string
  timestamp: Date
}
```

---

### 2.2 `@world-of-npcs/openclaw-adapter` (New Package)
**Location:** `packages/openclaw-adapter`  
**Purpose:** OpenClaw-specific implementation of ExternalAgentProvider

**Structure:**
```
openclaw-adapter/
├── src/
│   ├── index.ts
│   ├── openclaw-provider.ts        # Main provider implementation
│   ├── config.ts                   # Configuration
│   ├── mapper.ts                   # Status/event mappers
│   ├── gateway-client.ts           # Gateway WebSocket client
│   └── cli-bridge.ts               # CLI command bridge
├── package.json
└── tsconfig.json
```

**Key Classes:**

```typescript
// Main provider class
class OpenClawProvider implements ExternalAgentProvider {
  private config: OpenClawConfig
  private gatewayClient: GatewayClient
  private cliBridge: CliBridge
  private eventHandlers: EventHandler[]
  private agentIdMap: Map<string, string>  // internalId -> externalId
  
  constructor(config: OpenClawConfig)
  
  // Register a new agent with OpenClaw
  async registerAgent(input: RegisterAgentInput): Promise<RegisteredAgent>
  
  // Assign a task to an agent
  async assignTask(agentId: string, task: ExternalTaskInput): Promise<TaskAck>
  
  // Get current agent status
  async getAgentStatus(agentId: string): Promise<ExternalAgentStatus>
  
  // Subscribe to agent events
  subscribeToEvents(handler: EventHandler): void
  
  // Unsubscribe from events
  unsubscribeFromEvents(handler: EventHandler): void
  
  // Start event polling/subscription
  connect(): Promise<void>
  
  // Stop event handling
  disconnect(): Promise<void>
}

// Gateway WebSocket client
class GatewayClient {
  private ws: WebSocket | null
  private url: string
  private token?: string
  private reconnectAttempts: number
  
  connect(): Promise<void>
  disconnect(): Promise<void>
  call(method: string, params: object): Promise<unknown>
  onEvent(handler: (event: object) => void): void
}

// CLI Bridge for agent management
class CliBridge {
  private execPath: string
  
  async listAgents(): Promise<OpenClawAgent[]>
  async getAgentInfo(agentId: string): Promise<OpenClawAgentDetails>
  async sendMessage(agentId: string, message: string): Promise<void>
  async ping(agentId: string): Promise<boolean>
}
```

---

### 2.3 Updated Packages

#### `@world-of-npcs/agent-core` (Update)
**Changes:**
- Add `providerType` validation for external agents
- Add lifecycle events for external agent state sync
- Add methods to link internal agent to external provider

```typescript
// New methods to add to AgentService
interface ExternalAgentLink {
  internalAgentId: string
  providerType: string
  externalAgentId: string
}

class AgentService {
  // ... existing methods
  
  // Link internal agent to external provider
  linkToExternalProvider(link: ExternalAgentLink): Agent | undefined
  
  // Get agents by provider type
  getAgentsByProvider(providerType: string): Agent[]
  
  // Sync external agent state to internal
  syncExternalState(agentId: string, externalStatus: ExternalAgentStatus): Agent | undefined
}
```

#### `@world-of-npcs/shared-types` (Update)
**New types to add:**
```typescript
// Provider configuration
interface ProviderConfig {
  type: 'openclaw' | 'anthropic' | 'openai' | 'custom'
  enabled: boolean
  config: Record<string, unknown>
}

// External agent reference
interface ExternalAgentRef {
  providerType: string
  externalAgentId: string
  linkedAt: Date
}

// Task with external assignment tracking
interface ExternalTaskRef {
  taskId: string
  externalTaskId?: string
  assignedAt?: Date
  completedAt?: Date
  result?: unknown
}
```

---

## 3. Interfaces to Define

### 3.1 Core Provider Interface
```typescript
interface ExternalAgentProvider {
  readonly providerType: string
  
  registerAgent(input: RegisterAgentInput): Promise<RegisteredAgent>
  unregisterAgent(agentId: string): Promise<boolean>
  
  assignTask(agentId: string, task: ExternalTaskInput): Promise<TaskAck>
  cancelTask(agentId: string, taskId: string): Promise<boolean>
  
  getAgentStatus(agentId: string): Promise<ExternalAgentStatus>
  listAgents(): Promise<RegisteredAgent[]>
  
  subscribeToEvents(handler: EventHandler): void
  unsubscribeFromEvents(handler: EventHandler): void
  
  connect(): Promise<void>
  disconnect(): Promise<void>
}
```

### 3.2 Agent State Mapper
```typescript
// Map external provider states to internal states
const OPENCLAW_TO_INTERNAL_STATE: Record<string, AgentState> = {
  idle: 'idle',
  working: 'working',
  waiting: 'evaluating_bounties',
  error: 'interrupted',
}

const INTERNAL_TO_OPENCLAW_STATE: Record<string, string> = {
  idle: 'idle',
  working: 'working',
  evaluating_bounties: 'waiting',
  interrupted: 'error',
}
```

### 3.3 Provider Registry
```typescript
class ProviderRegistry {
  private providers: Map<string, ExternalAgentProvider>
  
  register(provider: ExternalAgentProvider): void
  unregister(providerType: string): void
  get(providerType: string): ExternalAgentProvider | undefined
  getAll(): ExternalAgentProvider[]
  getActive(): ExternalAgentProvider[]
}
```

---

## 4. How Agents Connect to OpenClaw

### 4.1 Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Deployment Flow                         │
└─────────────────────────────────────────────────────────────────┘

User requests deploy
        │
        ▼
┌─────────────────────┐
│ Validate Permissions│
│ (owner/approved)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Create Internal     │     │ Check OpenClaw Agent    │
│ Agent Record        │     │ Exists                  │
└─────────┬───────────┘     └────────────┬────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Call OpenClaw CLI  │     │ Use Existing or         │
│ or Gateway          │     │ Register New            │
└─────────┬───────────┘     └────────────┬────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │ Link External ID to      │
              │ Internal Agent           │
              └────────────┬─────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │ Spawn Agent in World    │
              │ at Default Location     │
              └────────────┬─────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │ Emit agent.deployed     │
              │ Event                   │
              └─────────────────────────┘
```

### 4.2 Task Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Task Sync Flow                             │
└─────────────────────────────────────────────────────────────────┘

Internal Task Created
        │
        ▼
┌─────────────────────┐
│ Find Available     │
│ External Agent      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Call assignTask()   │────▶│ OpenClaw Provider       │
│ on Provider         │     │ assignTask()            │
└─────────┬───────────┘     └────────────┬────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Update Internal     │     │ External Agent          │
│ Task Status         │     │ Accepts Task            │
└─────────┬───────────┘     └────────────┬────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Start Status Poll   │     │ Start Working           │
│ or WebSocket Sub    │     │ (via Gateway)           │
└─────────┬───────────┘     └────────────┬────────────┘
          │                              │
          │    ┌─────────────────────────┐
          │    │ Periodic Status Sync   │
          │    │ or Event Push          │
          │    └────────────┬────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ Map External State  │◀────│ Task Progress/Complete  │
│ to Internal          │     │ Events                  │
└─────────┬───────────┘     └─────────────────────────┘
          │
          ▼
┌─────────────────────┐
│ Update World        │
│ Simulation          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Grant Rewards       │
│ (if completed)     │
└─────────────────────┘
```

### 4.3 OpenClaw API/CLI Integration Points

| OpenClaw Feature | Integration Method | Use Case |
|-----------------|---------------------|----------|
| `openclaw agents list` | CLI Bridge | List available agents |
| `openclaw agent --agent <id>` | Gateway call | Run agent turn |
| `openclaw message send` | CLI Bridge | Send message to agent |
| Gateway WebSocket | GatewayClient | Real-time status/events |
| `openclaw gateway call` | Gateway RPC | Query agent status |

---

## 5. Implementation Order (Step-by-Step)

### Step 1: Foundation (Days 1-2)
- [ ] Create `packages/external-agent-providers` package
- [ ] Define `ExternalAgentProvider` interface
- [ ] Define event types and handlers
- [ ] Create base provider abstract class
- [ ] Update `shared-types` with new provider types

**Deliverables:** Provider abstraction layer

### Step 2: OpenClaw Adapter Core (Days 3-4)
- [ ] Create `packages/openclaw-adapter` package
- [ ] Implement `CliBridge` for agent listing/pinging
- [ ] Implement basic `GatewayClient` for RPC calls
- [ ] Implement `OpenClawProvider` skeleton

**Deliverables:** Basic OpenClaw connectivity

### Step 3: Agent Registration (Days 5-6)
- [ ] Implement `registerAgent()` method
- [ ] Implement agent ID mapping (internal ↔ external)
- [ ] Add registration flow to agent-service
- [ ] Create deployment API endpoint

**Deliverables:** Agent deployment works end-to-end

### Step 4: Task Assignment (Days 7-9)
- [ ] Implement `assignTask()` method
- [ ] Implement task status polling
- [ ] Create task-to-external mapping
- [ ] Update task-service for external assignment

**Deliverables:** Tasks can be assigned to external agents

### Step 5: Status Sync (Days 10-12)
- [ ] Implement Gateway WebSocket client
- [ ] Implement event handlers for state changes
- [ ] Create state mapper (OpenClaw ↔ Internal)
- [ ] Add real-time sync to agent-service

**Deliverables:** Agent state syncs in real-time

### Step 6: Testing & Polish (Days 13-15)
- [ ] Integration tests for full flow
- [ ] Error handling and retry logic
- [ ] Documentation and examples
- [ ] Performance optimization

**Deliverables:** Production-ready integration

---

## 6. API Endpoints to Create

### Agent Management
```
POST   /api/agents/external/register     Register external agent
DELETE /api/agents/:id/unlink            Unlink external agent
GET    /api/agents/:id/status            Get external agent status
POST   /api/agents/:id/ping              Ping external agent
```

### Provider Management
```
GET    /api/providers                    List available providers
GET    /api/providers/:type/status       Get provider status
POST   /api/providers/:type/connect      Connect to provider
POST   /api/providers/:type/disconnect   Disconnect from provider
```

### Task Management (Extension)
```
POST   /api/tasks/:taskId/assign-external   Assign task to external agent
GET    /api/tasks/:taskId/external-status   Get external task status
POST   /api/tasks/:taskId/cancel            Cancel external task
```

---

## 7. Risks and Mitigations

### Risk 1: OpenClaw Gateway Availability
**Severity:** High  
**Description:** If the OpenClaw Gateway is down, agent communication fails.

**Mitigation:**
- Implement connection retry with exponential backoff
- Cache last known agent states
- Queue tasks when disconnected, execute on reconnect
- Show clear offline status in UI

### Risk 2: API Rate Limiting
**Severity:** Medium  
**Description:** Frequent status polling may hit rate limits.

**Mitigation:**
- Use WebSocket for real-time updates instead of polling
- Implement request batching
- Add rate limit detection and backoff
- Cache responses with TTL

### Risk 3: Agent State Desync
**Severity:** Medium  
**Description:** External agent state may drift from internal representation.

**Mitigation:**
- Implement periodic reconciliation
- Add heartbeat/keepalive checks
- Log all state changes for debugging
- Provide manual resync button in UI

### Risk 4: Task Payload Mismatch
**Severity:** Low  
**Description:** Internal tasks may not map cleanly to external agent capabilities.

**Mitigation:**
- Define capability matching in Phase 3 (already planned)
- Add fallback to internal task handling
- Validate task compatibility before assignment

### Risk 5: Multi-Provider Complexity
**Severity:** Low  
**Description:** Abstracting multiple providers adds complexity.

**Mitigation:**
- Start with only OpenClaw provider
- Keep interfaces simple and focused
- Document provider-specific quirks
- Add providers incrementally

### Risk 6: Security
**Severity:** Medium  
**Description:** External agent access needs proper authentication.

**Mitigation:**
- Use Gateway token authentication
- Validate agent ownership before operations
- Sanitize all inputs to CLI/gateway
- Log all external operations

---

## 8. Testing Strategy

### Unit Tests
- Provider interface implementations
- State mapping functions
- Event handler registration
- CLI bridge responses

### Integration Tests
- Full agent deployment flow
- Task assignment and completion
- Status sync accuracy
- Error handling and recovery

### E2E Tests
- Deploy agent → Assign task → Verify completion
- Network disconnect → Reconnect → Verify sync
- Multiple agents → Parallel tasks → Verify isolation

---

## 9. Success Criteria

1. ✅ Can register an OpenClaw agent and see it in the world
2. ✅ Can assign a task to an external agent
3. ✅ Agent state changes reflect in real-time
4. ✅ Task completion triggers reward-grant flow
5. ✅ Graceful handling of disconnected agents
6. ✅ Provider abstraction allows future extensibility

---

## 10. Dependencies on Other Phases

| Phase | Dependency | Notes |
|-------|-----------|-------|
| Phase 1 | Required | Agent entity system, state machine |
| Phase 3 | Required | Bounty claim flow, capability matching |
| Phase 5 | Uses | Behavior engine for idle/explore states |

---

## 11. Future Extensibility

The provider abstraction enables adding more agent providers:

```typescript
// Future: Anthropic Agent Provider
class AnthropicProvider implements ExternalAgentProvider {
  // Connect to Anthropic Agents API
}

// Future: OpenAI Agent Provider  
class OpenAIProvider implements ExternalAgentProvider {
  // Connect to OpenAI Agents API
}

// Registry automatically supports new providers
providerRegistry.register(new AnthropicProvider())
providerRegistry.register(new OpenAIProvider())
```

---

## Appendix: File Changes Summary

### New Files
- `packages/external-agent-providers/src/types.ts`
- `packages/external-agent-providers/src/base-provider.ts`
- `packages/external-agent-providers/src/events.ts`
- `packages/external-agent-providers/src/index.ts`
- `packages/openclaw-adapter/src/openclaw-provider.ts`
- `packages/openclaw-adapter/src/gateway-client.ts`
- `packages/openclaw-adapter/src/cli-bridge.ts`
- `packages/openclaw-adapter/src/mapper.ts`
- `packages/openclaw-adapter/src/config.ts`
- `packages/openclaw-adapter/src/index.ts`

### Modified Files
- `packages/shared-types/types/agent.ts` - Add provider types
- `packages/shared-types/index.ts` - Export new types
- `packages/agent-core/src/agent-service.ts` - Add external linking
- `packages/agent-core/src/agent-repository.ts` - Add provider queries
- `apps/server-api/src/routes/agents.ts` - Add external agent routes

---

*Plan created by Conrad - Ready for Nibbler's review! 🧠*
