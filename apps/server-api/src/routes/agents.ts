import { Router, Request, Response } from 'express';
import { AgentService, AgentRepository } from '@world-of-npcs/agent-core';
import { TaskService } from '@world-of-npcs/task-core';
import { Agent, AgentState } from '@world-of-npcs/shared-types';

const router = Router();

// Initialize services
const agentRepository = new AgentRepository();
const agentService = new AgentService(agentRepository);
const taskService = new TaskService();

// Seed some demo agents if none exist
function seedDemoAgents() {
  const existingAgents = agentService.getAllAgents();
  if (existingAgents.length > 0) return;

  const demoAgents = [
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'fry',
      displayName: 'Fry',
      avatarId: 'fry_avatar',
      role: 'delivery',
      personalityProfile: { traits: ['optimistic', 'naive', 'loyal'] },
      location: { zoneId: 'office', x: 20, y: 30 },
      skillProfile: {
        skills: [
          { id: 'skill_1', agentId: '', skillType: 'communication', level: 3, xp: 150 },
          { id: 'skill_2', agentId: '', skillType: 'exploration', level: 2, xp: 80 },
        ],
        primaryFocus: 'communication' as const,
      },
      skills: ['delivery', 'social'] as string[],
      level: 2,
      experience: 250,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'bender',
      displayName: 'Bender',
      avatarId: 'bender_avatar',
      role: 'worker',
      personalityProfile: { traits: ['lazy', 'arrogant', 'mischievous'] },
      location: { zoneId: 'lounge', x: 80, y: 30 },
      skillProfile: {
        skills: [
          { id: 'skill_3', agentId: '', skillType: 'coding', level: 5, xp: 500 },
          { id: 'skill_4', agentId: '', skillType: 'planning', level: 2, xp: 100 },
        ],
        primaryFocus: 'coding' as const,
      },
      skills: ['coding', 'research'] as string[],
      level: 5,
      experience: 1200,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'leela',
      displayName: 'Leela',
      avatarId: 'leela_avatar',
      role: 'captain',
      personalityProfile: { traits: ['competent', 'no-nonsense', 'caring'] },
      location: { zoneId: 'lab', x: 50, y: 20 },
      skillProfile: {
        skills: [
          { id: 'skill_5', agentId: '', skillType: 'planning', level: 4, xp: 350 },
          { id: 'skill_6', agentId: '', skillType: 'teamwork', level: 4, xp: 320 },
        ],
        primaryFocus: 'planning' as const,
      },
      skills: ['coding', 'research', 'social'] as string[],
      level: 4,
      experience: 850,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'prof_farnsworth',
      displayName: 'Professor Farnsworth',
      avatarId: 'prof_avatar',
      role: 'scientist',
      personalityProfile: { traits: ['eccentric', 'mad-scientist', 'enthusiastic'] },
      location: { zoneId: 'lab', x: 50, y: 20 },
      skillProfile: {
        skills: [
          { id: 'skill_7', agentId: '', skillType: 'research', level: 5, xp: 600 },
          { id: 'skill_8', agentId: '', skillType: 'planning', level: 3, xp: 200 },
        ],
        primaryFocus: 'research' as const,
      },
      skills: ['research', 'coding'] as string[],
      level: 5,
      experience: 1500,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'amy_wong',
      displayName: 'Amy Wong',
      avatarId: 'amy_avatar',
      role: 'intern',
      personalityProfile: { traits: ['enthusiastic', 'wealthy', 'bubbly'] },
      location: { zoneId: 'lounge', x: 80, y: 30 },
      skillProfile: {
        skills: [
          { id: 'skill_9', agentId: '', skillType: 'communication', level: 3, xp: 180 },
          { id: 'skill_10', agentId: '', skillType: 'teamwork', level: 3, xp: 160 },
        ],
        primaryFocus: 'communication' as const,
      },
      skills: ['social', 'research'] as string[],
      level: 3,
      experience: 420,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'conrad',
      displayName: 'Conrad',
      avatarId: 'conrad_avatar',
      role: 'manager',
      personalityProfile: { traits: ['logical', 'procedural', 'detail-oriented'] },
      location: { zoneId: 'office', x: 20, y: 30 },
      skillProfile: {
        skills: [
          { id: 'skill_11', agentId: '', skillType: 'planning', level: 5, xp: 550 },
          { id: 'skill_12', agentId: '', skillType: 'teamwork', level: 4, xp: 380 },
        ],
        primaryFocus: 'planning' as const,
      },
      skills: ['coding', 'research', 'delivery'] as string[],
      level: 5,
      experience: 980,
    },
    {
      ownerUserId: 'system',
      providerType: 'openclaw',
      externalAgentId: 'main',
      displayName: 'Zoidberg',
      avatarId: 'zoidberg_avatar',
      role: 'doctor',
      personalityProfile: { traits: ['well-meaning', 'unlucky', 'optimistic'] },
      location: { zoneId: 'cafeteria', x: 80, y: 70 },
      skillProfile: {
        skills: [
          { id: 'skill_13', agentId: '', skillType: 'communication', level: 2, xp: 90 },
        ],
        primaryFocus: 'communication' as const,
      },
      skills: ['social', 'delivery'] as string[],
      level: 1,
      experience: 90,
    },
  ];

  demoAgents.forEach((agentData) => {
    agentService.createAgent(agentData as any);
  });
}

