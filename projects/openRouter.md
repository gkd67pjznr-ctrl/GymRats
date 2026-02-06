
Task List
✅ Understand why GLM switch works (Anthropic-compatible proxy)
🔄 Evaluate OpenRouter compatibility
⏳ Evaluate DeepSeek compatibility
⏳ Identify other compatible providers
⏳ Document switching patterns for each
Current Item: OpenRouter & DeepSeek Compatibility Analysis
Why This Works With GLM
You've identified the key insight correctly. Claude Code expects the Anthropic Messages API format:
Specific request structure (messages, model, max_tokens, etc.)
Specific response format (streaming SSE with message_start, content_block_delta, etc.)
Specific authentication (API key in x-api-key header)
GLM's proxy at https://api.z.ai/api/anthropic implements this exact interface, so Claude Code is none the wiser.
OpenRouter Compatibility: YES ✅
OpenRouter explicitly supports Anthropic API format at:
https://openrouter.ai/api/v1
However, there's a critical difference in the implementation:
json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-<your-openrouter-key>",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "anthropic/claude-3.5-haiku",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic/claude-3.5-sonnet",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "google/gemini-pro-1.5"
  }
}
```

**Key differences:**
1. **Model names must use OpenRouter's format**: `provider/model-name`
2. **You can mix providers** - use Claude for Sonnet, Gemini for Opus, DeepSeek for Haiku
3. **OpenRouter translates the Anthropic format** to each provider's native API

**Caveats:**
- Some features may not translate perfectly (thinking blocks, tool use nuances)
- Streaming behavior might differ slightly
- Cost is OpenRouter's pricing, not native provider pricing

---

### DeepSeek Compatibility: **NO** ❌ (Direct), **YES** ✅ (via OpenRouter)

DeepSeek's native API uses **OpenAI format**, not Anthropic format:
```
https://api.deepseek.com/v1
You cannot switch directly because Claude Code would send Anthropic-formatted requests that DeepSeek wouldn't understand.
However, you can use DeepSeek through OpenRouter:
json
{
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek/deepseek-r1-0528"
}
```

OpenRouter handles the Anthropic → OpenAI translation.

---

### Other Compatible Providers

Any service offering an **Anthropic-compatible proxy** will work:

1. **AWS Bedrock** - Supports Anthropic API format natively
2. **Google Vertex AI** - Has Anthropic Claude models with compatible API
3. **Azure** - Offers Anthropic Claude via compatible endpoint
4. **OpenRouter** - Universal translator (supports Anthropic format)
5. **Custom proxies** - You could build your own using LiteLLM or similar

**Won't work directly:**
- Native OpenAI API (different format)
- Native Gemini API (different format)
- Native DeepSeek API (different format)

---

### The Pattern

For any provider to work with this switching method:
```
Does the provider accept requests formatted like:
POST /messages
{
  "model": "string",
  "messages": [...],
  "max_tokens": number
}
with x-api-key authentication?
YES → Direct switch works
NO, but OpenAI format → Use OpenRouter bridge
NO, custom format → Won't work without custom proxy
Practical Recommendation for Your MoAI Setup
If you want maximum flexibility with cost optimization:
json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-<openrouter-key>",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek/deepseek-r1-0528",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic/claude-3.5-sonnet",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4"
  }
}
This gives you:
DeepSeek for cheap quick tasks (Haiku tier)
Real Claude Sonnet for balanced work
Real Claude Opus for complex reasoning
OpenRouter handles all the API translation, and you get one bill with transparent per-request pricing.
Want me to create a configuration file template for multi-provider switching, or shall we move on to implementing the MoAI workflow integration?
