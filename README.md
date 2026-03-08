# World of NPCs - Planet Express HQ

A mobile-first multiplayer simulation game where OpenClaw agents appear as NPCs in a Futurama-themed virtual world. Real AI work becomes visible gameplay!

## 🏢 What Is This?

Virtual Planet Express HQ where AI agents live and work. Watch them wander, work, and interact in real-time.

## 🚀 Quick Start

```bash
# Clone and setup
cd world-of-npcs

# Start the server
cd apps/server-api
npm run build
npm start

# Server runs on http://localhost:3001
```

## 📡 API Endpoints

### Demo API (`/api/demo`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/demo/status` | GET | Live NPC status with positions, states, moods |
| `/api/demo/agents` | GET | List all NPCs |
| `/api/demo/agents/:id` | GET | Get specific NPC details |
| `/api/demo/ping` | POST | Send message to NPC (via OpenClaw) |
| `/api/demo/interact` | POST | Interact with NPC (greet, wave, ask, task) |

### World API (`/api/world`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/world/state` | GET | World + agent state, zone stats |
| `/api/world/zones` | GET | List all zones (filter: ?location=hq\|city) |
| `/api/world/zones/:id` | GET | Get zone details + agents in zone |
| `/api/world/enter` | POST | Player enters world |
| `/api/world/move` | POST | Move agent or player |
| `/api/world/sim/status` | GET | Simulation running status |
| `/api/world/sim/start` | POST | Start simulation |
| `/api/world/sim/stop` | POST | Stop simulation |

### Tasks API (`/api/tasks`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | List tasks (filter: ?ownerUserId=xxx) |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | GET | Get task |
| `/api/tasks/:id` | PUT | Update task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/tasks/:id/assign` | POST | Assign task to agent |

### Bounties API (`/api/bounties`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bounties` | GET | List bounties (filters: status, category, difficulty, zoneAffinity) |
| `/api/bounties` | POST | Create bounty |
| `/api/bounties/:id` | GET | Get bounty details |
| `/api/bounties/:id` | PUT | Update bounty |
| `/api/bounties/:id` | DELETE | Delete bounty |
| `/api/bounties/:id/claim` | POST | Claim bounty for agent |
| `/api/bounties/:id/complete` | POST | Mark bounty complete (demo) |

## 🎮 Current Features

- ✅ 6 NPCs (Fry, Bender, Leela, Professor, Amy, Zoidberg)
- ✅ Auto-wandering simulation (every 8 seconds)
- ✅ Smooth movement animation (100ms tick)
- ✅ Zone system (6 HQ zones + 6 City zones)
- ✅ Task management API with in-memory storage
- ✅ Bounty system with 8 sample bounties
- ✅ Demo status screen with live updates
- ✅ Player enter/move system

## 📱 Mobile App

The mobile app is a React Native project (shell only):

```
cd apps/mobile-app
npm start
```

Requires React Native build chain (Expo recommended for quick start).

## 🗺️ Zones

### HQ Zones
- **Office Floor** - Main workspace
- **Meeting Room** - Conference room
- **Lounge** - Break room
- **Lab** - Research lab
- **Kitchen** - Food prep
- **Delivery Bay** - Loading dock

### City Zones
- **Street** - Main roads
- **Shop** - Retail stores
- **Park** - Green spaces
- **Transit Hub** - Transport station
- **Leisure Zone** - Entertainment

## 🔄 Phases

| Phase | Status |
|-------|--------|
| 0: Foundation | ✅ Done |
| 1: Simulation Core | ✅ Done |
| 2: Task System | ✅ Done |
| 3: Bounty System | ✅ Done |
| 4: OpenClaw Integration | ⏳ Next |

## 🤖 The Vision

NPCs will be backed by real OpenClaw agents - they'll be aware, autonomous, and capable of real work that shows up in-game!

---

*Delivering the Future! 🚀*
