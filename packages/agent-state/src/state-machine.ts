import { AgentState } from '@world-of-npcs/shared-types';

// Define all valid states
const VALID_STATES: AgentState[] = [
  'spawning', 'walking', 'working', 'meeting', 'socializing',
  'exploring', 'resting', 'idle',
  'evaluating_bounties', 'claiming_bounty', 'bounty_working',
  'bounty_collaborating', 'learning', 'interrupted', 'offline'
];

// Define valid state transitions
const VALID_TRANSITIONS: Record<AgentState, AgentState[]> = {
  spawning: ['walking', 'idle', 'offline', 'interrupted'],
  walking: ['working', 'meeting', 'socializing', 'exploring', 'resting', 'idle', 'evaluating_bounties', 'learning', 'interrupted', 'offline'],
  working: ['walking', 'idle', 'resting', 'evaluating_bounties', 'learning', 'interrupted', 'offline'],
  meeting: ['walking', 'socializing', 'working', 'idle', 'resting', 'interrupted', 'offline'],
  socializing: ['walking', 'meeting', 'working', 'idle', 'resting', 'exploring', 'interrupted', 'offline'],
  exploring: ['walking', 'working', 'meeting', 'socializing', 'idle', 'resting', 'evaluating_bounties', 'learning', 'interrupted', 'offline'],
  resting: ['walking', 'idle', 'working', 'evaluating_bounties', 'learning', 'socializing', 'interrupted', 'offline'],
  idle: ['walking', 'working', 'meeting', 'socializing', 'exploring', 'resting', 'evaluating_bounties', 'claiming_bounty', 'learning', 'interrupted', 'offline'],
  evaluating_bounties: ['idle', 'claiming_bounty', 'walking', 'resting', 'interrupted', 'offline'],
  claiming_bounty: ['bounty_working', 'idle', 'walking', 'interrupted', 'offline'],
  bounty_working: ['walking', 'idle', 'resting', 'evaluating_bounties', 'bounty_collaborating', 'learning', 'interrupted', 'offline'],
  bounty_collaborating: ['bounty_working', 'walking', 'idle', 'resting', 'interrupted', 'offline'],
  learning: ['walking', 'working', 'idle', 'resting', 'evaluating_bounties', 'interrupted', 'offline'],
  interrupted: ['walking', 'working', 'idle', 'resting', 'evaluating_bounties', 'learning', 'socializing', 'offline'],
  offline: ['spawning']
};

// Event types for state machine
export type StateChangeEvent = {
  type: 'state_change';
  previousState: AgentState;
  newState: AgentState;
  timestamp: Date;
};

export type TransitionRejectedEvent = {
  type: 'transition_rejected';
  currentState: AgentState;
  attemptedState: AgentState;
  timestamp: Date;
};

export type StateMachineEvent = StateChangeEvent | TransitionRejectedEvent;

// Event listener type
export type StateMachineListener = (event: StateMachineEvent) => void;

/**
 * AgentStateMachine - Manages state transitions for NPC agents
 * 
 * Handles:
 * - State transitions with validation
 * - Event emission on state changes
 * - Transition history tracking
 */
export class AgentStateMachine {
  private currentState: AgentState;
  private listeners: Set<StateMachineListener> = [];
  private transitionHistory: Array<{ from: AgentState; to: AgentState; timestamp: Date }> = [];

  constructor(initialState: AgentState = 'spawning') {
    if (!VALID_STATES.includes(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`);
    }
    this.currentState = initialState;
  }

  /**
   * Get the current state
   */
  getState(): AgentState {
    return this.currentState;
  }

  /**
   * Check if a transition to the given state is valid
   */
  canTransitionTo(targetState: AgentState): boolean {
    if (!VALID_STATES.includes(targetState)) {
      return false;
    }
    const allowedTransitions = VALID_TRANSITIONS[this.currentState];
    return allowedTransitions.includes(targetState);
  }

  /**
   * Attempt to transition to a new state
   * @returns true if transition was successful, false if rejected
   */
  transition(targetState: AgentState): boolean {
    // Handle offline specially - it can always be reached
    if (targetState === 'offline') {
      this.performTransition(targetState);
      return true;
    }

    if (!this.canTransitionTo(targetState)) {
      this.emit({
        type: 'transition_rejected',
        currentState: this.currentState,
        attemptedState: targetState,
        timestamp: new Date()
      });
      return false;
    }

    this.performTransition(targetState);
    return true;
  }

  /**
   * Perform the actual state transition
   */
  private performTransition(targetState: AgentState): void {
    const previousState = this.currentState;
    this.currentState = targetState;
    
    this.transitionHistory.push({
      from: previousState,
      to: targetState,
      timestamp: new Date()
    });

    this.emit({
      type: 'state_change',
      previousState,
      newState: targetState,
      timestamp: new Date()
    });
  }

  /**
   * Add an event listener
   */
  addListener(listener: StateMachineListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove an event listener
   */
  removeListener(listener: StateMachineListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: StateMachineEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in state machine listener:', error);
      }
    });
  }

  /**
   * Get transition history
   */
  getTransitionHistory(): Array<{ from: AgentState; to: AgentState; timestamp: Date }> {
    return [...this.transitionHistory];
  }

  /**
   * Get all valid states
   */
  static getValidStates(): AgentState[] {
    return [...VALID_STATES];
  }

  /**
   * Get valid transitions from current state
   */
  getValidTransitions(): AgentState[] {
    return [...VALID_TRANSITIONS[this.currentState]];
  }

  /**
   * Force set state (bypass validation - use with caution)
   */
  forceSetState(newState: AgentState): void {
    if (!VALID_STATES.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }
    this.performTransition(newState);
  }

  /**
   * Reset state machine to initial state
   */
  reset(initialState: AgentState = 'spawning'): void {
    this.transitionHistory = [];
    if (!VALID_STATES.includes(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`);
    }
    this.currentState = initialState;
  }
}

export default AgentStateMachine;
