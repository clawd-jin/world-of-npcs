# API Reference

## Agent API
```
POST   /agents/deploy           Deploy new agent to world
GET    /agents/:id              Get agent details
GET    /agents/:id/state       Get agent current state
POST   /agents/:id/tasks       Assign task to agent
POST   /agents/:id/pause       Pause agent
POST   /agents/:id/resume      Resume agent
```

## Task API
```
POST   /tasks                  Create new task
GET    /tasks/:id              Get task details
PATCH  /tasks/:id              Update task
GET    /tasks                  List tasks (filtered)
```

## Bounty API
```
POST   /bounties               Create bounty
GET    /bounties               List open bounties
GET    /bounties/:id           Get bounty details
POST   /bounties/:id/claim    Agent claims bounty
POST   /bounties/:id/reopen   Reopen bounty
POST   /bounties/:id/cancel   Cancel bounty
```

## World API
```
GET    /world/state            Full world state
GET    /world/zones            List all zones
GET    /world/zones/:id        Get zone details
POST   /world/enter            Player enters world
POST   /world/move             Player/agent movement
```

## Player API
```
POST   /players/join           Player joins world
GET    /players/me             Get current player
POST   /players/:id/avatar    Update avatar
POST   /players/invite         Invite user to world
```

## Economy API
```
GET    /economy/balance/:entityId    Get balance
GET    /economy/ledger/:entityId     Get transaction history
POST   /economy/reward               Grant reward
```

## Mobile Summary API (Optimized)
```
GET    /mobile/home             Home screen summary
GET    /mobile/world/summary    World state summary
GET    /mobile/agents/summary   Agents summary
GET    /mobile/bounties/summary Bounties summary
GET    /mobile/activity-feed    Activity feed
```

## Auth API
```
POST   /auth/register           Register new user
POST   /auth/login             Login
POST   /auth/logout            Logout
GET    /auth/me                Current user
```

---

## WebSocket Events

### Client → Server
- `world.subscribe` - Subscribe to zone updates
- `world.unsubscribe` - Unsubscribe from zone
- `player.move` - Player movement input
- `player.interact` - Interact with object/NPC

### Server → Client
- `world.state` - Full world state update
- `world.delta` - Incremental changes
- `agent.moved` - Agent position change
- `agent.state_changed` - Agent state transition
- `player.joined` - Player entered world
- `player.left` - Player left world
- `bounty.claimed` - Bounty was claimed
- `bounty.completed` - Bounty completed
- `notification` - Push notification payload
