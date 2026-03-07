// Task type enum
export enum TaskType {
  Coding = 'coding',
  Writing = 'writing',
  Research = 'research',
  Meeting = 'meeting',
  Planning = 'planning',
  Review = 'review',
  Design = 'design',
  Coordination = 'coordination',
  Delivery = 'delivery'
}

// Re-export types from shared-types
export type { Task, TaskStatus } from '@world-of-npcs/shared-types'
