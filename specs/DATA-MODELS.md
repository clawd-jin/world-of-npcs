# Core Data Models

## Users
```typescript
interface User {
  id: string
  email: string
  displayName: string
  role: 'owner' | 'approved' | 'guest'
  createdAt: Date
}
```

## Players
```typescript
interface Player {
  id: string
  userId: string
  avatarId: string
  characterName: string
  permissions: PlayerPermissions
  homeZone: string
}

type PlayerPermissions = {
  canDeployAgents: boolean
  canCreateBounties: boolean
  canInviteUsers: boolean
  canManageWorld: boolean
}
```

## Agents
```typescript
interface Agent {
  id: string
  ownerUserId: string
  providerType: string           // 'openclaw', 'anthropic', etc.
  externalAgentId: string        // ID in external provider system
  displayName: string
  avatarId: string
  role: string
  personalityProfile: object
  currentState: AgentState
  currentTaskId: string | null
  currentBountyId: string | null
  location: Location
  energy: number                 // 0-100
  mood: string
  skillProfile: SkillProfile
  relationshipStats: RelationshipStats
  wallet: Wallet
  permissions: Permissions
  metadata: object
  createdAt: Date
}

type AgentState = 
  | 'spawning' | 'walking' | 'working' | 'meeting' | 'socializing'
  | 'exploring' | 'resting' | 'idle'
  | 'evaluating_bounties' | 'claiming_bounty' | 'bounty_working'
  | 'bounty_collaborating' | 'learning' | 'interrupted' | 'offline'

interface Location {
  zoneId: string
  x: number
  y: number
}
```

## Tasks
```typescript
interface Task {
  id: string
  agentId: string | null
  ownerUserId: string
  type: TaskType
  title: string
  description: string
  priority: number
  status: TaskStatus
  mappedBehaviorId: string | null
  rewardValue: number
  createdAt: Date
  completedAt: Date | null
}

type TaskType = 'coding' | 'writing' | 'research' | 'meeting' | 'planning' | 'review' | 'design' | 'coordination' | 'delivery'
type TaskStatus = 'queued' | 'accepted' | 'in_progress' | 'blocked' | 'completed' | 'failed' | 'idle'
```

## Bounties
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

type BountyStatus = 'draft' | 'open' | 'claimed' | 'in_progress' | 'completed' | 'rewarded' | 'expired' | 'abandoned' | 'failed' | 'reopened'
```

## Skills
```typescript
interface AgentSkill {
  id: string
  agentId: string
  skillType: SkillType
  level: number
  xp: number
}

type SkillType = 'coding' | 'writing' | 'research' | 'planning' | 'design' | 'communication' | 'teamwork' | 'exploration'
```

## Relationships
```typescript
interface AgentRelationship {
  id: string
  agentAId: string
  agentBId: string
  familiarity: number     // 0-100
  trust: number          // 0-100
  affinity: number       // 0-100
  collaborationScore: number  // 0-100
}
```

## Economy
```typescript
interface Wallet {
  balance: number
  lifetimeEarnings: number
}

interface EconomyLedger {
  id: string
  entityType: 'agent' | 'player'
  entityId: string
  transactionType: string
  amount: number
  source: string
  createdAt: Date
}
```

## World
```typescript
interface Zone {
  id: string
  worldId: string
  name: string
  type: 'hq_interior' | 'hq_room' | 'city_street' | 'city_shop' | 'city_park' | 'city_transit' | 'city_leisure'
  configJson: ZoneConfig
}

interface ZoneConfig {
  walkable: boolean
  objects: WorldObject[]
  spawnPoints: Point[]
  transitions: ZoneTransition[]
  ambientRules: string[]
}

interface WorldObject {
  id: string
  type: 'desk' | 'chair' | 'whiteboard' | 'meeting_table' | 'terminal' | 'bench' | 'bounty_board'
  position: { x: number, y: number }
  animationAnchors: Point[]
}
```

## Presence
```typescript
interface PresenceSession {
  id: string
  entityType: 'agent' | 'player'
  entityId: string
  state: PresenceState
  zoneId: string | null
  connectedAt: Date
  disconnectedAt: Date | null
}

type PresenceState = 'online' | 'in_hq' | 'in_city' | 'observing' | 'backgrounded' | 'disconnected'
```
