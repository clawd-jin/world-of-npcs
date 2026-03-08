import { Router, Request, Response } from 'express';
import { Bounty, BountyStatus } from '@world-of-npcs/shared-types';

const router = Router();

// In-memory bounty store (would be replaced with database later)
const bounties: Map<string, Bounty> = new Map();

// Seed with sample Planet Express bounties
const sampleBounties: Bounty[] = [
  {
    id: 'bounty-001',
    createdByUserId: 'prof-farnsworth',
    title: 'Deliver Pizza to Mars Colony',
    description: 'Urgent pizza delivery to the Mars colony. Must arrive within 2 hours or the pizza gets cold!',
    category: 'delivery',
    difficulty: 2,
    requiredSkills: ['piloting', 'navigation'],
    preferredSkills: ['speed-driving'],
    rewardCredits: 500,
    rewardXp: 150,
    collaborationAllowed: false,
    status: 'open',
    zoneAffinity: 'mars',
    sourceType: 'planet-express',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    metadata: { destination: 'Mars Colony 7', package: 'Pizza (10 boxes)' }
  },
  {
    id: 'bounty-002',
    createdByUserId: 'prof-farnsworth',
    title: 'Repair Planet Express Ship Engine',
    description: 'The Nimbus engine is making a weird noise. Diagnose and fix before the next delivery run!',
    category: 'repair',
    difficulty: 4,
    requiredSkills: ['engineering', 'mechanics'],
    preferredSkills: ['futuristic-tech'],
    rewardCredits: 1200,
    rewardXp: 400,
    collaborationAllowed: true,
    status: 'open',
    zoneAffinity: 'planet-express-hq',
    sourceType: 'maintenance',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
    metadata: { shipName: 'Planet Express Ship', issue: 'engine-noise' }
  },
  {
    id: 'bounty-003',
    createdByUserId: 'amy-wong',
    title: 'Rescue Captured Package from Nudist Planet',
    description: 'The delivery went wrong. Retrieve the package from the Naked Way World without causing an incident.',
    category: 'retrieval',
    difficulty: 3,
    requiredSkills: ['stealth', 'negotiation'],
    preferredSkills: ['diplomacy'],
    rewardCredits: 800,
    rewardXp: 250,
    collaborationAllowed: false,
    status: 'open',
    zoneAffinity: 'naked-way',
    sourceType: 'planet-express',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    metadata: { packageId: 'PKG-7734', avoidIncidents: true }
  },
  {
    id: 'bounty-004',
    createdByUserId: 'zoidberg',
    title: 'Capture Live Bigfoot for Zoo',
    description: 'Professor wants a Bigfoot for the aquarium... I mean, zoo. Don\'t ask questions, just catch one!',
    category: 'capture',
    difficulty: 5,
    requiredSkills: ['tracking', 'trapping'],
    preferredSkills: ['animal-handling'],
    rewardCredits: 2000,
    rewardXp: 600,
    collaborationAllowed: true,
    status: 'open',
    zoneAffinity: null,
    sourceType: 'special-request',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    metadata: { target: 'Bigfoot', alive: true }
  },
  {
    id: 'bounty-005',
    createdByUserId: 'fry',
    title: 'Find Bender\'s Stolen Bending Unit',
    description: 'Someone stole my bending unit! Find the thief and get it back. Reward: 50 credits and a Slurm.',
    category: 'investigation',
    difficulty: 3,
    requiredSkills: ['detective', 'street-smarts'],
    preferredSkills: ['combat'],
    rewardCredits: 50,
    rewardXp: 100,
    collaborationAllowed: false,
    status: 'claimed',
    zoneAffinity: 'new-new-york',
    sourceType: 'personal',
    linkedTaskId: null,
    claimedByAgentId: 'agent-fry',
    claimedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    metadata: { stolenFrom: 'Room 426', suspect: 'Robot Mafia' }
  },
  {
    id: 'bounty-006',
    createdByUserId: 'prof-farnsworth',
    title: 'Escort Dangerous Cargo Through Asteroid Field',
    description: 'Transport unstable matter through the belt. If it explodes, we\'ll both be famous!',
    category: 'escort',
    difficulty: 4,
    requiredSkills: ['piloting', 'combat'],
    preferredSkills: ['crash-landings'],
    rewardCredits: 1500,
    rewardXp: 500,
    collaborationAllowed: true,
    status: 'open',
    zoneAffinity: 'asteroid-belt',
    sourceType: 'planet-express',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    metadata: { cargo: 'Unstable Matter', hazardLevel: 'extreme' }
  },
  {
    id: 'bounty-007',
    createdByUserId: 'leela-turanga',
    title: 'Clean Up After Mega-Death Battle',
    description: 'Some dumb brains blew up a planet. Clean up the debris field and salvage what you can.',
    category: 'cleanup',
    difficulty: 2,
    requiredSkills: ['piloting', 'salvage'],
    preferredSkills: [],
    rewardCredits: 300,
    rewardXp: 100,
    collaborationAllowed: true,
    status: 'completed',
    zoneAffinity: 'boomtown',
    sourceType: 'cleanup-duty',
    linkedTaskId: null,
    claimedByAgentId: 'agent-leela',
    claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    expiresAt: null,
    metadata: { debrisField: 'Sector 7G', salvageValue: 500 }
  },
  {
    id: 'bounty-008',
    createdByUserId: 'hermes-conrad',
    title: 'File Bureaucratic Reports (DO NOT DELAY)',
    description: 'Deadline is in 2 hours! Submit Forms 27-B, Section 6. Or was it Form 27-C? Better submit both just in case.',
    category: 'bureaucracy',
    difficulty: 1,
    requiredSkills: ['paperwork'],
    preferredSkills: [],
    rewardCredits: 100,
    rewardXp: 50,
    collaborationAllowed: false,
    status: 'open',
    zoneAffinity: 'earth',
    sourceType: 'corporate',
    linkedTaskId: null,
    claimedByAgentId: null,
    claimedAt: null,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    metadata: { forms: ['27-B', '27-C'], urgency: 'critical' }
  }
];

