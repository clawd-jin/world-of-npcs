import { Router, Request, Response } from 'express';
import { TaskService, CreateTaskInput, UpdateTaskInput } from '@world-of-npcs/task-core';
import { TaskStatus } from '@world-of-npcs/shared-types';

const router = Router();
const taskService = new TaskService();

// GET /api/tasks - List all tasks (with optional ownerUserId filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ownerUserId } = req.query;
    const tasks = await taskService.listTasks(ownerUserId as string | undefined);
    res.json({ tasks, total: tasks.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list tasks', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTask(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found', taskId: id });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get task', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const input: CreateTaskInput = req.body;
    
    // Validate required fields
    if (!input.ownerUserId || !input.type || !input.title || !input.description) {
      return res.status(400).json({ error: 'Missing required fields: ownerUserId, type, title, description' });
    }
    
    const task = await taskService.createTask(input);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input: UpdateTaskInput = req.body;
    
    const existing = await taskService.getTask(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found', taskId: id });
    }
    
    const updated = await taskService.updateTask(id, input);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found', taskId: id });
    }
    res.json({ success: true, taskId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/tasks/:id/assign - Assign task to agent
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Missing required field: agentId' });
    }
    
    const task = await taskService.getTask(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found', taskId: id });
    }
    
    // Use acceptTask to assign the agent (queued → accepted)
    const updated = await taskService.acceptTask(id, agentId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign task', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export const tasksRouter = router;
