// Wallet interface

// Economy ledger transaction type
export type TransactionType = 
  | 'bounty_reward'
  | 'task_reward'
  | 'skill_purchase'
  | 'item_purchase'
  | 'collaboration_bonus'
  | 'exploration_reward'
  | 'system_grant'
  | 'penalty'

// Economy ledger entry
export interface EconomyLedger {
  id: string
  entityType: 'agent' | 'player'
  entityId: string
  transactionType: TransactionType
  amount: number
  source: string
  createdAt: Date
}
