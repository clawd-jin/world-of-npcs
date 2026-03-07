# Phase 6: Multiplayer & Players

**Objective:** Enable human players to join the world, starting with owner as Nibbler.

## Sections Covered
- 19. Player / Human Character System
- 20. Multiplayer Architecture

## Deliverables

### 6.1 Player Model
```typescript
interface Player {
  id: string
  userId: string
  avatarId: string
  characterName: string
  permissions: PlayerPermissions
  homeZone: string
}
```

### 6.2 Owner as Nibbler
**Capabilities:**
- Move around HQ and city
- Inspect agents
- Observe world
- Use admin controls
- Interact socially

**Implementation:**
- Special player record for world owner
- Character locked to "Nibbler"
- Enhanced permissions (can deploy agents, create bounties, manage world)

### 6.3 Approved Users
- Other users can join as their own characters
- Capabilities based on permissions:
  - Movement, observation, interaction
  - Optional agent deployment (if permitted)

### 6.4 Player API
```
POST /players/join
GET /players/me
POST /players/:id/avatar
POST /players/invite
```

### 6.5 Presence System
**Presence States:**
- online, in HQ, in city, observing, backgrounded, disconnected

**Presence Tracking:**
```
presence_sessions:
  - id, entity_type, entity_id, state, zone_id, connected_at, disconnected_at
```

### 6.6 Multiplayer Architecture
**Requirements:**
- Multiple users in same world
- Synchronized positions
- Visible NPC actions
- Live join/leave events

**Strategy:**
- Authoritative server simulation
- WebSocket transport
- Presence service
- Client interpolation for movement

**Session Handling:**
- Players join shared world
- Clients subscribe to relevant zones only
- Reduces payload size

### 6.7 World Entry Flow
```
User opens app
  → Authenticate
  → Load player record
  → Connect to WebSocket
  → Subscribe to zone
  → Receive initial world state
  → Player appears in world
```

### 6.8 Player Movement
- Touch/drag controls
- Zone transitions
- Collision with agents and objects

### 6.9 Player Events
```
player.joined
player.left
player.moved
player.interacted
```

## Dependencies
- Phase 5: Social & Idle (presence, interactions)

## Next Phase
→ Phase 7: Economy & Progression