// Initialize with sample bounties
sampleBounties.forEach(bounty => bounties.set(bounty.id, bounty));

// GET /api/bounties - List all bounties (with optional filters)
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, category, difficulty, zoneAffinity } = req.query;
    
    let result = Array.from(bounties.values());
    
    // Apply filters
    if (status) {
      result = result.filter(b => b.status === status);
    }
    if (category) {
      result = result.filter(b => b.category === category);
    }
    if (difficulty) {
      result = result.filter(b => b.difficulty === parseInt(difficulty as string));
    }
    if (zoneAffinity) {
      result = result.filter(b => b.zoneAffinity === zoneAffinity || b.zoneAffinity === null);
    }
    
    res.json({ 
      bounties: result, 
      total: result.length,
      filters: { status, category, difficulty, zoneAffinity }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list bounties', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET /api/bounties/:id - Get bounty details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bounty = bounties.get(id);
    
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found', bountyId: id });
    }
    
    res.json(bounty);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/bounties - Create new bounty
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      requiredSkills,
      preferredSkills,
      rewardCredits,
      rewardXp,
      collaborationAllowed,
      zoneAffinity,
      sourceType,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || rewardCredits === undefined || rewardXp === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category, rewardCredits, rewardXp' 
      });
    }

    // Validate difficulty range
    if (difficulty && (difficulty < 1 || difficulty > 5)) {
      return res.status(400).json({ error: 'Difficulty must be between 1 and 5' });
    }

    // Validate status
    const validStatuses: BountyStatus[] = ['draft', 'open', 'claimed', 'in_progress', 'completed', 'rewarded', 'expired', 'abandoned', 'failed', 'reopened'];
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const newBounty: Bounty = {
      id: `bounty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdByUserId: req.body.createdByUserId || 'system',
      title,
      description,
      category,
      difficulty: difficulty || 1,
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      rewardCredits,
      rewardXp,
      collaborationAllowed: collaborationAllowed ?? true,
      status: req.body.status || 'draft',
      zoneAffinity: zoneAffinity || null,
      sourceType: sourceType || 'api',
      linkedTaskId: req.body.linkedTaskId || null,
      claimedByAgentId: null,
      claimedAt: null,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      metadata: metadata || {}
    };

    bounties.set(newBounty.id, newBounty);
    
    // Auto-publish if status is open
    if (newBounty.status === 'draft') {
      newBounty.status = 'open';
      bounties.set(newBounty.id, newBounty);
    }

    res.status(201).json(newBounty);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/bounties/:id/claim - Claim bounty for an agent
router.post('/:id/claim', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Missing required field: agentId' });
    }

    const bounty = bounties.get(id);
    
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found', bountyId: id });
    }

    // Check if already claimed
    if (bounty.status === 'claimed' || bounty.status === 'in_progress') {
      return res.status(400).json({ 
        error: 'Bounty already claimed', 
        claimedByAgentId: bounty.claimedByAgentId 
      });
    }

    // Check if bounty is still open
    if (bounty.status !== 'open') {
      return res.status(400).json({ 
        error: 'Bounty is not available for claiming', 
        currentStatus: bounty.status 
      });
    }

    // Check if expired
    if (bounty.expiresAt && new Date() > new Date(bounty.expiresAt)) {
      return res.status(400).json({ error: 'Bounty has expired' });
    }

    // Update bounty with claim
    const updatedBounty: Bounty = {
      ...bounty,
      status: 'claimed',
      claimedByAgentId: agentId,
      claimedAt: new Date()
    };

    bounties.set(id, updatedBounty);
    
    res.json({ 
      message: 'Bounty claimed successfully',
      bounty: updatedBounty 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to claim bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// PUT /api/bounties/:id - Update bounty
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bounty = bounties.get(id);
    
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found', bountyId: id });
    }

    const updatedBounty: Bounty = {
      ...bounty,
      ...req.body,
      id: bounty.id, // Prevent ID change
      createdByUserId: req.body.createdByUserId || bounty.createdByUserId
    };

    bounties.set(id, updatedBounty);
    res.json(updatedBounty);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// DELETE /api/bounties/:id - Delete bounty
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!bounties.has(id)) {
      return res.status(404).json({ error: 'Bounty not found', bountyId: id });
    }

    bounties.delete(id);
    res.json({ success: true, bountyId: id });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// POST /api/bounties/:id/complete - Mark bounty as completed (for testing/demo)
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rewardCredits = 0, rewardXp = 0 } = req.body;
    
    const bounty = bounties.get(id);
    
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found', bountyId: id });
    }

    if (bounty.status !== 'claimed' && bounty.status !== 'in_progress') {
      return res.status(400).json({ error: 'Bounty must be claimed first' });
    }

    const updatedBounty: Bounty = {
      ...bounty,
      status: 'completed',
      metadata: {
        ...bounty.metadata,
        completedAt: new Date().toISOString(),
        rewards: { credits: rewardCredits || bounty.rewardCredits, xp: rewardXp || bounty.rewardXp }
      }
    };

    bounties.set(id, updatedBounty);
    res.json({ 
      message: 'Bounty completed!',
      bounty: updatedBounty 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to complete bounty', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export const bountiesRouter = router;
