import { EventEmitter } from 'events'
import { Task, TaskStatus } from '@world-of-npcs/shared-types'
import { TaskRepository } from './task-repository'

// Task lifecycle events
export type TaskEventType = 
  | 'task_created' 
  | 'task_started' 
  | 'task_completed' 
  | 'task_failed' 
  | 'task_blocked' 
  | 'task_unblocked'
  | 'task_accepted'

export interface TaskEvent {
  taskId: string
  previousStatus: TaskStatus | null
  newStatus: TaskStatus
  timestamp: Date
  data?: Record<string, unknown>
}

// State machine: valid transitions from each status
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  queued: ['accepted', 'failed'],
  accepted: ['in_progress', 'failed'],
  in_progress: ['blocked', 'completed', 'failed'],
  blocked: ['in_progress', 'failed'],
  completed: [],
  failed: [],
  idle: ['queued', 'accepted']
}

// Check if transition is valid
function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export interface CreateTaskInput {
  ownerUserId: string
  type: string
  title: string
  description: string
  priority?: number
  mappedBehaviorId?: string | null
  rewardValue?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: number
  status?: TaskStatus
  agentId?: string | null
  mappedBehaviorId?: string | null
  rewardValue?: number
  completedAt?: Date | null
}

export class TaskService extends EventEmitter {
  private repository: TaskRepository

  constructor(repository?: TaskRepository) {
    super()
    this.repository = repository || new TaskRepository()
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      agentId: null,
      ownerUserId: input.ownerUserId,
      type: input.type as Task['type'],
      title: input.title,
      description: input.description,
      priority: input.priority ?? 0,
      status: 'queued',
      mappedBehaviorId: input.mappedBehaviorId ?? null,
      rewardValue: input.rewardValue ?? 0,
      createdAt: new Date(),
      completedAt: null
    }

    const created = await this.repository.create(task)
    
    // Emit task_created event
    this.emitTaskEvent('task_created', created.id, null, 'queued')
    
    return created
  }

  async getTask(id: string): Promise<Task | null> {
    return this.repository.findById(id)
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    // If marking as completed, set completedAt
    if (input.status === 'completed') {
      input.completedAt = new Date()
    }
    
    return this.repository.update(id, input)
  }

  async listTasks(ownerUserId?: string): Promise<Task[]> {
    if (ownerUserId) {
      return this.repository.findByOwner(ownerUserId)
    }
    return this.repository.findAll()
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.repository.delete(id)
  }

  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return this.repository.findByAgent(agentId)
  }

  // ===== Task Lifecycle Methods =====

  /**
   * Accept a queued task (queued → accepted)
   */
  async acceptTask(taskId: string, agentId: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'accepted')) {
      throw new Error(`Cannot accept task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, {
      status: 'accepted',
      agentId
    })

    if (updated) {
      this.emitTaskEvent('task_accepted', taskId, task.status, 'accepted')
    }

    return updated
  }

  /**
   * Start a task (accepted → in_progress)
   */
  async startTask(taskId: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'in_progress')) {
      throw new Error(`Cannot start task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, { status: 'in_progress' })

    if (updated) {
      this.emitTaskEvent('task_started', taskId, task.status, 'in_progress')
    }

    return updated
  }

  /**
   * Complete a task (in_progress → completed)
   */
  async completeTask(taskId: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'completed')) {
      throw new Error(`Cannot complete task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, {
      status: 'completed',
      completedAt: new Date()
    })

    if (updated) {
      this.emitTaskEvent('task_completed', taskId, task.status, 'completed')
    }

    return updated
  }

  /**
   * Fail a task (any → failed)
   */
  async failTask(taskId: string, reason?: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'failed')) {
      throw new Error(`Cannot fail task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, {
      status: 'failed',
      completedAt: new Date()
    })

    if (updated) {
      this.emitTaskEvent('task_failed', taskId, task.status, 'failed', { reason })
    }

    return updated
  }

  /**
   * Block a task (in_progress → blocked)
   */
  async blockTask(taskId: string, reason?: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'blocked')) {
      throw new Error(`Cannot block task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, { status: 'blocked' })

    if (updated) {
      this.emitTaskEvent('task_blocked', taskId, task.status, 'blocked', { reason })
    }

    return updated
  }

  /**
   * Unblock a task (blocked → in_progress)
   */
  async unblockTask(taskId: string): Promise<Task | null> {
    const task = await this.repository.findById(taskId)
    if (!task) return null

    if (!isValidTransition(task.status, 'in_progress')) {
      throw new Error(`Cannot unblock task from status: ${task.status}`)
    }

    const updated = await this.repository.update(taskId, { status: 'in_progress' })

    if (updated) {
      this.emitTaskEvent('task_unblocked', taskId, task.status, 'in_progress')
    }

    return updated
  }

  // ===== Private Helpers =====

  private emitTaskEvent(
    eventType: TaskEventType,
    taskId: string,
    previousStatus: TaskStatus | null,
    newStatus: TaskStatus,
    data?: Record<string, unknown>
  ): void {
    const event: TaskEvent = {
      taskId,
      previousStatus,
      newStatus,
      timestamp: new Date(),
      data
    }
    this.emit(eventType, event)
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
