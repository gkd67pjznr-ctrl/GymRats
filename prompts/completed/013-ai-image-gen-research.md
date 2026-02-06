<research_objective>
Deep research on AI image generation resources for mass art asset creation.

GymRats needs 1500+ exercise icons, UI elements (borders, backgrounds, buttons), avatar system assets, and theme visuals. This research will identify the most cost-effective and time-efficient tools to generate these at scale.

WHY: The app's visual identity depends on consistent, high-quality art assets. Manual creation of 1500+ icons is impractical. We need automated/semi-automated solutions that can batch-process our existing prompt CSV.
</research_objective>

<context>
Existing resources:
- `./docs/assets/exercise-image-prompts.csv` - 1590 exercise prompts ready to use
- `./docs/assets/EXERCISE-ICON-STYLE-GUIDE.md` - Established style (minimal silhouette with accent)
- `./docs/visual-style/ai-image-generation-tools.md` - Existing (likely outdated) research

Budget: Cost-conscious but time-efficient
Style baseline: Black/white icons with color accent flair
</context>

<research_scope>
<mcp_servers>
CRITICAL: Diligently search for MCP (Model Context Protocol) servers that enable image generation from Claude in terminal.

Search for:
1. Official Anthropic image generation MCPs
2. Community-built MCPs for Midjourney, DALL-E, Stable Diffusion
3. MCPs that can batch-process CSV files
4. MCPs with local model support (cost = $0)

For each MCP found, document:
- Name and repository URL
- Installation instructions
- Supported image generators
- Batch processing capability (YES/NO)
- Pricing model
- Quality assessment
</mcp_servers>

<apis_and_services>
Research these image generation APIs:

1. **OpenAI DALL-E 3**
   - Pricing per image
   - API batch capabilities
   - Quality for icons/silhouettes

2. **Midjourney**
   - API availability (official or unofficial)
   - Batch processing options
   - Pricing tiers

3. **Stable Diffusion**
   - Self-hosted options (free)
   - Cloud APIs (Replicate, Stability AI)
   - Best models for icons/silhouettes

4. **Leonardo.ai**
   - Pricing and free tier
   - Batch capabilities
   - Icon-specific features

5. **Ideogram**
   - Pricing
   - Text-in-image capabilities (useful for UI)

6. **Local/Free Options**
   - ComfyUI workflows
   - Automatic1111 batch processing
   - Fooocus
   - Hardware requirements
</apis_and_services>

<batch_processing>
Research how to efficiently process 1590 exercise prompts:

1. CSV-to-API pipelines
2. Queue management for rate limits
3. Output organization (naming, folders)
4. Error handling and retry logic
5. Progress tracking
6. Estimated time for full batch per service
</batch_processing>

<cost_analysis>
Create detailed cost comparison:

| Service | Per Image | 1590 Images | Batch Discount | Quality |
|---------|-----------|-------------|----------------|---------|
| DALL-E 3 | $X | $X | Y/N | A/B/C |
| ... | ... | ... | ... | ... |

Include hidden costs:
- API setup fees
- Storage costs
- Failed generation retries
</cost_analysis>
</research_scope>

<deliverables>
<primary_output>
Create: `./docs/visual-style/AI-IMAGE-GEN-MASTER-RESEARCH.md`

Structure:
```markdown
# AI Image Generation Master Research

## Executive Summary
[Best recommendation for GymRats use case]

## MCP Servers for Claude Terminal
### Available MCPs
[Detailed list with installation instructions]

### Recommended MCP Setup
[Step-by-step guide]

## API Comparison

### Pricing Table
[Full comparison]

### Quality Assessment
[With example outputs if possible]

## Batch Processing Strategy

### Recommended Pipeline
[For 1590 exercise icons]

### Time Estimates
[Per service]

## Cost Projections

### Exercise Icons (1590)
[Cost breakdown by service]

### Full Asset Suite
[Icons + UI + Avatars estimate]

## Recommendations

### Phase 1: Exercise Icons
[Best approach]

### Phase 2: UI Elements
[Best approach]

### Phase 3: Avatar System
[Best approach]

## Quick Start Guide
[How to generate first 10 test icons]
```
</primary_output>

<secondary_output>
Update: `./docs/visual-style/ai-image-generation-tools.md`
Either update with new findings or mark as deprecated pointing to new file.
</secondary_output>
</deliverables>

<verification>
Before completing:
1. At least 3 MCP servers researched with working installation steps
2. At least 5 APIs/services compared with accurate 2024/2025 pricing
3. Cost projection for 1590 images is realistic
4. Batch processing approach is documented
5. Recommendation is clear and actionable
</verification>

<success_criteria>
- Comprehensive research document created
- MCP servers identified with installation instructions
- Accurate pricing for all major services
- Clear recommendation for GymRats use case
- Actionable quick-start guide included
</success_criteria>

<next_prompt>
After completing, the next prompt will: Restructure visual-style and Themes folders
The research findings will inform the folder structure for generated assets.
</next_prompt>
