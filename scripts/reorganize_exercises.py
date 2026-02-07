#!/usr/bin/env python3
"""
Reorganize exercise master list by:
1. Primary muscle (first listed)
2. Equipment type (BB, DB, M, KB, BW, CB, BD, Other)
3. Alphabetical by exercise name
"""

import re
from collections import defaultdict

# Equipment order (as specified)
EQUIPMENT_ORDER = ['BB', 'DB', 'M', 'KB', 'BW', 'CB', 'BD', 'Other']
EQUIPMENT_NAMES = {
    'BB': 'Barbell',
    'DB': 'Dumbbell',
    'M': 'Machine',
    'KB': 'Kettlebell',
    'BW': 'Bodyweight',
    'CB': 'Cable',
    'BD': 'Band',
    'Other': 'Other'
}

def parse_exercises(filepath):
    """Parse all exercises from the markdown file."""
    exercises = []

    with open(filepath, 'r') as f:
        content = f.read()

    # Find all table rows that look like exercise entries
    # Pattern: | ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |
    pattern = r'\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|'

    for match in re.finditer(pattern, content):
        id_val = match.group(1).strip()
        name = match.group(2).strip()
        primary = match.group(3).strip()
        secondary = match.group(4).strip()
        bb = int(match.group(5))
        db = int(match.group(6))
        m = int(match.group(7))
        kb = int(match.group(8))
        bw = int(match.group(9))
        cb = int(match.group(10))
        bd = int(match.group(11))
        other = int(match.group(12))

        # Skip header rows
        if id_val == 'ID' or name == 'Name':
            continue

        # Get first primary muscle (before comma)
        first_primary = primary.split(',')[0].strip() if primary else 'uncategorized'
        if first_primary == '-' or not first_primary:
            first_primary = 'uncategorized'

        # Normalize muscle names
        first_primary = first_primary.lower()

        # Merge similar muscle groups
        muscle_normalizations = {
            'abs': 'abdominals',
            'quads': 'quadriceps',
            'rear delts': 'shoulders',
            'brachialis': 'biceps',
            'serratus anterior': 'chest',
        }
        first_primary = muscle_normalizations.get(first_primary, first_primary)

        # Determine equipment type
        equipment = []
        if bb: equipment.append('BB')
        if db: equipment.append('DB')
        if m: equipment.append('M')
        if kb: equipment.append('KB')
        if bw: equipment.append('BW')
        if cb: equipment.append('CB')
        if bd: equipment.append('BD')
        if other: equipment.append('Other')

        # If no equipment flagged, mark as Other
        if not equipment:
            equipment = ['Other']

        exercises.append({
            'id': id_val,
            'name': name,
            'primary': primary,
            'secondary': secondary,
            'first_primary': first_primary,
            'equipment': equipment,
            'bb': bb, 'db': db, 'm': m, 'kb': kb,
            'bw': bw, 'cb': cb, 'bd': bd, 'other': other
        })

    return exercises

def get_primary_equipment(exercise):
    """Get the primary (first) equipment type for an exercise."""
    for eq in EQUIPMENT_ORDER:
        if eq in exercise['equipment']:
            return eq
    return 'Other'

def organize_exercises(exercises):
    """Organize exercises by muscle -> equipment -> alphabetical name."""
    # Group by first primary muscle
    by_muscle = defaultdict(list)
    for ex in exercises:
        by_muscle[ex['first_primary']].append(ex)

    # For each muscle group, further group by equipment
    organized = {}
    for muscle, exs in by_muscle.items():
        by_equipment = defaultdict(list)
        for ex in exs:
            primary_eq = get_primary_equipment(ex)
            by_equipment[primary_eq].append(ex)

        # Sort each equipment group alphabetically by name
        for eq in by_equipment:
            by_equipment[eq].sort(key=lambda x: x['name'].lower())

        organized[muscle] = by_equipment

    return organized

def format_muscle_name(muscle):
    """Format muscle name for display."""
    # Capitalize properly
    special_cases = {
        'abs': 'Abs',
        'biceps': 'Biceps',
        'triceps': 'Triceps',
        'lats': 'Lats',
        'traps': 'Traps',
        'glutes': 'Glutes',
        'quads': 'Quads',
        'hamstrings': 'Hamstrings',
        'calves': 'Calves',
        'chest': 'Chest',
        'shoulders': 'Shoulders',
        'forearms': 'Forearms',
        'abdominals': 'Abdominals',
        'lower back': 'Lower Back',
        'middle back': 'Middle Back',
        'neck': 'Neck',
        'quadriceps': 'Quadriceps',
        'adductors': 'Adductors',
        'abductors': 'Abductors',
        'rear delts': 'Rear Delts',
        'brachialis': 'Brachialis',
        'serratus anterior': 'Serratus Anterior',
        'uncategorized': 'Uncategorized'
    }
    return special_cases.get(muscle.lower(), muscle.title())

