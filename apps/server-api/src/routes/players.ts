import { Router, Request, Response } from 'express';
import { Player, PlayerPermissions } from '@world-of-npcs/shared-types';
import { playerService } from '@world-of-npcs/player-core';

const router = Router();

// In-memory player storage (in production, use a proper database)
const players: Map<string, Player> = new Map();

// Invite storage
interface Invite {
  id: string;
  inviterId: string;
  invitedUserId: string;
  worldId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
const invites: Map<string, Invite> = new Map();

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default permissions
 */
function createDefaultPermissions(): PlayerPermissions {
  return {
    canDeployAgents: true,
    canCreateBounties: true,
    canInviteUsers: true,
    canManageWorld: false,
  };
}

// POST /join - Join a world as a player
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { userId, characterName, avatarId, homeZone, worldId } = req.body;

    if (!userId || !characterName || !avatarId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, characterName, avatarId',
      });
    }

    // Check if player already exists for this user
    const existingPlayer = Array.from(players.values()).find(
      (p) => p.userId === userId
    );

    if (existingPlayer) {
      return res.status(409).json({
        error: 'Player already exists for this user',
        player: existingPlayer,
      });
    }

    const player: Player = {
      id: generateId('player'),
      userId,
      avatarId,
      characterName,
      permissions: createDefaultPermissions(),
      homeZone: homeZone || 'lobby',
    };

    players.set(player.id, player);

    // If worldId provided, join the world
    let session = null;
    if (worldId) {
      const result = await playerService.joinWorld(player, { id: worldId, name: 'World' });
      session = result.session;
    }

    return res.status(201).json({
      player,
      session,
    });
  } catch (error) {
    console.error('Error joining world:', error);
    return res.status(500).json({ error: 'Failed to join world' });
  }
});

// GET /me - Get current player info
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Get userId from header (in production, use auth middleware)
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Missing x-user-id header' });
    }

    const player = Array.from(players.values()).find((p) => p.userId === userId);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get active session if any
    const session = playerService.getPlayerSession(player.id);

    return res.json({
      player,
      session,
    });
  } catch (error) {
    console.error('Error getting player:', error);
    return res.status(500).json({ error: 'Failed to get player' });
  }
});

// POST /:id/avatar - Update player avatar
router.post('/:id/avatar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { avatarId } = req.body;

    if (!avatarId) {
      return res.status(400).json({ error: 'Missing required field: avatarId' });
    }

    const player = players.get(id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update avatar
    const updatedPlayer: Player = {
      ...player,
      avatarId,
    };

    players.set(id, updatedPlayer);

    return res.json({
      message: 'Avatar updated successfully',
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// POST /invite - Create an invite
router.post('/invite', async (req: Request, res: Response) => {
  try {
    const { inviterId, invitedUserId, worldId } = req.body;

    if (!inviterId || !invitedUserId || !worldId) {
      return res.status(400).json({
        error: 'Missing required fields: inviterId, invitedUserId, worldId',
      });
    }

    // Verify inviter exists and has permission
    const inviter = players.get(inviterId);
    if (!inviter) {
      return res.status(404).json({ error: 'Inviter player not found' });
    }

    if (!inviter.permissions.canInviteUsers) {
      return res.status(403).json({ error: 'Inviter does not have permission to invite users' });
    }

    // Check for existing pending invite
    const existingInvite = Array.from(invites.values()).find(
      (i) =>
        i.invitedUserId === invitedUserId &&
        worldId &&
        i.worldId === i.status === 'pending'
    );

    if (existingInvite) {
      return res.status(409).json({
        error: 'Pending invite already exists',
        invite: existingInvite,
      });
    }

    const invite: Invite = {
      id: generateId('invite'),
      inviterId,
      invitedUserId,
      worldId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    invites.set(invite.id, invite);

    return res.status(201).json({
      message: 'Invite created successfully',
      invite,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return res.status(500).json({ error: 'Failed to create invite' });
  }
});

export default router;
