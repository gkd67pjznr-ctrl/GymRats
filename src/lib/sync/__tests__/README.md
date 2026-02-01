# Sync Integration Tests

These tests verify the sync system's integration with a real Supabase backend.

## Prerequisites

1. **Test Supabase instance**: Create a separate Supabase project for testing, or use your development instance (not recommended).

2. **Environment variables**: Create a `.env.test` file in the project root with the following variables:

```bash
EXPO_PUBLIC_SUPABASE_URL_TEST=https://your-test-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY_TEST=your-test-anon-key
```

Alternatively, you can set these environment variables in your shell.

3. **Database schema**: The test Supabase instance must have the required tables set up (friendships, workouts, routines, etc.). Use the same schema as your development database.

## Running Tests

To run only integration tests:

```bash
npm test -- --testPathPattern="integration"
```

To run all tests (integration tests will be skipped if credentials are missing):

```bash
npm test
```

## Test Structure

- `integrationTestHelpers.ts`: Utilities for checking credentials and skipping tests
- `friendRepository.integration.test.ts`: Tests for friend repository CRUD operations
- `conflictResolution.integration.test.ts`: Tests for conflict resolution with real data
- `friendsStore.integration.test.ts`: Tests for friends store sync methods (pullFromServer, pushToServer)

## Test Isolation

Each test cleans up its own data after running. Test data uses unique user IDs prefixed with `test-` to avoid collisions with production data.

## Adding New Integration Tests

1. Use `describeWithSupabase` and `testWithSupabase` from the helpers to automatically skip tests when credentials are missing.

2. Mock the Supabase client with test credentials in the `beforeAll` hook:

```typescript
jest.doMock('../../../supabase/client', () => {
  const actual = jest.requireActual('../../../supabase/client');
  const { createClient } = require('@supabase/supabase-js');
  return {
    ...actual,
    supabase: createClient(testUrl, testAnonKey),
  };
});
```

3. Clean up test data in `afterEach` hooks.

4. Use realistic test data that matches your schema.