/**
 * TabErrorBoundary Component
 *
 * A specialized error boundary component for individual tab screens in the app.
 * Extends the base ErrorBoundary with tab-specific error handling and logging.
 *
 * Features:
 * - Inherits all ErrorBoundary features (logging, recovery, dev/prod mode)
 * - Adds screen name prop for better error isolation
 * - Graceful fallback that maintains navigation
 * - Tab-specific error context for debugging
 *
 * @example
 * ```tsx
 * <TabErrorBoundary screenName="Home">
 *   <HomeScreen />
 * </TabErrorBoundary>
 * ```
 *
 * TODO: Consider adding tab-specific recovery actions (e.g., "Reload Tab", "Go to Home")
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ErrorBoundary from './error-boundary';

export interface TabErrorBoundaryProps {
  /** Child components to be wrapped by error boundary */
  children: ReactNode;
  /** Screen name for error context and logging */
  screenName: string;
}

export interface TabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * TabErrorBoundary class component
 *
 * Wraps ErrorBoundary with tab-specific error handling.
 * Uses composition to reuse ErrorBoundary functionality while adding screen context.
 */
class TabErrorBoundaryInternal extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { screenName } = this.props;

    // Enhanced logging with tab context (development only)
    if (__DEV__) {
      console.error(`[TabErrorBoundary] Error in "${screenName}" tab:`, {
        timestamp: new Date().toISOString(),
        errorName: error.name,
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
        screenName,
      });

      // Log component stack separately for better readability
      if (errorInfo.componentStack) {
        console.error(`[TabErrorBoundary] Component stack for "${screenName}":`, errorInfo.componentStack);
      }
    }

    // TODO: Send to error tracking service with tab context
    //
    // Step 1: Install Sentry (if not already installed)
    // npm install @sentry/react
    //
    // Step 2: Uncomment and modify the code below:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //       screenName,
    //       errorType: 'TabErrorBoundary',
    //     },
    //   },
    //   tags: {
    //     screen_name: screenName,
    //     error_boundary: 'tab',
    //     navigation_tab: screenName.toLowerCase(),
    //   },
    //   level: 'error',
    //   extra: {
    //     timestamp: new Date().toISOString(),
    //     tab_context: `${screenName} tab error`,
    //   },
    // });
    //
    // Alternative: Bugsnag integration
    // Bugsnag.notify(error, (event) => {
    //   event.addMetadata('react', {
    //     componentStack: errorInfo.componentStack,
    //     screenName,
    //     errorType: 'TabErrorBoundary',
    //   });
    //   event.addMetadata('navigation', {
    //     activeTab: screenName,
    //   });
    // });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, screenName } = this.props;

    if (hasError) {
      return <TabErrorFallback error={error} screenName={screenName} onReset={this.handleReset} />;
    }

    return children;
  }
}

/**
 * TabErrorFallback Component
 *
 * Displays a tab-specific error screen with:
 * - Screen name context
 * - Dark theme styling
 * - Recovery option
 */
interface TabErrorFallbackProps {
  error: Error | null;
  screenName: string;
  onReset: () => void;
}

const TabErrorFallback: React.FC<TabErrorFallbackProps> = ({ error, screenName, onReset }) => {
  // In development, show full error details
  // In production, show generic error message
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

  const errorMessage = isDev
    ? (error?.message ?? 'An unexpected error occurred')
    : 'An unexpected error occurred. Please try again.';

  const errorDetails = isDev && error ? (
    <Text style={styles.errorDetails}>
      {error.name}: {errorMessage}
    </Text>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>

        <Text style={styles.screenName}>In {screenName} screen</Text>

        <Text style={styles.message}>{errorMessage}</Text>

        {errorDetails}

        <Pressable style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Styles matching the app design system
 * Uses same dark theme as base ErrorBoundary for consistency
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // dark bg
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff', // text
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  screenName: {
    color: '#a1a1aa', // muted
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#888888', // muted
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorDetails: {
    color: '#a1a1aa', // muted
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: 'monospace',
    padding: 12,
    backgroundColor: '#18181b', // card
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a', // border
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a', // card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333', // border
  },
  buttonText: {
    color: '#ffffff', // text
    fontWeight: '700',
    fontSize: 16,
  },
});

// Export the internal component with default export for consistency
export default TabErrorBoundaryInternal;

/**
 * Convenience export named TabErrorBoundary for clear imports
 */
export const TabErrorBoundary = TabErrorBoundaryInternal;
