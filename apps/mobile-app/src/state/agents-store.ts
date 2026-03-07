// Agents State placeholder
// TODO: Implement agents state management

export interface Agent {
  id: string;
  name: string;
  level: number;
  rarity: string;
  status: 'idle' | 'active' | 'on_mission';
}

export interface AgentsState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
}

export const initialAgentsState: AgentsState = {
  agents: [],
  selectedAgentId: null,
  isLoading: false,
};

export const agentsReducer = (state: AgentsState, action: any): AgentsState => {
  switch (action.type) {
    case 'SET_AGENTS':
      return { ...state, agents: action.payload, isLoading: false };
    case 'SELECT_AGENT':
      return { ...state, selectedAgentId: action.payload };
    case 'UPDATE_AGENT_STATUS':
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.payload.id
            ? { ...agent, status: action.payload.status }
            : agent
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};
