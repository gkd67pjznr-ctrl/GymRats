# MoAI-ADK API Backend Switching: Anthropic <-> GLM

## Overview

MoAI-ADK supports switching its LLM backend between **Anthropic Claude** (native) and **GLM** (via a compatibility proxy). The trick is that Claude Code only speaks the Anthropic API protocol, so GLM is accessed by pointing the Anthropic environment variables at a different base URL (`https://api.z.ai/api/anthropic`) and swapping the auth token. The switch is done entirely through environment variables written to `.claude/settings.local.json`.

---

## Architecture at a Glance

```
User runs:  moai glm           User runs:  moai claude
      |                              |
      v                              v
 switch.py                      switch.py
 switch_to_glm()                switch_to_claude()
      |                              |
      v                              v
 Reads glm.json template        Reads settings.local.json
 Substitutes ${GLM_API_KEY}     Removes GLM env keys
 Merges into settings.local     Writes back clean settings
      |                              |
      v                              v
 .claude/settings.local.json    .claude/settings.local.json
 now has ANTHROPIC_BASE_URL     now has no override
 pointing to GLM proxy          (uses native Anthropic)
      |                              |
      v                              v
 Claude Code restarts and       Claude Code restarts and
 talks to GLM via proxy         talks to Anthropic directly
```

---

## File Inventory

### Core Implementation

| File | Purpose |
|------|---------|
| `src/cli/commands/switch.py` | Main switch logic. `switch_to_glm()` and `switch_to_claude()` entry points. Handles credential lookup, env var substitution, and writing to `settings.local.json`. |
| `src/core/credentials.py` | Credential storage and retrieval. Manages `~/.moai/.env.glm` (GLM key), `~/.moai/credentials.yaml` (both keys). Also handles removing stale `export GLM_API_KEY=` from shell configs. |
| `src/core/model_allocator.py` | Maps agent types (expert-backend, explore, etc.) to specific models based on service type (claude_subscription, glm, hybrid) and pricing plan. |
| `src/__main__.py` | CLI entry point. Registers `moai glm [api-key]`, `moai claude`, and `moai cc` commands. |

### Configuration Files

| File | Purpose |
|------|---------|
| `config/llm-configs/glm.json` | **The GLM config template.** Contains the environment variables that get injected into `settings.local.json` when switching to GLM. Uses `${GLM_API_KEY}` placeholder. |
| `config/sections/llm.yaml` | LLM mode selection (`claude-only`, `mashup`, `glm-only`), GLM base URL, model mappings (haiku/sonnet/opus all map to `glm-4.7`), routing config. |
| `config/sections/pricing.yaml` | Service type (`claude_subscription`, `claude_api`, `glm`, `hybrid`) and pricing plan selection. |

### Templates (for new project initialization)

| File | Purpose |
|------|---------|
| `templates/llm-configs/glm.json` | Same as above, distributed to new projects via `moai init`. |
| `templates/config/sections/llm.yaml` | Template version of LLM config. |
| `templates/config/sections/pricing.yaml` | Template version of pricing config. |

### Project Initialization

| File | Purpose |
|------|---------|
| `src/cli/commands/init.py` | `moai init` command. Prompts for GLM API key during setup, saves it, configures service type and pricing plan in YAML config files. |
| `src/cli/prompts/init_prompts.py` | Interactive setup wizard. Question 2 asks for GLM API key (optional). Stores it via `save_glm_key_to_env()`. |

### Worktree Integration

| File | Purpose |
|------|---------|
| `src/cli/worktree/cli.py` | `moai worktree new --glm` flag copies GLM config to worktrees. Enables parallel development with one worktree on Claude and another on GLM. |
| `src/cli/worktree/manager.py` | `_copy_llm_config()` method substitutes `${VAR}` patterns in the GLM config template and writes to `{worktree}/.claude/settings.local.json`. |

### Tests

| File | Purpose |
|------|---------|
| `tests/cli/commands/test_switch.py` | Tests for all switch operations: credential lookup priority, env var substitution, GLM/Claude switching, edge cases. |
| `tests/core/test_credentials.py` | Tests for credential CRUD: .env.glm file operations, credentials.yaml, shell config cleanup. |
| `tests/unit/core/test_model_allocator.py` | Tests for model allocation across all service types and pricing plans. |

---

## How the Switch Actually Works

### Switching to GLM (`moai glm`)

1. **Verify key exists**: Checks `~/.moai/.env.glm` for a saved GLM API key. If missing, aborts with instructions.

2. **Load the GLM config template**: Reads `.moai/llm-configs/glm.json`:
   ```json
   {
     "env": {
       "ANTHROPIC_AUTH_TOKEN": "${GLM_API_KEY}",
       "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
       "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
       "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
     }
   }
   ```

3. **Substitute credentials**: Replaces `${GLM_API_KEY}` with the actual key from the credential chain (see below).

4. **Merge into settings**: Reads `.claude/settings.local.json` (or creates it), merges the GLM env block in, writes it back.

5. **User restarts Claude Code**: The new env variables override the defaults. Claude Code now sends requests to `https://api.z.ai/api/anthropic` with the GLM auth token, and requests `glm-4.7` instead of `claude-3.5-sonnet` etc.

### Switching to Claude (`moai claude`)

1. **Check if GLM is active**: Looks for `ANTHROPIC_BASE_URL` in `.claude/settings.local.json`.

2. **Remove GLM keys**: Strips these 5 keys from the `env` block:
   - `ANTHROPIC_AUTH_TOKEN`
   - `ANTHROPIC_BASE_URL`
   - `ANTHROPIC_DEFAULT_HAIKU_MODEL`
   - `ANTHROPIC_DEFAULT_SONNET_MODEL`
   - `ANTHROPIC_DEFAULT_OPUS_MODEL`

