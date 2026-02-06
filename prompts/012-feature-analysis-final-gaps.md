<objective>
Perform a FINAL GAP ANALYSIS across all features analyzed in Parts 1-9.

This is Part 10 (Final) of the systematic feature-by-feature codebase analysis. Focus on:
- Cross-feature integration gaps
- Inconsistent patterns
- Missing features
- Technical debt summary
- Priority recommendations

WHY: Individual feature analysis may miss systemic issues. This final pass ensures nothing falls through the cracks.
</objective>

<context>
Read ALL previous analyses:
- `./docs/analyses/feature-analysis-core-workout.md`
- `./docs/analyses/feature-analysis-pr-scoring.md`
- `./docs/analyses/feature-analysis-ai-buddy.md`
- `./docs/analyses/feature-analysis-themes.md`
- `./docs/analyses/feature-analysis-state-persistence.md`
- `./docs/analyses/feature-analysis-navigation.md`
- `./docs/analyses/feature-analysis-social.md`
- `./docs/analyses/feature-analysis-auth.md`
- `./docs/analyses/feature-analysis-routines.md`

Compile findings into a comprehensive summary.
</context>

<scope>
<cross_cutting_concerns>
1. **Pattern Consistency**
   - Are all stores using the same patterns?
   - Are error handling approaches consistent?
   - Are loading states handled uniformly?

2. **Integration Gaps**
   - Features that don't talk to each other properly
   - Data that should sync but doesn't
   - UI inconsistencies between features

3. **Missing Features**
   - Documented but not implemented
   - Partially implemented
   - Obvious gaps users would expect

4. **Technical Debt**
   - Legacy code still in use
   - Temporary hacks that became permanent
   - TODO comments still pending

5. **Performance Bottlenecks**
   - Slow paths identified across analyses
   - Memory issues
   - Battery drain concerns
</cross_cutting_concerns>
</scope>

<process>
1. **Compile all issues** from previous analyses
2. **Categorize** by type (integration, pattern, missing, debt)
3. **Prioritize** by impact and effort
4. **Create action plan** with clear next steps
5. **Update PROJECT-STATUS.md** with findings
</process>

<output>
<final_report>
Create: `./docs/analyses/CODEBASE-ANALYSIS-SUMMARY.md`

Structure:
```markdown
# GymRats Codebase Analysis Summary

## Executive Summary
[High-level findings in 3-5 bullet points]

## Analysis Coverage
| Feature | Status | Critical Issues | Changes Made |
|---------|--------|-----------------|--------------|
| Core Workout | ✅ | X | Y |
| PR & Scoring | ✅ | X | Y |
| ... | ... | ... | ... |

## Cross-Feature Integration Gaps
### Gap 1: [Description]
- Affected features: [list]
- Impact: [High/Medium/Low]
- Recommended fix: [description]

### Gap 2: ...

## Pattern Inconsistencies
[List of inconsistent patterns with recommendations]

## Missing Features
| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| [feature] | Not started | P1 | Medium |

## Technical Debt Register
| Item | Location | Risk | Effort to Fix |
|------|----------|------|---------------|
| [item] | [files] | High | 2 days |

## Performance Summary
[Key bottlenecks and optimizations made]

## Recommended Priority Order
1. [Critical item] - Why
2. [High priority item] - Why
3. ...

## Questions for User
[Any decisions that need user input before proceeding]
```
</final_report>

<project_status_update>
Update: `./docs/1-PROJECT-STATUS.md`

Add section with analysis findings and updated priorities.
</project_status_update>
</output>

<verification>
1. All 9 previous analyses reviewed
2. All issues compiled
3. Gaps identified and documented
4. Priorities make sense
5. Action items are clear
</verification>

<success_criteria>
- Comprehensive summary document created
- All cross-feature gaps identified
- Clear priority recommendations
- PROJECT-STATUS.md updated
- User has clear next steps
</success_criteria>

<final_notes>
This concludes the systematic codebase analysis. The summary document should serve as:
1. A roadmap for future development
2. A technical debt tracker
3. A reference for onboarding new developers
4. Input for sprint planning
</final_notes>
