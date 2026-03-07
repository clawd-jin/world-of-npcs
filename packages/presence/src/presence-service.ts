import { PresenceState, PresenceSession } from '@world-of-npcs/shared-types';

type EntityType = 'player' | 'agent';

interface PresenceRecord {
  session: PresenceSession;
  lastUpdate: Date;
}

/**
 * PresenceService tracks online/offline, in_hq, in_city, observing, and backgrounded states
 * for both players and agents in the World of NPCs system.
 */
export class PresenceService {
  private sessions: Map<string, PresenceRecord> = new Map();
  private entityToSession: Map<string, string> = new Map();

  /**
   * Handle a new connection for a player or agent
   */
  connect(entityType: EntityType, entityId: string, zoneId: string | null = null): PresenceSession {
    const existingSessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (existingSessionId) {
      const existing = this.sessions.get(existingSessionId);
      if (existing) {
        existing.session.state = 'online';
        existing.session.zoneId = zoneId;
        existing.session.disconnectedAt = null;
        existing.lastUpdate = new Date();
        return existing.session;
      }
    }

    const session: PresenceSession = {
      id: this.generateSessionId(),
      entityType,
      entityId,
      state: 'online',
      zoneId,
      connectedAt: new Date(),
      disconnectedAt: null,
    };

    const record: PresenceRecord = {
      session,
      lastUpdate: new Date(),
    };

    this.sessions.set(session.id, record);
    this.entityToSession.set(this.getEntityKey(entityType, entityId), session.id);

    return session;
  }

  /**
   * Handle disconnection for a player or agent
   */
  disconnect(entityType: EntityType, entityId: string): void {
    const sessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (!sessionId) {
      return;
    }

    const record = this.sessions.get(sessionId);
    if (record) {
      record.session.state = 'disconnected';
      record.session.disconnectedAt = new Date();
      record.lastUpdate = new Date();
    }
  }

  /**
   * Update the presence state for an entity
   */
  updateState(entityType: EntityType, entityId: string, state: PresenceState, zoneId?: string | null): PresenceSession | null {
    const sessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (!sessionId) {
      return null;
    }

    const record = this.sessions.get(sessionId);
    if (!record) {
      return null;
    }

    record.session.state = state;
    if (zoneId !== undefined) {
      record.session.zoneId = zoneId;
    }
    record.lastUpdate = new Date();

    return record.session;
  }

  /**
   * Update the zone for an entity
   */
  updateZone(entityType: EntityType, entityId: string, zoneId: string | null): PresenceSession | null {
    const sessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (!sessionId) {
      return null;
    }

    const record = this.sessions.get(sessionId);
    if (!record) {
      return null;
    }

    record.session.zoneId = zoneId;
    record.lastUpdate = new Date();

    return record.session;
  }

  /**
   * Get the current presence session for an entity
   */
  getPresence(entityType: EntityType, entityId: string): PresenceSession | null {
    const sessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (!sessionId) {
      return null;
    }

    return this.sessions.get(sessionId)?.session ?? null;
  }

  /**
   * Get all entities in a specific state
   */
  getByState(state: PresenceState): PresenceSession[] {
    const result: PresenceSession[] = [];
    
    for (const record of this.sessions.values()) {
      if (record.session.state === state) {
        result.push(record.session);
      }
    }

    return result;
  }

  /**
   * Get all entities in a specific zone
   */
  getByZone(zoneId: string): PresenceSession[] {
    const result: PresenceSession[] = [];
    
    for (const record of this.sessions.values()) {
      if (record.session.zoneId === zoneId) {
        result.push(record.session);
      }
    }

    return result;
  }

  /**
   * Get all active (non-disconnected) sessions
   */
  getActiveSessions(): PresenceSession[] {
    const result: PresenceSession[] = [];
    
    for (const record of this.sessions.values()) {
      if (record.session.state !== 'disconnected') {
        result.push(record.session);
      }
    }

    return result;
  }

  /**
   * Get all sessions for a specific entity type
   */
  getByEntityType(entityType: EntityType): PresenceSession[] {
    const result: PresenceSession[] = [];
    
    for (const record of this.sessions.values()) {
      if (record.session.entityType === entityType) {
        result.push(record.session);
      }
    }

    return result;
  }

  /**
   * Get all players
   */
  getPlayers(): PresenceSession[] {
    return this.getByEntityType('player');
  }

  /**
   * Get all agents
   */
  getAgents(): PresenceSession[] {
    return this.getByEntityType('agent');
  }

  /**
   * Remove a session completely
   */
  removeSession(entityType: EntityType, entityId: string): boolean {
    const sessionId = this.entityToSession.get(this.getEntityKey(entityType, entityId));
    
    if (!sessionId) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.entityToSession.delete(this.getEntityKey(entityType, entityId));

    return true;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): PresenceSession[] {
    return Array.from(this.sessions.values()).map(r => r.session);
  }

  private getEntityKey(entityType: EntityType, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
