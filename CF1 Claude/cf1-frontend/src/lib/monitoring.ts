// CF1 Platform - Error Tracking & Analytics
// Comprehensive monitoring system for production

import * as Sentry from '@sentry/react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Types for analytics events
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface UserContext {
  userId?: string;
  walletAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// Initialize Sentry error tracking
export const initializeMonitoring = () => {
  const environment = import.meta.env.VITE_APP_MODE || 'development';
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize in production or if DSN is provided
  if (dsn && (environment === 'production' || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true')) {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      
      // Session replay
      replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (environment === 'development') {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = error.message as string;
            // Skip React hydration errors in development
            if (message.includes('Hydration') || message.includes('hydration')) {
              return null;
            }
          }
        }
        return event;
      },
      
      // Additional configuration
      attachStacktrace: true,
      sendDefaultPii: false, // Don't send personally identifiable information
    });

    console.log('CF1 Monitoring initialized:', { environment, version: import.meta.env.VITE_APP_VERSION });
  }
};

// Set user context for error tracking
export const setUserContext = (context: UserContext) => {
  Sentry.setUser({
    id: context.userId,
    username: context.walletAddress,
    ip_address: '{{auto}}',
  });

  Sentry.setTags({
    walletAddress: context.walletAddress,
    sessionId: context.sessionId,
  });

  // Track user authentication
  if (context.walletAddress) {
    trackEvent({
      action: 'user_authenticated',
      category: 'auth',
      label: 'wallet_connected',
      metadata: {
        walletAddress: context.walletAddress,
        timestamp: new Date().toISOString(),
      }
    });
  }
};

// Track custom analytics events
export const trackEvent = (event: AnalyticsEvent) => {
  // Sentry custom event
  Sentry.addBreadcrumb({
    message: `${event.category}.${event.action}`,
    category: event.category,
    level: 'info',
    data: {
      label: event.label,
      value: event.value,
      ...event.metadata,
    },
  });

  // Console logging in development
  if (import.meta.env.VITE_APP_MODE === 'development') {
    console.log('📊 Analytics Event:', event);
  }

  // Could integrate with Google Analytics, Mixpanel, etc. here
  if (import.meta.env.VITE_ANALYTICS_KEY) {
    // Example: gtag('event', event.action, { ... })
  }
};

// Track business-specific events
export const trackBusinessEvent = {
  // Investment events
  investmentStarted: (proposalId: string, amount: string) => {
    trackEvent({
      action: 'investment_started',
      category: 'business',
      label: proposalId,
      value: parseFloat(amount),
      metadata: { proposalId, amount }
    });
  },

  investmentCompleted: (proposalId: string, amount: string, txHash: string) => {
    trackEvent({
      action: 'investment_completed',
      category: 'business',
      label: proposalId,
      value: parseFloat(amount),
      metadata: { proposalId, amount, txHash }
    });
  },

  investmentFailed: (proposalId: string, amount: string, error: string) => {
    trackEvent({
      action: 'investment_failed',
      category: 'business',
      label: proposalId,
      value: parseFloat(amount),
      metadata: { proposalId, amount, error }
    });
  },

  // Proposal events
  proposalViewed: (proposalId: string) => {
    trackEvent({
      action: 'proposal_viewed',
      category: 'engagement',
      label: proposalId,
      metadata: { proposalId }
    });
  },

  proposalCreated: (proposalId: string, creator: string) => {
    trackEvent({
      action: 'proposal_created',
      category: 'business',
      label: proposalId,
      metadata: { proposalId, creator }
    });
  },

  // Navigation events
  pageViewed: (pageName: string, path: string) => {
    trackEvent({
      action: 'page_viewed',
      category: 'navigation',
      label: pageName,
      metadata: { path, timestamp: new Date().toISOString() }
    });
  },

  // Wallet events
  walletConnected: (address: string, walletType: string) => {
    trackEvent({
      action: 'wallet_connected',
      category: 'auth',
      label: walletType,
      metadata: { address, walletType }
    });
  },

  walletDisconnected: (address: string) => {
    trackEvent({
      action: 'wallet_disconnected',
      category: 'auth',
      metadata: { address }
    });
  },

  // Error events
  transactionError: (type: string, error: string, context?: any) => {
    trackEvent({
      action: 'transaction_error',
      category: 'error',
      label: type,
      metadata: { error, context }
    });
  },

  // Feature usage
  featureUsed: (featureName: string, context?: any) => {
    trackEvent({
      action: 'feature_used',
      category: 'engagement',
      label: featureName,
      metadata: context
    });
  },
};

// Performance monitoring
export const initializePerformanceMonitoring = () => {
  // Web Vitals tracking
  onCLS((metric) => {
    Sentry.setMeasurement('CLS', metric.value, 'ratio');
    trackEvent({
      action: 'web_vital_cls',
      category: 'performance',
      value: metric.value,
      metadata: { metric: metric.name, rating: metric.rating }
    });
  });

  onFCP((metric) => {
    Sentry.setMeasurement('FCP', metric.value, 'millisecond');
    trackEvent({
      action: 'web_vital_fcp',
      category: 'performance',
      value: metric.value,
      metadata: { metric: metric.name, rating: metric.rating }
    });
  });

  onINP((metric) => {
    Sentry.setMeasurement('INP', metric.value, 'millisecond');
    trackEvent({
      action: 'web_vital_inp',
      category: 'performance',
      value: metric.value,
      metadata: { metric: metric.name, rating: metric.rating }
    });
  });

  onLCP((metric) => {
    Sentry.setMeasurement('LCP', metric.value, 'millisecond');
    trackEvent({
      action: 'web_vital_lcp',
      category: 'performance',
      value: metric.value,
      metadata: { metric: metric.name, rating: metric.rating }
    });
  });

  onTTFB((metric) => {
    Sentry.setMeasurement('TTFB', metric.value, 'millisecond');
    trackEvent({
      action: 'web_vital_ttfb',
      category: 'performance',
      value: metric.value,
      metadata: { metric: metric.name, rating: metric.rating }
    });
  });
};

// Error reporting utilities
export const reportError = (error: Error, context?: any) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });

  trackEvent({
    action: 'error_reported',
    category: 'error',
    label: error.name,
    metadata: {
      message: error.message,
      stack: error.stack,
      context
    }
  });
};

// Custom performance timing
export const measurePerformance = <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  return fn()
    .then((result) => {
      const duration = performance.now() - startTime;
      
      Sentry.setMeasurement(`${operation}_duration`, duration, 'millisecond');
      
      trackEvent({
        action: 'operation_completed',
        category: 'performance',
        label: operation,
        value: duration,
        metadata: { operation, success: true }
      });
      
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      
      trackEvent({
        action: 'operation_failed',
        category: 'performance',
        label: operation,
        value: duration,
        metadata: { operation, error: error.message }
      });
      
      throw error;
    });
};

// Session tracking
export const startSession = () => {
  const sessionId = `cf1_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  Sentry.setTag('sessionId', sessionId);
  
  trackEvent({
    action: 'session_started',
    category: 'session',
    metadata: {
      sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  });

  return sessionId;
};

export const endSession = (sessionId: string) => {
  trackEvent({
    action: 'session_ended',
    category: 'session',
    metadata: {
      sessionId,
      timestamp: new Date().toISOString(),
      duration: Date.now() - parseInt(sessionId.split('_')[2])
    }
  });
};