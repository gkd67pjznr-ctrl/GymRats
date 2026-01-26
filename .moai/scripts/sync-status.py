#!/usr/bin/env python3
"""
Rebuild STATUS.md from git state and SPEC files.
Run this to get accurate SPEC status based on branches and merges.
"""

import subprocess
import re
from pathlib import Path
from datetime import datetime


def run_git_command(args):
    """Run git command and return output"""
    try:
        result = subprocess.run(
            ['git'] + args,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return ""


def get_merged_specs():
    """Get SPEC IDs that are merged to main"""
    output = run_git_command(['branch', '--merged', 'main'])
    merged = []
    for line in output.split('\n'):
        match = re.search(r'feature/(SPEC-[A-Z]+-\d+)', line)
        if match:
            merged.append(match.group(1))
    return set(merged)


def get_active_branches():
    """Get all SPEC branches (merged or not)"""
    output = run_git_command(['branch', '-a'])
    active = []
    for line in output.split('\n'):
        match = re.search(r'feature/(SPEC-[A-Z]+-\d+)', line)
        if match:
            active.append(match.group(1))
    return set(active)


def parse_spec_file(spec_path):
    """Extract title and description from SPEC file"""
    try:
        with open(spec_path, 'r') as f:
            content = f.read()

        # Extract title (first # heading)
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else "Untitled"

        # Extract first paragraph as description
        lines = content.split('\n')
        desc_lines = []
        found_content = False

        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                if found_content:
                    break
                continue
            found_content = True
            desc_lines.append(stripped)
            if len(' '.join(desc_lines)) > 100:
                break

        description = ' '.join(desc_lines)[:100] + '...' if desc_lines else "No description"

        return title, description
    except Exception as e:
        return "Error reading SPEC", str(e)


def get_spec_dates(spec_id):
    """Get creation date from git log"""
    try:
        # Find when SPEC file was first committed
        spec_pattern = f".moai/specs/{spec_id}.md"
        output = run_git_command(['log', '--format=%aI', '--', spec_pattern])

        if output:
            dates = output.split('\n')
            created = dates[-1][:10]  # First commit (oldest)
            return created
        return datetime.now().strftime('%Y-%m-%d')
    except:
        return datetime.now().strftime('%Y-%m-%d')


def rebuild_status():
    """Rebuild STATUS.md from current git state"""
    specs_dir = Path('.moai/specs')

    if not specs_dir.exists():
        print("Error: .moai/specs/ directory not found")
        return

    merged_specs = get_merged_specs()
    active_branches = get_active_branches()

    # Build status table
    status_lines = [
        '# SPEC Status Registry',
        '',
        f'**Last Updated**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
        '',
        '| SPEC ID | Status | Title | Description | Created | Completed |',
        '|---------|--------|-------|-------------|---------|-----------|'
    ]

    # Find all SPEC files
    spec_files = sorted(specs_dir.glob('SPEC-*.md'))

    for spec_file in spec_files:
        spec_id = spec_file.stem

        # Determine status
        if spec_id in merged_specs:
            status = 'completed'
            completed = '✅ Yes'
        elif spec_id in active_branches:
            status = 'in_progress'
            completed = '🔄 Working'
        else:
            status = 'not_started'
            completed = '📝 Planned'

        # Parse SPEC file
        title, description = parse_spec_file(spec_file)
        created = get_spec_dates(spec_id)

        # Truncate for table
        title_short = title[:40] + '...' if len(title) > 40 else title
        desc_short = description[:60] + '...' if len(description) > 60 else description

        status_lines.append(
            f'| {spec_id} | {status} | {title_short} | {desc_short} | {created} | {completed} |'
        )

    # Add legend
    status_lines.extend([
        '',
        '---',
        '',
        '## Status Definitions',
        '',
        '- **not_started**: SPEC created, not yet in development',
        '- **in_progress**: Currently being worked on in a worktree',
        '- **completed**: Implementation done, merged to main',
        '',
        '## Summary',
        '',
        f'- Total SPECs: {len(spec_files)}',
        f'- Completed: {len(merged_specs)}',
        f'- In Progress: {len(active_branches - merged_specs)}',
        f'- Not Started: {len(spec_files) - len(active_branches)}',
    ])

    # Write STATUS.md
    status_file = specs_dir / 'STATUS.md'
    with open(status_file, 'w') as f:
        f.write('\n'.join(status_lines))

    print(f"✅ STATUS.md updated: {status_file}")
    print(f"   Total SPECs: {len(spec_files)}")
    print(f"   Completed: {len(merged_specs)}")
    print(f"   In Progress: {len(active_branches - merged_specs)}")
    print(f"   Not Started: {len(spec_files) - len(active_branches)}")


if __name__ == '__main__':
    rebuild_status()
PYTHON_EOF
