# CF1 Platform - React Query Implementation Guide

This document describes the React Query setup for efficient blockchain data caching and synchronization in the CF1 Platform.

## Overview

React Query (TanStack Query) provides:
- **Intelligent Caching**: Automatic background refetching and cache management
- **Optimistic Updates**: Instant UI updates with rollback on failure  
- **Real-time Sync**: Background data synchronization and stale data detection
- **Error Handling**: Built-in retry logic and error boundaries
- **Performance**: Reduced network requests and improved user experience

## Architecture

### Query Client Configuration

**Location**: `src/lib/queryClient.ts`

```typescript
// Optimized settings for blockchain data
{
  staleTime: 1000 * 60 * 5,        // 5 minutes fresh time
  gcTime: 1000 * 60 * 30,          // 30 minutes cache time
  refetchInterval: 1000 * 30,       // 30 seconds background refetch
  retryDelay: exponentialBackoff,   // Smart retry strategy
}
```

### Query Key Factory

Consistent cache keys using a factory pattern:

```typescript
export const queryKeys = {
  proposals: {
    all: ['proposals'],
    list: (filters) => [...queryKeys.proposals.all, 'list', { filters }],
    detail: (id) => [...queryKeys.proposals.all, 'detail', id],
  }
}
```

## Query Hooks

### Proposal Queries

**File**: `src/hooks/queries/useProposalQueries.ts`

#### `useProposalsQuery(filters)`
- **Purpose**: Fetch and cache proposal list with filtering
- **Cache**: 2 minutes stale time, placeholder data for smooth transitions
- **Features**: Real-time filtering, sorting, search

#### `useProposalQuery(proposalId)`
- **Purpose**: Fetch individual proposal details
- **Cache**: 5 minutes stale time
- **Features**: Automatic enabling/disabling based on ID

#### `useInvestMutation()`
- **Purpose**: Handle investment transactions
- **Features**: 
  - Optimistic updates for instant UI feedback
  - Automatic rollback on failure
  - Cache invalidation after success
  - Notification integration

### Portfolio Queries

**File**: `src/hooks/queries/usePortfolioQueries.ts`

#### `usePortfolioData(address)`
- **Purpose**: Combined portfolio, transactions, and performance data
- **Features**: Parallel data fetching, unified loading states

#### `usePortfolioRefresh()`
- **Purpose**: Manual data refresh utilities
- **Features**: Selective invalidation, batch refresh

### Blockchain Queries

**File**: `src/hooks/queries/useBlockchainQueries.ts`

#### `useBlockHeightQuery()`
- **Purpose**: Real-time block height monitoring
- **Cache**: 5 seconds stale time, 10 seconds refetch interval
- **Features**: Background updates, network status tracking

#### `useWalletData(address)`
- **Purpose**: Wallet balance and network status
- **Features**: Combined data, automatic refresh

## Integration Patterns

### 1. Basic Query Usage

```typescript
const LaunchpadPage = () => {
  const { data, isLoading, error, refetch } = useProposalsQuery(filters);
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} onRetry={refetch} />;
  
  return <ProposalList proposals={data.proposals} />;
};
```

### 2. Optimistic Mutations

```typescript
const InvestButton = ({ proposalId, amount }) => {
  const investMutation = useInvestMutation();
  
  const handleInvest = () => {
    investMutation.mutate({ proposalId, amount });
    // UI updates instantly, rolls back on error
  };
  
  return (
    <button 
      onClick={handleInvest}
      disabled={investMutation.isPending}
    >
      {investMutation.isPending ? 'Investing...' : 'Invest'}
    </button>
  );
};
```

### 3. Prefetching for Better UX

```typescript
const ProposalCard = ({ proposal }) => {
  const prefetch = usePrefetchProposal();
  
  return (
    <Link
      to={`/proposal/${proposal.id}`}
      onMouseEnter={() => prefetch(proposal.id)}
    >
      {/* Proposal details load instantly on click */}
    </Link>
  );
};
```

### 4. Real-time Updates

```typescript
const BlockchainStatus = () => {
  const { blockHeight, isOnline, lastUpdate } = useBlockchainStatus();
  
  return (
    <div>
      Block: {blockHeight}
      Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
      Updated: {formatTime(lastUpdate)}
    </div>
  );
};
```

## Cache Management

### Invalidation Strategies

```typescript
// After successful investment
invalidateQueries.afterTransaction(queryClient, userAddress, proposalId);

// Manual refresh
const { refreshPortfolio } = usePortfolioRefresh();
refreshPortfolio(userAddress);
```

### Optimistic Updates

```typescript
// Set optimistic data
cacheUtils.setOptimisticInvestment(queryClient, proposalId, amount, userAddress);

// Rollback on error
if (error) {
  queryClient.setQueryData(queryKey, previousData);
}
```

## Performance Optimizations

### 1. Query Key Factories
- Consistent cache keys prevent duplicates
- Hierarchical invalidation (invalidate all proposals vs specific proposal)

### 2. Selective Subscriptions
- Components only re-render when their specific data changes
- Use `select` option to transform and subset data

### 3. Background Refetching
- Fresh data without loading states
- Configurable intervals based on data importance

### 4. Stale While Revalidate
- Show cached data immediately
- Fetch fresh data in background
- Update UI seamlessly when new data arrives

## Error Handling

### Retry Configuration

```typescript
retry: (failureCount, error) => {
  // Don't retry client errors (4xx)
  if (error.message.includes('4')) return false;
  
  // Retry network errors up to 3 times
  return failureCount < 3;
}
```

### Error Boundaries

```typescript
const QueryErrorBoundary = ({ error, onRetry }) => (
  <div className="error-state">
    <h3>Something went wrong</h3>
    <p>{error.message}</p>
    <button onClick={onRetry}>Try Again</button>
  </div>
);
```

## Development Tools

### React Query Devtools

- **Enabled**: Development mode only
- **Location**: Bottom-right corner
- **Features**: Cache inspection, query timeline, network activity

### Cache Status Indicators

```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    Cache: {isStale ? 'Stale' : 'Fresh'} |
    Last Fetch: {dataUpdatedAt} |
    Background: {isFetching ? 'Updating' : 'Idle'}
  </div>
)}
```

## Best Practices

### 1. Query Key Consistency
- Use factory pattern for all query keys
- Include all variables that affect the query

### 2. Loading States
- Show skeleton screens for better UX
- Use `placeholderData` for smooth transitions

### 3. Error Handling
- Provide retry buttons
- Show meaningful error messages
- Implement fallback UI states

### 4. Cache Invalidation
- Invalidate related data after mutations
- Use optimistic updates for instant feedback

### 5. Performance
- Prefetch on hover for navigation
- Use background refetching for fresh data
- Implement proper stale times based on data volatility

## Migration Guide

To convert existing components to use React Query:

1. **Replace useState/useEffect** with query hooks
2. **Remove manual loading states** - React Query handles them
3. **Add error handling** using query error states
4. **Implement optimistic updates** for mutations
5. **Add prefetching** for better navigation UX

## Monitoring

Track these metrics in production:
- Cache hit ratio
- Background fetch frequency
- Error rates by query type
- Average response times
- Query success/failure rates

---

**Last Updated**: January 2025  
**React Query Version**: 5.80.6