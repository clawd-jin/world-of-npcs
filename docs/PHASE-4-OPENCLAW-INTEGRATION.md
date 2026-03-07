# Phase 4: OpenClaw Integration

**Objective:** Connect the world to OpenClaw agents as the first external provider.

## Sections Covered
- 24. Integration Architecture

## Deliverables

### 4.1 OpenClaw Adapter
**Responsibilities:**
- Register/link agents
- Assign tasks
- Receive status/progress
- Normalize external state into internal format

### 4.2 Provider Interface
```typescript
interface ExternalAgentProvider {
  registerAgent(input: RegisterAgentInput): Promise<RegisteredAgent>
  assignTask(agentId: string, task: Task): Promise<TaskAck>
  getAgentStatus(agentId: string): Promise<ExternalAgentStatus>
  subscribeToEvents(handler: EventHandler): void
}
```

### 4.3 OpenClaw Provider Implementation
```typescript
class OpenClawProvider implements ExternalAgentProvider {
  // Connect to OpenClaw API/gateway
  // Map OpenClaw agent IDs to internal agent IDs
  // Handle task assignment and status polling
  // Normalize state changes into world events
}
```

### 4.4 Agent Deployment Flow
```
User requests to deploy agent
  → Validate permissions (owner/approved user)
  → Create internal agent record
  → Call OpenClawProvider.registerAgent()
  → Link external agent ID to internal ID
  → Spawn agent in world at default location
  → Emit agent.deployed event
```

### 4.5 Task Sync
```
Internal task assigned to agent
  → OpenClawProvider.assignTask()
  → External agent begins work
  → Poll/get status updates
  → Map external state to internal state
  → Update world simulation
  → On completion, grant rewards
```

### 4.6 Agent Status Mapping
| OpenClaw Status | Internal Agent State |
|-----------------|---------------------|
| idle | idle |
| working | working |
| waiting | evaluating_bounties |
| error | interrupted |

### 4.7 Provider Abstraction
- Keep OpenClaw-specific code isolated in `/packages/openclaw-adapter`
- Design for future providers (Anthropic, OpenAI agents, etc.)

### 4.8 Events from External Agents
```
agent.deployed
agent.state_changed
agent.task_completed
agent.error
```

## Dependencies
- Phase 3: Bounty System (bounty claim flow)
- Phase 1: Simulation Core (agent entity system)

## Next Phase
→ Phase 5: Social & Idle Systems
