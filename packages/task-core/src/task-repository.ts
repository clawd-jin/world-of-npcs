import { Task } from '@world-of-npcs/shared-types'

export class TaskRepository {
  private tasks: Map<string, Task> = new Map()

  async create(task: Task): Promise<Task> {
    this.tasks.set(task.id, task)
    return task
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values())
  }

  async findByOwner(ownerUserId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.ownerUserId === ownerUserId
    )
  }

  async findByAgent(agentId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.agentId === agentId
    )
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = this.tasks.get(id)
    if (!task) return null
    
    const updatedTask = { ...task, ...updates }
    this.tasks.set(id, updatedTask)
    return updatedTask
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id)
  }

  async clear(): Promise<void> {
    this.tasks.clear()
  }
}
