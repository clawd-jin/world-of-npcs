# Phase 5: Social & Idle Systems

**Objective:** Implement NPC behavior engine, social interactions, and idle exploration.

## Sections Covered
- 15. NPC Behavior Engine
- 16. Social System

## Deliverables

### 5.1 NPC Behavior Engine
**Purpose:** Determines what agents do moment to moment.

**Architecture:** Hybrid model
- Finite state machine for reliable transitions
- Utility scoring for choosing among available actions
- Rules engine for social/world effects

**Priority Order:**
1. Critical manually assigned work
2. Claimed bounty already in progress
3. Scheduled events
4. Available high-fit open bounties
5. Social obligations
6. Leisure / exploration
7. Ambient idle behavior

**Behavior Outcomes:**
- Move to task area
- Perform work animation
- Gather for collaboration
- Explore
- Rest
- Interact socially
- Claim or review bounties

### 5.2 Idle Behavior
When agent has no active work:
- Explore HQ
- Walk around city
- Socialize
- Relax
- Engage in ambient world behavior

### 5.3 Social Service
**Responsibilities:**
- Greetings
- Conversations
- Collaboration events
- Relationship growth
- Peer learning triggers

**Relationship Model:**
- familiarity, trust, affinity, collaboration score, mentorship tendency

### 5.4 Social Behaviors (Phase 1)
- Idle agents greet nearby agents
- Related workers gather
- Joint bounty work boosts teamwork
- Repeated collaboration improves relationship

### 5.5 Social Events
```
agent.social_interaction_started
agent.relationship_changed
agent.greeting
```

### 5.6 Ambient NPCs
- Futurama-inspired ambient NPCs in city
- Non-work exploration behavior
- Additional social and leisure movement

### 5.7 NPC Behavior Configuration
Make behaviors extensible:
- Add new behavior types easily
- Configure behavior weights
- Zone-specific behaviors

## Dependencies
- Phase 4: OpenClaw Integration (agent deployment)
- Phase 3: Bounty System (bounty evaluation in behavior priority)

## Next Phase
→ Phase 6: Multiplayer & Players
