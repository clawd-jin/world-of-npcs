# Phase 1: Simulation Core

**Objective:** Build the world simulation engine, agent entity system, movement, and basic rendering.

## Sections Covered
- 11. Agent Architecture
- 23. World / Simulation Runtime
- 10. World Architecture
- 21. Mobile-Specific Runtime Strategy

## Deliverables

### 1.1 Agent Entity System
```typescript
interface Agent {
  id: string
  ownerUserId: string
  providerType: string
  externalAgentId: string
  displayName: string
  avatarId: string
  role: string
  personalityProfile: object
  currentState: AgentState
  currentTaskId: string | null
  currentBountyId: string | null
  location: { zoneId: string, x: number, y: number }
  energy: number
  mood: string
  skillProfile: SkillProfile
  relationshipStats: RelationshipStats
  wallet: Wallet
  permissions: Permissions
  metadata: object
}
```

**Agent States:**
- spawning, walking, working, meeting, socializing, exploring, resting, idle
- evaluating_bounties, claiming_bounty, bounty_working, bounty_collaborating
- learning, interrupted, offline

### 1.2 Simulation Engine
- Tick-based processing (4-10 ticks/second)
- Tick stages:
  1. Ingest external/provider events
  2. Update agent intentions
  3. Evaluate bounties
  4. Resolve movement
  5. Resolve interactions/social events
  6. Resolve work/task progress
  7. Apply economy/XP changes
  8. Emit world update events
  9. Persist key deltas

### 1.3 Pathfinding
- Zone-based navigation
- Movement interpolation for clients
- Collision avoidance

### 1.4 Mobile World Rendering
- Server-authoritative rendering
- Client receives relevant state only
- Interpolation instead of full local simulation
- Passive mode (lower update frequency)

### 1.5 World State API
```
GET /world/state
GET /world/zones
GET /world/zones/:id
POST /world/enter
POST /world/move
```

## Dependencies
- Phase 0: Foundation (shared-types, world-model)

## Next Phase
→ Phase 2: Task System
