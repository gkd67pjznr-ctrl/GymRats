#!/bin/bash
# Initialize API switching in a git worktree.
#
# Copies .claude/settings.local.json from the main repo into the
# target worktree so Claude Code picks up the current backend config
# (GLM, OpenRouter, Deepseek, or native Anthropic).
#
# Usage:
#   ./scripts/llm/init-worktree.sh <worktree-path>
#   ./scripts/llm/init-worktree.sh              # lists worktrees to pick from
#
# After running, restart Claude Code in the worktree to use the backend.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN_REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE="$MAIN_REPO/.claude/settings.local.json"

# --- resolve target ---
if [ -n "$1" ]; then
  TARGET="$1"
else
  echo "Active worktrees:"
  git -C "$MAIN_REPO" worktree list --porcelain | grep '^worktree ' | sed 's/^worktree /  /'
  echo ""
  echo "Usage: $0 <worktree-path>"
  exit 1
fi

# --- validate ---
if [ ! -d "$TARGET" ]; then
  echo "Error: $TARGET is not a directory."
  exit 1
fi

if [ ! -f "$SOURCE" ]; then
  echo "Error: No .claude/settings.local.json in main repo."
  echo "Run a switch script first (e.g. ./scripts/llm/switch-glm.sh)"
  exit 1
fi

# --- copy ---
mkdir -p "$TARGET/.claude"
cp "$SOURCE" "$TARGET/.claude/settings.local.json"

# --- report ---
BACKEND=$(node -e "
const fs = require('fs');
try {
  const s = JSON.parse(fs.readFileSync('$TARGET/.claude/settings.local.json','utf8'));
  const url = (s.env||{}).ANTHROPIC_BASE_URL || '';
  if (url.includes('openrouter.ai')) console.log('OpenRouter');
  else if (url.includes('api.z.ai')) console.log('GLM');
  else if (url.includes('api.deepseek.com')) console.log('Deepseek');
  else console.log('Anthropic (native)');
} catch(e) { console.log('unknown'); }
")

echo "Copied backend config to $TARGET/.claude/settings.local.json"
echo "Backend: $BACKEND"
echo ""
echo "Restart Claude Code in the worktree to apply."
