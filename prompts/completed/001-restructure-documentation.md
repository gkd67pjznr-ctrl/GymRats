<objective>
Perform a comprehensive analysis and restructuring of the docs/ folder and root-level documentation files.

The goal is to create a clean, navigable, well-organized documentation system with:
- No duplicate content (compress duplicates into single authoritative documents)
- No outdated/superseded documents in active folders (archive them)
- Consistent naming conventions (kebab-case files, lowercase-kebab folders)
- Logical folder structure that's easy to navigate
- A clear README.md hub that serves as the single entry point

This matters because the current docs folder has accumulated technical debt: 85+ files with inconsistent naming, duplicate topics, and outdated summaries scattered throughout.
</objective>

<context>
**Project:** GymRats - React Native workout tracking app
**Current State:** 85+ documentation files across 15+ folders
**Known Issues:**
- Folder names use spaces and mixed case ("Codebase Analysis", "Master Documentation", "Feature Work Documents")
- Multiple "summary" and "complete" documents that overlap
- Some documents reference deprecated features or outdated implementations
- Inconsistent file naming (SCREAMING-CAPS.md vs kebab-case.md)

**Key Files to Preserve:**
- `docs/README.md` - Documentation hub (recently updated, well-organized)
- `docs/1-PROJECT-STATUS.md` - Single source of truth for status
- `docs/3-CODEBASE-GUIDE.md` - Technical reference
- `docs/features/*/feature-*.md` - Individual feature documentation (flat structure is good)
- `docs/Project Management/CLAUDE_WORKFLOW.md` - Claude workflow reference
- `CLAUDE.md` (root) - Main project instructions

**Files/Folders to Examine for Duplicates:**
- `docs/Codebase Analysis/` - Multiple overlapping analysis documents
- `docs/Feature Work Documents/` - May contain completed/superseded work
- `docs/Notifications/` - Multiple "update" and "summary" files
- `docs/Synchronization/` - Multiple synchronization summaries
- `docs/visual-style/` - Multiple roadmap versions (v1 and v2)
- `docs/Master Documentation/` - Core documents, check for outdated ones
</context>

<requirements>
## Phase 1: Analysis (Read-Only)
Thoroughly analyze every document in the docs/ folder and root .md files:

1. **Catalog all documents** - Create a complete inventory with:
   - File path
   - Purpose/topic
   - Last meaningful content date (from content, not file system)
   - Status: active | outdated | duplicate | superseded

2. **Identify duplicates** - Find documents covering the same topic:
   - Same information in different files
   - Older versions superseded by newer ones
   - "Summary" files that duplicate content from main files

3. **Identify outdated documents** - Find documents that are no longer accurate:
   - Reference deprecated features
   - Describe old implementations
   - Have "COMPLETE" or "FINAL" in name but describe WIP

4. **Map the dependency graph** - Understand which documents reference which others

## Phase 2: Restructuring Plan
Before making any changes, create a detailed restructuring plan in `docs/archive/RESTRUCTURE-PLAN.md`:

1. **Documents to archive** - List with reason for each
2. **Documents to merge** - Which files combine into what
3. **Folders to rename** - Old name → new name mapping
4. **Files to rename** - Old name → new name mapping
5. **New folder structure** - Complete tree view

## Phase 3: Execution
Only after the plan is approved, execute the restructuring:

### Folder Renames (apply these transformations):
- `Codebase Analysis` → `codebase-analysis`
- `Master Documentation` → `master`
- `Feature Work Documents` → `archive/feature-work` (likely outdated)
- `Project Management` → `project-management`
- `AskUQ` → `interviews`
- Spaces → hyphens in all folder names

### File Renames (apply kebab-case):
- `SCREAMING-CAPS.md` → `screaming-caps.md`
- `camelCase.md` → `camel-case.md`
- Preserve numbered prefixes: `1-PROJECT-STATUS.md` stays as-is

### Archive Structure:
Create `docs/archive/` with subdirectories:
- `docs/archive/superseded/` - Old versions replaced by newer
- `docs/archive/completed-work/` - Feature work that's done
- `docs/archive/old-summaries/` - Outdated summary documents

### Merging Rules:
When merging duplicates:
- Keep the most recent/complete version as the base
- Add any unique information from other versions
- Note the merge in a comment at the top
- Archive the source documents

## Phase 4: Update References
After restructuring:
1. Update `docs/README.md` with new paths
2. Update `CLAUDE.md` with new paths
3. Search for broken internal links and fix them
</requirements>

<constraints>
**DO NOT:**
- Delete any files - move to archive instead
- Modify the `docs/features/*/feature-*.md` structure (it's already well-organized)
- Change the numbered prefix system (1-, 2-, 3-)
- Modify content within documents except to fix broken links
- Touch `docs/business/` folder (git-ignored, private)

**WHY archive instead of delete:** Documentation history has value. Old decisions inform future ones. Archiving preserves institutional memory while decluttering active docs.

**WHY kebab-case:** It's URL-safe, consistent with web standards, and easier to type than SCREAMING_CAPS or spaces.
</constraints>

<implementation>
### Step-by-step execution order:

1. **Read all docs** - Use Glob to find all .md files, Read each one
2. **Create inventory** - Build the catalog in memory
3. **Identify issues** - Mark duplicates, outdated, superseded
4. **Write plan** - Create `docs/archive/RESTRUCTURE-PLAN.md`
5. **STOP** - Present plan to user and wait for approval
6. **Execute renames** - Use Bash `mv` commands for folders first, then files
7. **Execute archives** - Move outdated files to archive/
8. **Execute merges** - For any duplicate sets, merge and archive sources
9. **Update references** - Fix all broken links in README.md and CLAUDE.md
10. **Verify** - Run Glob again to confirm new structure
</implementation>

<output>
Create/modify files:
- `./docs/archive/RESTRUCTURE-PLAN.md` - The complete restructuring plan
- `./docs/README.md` - Updated with new paths after restructuring
- `../CLAUDE.md` - Updated with new paths after restructuring

After completion, provide:
1. Summary of changes made
2. Count of files archived
3. Count of files renamed
4. Count of merges performed
5. Final folder structure tree
</output>

<verification>
Before declaring complete:
- [ ] All folders use lowercase-kebab naming
- [ ] All files use kebab-case naming (except numbered prefixes)
- [ ] No duplicate documents exist in active folders
- [ ] docs/archive/ contains all outdated documents with clear subdirectories
- [ ] docs/README.md links all work correctly
- [ ] CLAUDE.md references are updated
- [ ] Run `find docs -name "*.md" | head -50` to verify naming conventions

Verify the new structure by running:
```bash
tree docs -L 2 --dirsfirst
```
</verification>

<success_criteria>
- Documentation is navigable in under 30 seconds to find any topic
- No file or folder names contain spaces
- All naming follows kebab-case convention
- Zero duplicate content in active folders
- Archive folder contains all historical documents with clear organization
- README.md serves as the single, accurate navigation hub
</success_criteria>
