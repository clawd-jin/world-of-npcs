// User types
export interface User {
  id: string
  email: string
  displayName: string
  role: 'owner' | 'approved' | 'guest'
  createdAt: Date
}

// Agent state types
export type AgentState = 
  | 'spawning' | 'walking' | 'working' | 'meeting' | 'socializing'
  | 'exploring' | 'resting' | 'idle'
  | 'evaluating_bounties' | 'claiming_bounty' | 'bounty_working'
  | 'bounty_collaborating' | 'learning' | 'interrupted' | 'offline'

// Location
export interface Location {
  zoneId: string
  x: number
  y: number
}

// Skill types
export type SkillType = 'coding' | 'writing' | 'research' | 'planning' | 'design' | 'communication' | 'teamwork' | 'exploration'

// Skill profile for agents
export interface SkillProfile {
  skills: AgentSkill[]
  primaryFocus: SkillType
  secondaryFocus?: SkillType
}

// Individual agent skill
export interface AgentSkill {
  id: string
  agentId: string
  skillType: SkillType
  level: number
  xp: number
}

// Relationship stats
export interface RelationshipStats {
  totalRelationships: number
  averageFamiliarity: number
  averageTrust: number
  averageAffinity: number
}

// Agent relationship between two agents
export interface AgentRelationship {
  id: string
  agentAId: string
  agentBId: string
  familiarity: number     // 0-100
  trust: number          // 0-100
  affinity: number       // 0-100
  collaborationScore: number  // 0-100
}

// Permissions
export interface Permissions {
  canDeploy: boolean
  canBountyHunt: boolean
  canSocialize: boolean
  canExplore: boolean
}

// Wallet (defined inline to avoid circular deps)
export interface Wallet {
  balance: number
  lifetimeEarnings: number
}

// Main Agent interface
export interface Agent {
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
  skills: string[]              // Array of skill names: coding, research, delivery, social
  level: number                 // Agent level (1+)
  experience: number            // Total experience points
  relationshipStats: RelationshipStats
  wallet: Wallet
  permissions: Permissions
  metadata: object
  createdAt: Date
}
