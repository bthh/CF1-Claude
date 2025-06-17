import '@testing-library/jest-dom'

// Global test setup

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for component visibility tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage for persistence tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock crypto for UUID generation in tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
    getRandomValues: vi.fn(arr => arr.map(() => Math.floor(Math.random() * 256)))
  }
});

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Console error suppression for expected errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An invalid form control')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock environment variables for consistent testing
vi.mock('import.meta', () => ({
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
}));

// Global test timeout
vi.setConfig({ testTimeout: 10000 });