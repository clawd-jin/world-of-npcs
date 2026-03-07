# Phase 3: Bounty System

**Objective:** Implement autonomous task discovery and claiming via bounty marketplace.

## Sections Covered
- 14. Bounty System Architecture

## Deliverables

### 3.1 Bounty Service
**Responsibilities:**
- Create bounty listings
- Classify required skills
- Expose open bounties
- Manage claim lifecycle
- Support reassignment
- Connect bounties to rewards
- Support collaborative bounties

**Bounty Lifecycle:**
draft → open → claimed → in_progress → completed → rewarded

**Optional failure:** expired, abandoned, failed, reopened

### 3.2 Bounty Model
```typescript
interface Bounty {
  id: string
  createdByUserId: string
  title: string
  description: string
  category: string
  difficulty: number
  requiredSkills: string[]
  preferredSkills: string[]
  rewardCredits: number
  rewardXp: number
  collaborationAllowed: boolean
  status: BountyStatus
  zoneAffinity: string | null
  sourceType: string
  linkedTaskId: string | null
  claimedByAgentId: string | null
  claimedAt: Date | null
  expiresAt: Date | null
  metadata: object
}
```

### 3.3 Bounty API
```
POST /bounties
GET /bounties
GET /bounties/:id
POST /bounties/:id/claim
POST /bounties/:id/reopen
POST /bounties/:id/cancel
```

### 3.4 Capability Matcher
Agents evaluate open bounties using scoring:

```
bounty_score =
  (skill_match * 0.4) +
  (availability * 0.2) +
  (success_history * 0.2) +
  (priority_fit * 0.1) +
  (location_fit * 0.1)
```

**Matching Inputs:**
- skill match, current workload, availability, energy, role specialization, success history, zone/location relevance, collaboration suitability

### 3.5 Autonomous Bounty Flow
```
Bounty created
  → Bounty Service marks open
  → Eligible agents scan/evaluate
  → NPC Behavior Engine checks fitness
  → Best-fit available agent claims
  → Bounty becomes active task
  → Task Mapper generates in-world action
  → Agent performs visible work
  → Completion triggers reward + progression
```

### 3.6 Bounty Board (In-World)
- Visual "Bounty Board" or "Mission Console" in HQ
- Agents can walk to it, inspect, claim work
- Users can visually inspect open work

### 3.7 Collaborative Bounties
- Support multiple agents on one bounty
- Examples: coder + writer, researcher + planner
- Reward split + teamwork bonus

### 3.8 Bounty Events
```
agent.bounty_claimed
agent.bounty_completed
bounty.expired
bounty.reopened
```

## Dependencies
- Phase 2: Task System (task service, task mapper)

## Next Phase
→ Phase 4: OpenClaw Integration
