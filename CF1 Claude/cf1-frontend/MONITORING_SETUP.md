# CF1 Platform - Monitoring & Analytics Setup

This document describes the comprehensive monitoring and analytics system implemented for the CF1 Platform.

## Overview

The monitoring system provides:
- **Error Tracking** with Sentry integration
- **Performance Monitoring** with Web Vitals
- **User Analytics** for engagement tracking
- **Business Metrics** for key platform actions
- **Session Tracking** for user behavior analysis

## Architecture

### Core Components

1. **Monitoring Library** (`src/lib/monitoring.ts`)
   - Sentry error tracking initialization
   - Custom analytics event tracking
   - Performance measurement utilities
   - User context management

2. **React Hooks** (`src/hooks/useMonitoring.ts`)
   - `usePageTracking()` - Automatic page view tracking
   - `useUserTracking()` - User context management
   - `useBusinessTracking()` - Business event tracking
   - `usePerformanceTracking()` - Performance measurement
   - `useErrorTracking()` - Error reporting

3. **Error Boundary** (`src/components/ErrorBoundary.tsx`)
   - React error boundary with Sentry integration
   - User-friendly error fallback UI
   - Error reporting and feedback collection

## Event Categories

### Business Events
- **Investment Tracking**
  - `investment_started` - User begins investment process
  - `investment_completed` - Successful investment transaction
  - `investment_failed` - Failed investment with error details

- **Proposal Tracking**
  - `proposal_viewed` - User views proposal details
  - `proposal_created` - New proposal created

- **Wallet Events**
  - `wallet_connected` - Wallet connection (demo or real)
  - `wallet_disconnected` - Wallet disconnection

### Navigation Events
- **Page Views** - Automatic tracking of all page visits
- **Feature Usage** - Track usage of specific features

### Performance Events
- **Web Vitals** - CLS, FCP, FID, LCP, TTFB metrics
- **Operation Timing** - Custom performance measurements
- **Component Lifecycle** - Component mount/unmount tracking

### Error Events
- **JavaScript Errors** - Unhandled exceptions and errors
- **Transaction Errors** - Blockchain transaction failures
- **Component Errors** - React component errors

## Setup Instructions

### 1. Environment Configuration

Add to your `.env` file:

```bash
# Sentry Configuration (Production)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics Configuration
VITE_ANALYTICS_KEY=your-analytics-key

# Monitoring Flags
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_USER_ANALYTICS=true
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=1.0.0
```

### 2. Sentry Project Setup

1. **Create Sentry Project**
   ```bash
   # Install Sentry CLI
   npm install -g @sentry/cli
   
   # Login to Sentry
   sentry-cli login
   
   # Create new project
   sentry-cli projects create cf1-platform
   ```

2. **Configure Release Tracking**
   ```bash
   # Create release
   sentry-cli releases new $VERSION
   
   # Upload source maps
   sentry-cli releases files $VERSION upload-sourcemaps ./dist
   
   # Finalize release
   sentry-cli releases finalize $VERSION
   ```

### 3. Integration Examples

#### Basic Error Tracking
```typescript
import { reportError } from './lib/monitoring';

try {
  // Risky operation
  await riskyFunction();
} catch (error) {
  reportError(error, { context: 'additional_info' });
}
```

#### Business Event Tracking
```typescript
import { useBusinessTracking } from './hooks/useMonitoring';

const MyComponent = () => {
  const { trackInvestment, trackFeature } = useBusinessTracking();
  
  const handleInvest = async (proposalId, amount) => {
    trackInvestment.started(proposalId, amount);
    
    try {
      const result = await invest(proposalId, amount);
      trackInvestment.completed(proposalId, amount, result.txHash);
    } catch (error) {
      trackInvestment.failed(proposalId, amount, error.message);
    }
  };
  
  return (
    <button onClick={() => trackFeature('button_clicked', { buttonName: 'invest' })}>
      Invest
    </button>
  );
};
```

