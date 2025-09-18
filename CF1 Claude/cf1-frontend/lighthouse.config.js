// CF1 Performance Baseline Configuration
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',              // Dashboard
        'http://localhost:4173/marketplace',   // Marketplace
        'http://localhost:4173/portfolio',     // Portfolio
        'http://localhost:4173/admin',         // Admin Dashboard
        'http://localhost:4173/discovery',     // Discovery/Smart Search
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage',
        output: ['html', 'json'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      }
    },
    assert: {
      assertions: {
        // CF1 Performance Standards (TradFi User Expectations)
        'categories:performance': ['error', { minScore: 0.85 }], // 85+ for enterprise users
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95+ for WCAG 2.1 AA
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.80 }],

        // Core Web Vitals (Critical for Financial Platform)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],    // 1.8s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],   // Minimal layout shift
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],        // 300ms

        // CF1-Specific Performance Requirements
        'interactive': ['error', { maxNumericValue: 3000 }],             // 3s TTI
        'speed-index': ['warn', { maxNumericValue: 2000 }],              // 2s Speed Index

        // Accessibility Specific to Financial Applications
        'color-contrast': 'error',                    // Critical for readability
        'keyboard': 'error',                         // Required for accessibility
        'focus-traps': 'error',                      // Modal accessibility
        'aria-valid-attr-value': 'error',           // Screen reader compatibility
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};