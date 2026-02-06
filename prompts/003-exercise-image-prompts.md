<research_objective>
Generate AI image generation prompts for every exercise in the GymRats database.

The goal is to create a consistent visual style across 1,590+ exercises. These prompts will be used with image generation tools (Midjourney, DALL-E, Stable Diffusion, or similar) to create exercise illustration icons.

WHY: Visual exercise icons help users quickly identify exercises, especially for obscure movements. A consistent style makes the app feel polished and professional.
</research_objective>

<context>
GymRats uses a "pure" aesthetic with dark UI, sharp contrast, and neon accents.

Exercise data source: `./docs/data/EXERCISE-MASTER-LIST.md` (created by previous prompt)
Fallback source: `src/data/exercises-raw.json`

Current accent themes in the app:
- toxic (lime green)
- electric (purple)
- ember (pink)
- ice (cyan)
</context>

<scope>
<style_research>
First, research and establish a visual style that:
1. Is simple and iconic (not photorealistic)
2. Works at small sizes (48x48 to 128x128 pixels)
3. Clearly shows the exercise movement or position
4. Uses a consistent color palette
5. Can be generated consistently across 1,500+ exercises

Consider these style options:
- **Silhouette style**: Black/white human silhouette in exercise position
- **Line art style**: Minimalist line drawings with single accent color
- **Flat illustration**: Simple geometric shapes, limited colors
- **Icon style**: Ultra-simplified, works at 24x24px

Pick ONE style and document the reasoning.
</style_research>

<prompt_template>
Create a master prompt template that can be adapted for each exercise:

```
[STYLE PREFIX] [EXERCISE DESCRIPTION] [STYLE SUFFIX]
```

The template should:
- Produce consistent results across different exercises
- Include negative prompts to avoid unwanted elements
- Specify aspect ratio, style, and quality parameters
- Work with major AI image generators
</prompt_template>

<exercise_prompts>
For each exercise, generate a specific prompt that:
1. Describes the key body position/movement
2. Specifies equipment if relevant
3. Uses consistent terminology
4. Fits the master template
</exercise_prompts>
</scope>

<deliverables>

<deliverable_1>
**Style Guide Document**: `./docs/assets/EXERCISE-ICON-STYLE-GUIDE.md`

Include:
- Chosen style and rationale
- Color palette specifications
- Size requirements
- Master prompt template
- Negative prompt list
- Example prompts for 10 common exercises
- Tips for consistency
</deliverable_1>

<deliverable_2>
**Exercise Prompts CSV**: `./docs/assets/exercise-image-prompts.csv`

Columns:
- exercise_id
- exercise_name
- image_prompt
- equipment_in_image (yes/no)
- body_position_description

This CSV can be used to batch-generate images or as a reference for manual generation.
</deliverable_2>

<deliverable_3>
**Priority List**: `./docs/assets/EXERCISE-IMAGE-PRIORITY.md`

Rank exercises by image priority:
1. **P0 - Critical (Top 50)**: Most common exercises used in workouts
2. **P1 - Important (Top 200)**: Popular exercises
3. **P2 - Nice to Have (Remaining)**: Less common exercises

This helps prioritize image generation effort.
</deliverable_3>

</deliverables>

<research_instructions>
1. Research existing fitness app icon styles (strong, fitbod, hevy, etc.)
2. Identify what makes exercise icons recognizable at small sizes
3. Consider accessibility (contrast, clarity for colorblind users)
4. Research AI image generation best practices for consistent outputs
5. Test prompt patterns that produce reliable results
</research_instructions>

<evaluation_criteria>
- Style guide is clear and actionable
- Prompts are specific enough to generate recognizable exercises
- CSV format is clean and can be programmatically processed
- Priority list is reasonable (popular lifts ranked higher)
- All 1,590+ exercises have prompts
</evaluation_criteria>

<verification>
Before completing:
1. Verify prompt template produces consistent results (describe expected output)
2. Confirm all exercises from master list have corresponding prompts
3. Check CSV is valid and parseable
4. Ensure priority ranking makes sense (bench, squat, deadlift should be P0)
5. Review style guide for completeness
</verification>

<constraints>
- Do NOT attempt to actually generate images (only create prompts)
- Do NOT use copyrighted character descriptions
- Focus on generic human figures in exercise positions
- Keep prompts concise (under 200 characters ideally)
- Ensure prompts work across multiple AI image generators
</constraints>

<success_criteria>
- Style guide created at `./docs/assets/EXERCISE-ICON-STYLE-GUIDE.md`
- CSV with all exercise prompts at `./docs/assets/exercise-image-prompts.csv`
- Priority list at `./docs/assets/EXERCISE-IMAGE-PRIORITY.md`
- Prompts are actionable and can be used immediately
- Consistent style is achievable from the prompts
</success_criteria>