// Seed on module load
seedDemoAgents();

// Valid skill types
const VALID_SKILLS = ['coding', 'research', 'delivery', 'social'];

// Valid moods
const VALID_MOODS = ['happy', 'neutral', 'busy', 'excited', 'tired', 'focused', 'relaxed'];

// GET /api/agents - List all agents with full details
router.get('/', (req: Request, res: Response) => {
  try {
    const agents = agentService.getAllAgents();
    res.json({
      agents,
      total: agents.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list agents',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/agents/:id - Get agent details (skills, mood, energy, etc.)
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentService.getAgent(id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get agent',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /api/agents/:id - Update agent (mood, energy, state, level, experience, skills)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingAgent = agentService.getAgent(id);
    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    // Validate mood if provided
    if (updates.mood && !VALID_MOODS.includes(updates.mood)) {
      return res.status(400).json({
        error: 'Invalid mood',
        validMoods: VALID_MOODS,
      });
    }

    // Validate energy if provided (0-100)
    if (updates.energy !== undefined) {
      if (typeof updates.energy !== 'number' || updates.energy < 0 || updates.energy > 100) {
        return res.status(400).json({
          error: 'Energy must be a number between 0 and 100',
        });
      }
    }

    // Validate level if provided
    if (updates.level !== undefined) {
      if (typeof updates.level !== 'number' || updates.level < 1) {
        return res.status(400).json({
          error: 'Level must be a number >= 1',
        });
      }
    }

    // Validate experience if provided
    if (updates.experience !== undefined) {
      if (typeof updates.experience !== 'number' || updates.experience < 0) {
        return res.status(400).json({
          error: 'Experience must be a number >= 0',
        });
      }
    }

    // Validate skills if provided
    if (updates.skills !== undefined) {
      if (!Array.isArray(updates.skills)) {
        return res.status(400).json({
          error: 'Skills must be an array',
        });
      }
      const invalidSkills = updates.skills.filter((s: string) => !VALID_SKILLS.includes(s));
      if (invalidSkills.length > 0) {
        return res.status(400).json({
          error: 'Invalid skills',
          validSkills: VALID_SKILLS,
          invalidSkills,
        });
      }
    }

    // Validate state if provided
    if (updates.currentState) {
      const validStates: AgentState[] = [
        'spawning', 'walking', 'working', 'meeting', 'socializing',
        'exploring', 'resting', 'idle',
        'evaluating_bounties', 'claiming_bounty', 'bounty_working',
        'bounty_collaborating', 'learning', 'interrupted', 'offline'
      ];
      if (!validStates.includes(updates.currentState)) {
        return res.status(400).json({
          error: 'Invalid agent state',
          validStates,
        });
      }
    }

    // Apply updates
    const updatedAgent = agentService.getAgent(id);
    if (!updatedAgent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    // Update allowed fields
    const allowedUpdates: Partial<Agent> = {};
    if (updates.mood !== undefined) allowedUpdates.mood = updates.mood;
    if (updates.energy !== undefined) allowedUpdates.energy = updates.energy;
    if (updates.currentState !== undefined) allowedUpdates.currentState = updates.currentState;
    if (updates.level !== undefined) allowedUpdates.level = updates.level;
    if (updates.experience !== undefined) allowedUpdates.experience = updates.experience;
    if (updates.skills !== undefined) allowedUpdates.skills = updates.skills;
    if (updates.location !== undefined) allowedUpdates.location = updates.location;

    const result = agentRepository.update(id, allowedUpdates);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update agent',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/agents/:id/tasks - Get agent's tasks
router.get('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    const tasks = await taskService.getTasksByAgent(id);

    res.json({
      tasks,
      total: tasks.length,
      agentId: id,
      agentName: agent.displayName,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get agent tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/agents/:id/skills - Add skill to agent
router.post('/:id/skills', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { skill } = req.body;

    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    // Validate skill
    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        error: 'Skill is required and must be a string',
      });
    }

    const normalizedSkill = skill.toLowerCase();
    if (!VALID_SKILLS.includes(normalizedSkill)) {
      return res.status(400).json({
        error: 'Invalid skill',
        validSkills: VALID_SKILLS,
      });
    }

    // Check if agent already has this skill
    if (agent.skills && agent.skills.includes(normalizedSkill)) {
      return res.status(400).json({
        error: 'Agent already has this skill',
        skill: normalizedSkill,
        currentSkills: agent.skills,
      });
    }

    // Add skill to agent
    const currentSkills = agent.skills || [];
    const updatedSkills = [...currentSkills, normalizedSkill];

    const updatedAgent = agentRepository.update(id, {
      skills: updatedSkills,
    });

    res.json({
      success: true,
      message: `Skill '${normalizedSkill}' added to agent ${agent.displayName}`,
      agent: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to add skill',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/agents/:id/skills/:skill - Remove skill from agent
router.delete('/:id/skills/:skill', (req: Request, res: Response) => {
  try {
    const { id, skill } = req.params;

    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    const normalizedSkill = skill.toLowerCase();

    // Check if agent has this skill
    if (!agent.skills || !agent.skills.includes(normalizedSkill)) {
      return res.status(400).json({
        error: 'Agent does not have this skill',
        skill: normalizedSkill,
        currentSkills: agent.skills,
      });
    }

    // Remove skill from agent
    const updatedSkills = (agent.skills || []).filter((s: string) => s !== normalizedSkill);

    const updatedAgent = agentRepository.update(id, {
      skills: updatedSkills,
    });

    res.json({
      success: true,
      message: `Skill '${normalizedSkill}' removed from agent ${agent.displayName}`,
      agent: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to remove skill',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/agents/:id/energy - Update agent energy
router.post('/:id/energy', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { delta, set } = req.body;

    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    let newEnergy: number;

    if (set !== undefined) {
      // Set absolute energy value
      if (typeof set !== 'number' || set < 0 || set > 100) {
        return res.status(400).json({
          error: 'Energy value must be between 0 and 100',
        });
      }
      newEnergy = set;
    } else if (delta !== undefined) {
      // Apply delta (positive or negative)
      if (typeof delta !== 'number') {
        return res.status(400).json({
          error: 'Delta must be a number',
        });
      }
      newEnergy = Math.max(0, Math.min(100, agent.energy + delta));
    } else {
      return res.status(400).json({
        error: 'Must provide either delta or set value',
      });
    }

    const updatedAgent = agentRepository.update(id, { energy: newEnergy });

    res.json({
      success: true,
      energy: newEnergy,
      agent: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update energy',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/agents/:id/experience - Add experience to agent (can trigger level up)
router.post('/:id/experience', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', agentId: id });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number',
      });
    }

    const currentExp = agent.experience || 0;
    const currentLevel = agent.level || 1;
    const newExp = currentExp + amount;

    // Simple level-up logic: 100 XP per level
    const xpPerLevel = 100;
    let newLevel = currentLevel;
    let expForNextLevel = xpPerLevel * newLevel;
    
    while (newExp >= expForNextLevel) {
      newLevel++;
      expForNextLevel = xpPerLevel * newLevel;
    }

    const leveledUp = newLevel > currentLevel;

    const updatedAgent = agentRepository.update(id, {
      experience: newExp,
      level: newLevel,
    });

    res.json({
      success: true,
      experience: newExp,
      level: newLevel,
      leveledUp,
      expForNextLevel,
      agent: updatedAgent,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to add experience',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Export router
export const agentsRouter = router;
