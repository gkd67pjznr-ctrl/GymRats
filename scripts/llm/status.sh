#!/bin/bash
# Show current Claude Code backend status

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

node -e "
const fs = require('fs');
const path = require('path');
const os = require('os');

const settingsPath = path.join('$PROJECT_DIR', '.claude', 'settings.local.json');
const glmKeyPath = path.join(os.homedir(), '.config', 'forgerank', '.env.glm');
const deepseekKeyPath = path.join(os.homedir(), '.config', 'forgerank', '.env.deepseek');
const orKeyPath = path.join(os.homedir(), '.config', 'forgerank', '.env.openrouter');

// Read settings
let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch(e) {}

const env = settings.env || {};
const baseUrl = env.ANTHROPIC_BASE_URL;
const token = env.ANTHROPIC_AUTH_TOKEN;
const masked = token ? token.substring(0, 8) + '...' : 'n/a';

console.log('=== Claude Code Backend Status ===');
console.log('');

if (!baseUrl) {
  console.log('Backend:  Anthropic (native)');
} else if (baseUrl.includes('openrouter.ai')) {
  console.log('Backend:  OpenRouter');
  console.log('URL:      ' + baseUrl);
  console.log('Token:    ' + masked);
  console.log('Haiku:    ' + (env.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'default'));
  console.log('Sonnet:   ' + (env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'default'));
  console.log('Opus:     ' + (env.ANTHROPIC_DEFAULT_OPUS_MODEL || 'default'));
} else if (baseUrl.includes('api.z.ai')) {
  console.log('Backend:  GLM');
  console.log('URL:      ' + baseUrl);
  console.log('Token:    ' + masked);
  console.log('Model:    ' + (env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'default'));
} else if (baseUrl.includes('api.deepseek.com')) {
  console.log('Backend:  Deepseek');
  console.log('URL:      ' + baseUrl);
  console.log('Token:    ' + masked);
  console.log('Model:    ' + (env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'default'));
} else {
  console.log('Backend:  Custom');
  console.log('URL:      ' + baseUrl);
}

console.log('');
console.log('=== Saved Keys ===');
console.log('GLM:         ' + (fs.existsSync(glmKeyPath) ? 'saved' : 'not found'));
console.log('Deepseek:         ' + (fs.existsSync(deepseekKeyPath) ? 'saved' : 'not found'));
console.log('OpenRouter:  ' + (fs.existsSync(orKeyPath) ? 'saved' : 'not found'));
"
