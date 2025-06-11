# CF1 Frontend Testing Setup

## Overview
This document describes the testing infrastructure setup for the CF1 frontend application using Vitest, React Testing Library, and comprehensive mocking strategies.

## Testing Stack
- **Test Runner**: Vitest (optimized for Vite projects)
- **Testing Library**: React Testing Library for component testing
- **Mocking**: Vitest mocking capabilities
- **Coverage**: V8 coverage provider
- **Environment**: jsdom for DOM simulation

## Setup Files

### Core Configuration
- `vitest.config.ts` - Main Vitest configuration with coverage settings
- `src/test/setup.ts` - Global test setup and imports
- `src/test/vitest-globals.d.ts` - TypeScript declarations for Vitest globals

### Testing Utilities
- `src/test/test-utils.tsx` - Custom render function with providers
- `src/test/mocks/cosmjs.ts` - Mock implementations for blockchain integration

## Test Coverage

### Components Tested ✅
1. **WalletConnection** (13 tests)
   - Connection states (connected/disconnected/connecting)
   - Error handling and display
   - User interactions (connect/disconnect)
   - Address truncation
   - Balance display

2. **PriceChart** (15 tests)
   - Chart rendering with/without data
   - Timeframe selection
   - Price trend indicators
   - Statistics display
   - Accessibility features

### Hooks Tested ✅
1. **useCosmJS** (11 tests)
   - Initial state management
   - Wallet connection flow
   - Error handling
   - Contract interactions
   - Utility functions

## Test Scripts

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Mock Strategy

### Blockchain Integration Mocks
- `createMockUseCosmJS()` - Flexible mock for useCosmJS hook
- Mock data for proposals, portfolio, and platform stats
- Configurable return values for different test scenarios

### Example Usage
```typescript
const mockHook = createMockUseCosmJS({
  isConnected: true,
  balance: '1000000000',
  invest: vi.fn().mockResolvedValue({ transactionHash: 'mock_hash' }),
})
vi.mocked(useCosmJS).mockReturnValue(mockHook)
```

## Current Test Results
- **Total Tests**: 65
- **Passing**: 54 (83%)
- **Failing**: 11 (17%)
- **Coverage**: Components, hooks, and utilities

## Test File Structure
```
src/
├── components/
│   └── __tests__/
│       ├── WalletConnection.test.tsx
│       ├── PriceChart.test.tsx
│       └── InvestmentModal.test.tsx (partial)
├── hooks/
│   └── __tests__/
│       └── useCosmJS.test.tsx
└── test/
    ├── setup.ts
    ├── test-utils.tsx
    ├── vitest-globals.d.ts
    └── mocks/
        └── cosmjs.ts
```

## Testing Best Practices

### Component Testing
1. **Render with Providers**: Use custom render function for consistent provider setup
2. **Mock External Dependencies**: Mock blockchain interactions and complex services
3. **Test User Interactions**: Focus on user-facing behavior, not implementation details
4. **Accessibility**: Include accessibility testing where relevant

### Hook Testing
1. **Use renderHook**: Test custom hooks in isolation
2. **Test State Changes**: Verify state updates and side effects
3. **Mock Dependencies**: Mock external services and APIs
4. **Async Operations**: Properly handle async operations with act()

### Mock Guidelines
1. **Flexible Mocks**: Create configurable mocks for different scenarios
2. **Realistic Data**: Use realistic mock data that matches production types
3. **Error Scenarios**: Test both success and error cases
4. **State Management**: Mock state appropriately for different test scenarios

## Coverage Targets
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Next Steps

### High Priority
1. **Complete InvestmentModal Tests**: Fix remaining test failures
2. **Add Layout Component Tests**: Test Header, Sidebar, and navigation components
3. **Add Page Component Tests**: Test main page components (Dashboard, Portfolio, etc.)

### Medium Priority
1. **Integration Tests**: Add end-to-end testing with real user flows
2. **Performance Tests**: Add performance testing for heavy components
3. **Visual Regression**: Consider adding visual regression testing

### Future Enhancements
1. **MSW Integration**: Consider Mock Service Worker for API mocking
2. **Playwright/Cypress**: Add true end-to-end testing
3. **Storybook Testing**: Integrate with Storybook for component testing

## Debugging Tests

### Common Issues
1. **Mock not working**: Ensure mock is called before component render
2. **Async operations**: Use waitFor() for async state changes
3. **Text not found**: Check exact text content, consider using regex or functions
4. **Provider issues**: Ensure all required providers are in test-utils.tsx

### Debug Commands
```bash
# Run specific test file
npm test -- WalletConnection.test.tsx

# Run tests in debug mode
npm test -- --inspect-brk

# Run tests with more verbose output
npm test -- --reporter=verbose
```

## Continuous Integration
The testing setup is ready for CI/CD integration with:
- Automated test runs on pull requests
- Coverage reporting and thresholds
- Fail-fast behavior on test failures
- Multiple browser environment testing (if needed)