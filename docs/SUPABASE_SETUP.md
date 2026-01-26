# Supabase Setup Guide

This guide covers the complete setup and configuration of Supabase for the Forgerank application.

## Overview

Forgerank uses Supabase as the backend database and authentication provider. The integration follows Expo's best practices for environment variable management in React Native applications.

## Architecture

### Client Location
The Supabase client is initialized in `/home/thomas/Forgerank/src/lib/supabase/client.ts`

### Environment Variable Access Pattern
This project uses Expo's `Constants.expoConfig.extra` pattern for accessing environment variables:

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
```

### Why This Pattern?

Expo requires environment variables to be declared in `app.json` under the `extra` section for security and accessibility reasons. This pattern:

- Prevents sensitive values from being bundled into the client JavaScript bundle
- Provides type-safe access to environment variables
- Works consistently across iOS, Android, and web platforms
- Integrates with EAS Build for production deployments

## Manual Supabase Project Creation

Follow these steps to create and configure your Supabase project:

### Step 1: Create Supabase Account

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Step 2: Create New Project

1. After logging in, click "New Project"
2. Choose your organization (or create one)
3. Configure project settings:
   - **Name**: `forgerank` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

4. Click "Create new project"
5. Wait for project provisioning (typically 2-3 minutes)

### Step 3: Get API Credentials

1. In your Supabase project dashboard, navigate to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: Found under "Project API keys" > "Project URL"
   - **anon/public key**: Found under "Project API keys" > "anon public"

### Step 4: Configure Environment Variables

Update `/home/thomas/Forgerank/.env` with your actual Supabase credentials:

```bash
# Replace with your actual Supabase project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Replace with your actual Supabase anonymous key
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 5: Update app.json

The `app.json` file has been updated to include environment variable references:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

### Step 6: Restart Development Server

After updating environment variables, restart your development server:

```bash
npm start
```

## Using the Supabase Client

### Import the Client

```typescript
import { supabase } from '@/src/lib/supabase/client';
```

### Example: Query Data

```typescript
async function getWorkouts() {
  const { data, error } = await supabase
    .from('workouts')
    .select('*');

  if (error) {
    console.error('Error fetching workouts:', error);
    return;
  }

  return data;
}
```

### Example: Insert Data

```typescript
async function createWorkout(workout: Workout) {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();

  if (error) {
    console.error('Error creating workout:', error);
    return;
  }

  return data;
}
```

### Example: Health Check

```typescript
import { healthCheck } from '@/src/lib/supabase/client';

async function checkSupabaseConnection() {
  const result = await healthCheck();

  if (result.status === 'connected') {
    console.log('✓ Supabase is ready');
  } else {
    console.error('✗ Supabase connection failed:', result.message);
  }
}
```

## Database Schema Setup

After creating your Supabase project, you'll need to set up your database schema. This can be done through:

1. **Supabase Dashboard**: Use the SQL Editor in your project dashboard
2. **Migrations**: Create migration files for version-controlled schema changes
3. **TypeScript types**: Generate TypeScript types from your schema

### Recommended Schema

Forgerank will need tables for:

- `profiles`: User profiles and settings
- `workouts`: Workout sessions
- `exercises`: Exercise library
- `routines`: Workout routines
- `social_posts`: Social feed posts
- `friends`: User friendships

See the [Database Schema Documentation](./DATABASE_SCHEMA.md) for detailed table definitions.

> **Note:** The DATABASE_SCHEMA.md documentation will be created in SPEC-005 as part of the database schema design and implementation phase. This will include complete table definitions, relationships, indexes, and TypeScript type generation.

## Security Considerations

### Row Level Security (RLS)

Supabase uses Row Level Security to restrict data access. Enable RLS on all tables:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Example RLS Policy

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

### API Key Security

- The `anon` key is safe to use in client-side code
- The `service_role` key should NEVER be used in client code
- Never commit actual API keys to version control
- Use environment variables for all sensitive values

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

The Supabase client tests are located in:
`/home/thomas/Forgerank/src/lib/supabase/__tests__/client.test.ts`

Tests cover:
- Environment variable loading and validation
- Client initialization behavior
- Error handling for missing credentials
- Health check functionality

## Troubleshooting

### Common Issues

**Issue**: "Missing Supabase URL" error
- **Solution**: Verify `EXPO_PUBLIC_SUPABASE_URL` is set in `.env` and restart dev server

**Issue**: "Invalid Supabase URL format" error
- **Solution**: Ensure URL starts with `https://` and is a valid Supabase project URL

**Issue**: Connection timeout
- **Solution**: Check network connectivity and verify Supabase project is active

**Issue**: RLS policy violations
- **Solution**: Review Row Level Security policies in Supabase dashboard

### Debug Mode

Enable debug logging for Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  global: {
    headers: { 'X-Client-Info': 'forgerank' },
  },
  auth: {
    debug: true, // Enable auth debug logging
  },
});
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Next Steps

1. Set up your Supabase project following the manual creation steps
2. Configure environment variables in `.env`
3. Test the connection using the health check function
4. Design your database schema
5. Implement authentication flows
6. Create data access layers for your features

---

Last Updated: 2026-01-24
Forgerank Version: 1.0.0
