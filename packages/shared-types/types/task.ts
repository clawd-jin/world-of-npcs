// Task type definitions
export type TaskType = 'coding' | 'writing' | 'research' | 'meeting' | 'planning' | 'review' | 'design' | 'coordination' | 'delivery'

// Task status definitions
export type TaskStatus = 'queued' | 'accepted' | 'in_progress' | 'blocked' | 'completed' | 'failed' | 'idle'

// Main Task interface
export interface Task {
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
