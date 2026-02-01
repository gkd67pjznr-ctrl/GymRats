#!/bin/bash
# Switch Claude Code backend to DeepSeek V3

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join('$PROJECT_DIR', '.claude', 'settings.local.json');
const templatePath = path.join('$SCRIPT_DIR', 'deepseek-template.json');
const keyPath = path.join(require('os').homedir(), '.config', 'forgerank', '.env.deepseek');

// Read Deepseek key
if (!fs.existsSync(keyPath)) {
  console.error('Error: Deepseek API key not found.');
  console.error('Run: ./scripts/llm/save-openrouter-key.sh <your-api-key>');
  process.exit(1);
}
const keyFile = fs.readFileSync(keyPath, 'utf8');
const match = keyFile.match(/^DEEPSEEK_API_KEY=[\"']?(.+?)[\"']?\s*$/m);
if (!match) {
  console.error('Error: Could not parse Deepseek API key from ' + keyPath);
  process.exit(1);
}
const apiKey = match[1];

// Read existing settings
let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch(e) {}

// Check if already on Deepseek
if (settings.env && settings.env.ANTHROPIC_BASE_URL && settings.env.ANTHROPIC_BASE_URL.includes('api.deepseek.com')) {
  console.log('Already using Deepseek backend.');
  process.exit(0);
}

// Clean any existing backend keys
const keysToRemove = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL', 'ANTHROPIC_DEFAULT_SONNET_MODEL', 'ANTHROPIC_DEFAULT_OPUS_MODEL'];
if (settings.env) {
  keysToRemove.forEach(k => delete settings.env[k]);
  if (settings.env.ANTHROPIC_API_KEY === '') delete settings.env.ANTHROPIC_API_KEY;
}

// Read template and substitute key
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const substituted = {};
for (const [k, v] of Object.entries(template)) {
  substituted[k] = typeof v === 'string' ? v.replace('__DEEPSEEK_API_KEY__', apiKey) : v;
}

// Merge
if (!settings.env) settings.env = {};
Object.assign(settings.env, substituted);

// Write
fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
console.log('Switched to DeepSeek V3 backend.');
console.log('Added 6 env vars to .claude/settings.local.json');
console.log('  Haiku  -> deepseek/deepseek-r1-0528');
console.log('  Sonnet -> deepseek/deepseek-r1-0528');
console.log('  Opus   -> deepseek/deepseek-r1-0528');
console.log('');
console.log('Restart Claude Code to apply changes.');
"
