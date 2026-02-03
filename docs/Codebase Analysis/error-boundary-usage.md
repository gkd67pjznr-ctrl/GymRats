# Error Boundary Usage Guide

This guide explains how to use the Error Boundary components in the GymRats app.

## Overview

GymRats uses two error boundary components:

1. **ErrorBoundary** (`src/ui/error-boundary.tsx`) - General-purpose error boundary
2. **TabErrorBoundary** (`src/ui/tab-error-boundary.tsx`) - Specialized for tab screens

## ErrorBoundary

The base ErrorBoundary component catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI.

### Basic Usage

```tsx
import ErrorBoundary from '@/src/ui/error-boundary';

function App() {
  return (
    <ErrorBoundary name="app-root">
      <YourComponents />
    </ErrorBoundary>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components to be wrapped |
| `name` | `string` | No | Name for logging and error tracking |
| `componentStack` | `string` | No | Component stack from parent error boundary |

### Features

- **Error catching**: Catches errors in child components via `getDerivedStateFromError`
- **Enhanced logging**: Logs with `[ErrorBoundary]` prefix and structured data
- **Component stack trace**: Separately logs component stack for debugging
- **Dev/Production mode**: Shows detailed errors in dev, generic message in production
- **Recovery**: "Try Again" button to reset error state and re-render

### Example with Named Boundary

```tsx
<ErrorBoundary name="workout-screen">
  <WorkoutScreen />
</ErrorBoundary>
```

This will include the name "workout-screen" in error logs and error tracking.

## TabErrorBoundary

TabErrorBoundary extends ErrorBoundary with tab-specific error handling and screen name context.

### Basic Usage

```tsx
import { TabErrorBoundary } from '@/src/ui/tab-error-boundary';

function FeedTab() {
  return (
    <TabErrorBoundary screenName="Feed">
      <FeedContent />
    </TabErrorBoundary>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components to be wrapped |
| `screenName` | `string` | Yes | Screen name for error context and logging |

### Features

- All ErrorBoundary features, plus:
- **Screen name context**: Displays "In {screenName} screen" in error UI
- **Tab-specific logging**: Logs with `[TabErrorBoundary]` prefix and screen name
- **Isolated errors**: Errors in one tab don't affect other tabs

### Example for Each Tab

```tsx
// Home tab
<TabErrorBoundary screenName="Home">
  <HomeContent />
</TabErrorBoundary>

// Feed tab
<TabErrorBoundary screenName="Feed">
  <FeedContent />
</TabErrorBoundary>

// Workout tab
<TabErrorBoundary screenName="Workout">
  <WorkoutContent />
</TabErrorBoundary>

// Body tab
<TabErrorBoundary screenName="Body">
  <BodyContent />
</TabErrorBoundary>

// Profile tab
<TabErrorBoundary screenName="Profile">
  <ProfileContent />
</TabErrorBoundary>
```

## Error Tracking Integration

### Sentry Integration (Recommended)

1. Install Sentry:

```bash
npm install @sentry/react
```

2. Initialize Sentry in your app entry point (`app/_layout.tsx`):

```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});
```

3. Uncomment the Sentry integration code in:
   - `src/ui/error-boundary.tsx` (line ~94-120)
   - `src/ui/tab-error-boundary.tsx` (line ~55-80)

### Bugsnag Integration

1. Install Bugsnag:

```bash
npm install @bugsnag/js @bugsnag/react
```

2. Initialize Bugsnag:

```tsx
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

Bugsnag.start({
  apiKey: 'YOUR_BUGSNAG_API_KEY',
  plugins: [new BugsnagPluginReact()],
});
```

3. Use the Bugsnag integration examples in the TODO comments.

## Testing

### Characterization Tests

Characterization tests capture existing behavior:

```tsx
// __tests__/ui/error-boundary.characterization.test.tsx
test('characterize: ErrorBoundary renders children when no error', () => {
  const { getByTestId } = render(
    <ErrorBoundary>
      <TestChild />
    </ErrorBoundary>
  );
  expect(getByTestId('test-child')).toBeTruthy();
});
```

### Unit Tests

Test error catching, recovery, and dev/prod modes:

```tsx
test('catches errors and shows error screen', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  expect(getByText('Something went wrong')).toBeTruthy();
});
```

## Design System Integration

Both error boundary components use the GymRats design system:

- **Background**: `#0a0a0a` (dark bg)
- **Card**: `#1a1a1a` (card)
- **Border**: `#333333` (border)
- **Text**: `#ffffff` (text)
- **Muted**: `#888888` (muted)

## Error Recovery

The "Try Again" button:

1. Clears the error state
2. Re-renders the component tree
3. Allows transient errors to recover

For persistent errors, users can retry multiple times.

## Troubleshooting

### Errors Not Being Caught

- Ensure ErrorBoundary wraps the component tree correctly
- Check for async errors (ErrorBoundary doesn't catch them)
- Verify ErrorBoundary is above the error in the component tree

### Production vs Development

- **Development**: Shows full error details (name, message, stack)
- **Production**: Shows generic message for security

Use `__DEV__` global to control mode behavior.

### Logging

Error logs include:

- Timestamp
- Error name and message
- Component stack trace
- Boundary/screen name
- Original error object

## Best Practices

1. **Wrap at strategic points**:
   - Root layout (already done)
   - Each tab screen (already done)
   - Major features or modules

2. **Use descriptive names**:
   - Helps with debugging
   - Improves error tracking

3. **Test error boundaries**:
   - Write tests for error catching
   - Test recovery mechanism
   - Verify dev/prod mode behavior

4. **Monitor in production**:
   - Integrate with error tracking service
   - Set up alerts for critical errors
   - Track error rates by boundary/screen

## Related Files

- `src/ui/error-boundary.tsx` - Base ErrorBoundary component
- `src/ui/tab-error-boundary.tsx` - Tab-specific ErrorBoundary
- `app/_layout.tsx` - Root layout with ErrorBoundary
- `app/(tabs)/*` - Tab screens with TabErrorBoundary
- `__tests__/ui/error-boundary.test.tsx` - ErrorBoundary tests
- `__tests__/ui/tab-error-boundary.test.tsx` - TabErrorBoundary tests
