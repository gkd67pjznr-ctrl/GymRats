<objective>
Create a production pipeline for generating 1590 exercise icons using the most cost-effective method identified in research.

This is the first major asset generation task. Success here proves the pipeline for all future asset generation.

Style: Minimal black/white silhouette with color accent flair (per EXERCISE-ICON-STYLE-GUIDE.md)
</objective>

<context>
Prerequisites (from previous prompts):
- `./docs/art/generation/AI-IMAGE-GEN-RESEARCH.md` - Research findings
- `./docs/art/generation/exercise-prompts.csv` - 1590 prompts ready
- `./docs/art/generation/EXERCISE-ICON-STYLE-GUIDE.md` - Style specs
- `./assets/exercises/icons/` - Output folder

Budget: Cost-conscious but time-efficient
Target: B&W silhouette icons with subtle color accent
Size: 256x256 or 512x512 PNG with transparency
</context>

<requirements>
<pipeline_components>

1. **Prompt Refinement Script**
   Create: `./scripts/art/refine-exercise-prompts.js`

   - Read exercise-prompts.csv
   - Apply master template consistently
   - Add negative prompts
   - Output refined-prompts.csv

2. **Batch Generation Script**
   Create: `./scripts/art/generate-icons.js` (or .py)

   - Read refined prompts
   - Connect to chosen API/MCP
   - Handle rate limiting
   - Save with correct naming: `{exercise_id}.png`
   - Log progress and errors
   - Support resume from interruption

3. **Quality Check Script**
   Create: `./scripts/art/check-icon-quality.js`

   - Verify all icons generated
   - Check file sizes (detect failed generations)
   - Flag icons needing regeneration
   - Generate quality report

4. **Integration Script**
   Create: `./scripts/art/integrate-icons.js`

   - Copy approved icons to `./assets/exercises/icons/`
   - Generate icon manifest JSON
   - Update any code references
</pipeline_components>

<phased_approach>
Given cost-consciousness, implement in phases:

**Phase 1: Test Batch (10 icons)**
- Top 10 exercises (bench, squat, deadlift, etc.)
- Validate quality and consistency
- Refine prompts if needed
- Estimate full batch cost/time

**Phase 2: Priority Icons (P0 - 273 exercises)**
- Most common exercises first
- Ship these with MVP

**Phase 3: Full Coverage (P1+P2 - remaining 1317)**
- Complete exercise library
- Can be done post-launch
</phased_approach>

<fallback_strategy>
If AI generation quality is insufficient:
- Document which exercises need manual touch-up
- Create simple SVG template as fallback
- Identify exercises that can share icons (variations)
</fallback_strategy>
</requirements>

<output>
<scripts>
Create all pipeline scripts in `./scripts/art/`
</scripts>

<documentation>
Create: `./docs/art/generation/ICON-PIPELINE-GUIDE.md`

Include:
- How to run each script
- Environment setup (API keys, etc.)
- Troubleshooting common issues
- Cost tracking
</documentation>

<test_run>
Execute Phase 1 (10 test icons) and include results:
- Generated icon samples
- Quality assessment
- Cost incurred
- Time taken
- Recommendations for full batch
</test_run>
</output>

<verification>
Before completing:
1. All scripts are functional
2. Test batch of 10 icons generated successfully
3. Quality meets style guide standards
4. Cost projection for full batch documented
5. Pipeline guide is complete
</verification>

<success_criteria>
- Working pipeline that can generate icons at scale
- 10 test icons generated and quality-verified
- Clear cost/time estimates for remaining icons
- Documentation for running the pipeline
</success_criteria>

<next_prompt>
After completing, the next prompt will: Design UI element asset system
(borders, backgrounds, buttons, effects)
</next_prompt>
