import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client with disabled retries and caching
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// Mock notification context
const NotificationContext = React.createContext({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
  clear: vi.fn(),
  notifications: [],
})

// Mock CosmJS context
const CosmJSContext = React.createContext({
  isConnected: false,
  address: null,
  chainInfo: null,
  balance: null,
  isLoading: false,
  error: null,
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  getBalance: vi.fn(),
  executeContract: vi.fn(),
  queryContract: vi.fn(),
  signAndBroadcast: vi.fn(),
})

// Mock AdminAuth context
const AdminAuthContext = React.createContext({
  currentAdmin: null,
  isAuthenticated: false,
  isLoading: false,
  loginAsAdmin: vi.fn(),
  logout: vi.fn(),
  checkPermission: vi.fn(() => false),
  hasRole: vi.fn(() => false),
  sessionExpiry: null,
})

// Mock Onboarding context
const OnboardingContext = React.createContext({
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
})

interface AllTheProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  cosmjsProps?: any
  adminProps?: any
  notificationProps?: any
}

// Comprehensive providers wrapper
const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient(),
  cosmjsProps = {},
  adminProps = {},
  notificationProps = {}
}: AllTheProvidersProps) => {
  const cosmjsValue = {
    isConnected: false,
    address: null,
    chainInfo: null,
    balance: null,
    isLoading: false,
    error: null,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    getBalance: vi.fn(),
    executeContract: vi.fn(),
    queryContract: vi.fn(),
    signAndBroadcast: vi.fn(),
    ...cosmjsProps
  }

  const adminValue = {
    currentAdmin: null,
    isAuthenticated: false,
    isLoading: false,
    loginAsAdmin: vi.fn(),
    logout: vi.fn(),
    checkPermission: vi.fn(() => false),
    hasRole: vi.fn(() => false),
    sessionExpiry: null,
    ...adminProps
  }

  const notificationValue = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
    clear: vi.fn(),
    notifications: [],
    ...notificationProps
  }

  const onboardingValue = {
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
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CosmJSContext.Provider value={cosmjsValue}>
          <NotificationContext.Provider value={notificationValue}>
            <AdminAuthContext.Provider value={adminValue}>
              <OnboardingContext.Provider value={onboardingValue}>
                {children}
              </OnboardingContext.Provider>
            </AdminAuthContext.Provider>
          </NotificationContext.Provider>
        </CosmJSContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

// Custom render function with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient
    cosmjsProps?: any
    adminProps?: any
    notificationProps?: any
  },
) => {
  const { queryClient, cosmjsProps, adminProps, notificationProps, ...renderOptions } = options || {}
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders 
      queryClient={queryClient}
      cosmjsProps={cosmjsProps}
      adminProps={adminProps}
      notificationProps={notificationProps}
    >
      {children}
    </AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Render with connected wallet state
export const renderWithConnectedWallet = (ui: ReactElement, address = 'cosmos1test123') => {
  return customRender(ui, {
    cosmjsProps: {
      isConnected: true,
      address,
      balance: { amount: '1000000', denom: 'untrn' },
    }
  })
}

// Render with authenticated admin
export const renderWithAuthenticatedAdmin = (ui: ReactElement, role = 'creator') => {
  return customRender(ui, {
    adminProps: {
      isAuthenticated: true,
      currentAdmin: {
        id: 'admin123',
        address: 'cosmos1admin123',
        role,
        permissions: ['view_proposals', 'create_proposals'],
        sessionExpiry: Date.now() + 3600000, // 1 hour from now
      },
      checkPermission: vi.fn(() => true),
      hasRole: vi.fn(() => true),
    }
  })
}

// Render with both connected wallet and authenticated admin
export const renderWithFullAuth = (ui: ReactElement, walletAddress = 'cosmos1test123', adminRole = 'creator') => {
  return customRender(ui, {
    cosmjsProps: {
      isConnected: true,
      address: walletAddress,
      balance: { amount: '1000000', denom: 'untrn' },
    },
    adminProps: {
      isAuthenticated: true,
      currentAdmin: {
        id: 'admin123',
        address: walletAddress,
        role: adminRole,
        permissions: ['view_proposals', 'create_proposals'],
        sessionExpiry: Date.now() + 3600000,
      },
      checkPermission: vi.fn(() => true),
      hasRole: vi.fn(() => true),
    }
  })
}

// Mock data factories for consistent test data
export const createMockProposal = (overrides: Partial<any> = {}) => ({
  id: 'proposal-123',
  title: 'Test Solar Farm Investment',
  description: 'A test solar farm for clean energy investment',
  creator: 'cosmos1creator123',
  funding_goal: { amount: '1000000', denom: 'untrn' },
  current_funding: { amount: '500000', denom: 'untrn' },
  end_time: (Date.now() + 86400000).toString(), // 24 hours from now
  status: 'active',
  category: 'renewable_energy',
  risk_level: 'medium',
  expected_apy: 8.5,
  lockup_period: 365,
  minimum_investment: { amount: '1000', denom: 'untrn' },
  ...overrides,
})

export const createMockInvestment = (overrides: Partial<any> = {}) => ({
  id: 'investment-123',
  proposal_id: 'proposal-123',
  investor: 'cosmos1investor123',
  amount: { amount: '50000', denom: 'untrn' },
  timestamp: new Date().toISOString(),
  shares: 50,
  status: 'active',
  ...overrides,
})

export const createMockBalance = (amount = '1000000', denom = 'untrn') => ({
  amount,
  denom,
})

// Mock hook implementations that can be used in tests
export const mockUseNotifications = () => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  dismiss: vi.fn(),
  clear: vi.fn(),
  notifications: [],
})

export const mockUseCosmJS = () => ({
  isConnected: false,
  address: null,
  chainInfo: null,
  balance: null,
  isLoading: false,
  error: null,
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  getBalance: vi.fn(),
  executeContract: vi.fn(),
  queryContract: vi.fn(),
  signAndBroadcast: vi.fn(),
})

export const mockUseAdminAuth = () => ({
  currentAdmin: null,
  isAuthenticated: false,
  isLoading: false,
  loginAsAdmin: vi.fn(),
  logout: vi.fn(),
  checkPermission: vi.fn(() => false),
  hasRole: vi.fn(() => false),
  sessionExpiry: null,
})

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { customRender as render }