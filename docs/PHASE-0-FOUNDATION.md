# Phase 0: Foundation

**Objective:** Set up project structure, shared types, auth, and world model.

## Sections Covered
- 29. Monorepo Structure
- 30. Security and Permissions
- 6. High-Level Architecture (overview)
- 7. Architectural Principles
- 8. Recommended Tech Stack (reference)

## Deliverables

### 0.1 Monorepo Setup
```
/apps
  /mobile-app
  /admin-dashboard
  /server-api
  /simulation-service

/packages
  /shared-types
  /world-model
  /auth-core
  /asset-config

/assets
  /avatars
  /maps
  /tilesets
  /animations
  /ui
```

### 0.2 Shared Types
- Define all core interfaces: `Agent`, `Task`, `Bounty`, `Player`, `Zone`, `World`
- Location: `/packages/shared-types`

### 0.3 Auth System
- User registration/login
- Role-based access: Owner, Approved User, Guest
- JWT/session management
- Location: `/packages/auth-core`

### 0.4 World Model
- Zone definitions (HQ interior, city zones)
- World object definitions (desks, meeting rooms, etc.)
- Zone-based world model from section 10
- Location: `/packages/world-model`

### 0.5 Mobile App Shell
- React Native app scaffold
- Navigation structure
- Basic UI components
- Screen placeholders (Home, World, Agents, Bounties, Economy, Profile)

## Dependencies
- None (this is the starting point)

## Next Phase
→ Phase 1: Simulation Core
