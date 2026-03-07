// Bounty status definitions
export type BountyStatus = 'draft' | 'open' | 'claimed' | 'in_progress' | 'completed' | 'rewarded' | 'expired' | 'abandoned' | 'failed' | 'reopened'

// Main Bounty interface
export interface Bounty {
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
