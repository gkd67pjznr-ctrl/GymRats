#!/usr/bin/env node

/**
 * GymRats Feature Documentation Synchronization Script
 *
 * This script automates the Maestro duties by:
 * 1. Scanning all GymRats repositories for feature documentation
 * 2. Comparing files across repositories
 * 3. Accumulating positive feature progress (never going backwards)
 * 4. Updating the current repository with combined information
 * 5. Maintaining consistency and completeness
 */

import * as fs from 'fs';
import * as path from 'path';

// Repository paths
const REPOSITORIES = [
  '/Users/tmac/Documents/Projects/Forgerank',           // Main repository
  '/Users/tmac/Documents/Projects/Forgerank-devs',      // Devs repository
  '/Users/tmac/Documents/Projects/Forgerank-glm',       // GLM repository
  '/Users/tmac/Documents/Projects/Forgerank-qwen'       // Current repository (this one)
];

const CURRENT_REPO = '/Users/tmac/Documents/Projects/Forgerank';

// Key documentation files to synchronize
const DOCS_TO_SYNC = [
  'docs/FEATURE-MASTER.md',
  'docs/progress.md',
  'docs/PROJECT_STATUS.md',
  'docs/USER_TESTING_CHECKLIST.md',
  'docs/features/feature-forge-milestones.md',
  'docs/features/feature-forge-lab.md',
  'docs/features/feature-workouts.md',
  'docs/features/feature-cue-system.md'
];

interface FeatureProgress {
  totalFeatures: number;
  completedFeatures: number;
  featureStatus: Map<string, { status: string; progress: string }>;
}

interface RepositoryData {
  path: string;
  featureMaster: string;
  progress: string;
  projectStatus: string;
  userTesting: string;
  features: Map<string, string>;
}

async function readRepoFiles(repoPath: string): Promise<RepositoryData> {
  console.log(`Reading files from repository: ${repoPath}`);

  const featureMasterPath = path.join(repoPath, 'docs/FEATURE-MASTER.md');
  const progressPath = path.join(repoPath, 'docs/progress.md');
  const projectStatusPath = path.join(repoPath, 'docs/PROJECT_STATUS.md');
  const userTestingPath = path.join(repoPath, 'docs/USER_TESTING_CHECKLIST.md');

  const repoData: RepositoryData = {
    path: repoPath,
    featureMaster: fs.existsSync(featureMasterPath) ? fs.readFileSync(featureMasterPath, 'utf8') : '',
    progress: fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : '',
    projectStatus: fs.existsSync(projectStatusPath) ? fs.readFileSync(projectStatusPath, 'utf8') : '',
    userTesting: fs.existsSync(userTestingPath) ? fs.readFileSync(userTestingPath, 'utf8') : '',
    features: new Map()
  };

  // Read feature files
  const featuresDir = path.join(repoPath, 'docs/features');
  if (fs.existsSync(featuresDir)) {
    const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.md'));
    for (const file of featureFiles) {
      const filePath = path.join(featuresDir, file);
      repoData.features.set(file, fs.readFileSync(filePath, 'utf8'));
    }
  }

  return repoData;
}

function extractFeatureProgress(content: string): FeatureProgress {
  const progress: FeatureProgress = {
    totalFeatures: 0,
    completedFeatures: 0,
    featureStatus: new Map()
  };

  // Extract feature status from FEATURE-MASTER.md format
  const featureRegex = /\| \[([^\]]+)\]\([^)]+\) \| ([^|]+) \| ([^|]+) \|/g;
  let match;

  while ((match = featureRegex.exec(content)) !== null) {
    const featureName = match[1];
    const status = match[2].trim();
    const progressStr = match[3].trim();

    progress.featureStatus.set(featureName, { status, progress: progressStr });

    // Parse progress numbers (e.g., "8/20" or "Done")
    if (progressStr.includes('/')) {
      const [completed, total] = progressStr.split('/').map(Number);
      if (!isNaN(completed) && !isNaN(total)) {
        progress.completedFeatures += completed;
        progress.totalFeatures += total;
      }
    } else if (status === 'Done' || status === 'Implemented') {
      // For features marked as done without specific numbers
      progress.completedFeatures += 1;
      progress.totalFeatures += 1;
    }
  }

  return progress;
}