3. **Clean up**: If the `env` section is now empty, removes it entirely. Writes back.

4. **User restarts Claude Code**: Without the overrides, Claude Code uses its native Anthropic connection.

### Updating the GLM Key (`moai glm <api-key>`)

1. Saves the key to `~/.moai/.env.glm` (dotenv format, chmod 600).
2. If `GLM_API_KEY` is also exported in `~/.zshrc` or `~/.bashrc`, removes those lines (creates `.moai-backup`).
3. Does NOT switch the backend - just stores the key for next time.

---

## Credential Resolution Chain

When the system needs a GLM API key, it checks these sources in order:

| Priority | Source | Path | Notes |
|----------|--------|------|-------|
| 1 | `.env.glm` file | `~/.moai/.env.glm` | User's explicit choice via `moai glm <key>` |
| 2 | `credentials.yaml` | `~/.moai/credentials.yaml` | Legacy storage, backward compat |
| 3 | Environment variable | `$GLM_API_KEY` | Fallback for CI/CD pipelines |

For Anthropic keys:

| Priority | Source | Path |
|----------|--------|------|
| 1 | Environment variable | `$ANTHROPIC_API_KEY` |
| 2 | `credentials.yaml` | `~/.moai/credentials.yaml` |

---

## Model Allocation System

The `model_allocator.py` maps agent types to models based on the active service:

### Claude Subscription Plans

| Agent Type | Pro ($20) | Max5 ($100) | Max20 ($200) |
|------------|-----------|-------------|--------------|
| plan, security, refactoring, strategy | sonnet | opus | opus |
| backend, frontend, database, ddd, spec, docs, quality | sonnet | sonnet | opus |
| explore, debug | haiku | haiku | haiku/sonnet |

### GLM Plans

| Agent Type | Basic | Pro | Enterprise |
|------------|-------|-----|------------|
| All high-complexity | glm-basic | glm-pro | glm-enterprise |
| All medium-complexity | glm-basic | glm-pro | glm-enterprise |
| explore, debug | glm-basic | glm-basic | glm-basic/pro |

### Hybrid Mode

Uses Claude allocation for most agents, but overrides `explore` and `expert_debug` to use `glm-basic` for cost savings.

---

## LLM Modes

Configured in `llm.yaml`:

| Mode | Description |
|------|-------------|
| `claude-only` | All operations use Claude (default) |
| `mashup` | Planning with Claude, execution with GLM |
| `glm-only` | Everything uses GLM (lowest cost) |

---

## The Proxy Mechanism

The key insight is that GLM is accessed through a **compatibility proxy** at `https://api.z.ai/api/anthropic`. This proxy:

- Accepts the Anthropic API protocol (same request/response format)
- Routes requests to the GLM backend
- Uses the GLM API key as `ANTHROPIC_AUTH_TOKEN`
- Maps model names: when Claude Code requests `haiku`/`sonnet`/`opus`, the config overrides these to `glm-4.7`

This means Claude Code doesn't need any code changes to support GLM - the entire switch is done through environment variable overrides in `settings.local.json`.

---

## Worktree Integration

For hybrid development (some work on Claude, some on GLM):

```bash
# Create a worktree with GLM config
moai worktree new SPEC-AUTH-001 --glm

# This copies glm.json to {worktree}/.claude/settings.local.json
# with ${GLM_API_KEY} substituted from the environment
```

The `_copy_llm_config()` method in `manager.py` handles the substitution and file copy.

---

## Key Constants

From `switch.py`:

```python
GLM_ENV_KEYS = [
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_BASE_URL",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    "ANTHROPIC_DEFAULT_SONNET_MODEL",
    "ANTHROPIC_DEFAULT_OPUS_MODEL",
]
```

These are the 5 environment variables that get added/removed from `settings.local.json` during a switch.

---

## File Paths Summary

```
~/.moai/.env.glm                          # GLM API key (dotenv, chmod 600)
~/.moai/credentials.yaml                  # Both API keys (YAML, chmod 600)
{project}/.moai/llm-configs/glm.json      # GLM config template
{project}/.moai/config/sections/llm.yaml  # LLM mode + GLM settings
{project}/.moai/config/sections/pricing.yaml  # Service type + plan
{project}/.claude/settings.local.json     # Runtime env var overrides (THE SWITCH TARGET)
```

---

## Sequence Diagram

```
User                    CLI                    Credentials           settings.local.json
 |                       |                         |                        |
 |-- moai glm <key> --->|                         |                        |
 |                       |-- save_glm_key_to_env ->|                        |
 |                       |     (~/.moai/.env.glm)  |                        |
 |                       |<-- saved ---------------|                        |
 |<-- "key updated" -----|                         |                        |
 |                       |                         |                        |
 |-- moai glm --------->|                         |                        |
 |                       |-- glm_env_exists? ----->|                        |
 |                       |<-- yes (key found) -----|                        |
 |                       |-- load glm.json ------->|                        |
 |                       |-- substitute ${vars} -->|                        |
 |                       |<-- actual key ----------|                        |
 |                       |-- merge env ------------|----------------------->|
 |                       |                         |    ANTHROPIC_BASE_URL  |
 |                       |                         |    ANTHROPIC_AUTH_TOKEN |
 |                       |                         |    ANTHROPIC_DEFAULT_* |
 |<-- "switched to GLM" -|                         |                        |
 |                       |                         |                        |
 |-- moai claude ------->|                         |                        |
 |                       |-- remove GLM keys ------|----------------------->|
 |                       |                         |    (keys removed)      |
 |<-- "switched Claude" -|                         |                        |
```
