# Virtual AI Office World '97 - Project Roadmap

## Overview
A mobile-first multiplayer simulation game where OpenClaw agents appear as NPCs in a Futurama-themed world (Planet Express HQ). Real AI work becomes visible gameplay.

---

## Phase Roadmap

| Phase | Name | Sections | Objective |
|-------|------|----------|-----------|
| **0** | Foundation | 29, 30, 6, 7, 8 | Monorepo, types, auth, world model, mobile shell |
| **1** | Simulation Core | 11, 23, 10, 21 | Agent entities, tick-based simulation, movement, rendering |
| **2** | Task System | 12, 13 | Task lifecycle, task-to-animation mapping |
| **3** | Bounty System | 14 | Marketplace, autonomous claiming, capability matching |
| **4** | OpenClaw Integration | 24 | Provider adapter, agent deployment, task sync |
| **5** | Social & Idle | 15, 16 | NPC behavior engine, social interactions, exploration |
| **6** | Multiplayer & Players | 19, 20 | Owner as Nibbler, presence, human players |
| **7** | Economy & Progression | 17, 18, 22 | Economy, skills, rewards, notifications |

---

## Quick Start for Agents

### For coding agents (Bender, Fry):
```
1. Read PHASE-0-FOUNDATION.md - understand structure
2. Read PHASE-1-SIMULATION-CORE.md - start here
3. Pick a deliverable and implement
```

### Dependency Order:
```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

### Each Phase Contains:
- **Sections Covered** - which original doc sections
- **Deliverables** - specific features/implementations
- **Dependencies** - what must be done first
- **Next Phase** - where to go after

---

## File Structure
```
/world-of-npcs
  /docs
    PHASE-0-FOUNDATION.md
    PHASE-1-SIMULATION-CORE.md
    PHASE-2-TASK-SYSTEM.md
    PHASE-3-BOUNTY-SYSTEM.md
    PHASE-4-OPENCLAW-INTEGRATION.md
    PHASE-5-SOCIAL-IDLE.md
    PHASE-6-MULTIPLAYER.md
    PHASE-7-ECONOMY.md
    ROADMAP.md (this file)
```

---

## Phase Descriptions

### Phase 0: Foundation ⏱️ 1-2 weeks
- Monorepo setup with apps and packages
- Shared TypeScript types
- Auth system with roles (Owner, Approved, Guest)
- World model (zones, objects)
- Mobile app shell

### Phase 1: Simulation Core ⏱️ 2-3 weeks
- Agent entity system with states
- Tick-based simulation engine (4-10 ticks/sec)
- Pathfinding and movement
- Mobile rendering strategy

### Phase 2: Task System ⏱️ 2-3 weeks
- Task CRUD API
- Task lifecycle management
- Task Mapper (real work → animation)
- Visible work animations

### Phase 3: Bounty System ⏱️ 2-3 weeks
- Bounty marketplace
- Capability matcher scoring
- Autonomous bounty claim flow
- Bounty Board in-world object

### Phase 4: OpenClaw Integration ⏱️ 2-3 weeks
- ExternalAgentProvider interface
- OpenClaw adapter implementation
- Agent deployment flow
- Task sync with external agents

### Phase 5: Social & Idle ⏱️ 2-3 weeks
- NPC Behavior Engine (FSM + utility scoring)
- Social interactions
- Relationship tracking
- Idle exploration behavior

### Phase 6: Multiplayer ⏱️ 2-3 weeks
- Owner as Nibbler
- Approved user join flow
- Presence system
- WebSocket multiplayer sync

### Phase 7: Economy ⏱️ 2-3 weeks
- Economy service and ledger
- Skill system with XP
- Rewards and milestones
- Push notifications

---

## Total Estimated Timeline
**~16-20 weeks** for full implementation (phased, sequential)

Can be parallelized after Phase 1 (multiple teams on different features)

---

## Notes
- Original 34 sections consolidated into 7 phases
- Each phase is independently actionable
- Start with Phase 0 for context
- Mobile app work can begin in Phase 0, continues through all phases