function mergeFeatureMasterFiles(repos: RepositoryData[]): string {
  console.log('Merging FEATURE-MASTER.md files...');

  // Start with current repo as base
  let mergedContent = repos.find(r => r.path === CURRENT_REPO)?.featureMaster || repos[0].featureMaster;

  // Extract current feature statuses
  const currentProgress = extractFeatureProgress(mergedContent);

  // For each repository, check if it has more advanced feature statuses
  for (const repo of repos) {
    const repoProgress = extractFeatureProgress(repo.featureMaster);

    // Update features that are more complete in this repo
    for (const [featureName, repoStatus] of repoProgress.featureStatus) {
      const currentStatus = currentProgress.featureStatus.get(featureName);

      // If this repo has a more advanced status, update it
      if (shouldUpdateFeatureStatus(currentStatus?.status || '', repoStatus.status)) {
        // Update the feature status in merged content
        const featurePattern = new RegExp(
          `(\\| \\[${featureName.replace(/[.*+?^${}()|[\\]\\$]/g, '\\$&')}\\]\\([^)]+\\) \\| )([^|]+)( \\| [^|]+ \\|)`,
          'g'
        );
        mergedContent = mergedContent.replace(featurePattern, `$1${repoStatus.status}$3`);

        // Update progress if available
        const progressPattern = new RegExp(
          `(\\| \\[${featureName.replace(/[.*+?^${}()|[\\]\\$]/g, '\\$&')}\\]\\([^)]+\\) \\| [^|]+ \\| )([^|]+)( \\|)`,
          'g'
        );
        if (repoStatus.progress) {
          mergedContent = mergedContent.replace(progressPattern, `$1${repoStatus.progress}$3`);
        }
      }
    }
  }

  return mergedContent;
}

function shouldUpdateFeatureStatus(currentStatus: string, newStatus: string): boolean {
  // Status priority: Planned < In Progress < Implemented < Done
  const statusPriority: Record<string, number> = {
    'Planned': 0,
    'In Progress': 1,
    'Implemented': 2,
    'Done': 3
  };

  return (statusPriority[newStatus] || 0) > (statusPriority[currentStatus] || 0);
}

function mergeFeatureFiles(featureName: string, repos: RepositoryData[]): string {
  console.log(`Merging feature file: ${featureName}`);

  // Start with current repo as base
  let mergedContent = '';
  const currentRepo = repos.find(r => r.path === CURRENT_REPO);

  if (currentRepo && currentRepo.features.has(featureName)) {
    mergedContent = currentRepo.features.get(featureName) || '';
  } else {
    // Use first repo that has this feature
    for (const repo of repos) {
      if (repo.features.has(featureName)) {
        mergedContent = repo.features.get(featureName) || '';
        break;
      }
    }
  }

  // For specific features, look for more complete implementations
  if (featureName === 'feature-forge-milestones.md') {
    // Find the most complete implementation
    for (const repo of repos) {
      if (repo.features.has(featureName)) {
        const content = repo.features.get(featureName) || '';
        if (content.includes('Done') && content.includes('[x]')) {
          // This repo has a complete implementation
          return content;
        }
      }
    }
  } else if (featureName === 'feature-cue-system.md') {
    // Find the most complete implementation for AI Gym Buddy
    for (const repo of repos) {
      if (repo.features.has(featureName)) {
        const content = repo.features.get(featureName) || '';
        if (content.includes('Implemented') && content.includes('[x]')) {
          // This repo has a complete implementation
          return content;
        }
      }
    }
  }

  return mergedContent;
}

