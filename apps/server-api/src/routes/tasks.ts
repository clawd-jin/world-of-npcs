import { Router, Request, Response } from 'express';
import { TaskRepository, TaskType, TaskStatus } from '@world-of-npcs/task-core';
import { Task } from '@world-of-npcs/shared-types';

const router = Router();
const taskRepository = new TaskRepository();

// POST / - Create a new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const { ownerUserId, type, title, description, priority = 0, mappedBehaviorId = null, rewardValue = 0 } = req.body;

    if (!ownerUserId || !type || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields: ownerUserId, type, title, description' });
    }

    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: null,
      ownerUserId,
      type: type as TaskType,
      title,
      description,
      priority,
      status: 'queued' as TaskStatus,
      mappedBehaviorId,
      rewardValue,
      createdAt: new Date(),
      completedAt: null,
    };

    const created = await taskRepository.create(task);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET / - List all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ownerUserId, agentId } = req.query;

    let tasks: Task[];
    
    if (ownerUserId) {
      tasks = await taskRepository.findByOwner(ownerUserId as string);
    } else if (agentId) {
      tasks = await taskRepository.findByAgent(agentId as string);
    } else {
      tasks = await taskRepository.findAll();
    }

    return res.json(tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    return res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// GET /:id - Get a specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskRepository.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    return res.status(500).json({ error: 'Failed to get task' });
  }
});

// PATCH /:id - Update a task
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Prevent updating immutable fields
    const { id: _id, createdAt: _createdAt, ...allowedUpdates } = updates;

    const updatedTask = await taskRepository.update(id, allowedUpdates);
    return res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /:id - Delete a task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRepository.delete(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
