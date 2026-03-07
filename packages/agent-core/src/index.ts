// Agent core package exports
export { AgentService, AgentLifecycleEvent, AgentServiceConfig } from './agent-service'
export { AgentRepository, CreateAgentDTO, UpdateAgentStateDTO } from './agent-repository'

// Re-export types from shared-types for convenience
export type {
  Agent,
  AgentState,
  Location,
  SkillProfile,
  SkillType,
  AgentSkill,
  RelationshipStats,
  AgentRelationship,
  Permissions,
  Wallet,
} from '@world-of-npcs/shared-types'
