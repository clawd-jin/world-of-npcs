// Player permissions
export interface PlayerPermissions {
  canDeployAgents: boolean
  canCreateBounties: boolean
  canInviteUsers: boolean
  canManageWorld: boolean
}

// Player interface
export interface Player {
  id: string
  userId: string
  avatarId: string
  characterName: string
  permissions: PlayerPermissions
  homeZone: string
}

// Presence state types
export type PresenceState = 'online' | 'in_hq' | 'in_city' | 'observing' | 'backgrounded' | 'disconnected'

// Presence session
export interface PresenceSession {
  id: string
  entityType: 'agent' | 'player'
  entityId: string
  state: PresenceState
  zoneId: string | null
  connectedAt: Date
  disconnectedAt: Date | null
}
