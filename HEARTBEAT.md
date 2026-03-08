# World of NPCs - Project Heartbeat

Every heartbeat runs the self-checking loop: GOAL → EXECUTE → CHECK → REPEAT

## Project Context
- **Location:** `/Users/clawd_jin/.openclaw/workspace/world-of-npcs`
- **Repo:** https://github.com/clawd-jin/world-of-npcs
- **Phase Status:** Phase 0-4 ✅ | Phase 5-7 🚧

## Self-Checking Loop (Every 30 min)

### 1. CHECK (What exists now?)
- Run: `git status && git log --oneline -3`
- Check: Any uncommitted changes?
- Check: Server running? `curl -s localhost:3000/health || echo "STOPPED"`

### 2. GOAL (What needs doing?)
- Current phase: **Phase 5 - Social & Idle**
- Deliverables needed:
  - [ ] NPC Behavior Engine (FSM + utility scoring)
  - [ ] Social interactions system
  - [ ] Relationship tracking
  - [ ] Idle exploration behavior
- Check: What's blocking? What's ready?

### 3. EXECUTE (Do the work)
- If blocked: Post in for help channel
- If ready: Pick one deliverable and implement
- Commit often with clear messages

### 4. REPEAT
- Next heartbeat: Go back to CHECK

## Heartbeat Tasks
1. Run git status → report any changes
2. Check server health
3. Pick ONE next task from current phase
4. Execute or flag blocker
5. Report progress to channel

## Alert Conditions
- Server down → Restart it
- Blocker identified → Ping team in Discord
- Task complete → Commit and update this file

## Cron Schedule
- Every 30 minutes: Full loop
- Daily (9am): Sprint planning
