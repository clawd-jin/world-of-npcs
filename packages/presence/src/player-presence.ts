import { PresenceState, PresenceSession, Player } from '@world-of-npcs/shared-types';
import { PresenceService } from './presence-service';

/**
 * PlayerPresenceService provides specialized presence tracking for players.
 * Handles states: online, in_hq, in_city, observing, backgrounded
 */
export class PlayerPresenceService {
  private presenceService: PresenceService;

  constructor(presenceService?: PresenceService) {
    this.presenceService = presenceService ?? new PresenceService();
  }

  /**
   * Mark a player as online (default state when connecting)
   */
  playerOnline(playerId: string, zoneId: string | null = null): PresenceSession {
    return this.presenceService.connect('player', playerId, zoneId);
  }

  /**
   * Mark a player as disconnected/offline
   */
  playerOffline(playerId: string): void {
    this.presenceService.disconnect('player', playerId);
  }

  /**
   * Set player to in_hq state (headquarters)
   */
  playerInHQ(playerId: string, zoneId: string): PresenceSession | null {
    return this.presenceService.updateState('player', playerId, 'in_hq', zoneId);
  }

  /**
   * Set player to in_city state
   */
  playerInCity(playerId: string, zoneId: string): PresenceSession | null {
    return this.presenceService.updateState('player', playerId, 'in_city', zoneId);
  }

  /**
   * Set player to observing state (spectating/observing world)
   */
  playerObserving(playerId: string, zoneId: string | null = null): PresenceSession | null {
    return this.presenceService.updateState('player', playerId, 'observing', zoneId);
  }

  /**
   * Set player to backgrounded state (tab minimized, idle, etc.)
   */
  playerBackgrounded(playerId: string): PresenceSession | null {
    return this.presenceService.updateState('player', playerId, 'backgrounded');
  }

  /**
   * Get player's current presence
   */
  getPlayerPresence(playerId: string): PresenceSession | null {
    return this.presenceService.getPresence('player', playerId);
  }

  /**
   * Get all online players (any state except disconnected/backgrounded)
   */
  getOnlinePlayers(): PresenceSession[] {
    const allPlayers = this.presenceService.getPlayers();
    return allPlayers.filter(p => p.state !== 'disconnected');
  }

  /**
   * Get all players in HQ
   */
  getPlayersInHQ(): PresenceSession[] {
    return this.presenceService.getByState('in_hq');
  }

  /**
   * Get all players in city
   */
  getPlayersInCity(): PresenceSession[] {
    return this.presenceService.getByState('in_city');
  }

  /**
   * Get all observing players
   */
  getObservingPlayers(): PresenceSession[] {
    return this.presenceService.getByState('observing');
  }

  /**
   * Get all backgrounded players
   */
  getBackgroundedPlayers(): PresenceSession[] {
    return this.presenceService.getByState('backgrounded');
  }

  /**
   * Get all players in a specific zone
   */
  getPlayersInZone(zoneId: string): PresenceSession[] {
    return this.presenceService.getByZone(zoneId).filter(
      p => p.entityType === 'player'
    );
  }

  /**
   * Get all connected players
   */
  getAllPlayers(): PresenceSession[] {
    return this.presenceService.getPlayers();
  }

  /**
   * Move player to a new zone with appropriate state update
   */
  movePlayer(playerId: string, targetZone: 'hq' | 'city' | 'observe', zoneId: string): PresenceSession | null {
    const stateMap: Record<'hq' | 'city' | 'observe', PresenceState> = {
      hq: 'in_hq',
      city: 'in_city',
      observe: 'observing',
    };
    return this.presenceService.updateState('player', playerId, stateMap[targetZone], zoneId);
  }

  /**
   * Check if player is active (online, in_hq, in_city, or observing)
   */
  isPlayerActive(playerId: string): boolean {
    const presence = this.getPlayerPresence(playerId);
    if (!presence) return false;
    const activeStates: PresenceState[] = ['online', 'in_hq', 'in_city', 'observing'];
    return activeStates.includes(presence.state);
  }

  /**
   * Remove player from presence tracking
   */
  removePlayer(playerId: string): boolean {
    return this.presenceService.removeSession('player', playerId);
  }
}
