// Global mock setup for all CF1 hooks and modules

import { mockUseCosmJS } from './cosmjs'
import { 
  mockUseNotifications,
  mockUseAdminAuth,
  mockUseOnboarding,
  mockUseVerification,
  mockUseTheme,
  mockUseKeyboardShortcuts,
  mockUseAccessibility,
  mockUseFilter,
  mockUseAnalytics,
  createMockUseQuery,
  createMockUseMutation
} from './hooks'

// Global mock implementations - these are used by vi.mock() calls
export const globalMocks = {
  // Hooks
  useCosmJS: () => mockUseCosmJS,
  useNotifications: () => mockUseNotifications,
  useAdminAuth: () => mockUseAdminAuth,
  useOnboarding: () => mockUseOnboarding,
  useVerification: () => mockUseVerification,
  useTheme: () => mockUseTheme,
  useKeyboardShortcuts: () => mockUseKeyboardShortcuts,
  useAccessibility: () => mockUseAccessibility,
  useFilter: () => mockUseFilter,
  useAnalytics: () => mockUseAnalytics,
  
  // React Query
  useQuery: (key: any, fn: any, options: any) => createMockUseQuery(null, options),
  useMutation: (fn: any, options: any) => createMockUseMutation(options),
  
  // React Router
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' }),
  useParams: () => ({}),
  
  // External libraries
  fetch: global.fetch,
  
  // Environment
  'import.meta': {
    env: {
      VITE_APP_MODE: 'test',
      VITE_NETWORK_ENV: 'testnet',
      VITE_CHAIN_ID: 'pion-1',
      VITE_RPC_URL: 'https://rpc-test.neutron.org',
      VITE_REST_URL: 'https://rest-test.neutron.org',
      VITE_LAUNCHPAD_CONTRACT_ADDRESS: 'neutron1test123',
      VITE_ENABLE_MOCK_DATA: 'true',
      VITE_API_URL: 'http://localhost:3001',
    }
  }
}

// Setup function to apply all mocks
export const setupGlobalMocks = () => {
  // Mock CF1 hooks
  vi.mock('../hooks/useCosmJS', () => ({
    useCosmJS: globalMocks.useCosmJS,
  }))
  
  vi.mock('../hooks/useNotifications', () => ({
    useNotifications: globalMocks.useNotifications,
  }))
  
  vi.mock('../hooks/useAdminAuth', () => ({
    useAdminAuthContext: globalMocks.useAdminAuth,
  }))
  
  vi.mock('../hooks/useOnboarding', () => ({
    useOnboarding: globalMocks.useOnboarding,
  }))
  
  vi.mock('../hooks/useVerification', () => ({
    useVerification: globalMocks.useVerification,
  }))
  
  vi.mock('../hooks/useTheme', () => ({
    useTheme: globalMocks.useTheme,
  }))
  
  vi.mock('../hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: globalMocks.useKeyboardShortcuts,
  }))
  
  vi.mock('../hooks/useAccessibility', () => ({
    useAccessibility: globalMocks.useAccessibility,
  }))
  
  vi.mock('../hooks/useFilter', () => ({
    useFilter: globalMocks.useFilter,
  }))
  
  vi.mock('../hooks/useAnalytics', () => ({
    useAnalytics: globalMocks.useAnalytics,
  }))
  
  // Mock React Query
  vi.mock('@tanstack/react-query', () => ({
    useQuery: globalMocks.useQuery,
    useMutation: globalMocks.useMutation,
    QueryClient: vi.fn().mockImplementation(() => ({
      setQueryData: vi.fn(),
      getQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
      removeQueries: vi.fn(),
      clear: vi.fn(),
    })),
    QueryClientProvider: ({ children }: any) => children,
  }))
  
  // Mock React Router
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
      ...actual,
      useNavigate: globalMocks.useNavigate,
      useLocation: globalMocks.useLocation,
      useParams: globalMocks.useParams,
      BrowserRouter: ({ children }: any) => children,
      Routes: ({ children }: any) => children,
      Route: ({ children }: any) => children,
    }
  })
}

export * from './cosmjs'
export * from './hooks'