// __tests__/lib/hooks/useRouteProtection.test.ts
import { renderHook } from '@testing-library/react-native';

// Mock expo-router
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSegments: string[] = [];
const mockPathname = '/';

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useSegments: () => mockSegments,
  usePathname: () => mockPathname,
}));

// Mock auth store
const mockAuthState = {
  user: null as { id: string; email: string } | null,
  loading: false,
  hydrated: true,
};

jest.mock('@/src/lib/stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

// Import after mocks
import {
  useRouteProtection,
  useRequiresAuth,
  useShowAuthenticatedUI,
} from '@/src/lib/hooks/useRouteProtection';

describe('useRouteProtection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.user = null;
    mockAuthState.loading = false;
    mockAuthState.hydrated = true;
    mockSegments.length = 0;
  });

  describe('public routes', () => {
    it('should identify auth routes as public', () => {
      mockSegments.push('auth', 'login');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(true);
      expect(result.current.isAuthRoute).toBe(true);
    });

    it('should identify onboarding as public', () => {
      mockSegments.push('onboarding');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(true);
    });

    it('should identify index as public', () => {
      mockSegments.push('index');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(true);
    });

    it('should identify empty segments as public', () => {
      // Empty segments array
      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(true);
    });
  });

  describe('protected routes', () => {
    it('should identify tabs routes as protected', () => {
      mockSegments.push('(tabs)', 'profile');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(false);
    });

    it('should identify settings as protected', () => {
      mockSegments.push('settings');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(false);
    });

    it('should identify friends as protected', () => {
      mockSegments.push('friends');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(false);
    });

    it('should identify dm routes as protected', () => {
      mockSegments.push('dm', '123');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isPublicRoute).toBe(false);
    });
  });

  describe('authentication state', () => {
    it('should report not authenticated when user is null', () => {
      mockAuthState.user = null;
      mockSegments.push('(tabs)');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should report authenticated when user exists', () => {
      mockAuthState.user = { id: '123', email: 'test@test.com' };
      mockSegments.push('(tabs)');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should report loading state', () => {
      mockAuthState.loading = true;

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isLoading).toBe(true);
    });

    it('should report hydrated state', () => {
      mockAuthState.hydrated = false;

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.isHydrated).toBe(false);
    });
  });

  describe('redirect logic', () => {
    it('should indicate redirect to login for unauthenticated users on protected routes', () => {
      mockAuthState.user = null;
      mockAuthState.hydrated = true;
      mockAuthState.loading = false;
      mockSegments.push('(tabs)', 'profile');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectToLogin).toBe(true);
      expect(result.current.shouldRedirectFromAuth).toBe(false);
    });

    it('should NOT indicate redirect for authenticated users on protected routes', () => {
      mockAuthState.user = { id: '123', email: 'test@test.com' };
      mockAuthState.hydrated = true;
      mockAuthState.loading = false;
      mockSegments.push('(tabs)', 'profile');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectToLogin).toBe(false);
    });

    it('should NOT indicate redirect for unauthenticated users on public routes', () => {
      mockAuthState.user = null;
      mockAuthState.hydrated = true;
      mockAuthState.loading = false;
      mockSegments.push('auth', 'login');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectToLogin).toBe(false);
    });

    it('should indicate redirect from auth for authenticated users on auth routes', () => {
      mockAuthState.user = { id: '123', email: 'test@test.com' };
      mockAuthState.hydrated = true;
      mockAuthState.loading = false;
      mockSegments.push('auth', 'login');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectFromAuth).toBe(true);
    });

    it('should NOT redirect while loading', () => {
      mockAuthState.user = null;
      mockAuthState.hydrated = true;
      mockAuthState.loading = true;
      mockSegments.push('(tabs)', 'profile');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectToLogin).toBe(false);
    });

    it('should NOT redirect while not hydrated', () => {
      mockAuthState.user = null;
      mockAuthState.hydrated = false;
      mockAuthState.loading = false;
      mockSegments.push('(tabs)', 'profile');

      const { result } = renderHook(() => useRouteProtection({ autoRedirect: false }));

      expect(result.current.shouldRedirectToLogin).toBe(false);
    });
  });
});

describe('useRequiresAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSegments.length = 0;
  });

  it('should return true for protected routes', () => {
    mockSegments.push('(tabs)', 'profile');

    const { result } = renderHook(() => useRequiresAuth());

    expect(result.current).toBe(true);
  });

  it('should return false for public routes', () => {
    mockSegments.push('auth', 'login');

    const { result } = renderHook(() => useRequiresAuth());

    expect(result.current).toBe(false);
  });
});

describe('useShowAuthenticatedUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.user = null;
    mockAuthState.hydrated = true;
    mockSegments.length = 0;
  });

  it('should return false when not hydrated', () => {
    mockAuthState.hydrated = false;
    mockAuthState.user = { id: '123', email: 'test@test.com' };
    mockSegments.push('(tabs)');

    const { result } = renderHook(() => useShowAuthenticatedUI());

    expect(result.current).toBe(false);
  });

  it('should return false when no user', () => {
    mockAuthState.user = null;
    mockSegments.push('(tabs)');

    const { result } = renderHook(() => useShowAuthenticatedUI());

    expect(result.current).toBe(false);
  });

  it('should return false on auth screens', () => {
    mockAuthState.user = { id: '123', email: 'test@test.com' };
    mockSegments.push('auth', 'login');

    const { result } = renderHook(() => useShowAuthenticatedUI());

    expect(result.current).toBe(false);
  });

  it('should return false on onboarding', () => {
    mockAuthState.user = { id: '123', email: 'test@test.com' };
    mockSegments.push('onboarding');

    const { result } = renderHook(() => useShowAuthenticatedUI());

    expect(result.current).toBe(false);
  });

  it('should return true for authenticated users on regular screens', () => {
    mockAuthState.user = { id: '123', email: 'test@test.com' };
    mockSegments.push('(tabs)', 'profile');

    const { result } = renderHook(() => useShowAuthenticatedUI());

    expect(result.current).toBe(true);
  });
});
