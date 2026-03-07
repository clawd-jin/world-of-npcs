// Task Core exports
export { TaskService, CreateTaskInput, UpdateTaskInput } from './task-service'
export { TaskRepository } from './task-repository'
export { TaskType } from './task-types'

// Re-export types from shared-types
export type { Task, TaskStatus } from '@world-of-npcs/shared-types'
