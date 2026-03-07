// Re-export AgentState from shared-types
export { AgentState } from '@world-of-npcs/shared-types';

// Export state machine
export { AgentStateMachine, StateMachineEvent, StateChangeEvent, TransitionRejectedEvent, StateMachineListener } from './state-machine';

export default AgentStateMachine;
