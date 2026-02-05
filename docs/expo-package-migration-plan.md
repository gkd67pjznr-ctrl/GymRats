# Expo Package Migration Plan

## Overview
This document tracks necessary package updates and migrations for GymRats to maintain compatibility with Expo SDK updates and address deprecation warnings.

## Current Expo SDK: 54.0.33

## High Priority Migrations

### 1. `expo-av` → `expo-audio` + `expo-video`
**Status**: ✅ COMPLETED (Feb 2026)

**Migration Summary**:
- Replaced `expo-av` with `expo-audio` and `expo-video`
- Updated `SoundManager.ts` and `VoiceManager.ts` to use new API
- Updated Jest mocks in `jest.setup.js` and `SoundManager.test.ts`
- Removed `expo-av` from dependencies

**New API used**:
- `createAudioPlayer(source)` - Creates AudioPlayer instance
- `setAudioModeAsync({ playsInSilentMode, shouldPlayInBackground, shouldDuckAndroid })`
- `AudioPlayer.play()`, `.pause()`, `.seekTo()`, `.remove()`
- `AudioPlayer.volume` property (not async method)
- `AudioPlayer.addListener('playbackStatusUpdate', callback)`

### 2. `expo-notifications` Limitations
**Warning**: `expo-notifications functionality is not fully supported in Expo Go. Use a development build instead.`

**Status**: Expected limitation, not a code change
**Action**: Inform users to use development builds for full notification functionality
**Priority**: Low (documentation/UX note)

## Medium Priority Updates

### 3. `@react-native-async-storage/async-storage`
**Current**: `^2.2.0`
**Latest**: Check for updates compatible with Expo 54
**Action**: Run `npm outdated` and update if major version available
**Priority**: Medium

### 4. `@react-native-community/netinfo`
**Current**: `^11.4.1`
**Latest**: Check for updates compatible with Expo 54
**Action**: Run `npm outdated` and update if major version available
**Priority**: Medium

### 5. React Navigation Packages
- `@react-navigation/bottom-tabs`: `^7.4.0`
- `@react-navigation/elements`: `^2.6.3`
- `@react-navigation/native`: `^7.1.8`
- `@react-navigation/native-stack`: `^7.3.16`

**Action**: Check compatibility with React Native 0.81.5
**Priority**: Medium

## Low Priority / Monitoring

### 6. `react-native-reanimated`
**Current**: `~4.1.1`
**Latest**: v3+ compatible with New Architecture
**Note**: Works with Expo 54 and React Native 0.81.5
**Priority**: Low (monitor for v3 migration when ready)

### 7. `zustand`
**Current**: `^5.0.10`
**Latest**: Check for updates
**Priority**: Low

### 8. `@supabase/supabase-js`
**Current**: `^2.91.1`
**Latest**: Check for updates
**Priority**: Low

## Testing Requirements

### Before Migration
1. All tests pass: `npm test`
2. Expo builds successfully: `npm start`
3. Audio playback works in app

### After `expo-av` Migration
1. SoundManager tests pass
2. VoiceManager tests pass
3. Celebration sounds work in live workout
4. Buddy voice lines work (if premium tier)
5. No console warnings about deprecated `expo-av`

## Implementation Timeline

### Phase 1: Research (1-2 days)
- Investigate `expo-audio` API compatibility
- Test migration in a branch
- Update Jest mocks

### Phase 2: Implementation (2-3 days)
- Update package.json dependencies
- Migrate `SoundManager.ts`
- Migrate `VoiceManager.ts`
- Update test files
- Fix TypeScript errors

### Phase 3: Testing (1-2 days)
- Run full test suite
- Test audio playback manually
- Verify no regression in functionality

### Phase 4: Other Updates (1-2 days)
- Update other packages from `npm outdated`
- Run compatibility checks
- Update documentation

## Risk Assessment

### High Risk
- `expo-av` migration could break audio playback
- Different API in `expo-audio` may require significant code changes

### Mitigation
- Create feature branch for migration
- Test thoroughly before merging
- Keep old code commented during transition
- Have rollback plan

## Notes

### Expo Go Limitations
Some features (notifications) require development builds. This is expected and documented in Expo documentation.

### React Compiler
Currently enabled in `app.config.js`. Monitor for compatibility issues with package updates.

### New Architecture
React Native 0.81.5 with New Architecture enabled. Ensure packages are compatible.