# Phase 2: Task System

**Objective:** Implement task creation, lifecycle management, and task-to-animation mapping.

## Sections Covered
- 12. Task System Architecture
- 13. Task Mapper

## Deliverables

### 2.1 Task Service
**Responsibilities:**
- Create tasks
- Manage lifecycle
- Classify task type
- Store metadata
- Connect task to agent or bounty
- Emit lifecycle events

**Task States:** queued, accepted, in_progress, blocked, completed, failed, idle

**Task Types:**
- coding, writing, research, meeting, planning, review, design, coordination, delivery

### 2.2 Task API
```
POST /tasks
GET /tasks/:id
PATCH /tasks/:id
GET /tasks
```

### 2.3 Task Mapper
Translates real-world tasks into in-world behavior.

**Input:**
- task type, priority, duration hint, collaborators, difficulty, required skills

**Output:**
- target zone, target object, animation set, expected time class, reward class, collaboration requirements, interruption rules

**Example Mappings:**

| Task Type | Zone | Object | Animation |
|-----------|------|--------|-----------|
| Coding website | Office floor | Desk terminal | typing |
| Writing docs | Desk/quiet area | Desk | writing/reading |
| Meeting | Meeting room | Chairs | seated facing group |
| Research | Lab or desk | Lab bench | reading/analysis |
| Planning | Whiteboard area | Whiteboard | discussing/presenting |

### 2.4 Visible Work Animations
- Agent walks to task location
- Agent performs task-specific animation
- Optional idle pauses, review animations
- Task completion visual feedback

### 2.5 Task Lifecycle Events
```
agent.task_assigned
agent.task_started
agent.task_completed
agent.task_failed
```

## Dependencies
- Phase 1: Simulation Core (agents, world, movement)

## Next Phase
→ Phase 3: Bounty System
