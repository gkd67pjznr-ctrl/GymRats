#!/bin/bash
# Switch Claude Code to use GLM API

cp claude-settings-glm.json .claude/settings.local.json
echo "✅ Switched to GLM API (z.ai)"
echo "💡 Restart Claude Code or start new session for changes to take effect"
