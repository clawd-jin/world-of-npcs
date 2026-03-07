#!/bin/bash
# World of NPCs - Daily Progress Check Script
# Run this daily to review project status

PROJECT_DIR="/Users/clawd_jin/.openclaw/workspace/world-of-npcs"
LOG_FILE="$PROJECT_DIR/logs/daily.log"

echo "=== World of NPCs Daily Review - $(date) ===" >> $LOG_FILE
echo "" >> $LOG_FILE

# Check git status
cd $PROJECT_DIR
echo "📊 Git Status:" >> $LOG_FILE
echo "  Branch: $(git branch --show-current)" >> $LOG_FILE
echo "  Commits: $(git rev-list --count HEAD)" >> $LOG_FILE
echo "  Last commit: $(git log -1 --oneline)" >> $LOG_FILE
echo "" >> $LOG_FILE

# Check what phases have work
echo "📋 Phase Status:" >> $LOG_FILE
for phase in PHASE-0 PHASE-1 PHASE-2 PHASE-3 PHASE-4 PHASE-5 PHASE-6 PHASE-7; do
  if [ -f "$PROJECT_DIR/docs/${phase}*.md" ]; then
    echo "  ✅ $phase - docs ready" >> $LOG_FILE
  else
    echo "  ❌ $phase - missing" >> $LOG_FILE
  fi
done
echo "" >> $LOG_FILE

# Check code folders (if they exist)
echo "💻 Code Status:" >> $LOG_FILE
if [ -d "$PROJECT_DIR/apps" ]; then
  echo "  Apps folder exists" >> $LOG_FILE
else
  echo "  ⚠️  No code yet - still in planning phase" >> $LOG_FILE
fi
echo "" >> $LOG_FILE

# Next steps
echo "🚀 Next Steps:" >> $LOG_FILE
echo "  1. Phase 0: Create monorepo structure" >> $LOG_FILE
echo "  2. Phase 0: Set up shared-types package" >> $LOG_FILE
echo "  3. Phase 0: Implement auth system" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "Review complete." >> $LOG_FILE
echo "========================================" >> $LOG_FILE
echo "" >> $LOG_FILE
