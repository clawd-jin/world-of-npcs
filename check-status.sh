#!/bin/bash
# Check server status and log

echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log

# Check server
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "Server: OK" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log
  curl -s http://localhost:3001/api/demo/status | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'NPCs: {len(d[\"npcs\"])}')" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log
else
  echo "Server: DOWN" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log
fi

# Check subagents
echo "Active tasks: $(ls -la /Users/clawd_jin/.openclaw/workspace/world-of-npcs/*.md 2>/dev/null | wc -l)" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log

echo "---" >> /Users/clawd_jin/.openclaw/workspace/world-of-npcs/status-check.log
