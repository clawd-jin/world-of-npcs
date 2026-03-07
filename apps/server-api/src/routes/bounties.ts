import { Router, Request, Response } from 'express';
import { Bounty, BountyStatus } from '@world-of-npcs/shared-types';

const router = Router();

// In-memory bounty store (will be replaced with proper repository)
const bounties: Map<string, Bounty> = new Map();

// Helper to generate IDs
const generateId = () => `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// POST / - Create a new bounty
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      createdByUserId,
      title,
      description,
      category,
      difficulty = 1,
      requiredSkills = [],
      preferredSkills = [],
      rewardCredits,
      rewardXp = 0,
      collaborationAllowed = false,
      zoneAffinity = null,
      sourceType = 'manual',
      linkedTaskId = null,
      metadata = {},
    } = req.body;

    if (!createdByUserId || !title || !description || !category || !rewardCredits) {
      return res.status(400).json({
        error: 'Missing required fields: createdByUserId, title, description, category, rewardCredits'
      });
    }

    const bounty: Bounty = {
      id: generateId(),
      createdByUserId,
      title,
      description,
      category,
      difficulty,
      requiredSkills,
      preferredSkills,
      rewardCredits,
      rewardXp,
      collaborationAllowed,
      status: 'open',
      zoneAffinity,
      sourceType,
      linkedTaskId,
      claimedByAgentId: null,
      claimedAt: null,
      expiresAt: null,
      metadata,
    };

    bounties.set(bounty.id, bounty);
    return res.status(201).json(bounty);
  } catch (error) {
    console.error('Error creating bounty:', error);
    return res.status(500).json({ error: 'Failed to create bounty' });
  }
});

// GET / - List open bounties
router.get('/', async (req: Request, res: Response) => {
  try {
    const { createdByUserId, category } = req.query;

    let result: Bounty[] = Array.from(bounties.values());

    // Filter by status (open bounties)
    result = result.filter(b => b.status === 'open');

    // Filter by creator if provided
    if (createdByUserId) {
      result = result.filter(b => b.createdByUserId === createdByUserId);
    }

    // Filter by category if provided
    if (category) {
      result = result.filter(b => b.category === category);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error listing bounties:', error);
    return res.status(500).json({ error: 'Failed to list bounties' });
  }
});

// GET /:id - Get a specific bounty
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bounty = bounties.get(id);

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }

    return res.json(bounty);
  } catch (error) {
    console.error('Error getting bounty:', error);
    return res.status(500).json({ error: 'Failed to get bounty' });
  }
});

// POST /:id/claim - Claim a bounty
router.post('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Missing required field: agentId' });
    }

    const bounty = bounties.get(id);

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }

    if (bounty.status !== 'open') {
      return res.status(400).json({ error: `Cannot claim bounty with status: ${bounty.status}` });
    }

    // Update bounty with claim info
    const updatedBounty: Bounty = {
      ...bounty,
      status: 'claimed' as BountyStatus,
      claimedByAgentId: agentId,
      claimedAt: new Date(),
    };

    bounties.set(id, updatedBounty);
    return res.json(updatedBounty);
  } catch (error) {
    console.error('Error claiming bounty:', error);
    return res.status(500).json({ error: 'Failed to claim bounty' });
  }
});

// POST /:id/reopen - Reopen a bounty
router.post('/:id/reopen', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bounty = bounties.get(id);

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }

    // Can reopen completed, failed, or abandoned bounties
    const reopenableStatuses: BountyStatus[] = ['completed', 'failed', 'abandoned'];
    if (!reopenableStatuses.includes(bounty.status)) {
      return res.status(400).json({ error: `Cannot reopen bounty with status: ${bounty.status}` });
    }

    // Update bounty status to reopened
    const updatedBounty: Bounty = {
      ...bounty,
      status: 'reopened' as BountyStatus,
      claimedByAgentId: null,
      claimedAt: null,
    };

    bounties.set(id, updatedBounty);
    return res.json(updatedBounty);
  } catch (error) {
    console.error('Error reopening bounty:', error);
    return res.status(500).json({ error: 'Failed to reopen bounty' });
  }
});

// POST /:id/cancel - Cancel a bounty
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bounty = bounties.get(id);

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }

    // Can only cancel open bounties
    if (bounty.status !== 'open') {
      return res.status(400).json({ error: `Cannot cancel bounty with status: ${bounty.status}` });
    }

    // Update bounty status to failed (cancelled)
    const updatedBounty: Bounty = {
      ...bounty,
      status: 'failed' as BountyStatus,
    };

    bounties.set(id, updatedBounty);
    return res.json(updatedBounty);
  } catch (error) {
    console.error('Error cancelling bounty:', error);
    return res.status(500).json({ error: 'Failed to cancel bounty' });
  }
});

export default router;
