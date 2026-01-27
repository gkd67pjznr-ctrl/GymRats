#!/bin/bash
# Switch Claude Code to use Anthropic API

cp claude-settings-anthropic.json .claude/settings.local.json
echo "✅ Switched to Anthropic API"
echo "💡 Restart Claude Code or start new session for changes to take effect"