#### Performance Monitoring
```typescript
import { usePerformanceTracking } from './hooks/useMonitoring';

const MyComponent = () => {
  const { measureAsync } = usePerformanceTracking();
  
  const loadData = async () => {
    return measureAsync('data_loading', async () => {
      return await fetchExpensiveData();
    });
  };
};
```

#### Page Tracking
```typescript
import { usePageTracking } from './hooks/useMonitoring';

const App = () => {
  usePageTracking(); // Automatically tracks page views
  
  return <Router>...</Router>;
};
```

## Production Dashboard

### Sentry Dashboard

Monitor in production:
- **Error Rate** - Track error frequency and trends
- **Performance** - Monitor Web Vitals and custom metrics
- **Releases** - Track error rates by deployment
- **User Impact** - See which users are affected by issues

### Key Metrics to Monitor

1. **Business Metrics**
   - Investment conversion rate
   - Proposal view-to-investment ratio
   - Wallet connection success rate
   - Feature adoption rates

2. **Technical Metrics**
   - Page load times
   - Error rates by component
   - API response times
   - Bundle size impact

3. **User Experience**
   - Session duration
   - Page bounce rates
   - User flow completion
   - Feature usage patterns

## Development Workflow

### Local Development
- All events logged to console
- Error boundary shows detailed error info
- Performance metrics visible in DevTools
- No external service calls (unless DSN provided)

### Testing
- Mock monitoring functions in tests
- Verify error boundary behavior
- Test analytics event firing
- Performance measurement validation

### Production Deployment
- Sentry DSN configured
- Source maps uploaded
- Release tracking enabled
- Performance monitoring active

## Best Practices

### 1. Error Handling
```typescript
// Good: Contextual error reporting
reportError(error, {
  userId: user.id,
  action: 'investment_creation',
  proposalId: proposal.id
});

// Bad: Generic error reporting
reportError(error);
```

### 2. Performance Monitoring
```typescript
// Good: Meaningful operation names
measureAsync('proposal_data_fetch', fetchProposal);

// Bad: Generic operation names
measureAsync('fetch', fetchData);
```

### 3. Business Event Tracking
```typescript
// Good: Specific, actionable events
trackFeature('investment_modal_opened', { proposalId, amount });

// Bad: Generic events
trackFeature('modal_opened');
```

### 4. Privacy Considerations
- Never track PII (personally identifiable information)
- Hash or anonymize sensitive data
- Respect user privacy preferences
- Comply with GDPR/CCPA requirements

## Troubleshooting

### Common Issues

1. **Sentry Not Initializing**
   - Check DSN format
   - Verify environment variables
   - Ensure network connectivity

2. **Events Not Tracking**
   - Check console for errors
   - Verify hook usage
   - Test in development mode

3. **Performance Impact**
   - Monitor bundle size
   - Use sampling in production
   - Lazy load monitoring code

### Debug Mode

Enable verbose logging:
```bash
VITE_ENABLE_DEBUG_MODE=true
```

This will:
- Log all events to console
- Show detailed error information
- Display performance measurements
- Enable Sentry debug mode

## Integration Points

### Existing Systems
- **CosmJS Integration** - Wallet and transaction tracking
- **React Query** - API performance monitoring
- **Zustand Stores** - State change tracking
- **Error Boundaries** - Component error tracking

### External Services
- **Sentry** - Error tracking and performance
- **Google Analytics** - User behavior (optional)
- **Mixpanel** - Event analytics (optional)
- **DataDog** - Infrastructure monitoring (optional)

## Security Considerations

1. **Data Privacy**
   - No PII in error reports
   - Sanitize sensitive data
   - Use sampling for performance

2. **API Keys**
   - Secure Sentry DSN
   - Rotate keys regularly
   - Use environment variables

3. **Rate Limiting**
   - Limit error reporting frequency
   - Implement client-side throttling
   - Monitor quota usage

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Dependencies**: @sentry/react, web-vitals