def generate_markdown(organized):
    """Generate the reorganized markdown file."""
    lines = []

    # Header
    lines.append("# GymRats Exercise Master List")
    lines.append("")
    lines.append("> **Source of Truth** for the GymRats exercise database.")
    lines.append("> **Organization:** Grouped by Primary Muscle → Equipment Type → Alphabetical")
    lines.append(">")
    lines.append("> **Last Updated:** 2026-02-07")

    # Count total exercises
    total = sum(len(ex) for muscle_data in organized.values() for ex in muscle_data.values())
    lines.append(f"> **Total Exercises:** {total}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # How to use
    lines.append("## How to Use This File")
    lines.append("")
    lines.append("1. **Find exercises** by primary muscle group, then by equipment type")
    lines.append("2. **Edit exercise names** directly in the \"Name\" column to clean them up")
    lines.append("3. **Do NOT change IDs** - these link to the codebase")
    lines.append("4. **Equipment flags**: 1 = uses this equipment, 0 = does not")
    lines.append("")
    lines.append("### Equipment Legend")
    lines.append("| Code | Equipment |")
    lines.append("|------|-----------|")
    lines.append("| BB | Barbell (includes EZ bar, trap bar) |")
    lines.append("| DB | Dumbbell |")
    lines.append("| M | Machine (includes Smith machine, lever) |")
    lines.append("| KB | Kettlebell |")
    lines.append("| BW | Bodyweight |")
    lines.append("| CB | Cable |")
    lines.append("| BD | Band (resistance band) |")
    lines.append("| Other | Other equipment |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Table of Contents
    lines.append("## Table of Contents")
    lines.append("")

    # Sort muscles alphabetically, but put 'uncategorized' at the end
    sorted_muscles = sorted(organized.keys(), key=lambda x: (x == 'uncategorized', x.lower()))

    for muscle in sorted_muscles:
        muscle_count = sum(len(exs) for exs in organized[muscle].values())
        anchor = muscle.lower().replace(' ', '-').replace('/', '-')
        formatted_name = format_muscle_name(muscle)
        lines.append(f"- [{formatted_name}](#{anchor}) ({muscle_count})")

    lines.append("")
    lines.append(f"**Total: {total} exercises**")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Generate sections for each muscle
    for muscle in sorted_muscles:
        muscle_data = organized[muscle]
        muscle_count = sum(len(exs) for exs in muscle_data.values())
        formatted_name = format_muscle_name(muscle)

        lines.append(f"## {formatted_name}")
        lines.append("")
        lines.append(f"*{muscle_count} exercises*")
        lines.append("")

        # Process each equipment type in order
        for eq in EQUIPMENT_ORDER:
            if eq not in muscle_data or not muscle_data[eq]:
                continue

            exs = muscle_data[eq]
            eq_name = EQUIPMENT_NAMES[eq]

            lines.append(f"### {eq_name} ({len(exs)})")
            lines.append("")
            lines.append("| ID | Name | Primary | Secondary | BB | DB | M | KB | BW | CB | BD | Other |")
            lines.append("|----|------|---------|-----------|----|----|---|----|----|----|----|-------|")

            for ex in exs:
                lines.append(f"| {ex['id']} | {ex['name']} | {ex['primary']} | {ex['secondary']} | {ex['bb']} | {ex['db']} | {ex['m']} | {ex['kb']} | {ex['bw']} | {ex['cb']} | {ex['bd']} | {ex['other']} |")

            lines.append("")

        lines.append("---")
        lines.append("")

    # Summary by Muscle
    lines.append("## Summary by Muscle Group")
    lines.append("")
    lines.append("| Muscle | Equipment | Count |")
    lines.append("|--------|-----------|-------|")

    grand_total = 0
    for muscle in sorted_muscles:
        muscle_data = organized[muscle]
        formatted_name = format_muscle_name(muscle)
        for eq in EQUIPMENT_ORDER:
            if eq in muscle_data and muscle_data[eq]:
                count = len(muscle_data[eq])
                grand_total += count
                lines.append(f"| {formatted_name} | {EQUIPMENT_NAMES[eq]} | {count} |")

    lines.append(f"| **Total** | | **{grand_total}** |")
    lines.append("")

    return '\n'.join(lines)

def main():
    input_file = '/Users/tmac/Documents/Projects/GymRats/docs/data/exercise-master-list.md'
    output_file = '/Users/tmac/Documents/Projects/GymRats/docs/data/exercise-master-list-reorganized.md'

    print("Parsing exercises...")
    exercises = parse_exercises(input_file)
    print(f"Found {len(exercises)} exercises")

    print("Organizing by muscle -> equipment -> name...")
    organized = organize_exercises(exercises)

    print(f"Found {len(organized)} muscle groups:")
    for muscle in sorted(organized.keys()):
        count = sum(len(exs) for exs in organized[muscle].values())
        print(f"  - {format_muscle_name(muscle)}: {count} exercises")

    print("\nGenerating markdown...")
    markdown = generate_markdown(organized)

    with open(output_file, 'w') as f:
        f.write(markdown)

    print(f"\nDone! Output written to: {output_file}")

if __name__ == '__main__':
    main()