function mergeProgressFiles(repos: RepositoryData[]): string {
  console.log('Merging progress.md files...');

  // Start with current repo as base
  const currentRepo = repos.find(r => r.path === CURRENT_REPO);
  let mergedContent = currentRepo?.progress || repos[0].progress;

  // Look for recent decision log entries in other repos
  for (const repo of repos) {
    if (repo.path === CURRENT_REPO) continue;

    // Extract decision log entries (### YYYY-MM-DD)
    const decisionLogRegex = /### (\d{4}-\d{2}-\d{2})\s*\([^)]*\)[\s\S]*?(?=\n### \d{4}-\d{2}-\d{2}|\n---|\n\*|$)/g;
    let match;

    while ((match = decisionLogRegex.exec(repo.progress)) !== null) {
      const date = match[1];
      const entry = match[0];

      // Only add if this date entry doesn't exist in current content
      if (!mergedContent.includes(`### ${date}`)) {
        // Add before the closing --- or at the end
        if (mergedContent.includes('---\n\n*This document')) {
          mergedContent = mergedContent.replace(
            '---\n\n*This document',
            `${entry}\n\n---\n\n*This document`
          );
        } else {
          mergedContent += `\n\n${entry}`;
        }
      }
    }
  }

  return mergedContent;
}

function mergeProjectStatusFiles(repos: RepositoryData[]): string {
  console.log('Merging PROJECT_STATUS.md files...');

  // Start with current repo as base (it should be most up to date)
  const currentRepo = repos.find(r => r.path === CURRENT_REPO);
  let mergedContent = currentRepo?.projectStatus || repos[0].projectStatus;

  // Update date to most recent
  const dateRegex = /Last Updated: \d{4}-\d{2}-\d{2}/;
  let mostRecentDate = '2026-01-27'; // Default

  for (const repo of repos) {
    const dateMatch = repo.projectStatus.match(/Last Updated: (\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const date = dateMatch[1];
      if (date > mostRecentDate) {
        mostRecentDate = date;
      }
    }
  }

  mergedContent = mergedContent.replace(dateRegex, `Last Updated: ${mostRecentDate}`);

  // Update phase description if needed
  for (const repo of repos) {
    const phaseMatch = repo.projectStatus.match(/Current Phase: ([^\n]+)/);
    if (phaseMatch) {
      const phase = phaseMatch[1];
      // Use the most advanced phase
      if (phase.includes('Phase 2') || phase.includes('Advanced')) {
        mergedContent = mergedContent.replace(
          /Current Phase: [^\n]+/,
          `Current Phase: ${phase}`
        );
        break;
      }
    }
  }

  return mergedContent;
}

function mergeTestingFiles(repos: RepositoryData[]): string {
  console.log('Merging USER_TESTING_CHECKLIST.md files...');

  // Start with current repo as base
  const currentRepo = repos.find(r => r.path === CURRENT_REPO);
  let mergedContent = currentRepo?.userTesting || repos[0].userTesting;

  // Look for new test cases in other repos
  for (const repo of repos) {
    if (repo.path === CURRENT_REPO) continue;

    // Extract test case sections (### TC-XX)
    const testCaseRegex = /### TC-[^\n]+[\s\S]*?(?=\n### TC-|\n---|\n\*\*End|\n$)/g;
    let match;

    while ((match = testCaseRegex.exec(repo.userTesting)) !== null) {
      const testCase = match[0];
      const testCaseId = testCase.match(/### (TC-[^\n]+)/)?.[1] || '';

      // Only add if this test case doesn't exist in current content
      if (testCaseId && !mergedContent.includes(`### ${testCaseId}`)) {
        // Add before the end marker or at the end
        if (mergedContent.includes('**End of Testing Checklist**')) {
          mergedContent = mergedContent.replace(
            '**End of Testing Checklist**',
            `${testCase}\n\n**End of Testing Checklist**`
          );
        } else {
          mergedContent += `\n\n${testCase}`;
        }
      }
    }
  }

  return mergedContent;
}

async function synchronizeRepositories() {
  console.log('Starting GymRats Feature Documentation Synchronization...\n');

  try {
    // 1. Read all repository files
    const repos: RepositoryData[] = [];
    for (const repoPath of REPOSITORIES) {
      if (fs.existsSync(repoPath)) {
        const repoData = await readRepoFiles(repoPath);
        repos.push(repoData);
      }
    }

    if (repos.length === 0) {
      console.error('No repositories found!');
      process.exit(1);
    }

    console.log(`\nFound ${repos.length} repositories\n`);

    // 2. Merge FEATURE-MASTER.md
    const mergedFeatureMaster = mergeFeatureMasterFiles(repos);
    const featureMasterPath = path.join(CURRENT_REPO, 'docs/FEATURE-MASTER.md');
    fs.writeFileSync(featureMasterPath, mergedFeatureMaster);
    console.log('✅ Updated FEATURE-MASTER.md\n');

    // 3. Merge progress.md
    const mergedProgress = mergeProgressFiles(repos);
    const progressPath = path.join(CURRENT_REPO, 'docs/progress.md');
    fs.writeFileSync(progressPath, mergedProgress);
    console.log('✅ Updated progress.md\n');

    // 4. Merge PROJECT_STATUS.md
    const mergedProjectStatus = mergeProjectStatusFiles(repos);
    const projectStatusPath = path.join(CURRENT_REPO, 'docs/PROJECT_STATUS.md');
    fs.writeFileSync(projectStatusPath, mergedProjectStatus);
    console.log('✅ Updated PROJECT_STATUS.md\n');

    // 5. Merge USER_TESTING_CHECKLIST.md
    const mergedUserTesting = mergeTestingFiles(repos);
    const userTestingPath = path.join(CURRENT_REPO, 'docs/USER_TESTING_CHECKLIST.md');
    fs.writeFileSync(userTestingPath, mergedUserTesting);
    console.log('✅ Updated USER_TESTING_CHECKLIST.md\n');

    // 6. Merge individual feature files
    const featuresDir = path.join(CURRENT_REPO, 'docs/features');
    if (!fs.existsSync(featuresDir)) {
      fs.mkdirSync(featuresDir, { recursive: true });
    }

    // Collect all feature files across repositories
    const allFeatureFiles = new Set<string>();
    for (const repo of repos) {
      for (const featureFile of repo.features.keys()) {
        allFeatureFiles.add(featureFile);
      }
    }

    for (const featureFile of allFeatureFiles) {
      const mergedFeature = mergeFeatureFiles(featureFile, repos);
      if (mergedFeature) {
        const outputPath = path.join(featuresDir, featureFile);
        fs.writeFileSync(outputPath, mergedFeature);
        console.log(`✅ Updated ${featureFile}`);
      }
    }

    console.log('\n🎉 Synchronization complete!');
    console.log('All documentation files have been updated with the latest feature information.');

    // Create synchronization summary
    const summaryContent = `# Feature Documentation Synchronization - Script Summary

## Overview
This document summarizes the automated updates made by the synchronization script to consolidate feature documentation across all GymRats repositories.

## Updates Made
- FEATURE-MASTER.md: Updated with latest feature statuses from all repositories
- progress.md: Added recent decision log entries from other repositories
- PROJECT_STATUS.md: Updated date and phase information
- USER_TESTING_CHECKLIST.md: Added new test cases from other repositories
- Individual feature files: Updated with most complete implementations

## Repositories Processed
${REPOSITORIES.map(repo => `- ${repo}`).join('\n')}

*Automatically generated by sync-feature-docs.ts*
`;

    const summaryPath = path.join(CURRENT_REPO, 'docs/feature-synchronization-summary.md');
    fs.writeFileSync(summaryPath, summaryContent);
    console.log('✅ Created synchronization summary\n');

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run the synchronization
if (import.meta.url === `file://${process.argv[1]}`) {
  synchronizeRepositories();
}

export { synchronizeRepositories };