import { Router, Request, Response } from 'express';
import { AgentRepository, CreateAgentDTO, UpdateAgentStateDTO } from '@world-of-npcs/agent-core';
import { AgentState } from '@world-of-npcs/shared-types';

const router = Router();
const agentRepository = new AgentRepository();

// POST /deploy - Deploy a new agent
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { 
      ownerUserId, 
      providerType, 
      externalAgentId, 
      displayName, 
      avatarId, 
      role, 
      personalityProfile, 
      location, 
      skillProfile,
      metadata 
    } = req.body;

    if (!ownerUserId || !providerType || !externalAgentId || !displayName || !avatarId || !role || !personalityProfile || !location || !skillProfile) {
      return res.status(400).json({ 
        error: 'Missing required fields: ownerUserId, providerType, externalAgentId, displayName, avatarId, role, personalityProfile, location, skillProfile' 
      });
    }

    const dto: CreateAgentDTO = {
      ownerUserId,
      providerType,
      externalAgentId,
      displayName,
      avatarId,
      role,
      personalityProfile,
      location,
      skillProfile,
      metadata,
    };

    const agent = agentRepository.create(dto);
    return res.status(201).json(agent);
  } catch (error) {
    console.error('Error deploying agent:', error);
    return res.status(500).json({ error: 'Failed to deploy agent' });
  }
});

// GET /:id - Get an agent by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentRepository.getById(id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json(agent);
  } catch (error) {
    console.error('Error getting agent:', error);
    return res.status(500).json({ error: 'Failed to get agent' });
  }
});

// GET /:id/state - Get agent state
router.get('/:id/state', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentRepository.getById(id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json({
      currentState: agent.currentState,
      currentTaskId: agent.currentTaskId,
      currentBountyId: agent.currentBountyId,
      location: agent.location,
      energy: agent.energy,
      mood: agent.mood,
    });
  } catch (error) {
    console.error('Error getting agent state:', error);
    return res.status(500).json({ error: 'Failed to get agent state' });
  }
});

// POST /:id/tasks - Assign a task to an agent
router.post('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    const agent = agentRepository.getById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (!taskId) {
      return res.status(400).json({ error: 'Missing required field: taskId' });
    }

    // Update agent state to assign the task
    const updatedAgent = agentRepository.updateState(id, {
      state: 'working' as AgentState,
      taskId,
    });

    if (!updatedAgent) {
      return res.status(500).json({ error: 'Failed to assign task' });
    }

    return res.json({
      message: 'Task assigned successfully',
      agentId: id,
      taskId,
      state: updatedAgent.currentState,
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    return res.status(500).json({ error: 'Failed to assign task' });
  }
});

// POST /:id/pause - Pause an agent
router.post('/:id/pause', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = agentRepository.getById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update agent state to paused
    const updatedAgent = agentRepository.updateState(id, {
      state: 'paused' as AgentState,
    });

    if (!updatedAgent) {
      return res.status(500).json({ error: 'Failed to pause agent' });
    }

    return res.json({
      message: 'Agent paused successfully',
      agentId: id,
      state: updatedAgent.currentState,
    });
  } catch (error) {
    console.error('Error pausing agent:', error);
    return res.status(500).json({ error: 'Failed to pause agent' });
  }
});

// POST /:id/resume - Resume a paused agent
router.post('/:id/resume', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = agentRepository.getById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Only resume if agent is currently paused
    if (agent.currentState !== 'paused') {
      return res.status(400).json({ error: 'Agent is not paused' });
    }

    // Update agent state back to idle (or working if they had a task)
    const newState: AgentState = agent.currentTaskId ? 'working' : 'idle';
    const updatedAgent = agentRepository.updateState(id, {
      state: newState,
    });

    if (!updatedAgent) {
      return res.status(500).json({ error: 'Failed to resume agent' });
    }

    return res.json({
      message: 'Agent resumed successfully',
      agentId: id,
      state: updatedAgent.currentState,
    });
  } catch (error) {
    console.error('Error resuming agent:', error);
    return res.status(500).json({ error: 'Failed to resume agent' });
  }
});

export default router;
