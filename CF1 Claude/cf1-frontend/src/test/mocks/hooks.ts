// Comprehensive mock implementations for all CF1 hooks

// Mock useNotifications hook
export const createMockUseNotifications = (overrides: any = {}) => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
  clear: vi.fn(),
  notifications: [],
  ...overrides,
})

// Mock useAdminAuth hook  
export const createMockUseAdminAuth = (overrides: any = {}) => ({
  currentAdmin: null,
  isAuthenticated: false,
  isLoading: false,
  loginAsAdmin: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
  checkPermission: vi.fn(() => false),
  hasRole: vi.fn(() => false),
  sessionExpiry: null,
  ...overrides,
})

// Mock useOnboarding hook
export const createMockUseOnboarding = (overrides: any = {}) => ({
  isActive: false,
  currentStep: null,
  totalSteps: 0,
  isComplete: false,
  startTour: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  skipTour: vi.fn(),
  completeTour: vi.fn(),
  restartTour: vi.fn(),
  progress: 0,
  ...overrides,
})

// Mock useVerification hook
export const createMockUseVerification = (overrides: any = {}) => ({
  userLevel: 'anonymous',
  isVerifying: false,
  canPerformAction: vi.fn(() => false),
  requiresVerification: vi.fn(() => true),
  getRequiredLevel: vi.fn(() => 'basic'),
  submitVerification: vi.fn().mockResolvedValue(undefined),
  checkVerificationStatus: vi.fn().mockResolvedValue('pending'),
  ...overrides,
})

// Mock useTheme hook
export const createMockUseTheme = (overrides: any = {}) => ({
  theme: 'dark',
  toggleTheme: vi.fn(),
  setTheme: vi.fn(),
  isDark: true,
  isLight: false,
  ...overrides,
})

// Mock useKeyboardShortcuts hook
export const createMockUseKeyboardShortcuts = (overrides: any = {}) => ({
  isHelpOpen: false,
  toggleHelp: vi.fn(),
  shortcuts: [],
  registerShortcut: vi.fn(),
  unregisterShortcut: vi.fn(),
  ...overrides,
})

// Mock useAccessibility hook
export const createMockUseAccessibility = (overrides: any = {}) => ({
  announceToScreenReader: vi.fn(),
  focusElement: vi.fn(),
  trapFocus: vi.fn(),
  releaseFocus: vi.fn(),
  isReducedMotion: false,
  isHighContrast: false,
  ...overrides,
})

// Mock useFilter hook
export const createMockUseFilter = (overrides: any = {}) => ({
  filters: {},
  activeFilters: [],
  setFilter: vi.fn(),
  removeFilter: vi.fn(),
  clearFilters: vi.fn(),
  applyFilters: vi.fn(),
  filteredData: [],
  ...overrides,
})

// Mock useAnalytics hook
export const createMockUseAnalytics = (overrides: any = {}) => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackTiming: vi.fn(),
  setUserProperties: vi.fn(),
  analytics: null,
  ...overrides,
})

// Mock React Query hooks
export const createMockUseQuery = (data: any = null, overrides: any = {}) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: true,
  isFetching: false,
  refetch: vi.fn().mockResolvedValue({ data }),
  fetchStatus: 'idle',
  status: 'success',
  ...overrides,
})

export const createMockUseMutation = (overrides: any = {}) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: null,
  reset: vi.fn(),
  ...overrides,
})

// Mock zustand stores
export const createMockStore = (initialState: any = {}) => ({
  ...initialState,
  setState: vi.fn(),
  getState: vi.fn(() => initialState),
  subscribe: vi.fn(),
  destroy: vi.fn(),
})

// Default mock values that can be imported directly
export const mockUseNotifications = createMockUseNotifications()
export const mockUseAdminAuth = createMockUseAdminAuth()
export const mockUseOnboarding = createMockUseOnboarding()
export const mockUseVerification = createMockUseVerification()
export const mockUseTheme = createMockUseTheme()
export const mockUseKeyboardShortcuts = createMockUseKeyboardShortcuts()
export const mockUseAccessibility = createMockUseAccessibility()
export const mockUseFilter = createMockUseFilter()
export const mockUseAnalytics = createMockUseAnalytics()