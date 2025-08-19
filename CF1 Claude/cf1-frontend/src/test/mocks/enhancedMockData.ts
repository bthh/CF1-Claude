import { vi } from 'vitest';

// Enhanced mock data for comprehensive testing

// Role-based users
export const mockUsers = [
  {
    id: 'user-investor-1',
    address: 'cosmos1investor1abc',
    email: 'investor1@cf1.com',
    role: 'investor',
    isActive: true,
    isVerified: true,
    kycStatus: 'approved',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
    totalInvestments: 8,
    totalInvested: { amount: '75000', denom: 'untrn' },
    portfolioValue: 82500,
    avgReturn: 12.5,
    riskProfile: 'moderate',
    profile: {
      firstName: 'Alex',
      lastName: 'Chen',
      bio: 'Tech investor focused on sustainable technology',
      avatar: 'https://example.com/avatar1.jpg',
      interests: ['renewable_energy', 'ai_technology', 'sustainable_transport']
    },
    preferences: {
      notifications: { email: true, push: true, sms: false },
      privacy: { profilePublic: true, investmentsPublic: false },
      language: 'en',
      timezone: 'UTC'
    }
  },
  {
    id: 'user-creator-1',
    address: 'cosmos1creator1def',
    email: 'creator1@cf1.com',
    role: 'creator',
    isActive: true,
    isVerified: true,
    kycStatus: 'approved',
    createdAt: '2024-01-05T00:00:00Z',
    lastLogin: '2024-01-19T14:20:00Z',
    totalProposals: 4,
    totalRaised: { amount: '1250000', denom: 'untrn' },
    successRate: 85.5,
    avgFundingTime: 12, // days
    profile: {
      firstName: 'Maria',
      lastName: 'Rodriguez',
      bio: 'Clean energy entrepreneur with 10 years experience',
      avatar: 'https://example.com/avatar2.jpg',
      company: 'GreenTech Solutions',
      website: 'https://greentech-solutions.com',
      specializations: ['solar_energy', 'wind_power', 'energy_storage']
    },
    socialProof: {
      linkedIn: 'https://linkedin.com/in/maria-rodriguez',
      twitter: '@mariagreen',
      github: 'https://github.com/maria-greentech'
    }
  },
  {
    id: 'user-admin-1',
    address: 'cosmos1admin1ghi',
    email: 'admin@cf1.com',
    role: 'platform_admin',
    isActive: true,
    isVerified: true,
    kycStatus: 'approved',
    createdAt: '2023-12-01T00:00:00Z',
    lastLogin: '2024-01-20T09:00:00Z',
    permissions: ['manage_users', 'manage_platform_config', 'view_all_data', 'moderate_content'],
    adminLevel: 'platform_admin',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      bio: 'Platform administrator ensuring smooth operations',
      avatar: 'https://example.com/avatar3.jpg'
    }
  }
];

// Enhanced dashboard widgets with role-based configurations
export const mockDashboardWidgets = [
  // Common widgets
  {
    id: 'widget-marketplace-1',
    type: 'marketplace',
    size: 'medium',
    position: 0,
    isVisible: true,
    allowedRoles: ['investor', 'creator', 'admin'],
    settings: {
      showFeatured: true,
      maxItems: 6,
      categories: ['all']
    },
    dataFilters: {
      status: 'active',
      minInvestment: 0
    },
    refreshInterval: 300 // 5 minutes
  },
  // Investor-specific widgets
  {
    id: 'widget-investor-recommendations-1',
    type: 'investorRecommendations',
    size: 'large',
    position: 1,
    isVisible: true,
    allowedRoles: ['investor'],
    settings: {
      maxRecommendations: 5,
      riskLevel: 'moderate',
      aiPowered: true
    },
    dataFilters: {
      matchRiskProfile: true,
      matchInterests: true
    }
  },
  {
    id: 'widget-investor-performance-1',
    type: 'investorPerformance',
    size: 'medium',
    position: 2,
    isVisible: true,
    allowedRoles: ['investor'],
    settings: {
      timeRange: '12M',
      showBenchmark: true,
      includeDividends: true
    }
  },
  // Creator-specific widgets
  {
    id: 'widget-creator-analytics-1',
    type: 'creatorAnalytics',
    size: 'large',
    position: 1,
    isVisible: true,
    allowedRoles: ['creator'],
    settings: {
      showFundingProgress: true,
      showInvestorMetrics: true,
      timeRange: '6M'
    }
  },
  {
    id: 'widget-creator-assets-1',
    type: 'creatorAssets',
    size: 'medium',
    position: 2,
    isVisible: true,
    allowedRoles: ['creator'],
    settings: {
      showDrafts: true,
      showActive: true,
      showCompleted: false
    }
  },
  // Admin-specific widgets
  {
    id: 'widget-admin-feature-toggles-1',
    type: 'adminFeatureToggles',
    size: 'medium',
    position: 1,
    isVisible: true,
    allowedRoles: ['admin'],
    settings: {
      showCriticalOnly: false,
      groupByCategory: true
    }
  },
  {
    id: 'widget-admin-system-health-1',
    type: 'adminSystemHealth',
    size: 'large',
    position: 2,
    isVisible: true,
    allowedRoles: ['admin'],
    settings: {
      showMetrics: true,
      showAlerts: true,
      refreshInterval: 60
    }
  }
];

// Mock proposals with comprehensive data
export const mockProposals = [
  {
    id: 'proposal-solar-farm-1',
    title: 'Community Solar Farm Project',
    description: 'A 50MW solar farm providing clean energy to 15,000 homes',
    creator: 'cosmos1creator1def',
    creatorInfo: mockUsers[1], // Creator user
    category: 'renewable_energy',
    subcategory: 'solar',
    funding_goal: { amount: '2500000', denom: 'untrn' },
    current_funding: { amount: '1875000', denom: 'untrn' },
    funding_percentage: 75,
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-03-31T23:59:59Z',
    status: 'active',
    risk_level: 'medium',
    expected_apy: 8.5,
    lockup_period: 730, // 2 years
    minimum_investment: { amount: '1000', denom: 'untrn' },
    investor_count: 156,
    location: 'California, USA',
    environmental_impact: {
      co2_reduction: '125000', // kg per year
      homes_powered: 15000,
      clean_energy_generated: '87500' // MWh per year
    },
    financials: {
      irr: 9.2,
      npv: { amount: '485000', denom: 'untrn' },
      payback_period: 7.5,
      projected_revenue: { amount: '5200000', denom: 'untrn' }
    },
    milestones: [
      { id: '1', title: 'Land Acquisition', completed: true, date: '2024-01-15T00:00:00Z' },
      { id: '2', title: 'Permitting', completed: true, date: '2024-02-01T00:00:00Z' },
      { id: '3', title: 'Construction Start', completed: false, target_date: '2024-04-01T00:00:00Z' },
      { id: '4', title: 'Grid Connection', completed: false, target_date: '2024-08-01T00:00:00Z' }
    ]
  },
  {
    id: 'proposal-ev-charging-1',
    title: 'Urban EV Charging Network',
    description: 'Expanding electric vehicle charging infrastructure across metropolitan areas',
    creator: 'cosmos1creator2jkl',
    category: 'sustainable_transport',
    subcategory: 'ev_infrastructure',
    funding_goal: { amount: '1800000', denom: 'untrn' },
    current_funding: { amount: '540000', denom: 'untrn' },
    funding_percentage: 30,
    start_time: '2024-01-15T00:00:00Z',
    end_time: '2024-04-15T23:59:59Z',
    status: 'active',
    risk_level: 'medium',
    expected_apy: 11.2,
    lockup_period: 1095, // 3 years
    minimum_investment: { amount: '500', denom: 'untrn' },
    investor_count: 89,
    location: 'New York, USA',
    environmental_impact: {
      co2_reduction: '95000',
      vehicles_supported: 8500,
      charging_sessions_per_year: '2500000'
    }
  }
];

// Mock investments with detailed tracking
export const mockInvestments = [
  {
    id: 'investment-1',
    proposal_id: 'proposal-solar-farm-1',
    investor: 'cosmos1investor1abc',
    amount: { amount: '25000', denom: 'untrn' },
    shares: 250,
    timestamp: '2024-01-10T15:30:00Z',
    status: 'active',
    purchase_price: 100, // per share
    current_value: 112.5, // per share
    total_return: 12.5, // percentage
    dividends_received: { amount: '1250', denom: 'untrn' },
    vesting_schedule: {
      total_shares: 250,
      vested_shares: 62.5, // 25% after 3 months
      next_vesting_date: '2024-04-10T00:00:00Z',
      vesting_amount: 62.5
    }
  },
  {
    id: 'investment-2',
    proposal_id: 'proposal-ev-charging-1',
    investor: 'cosmos1investor1abc',
    amount: { amount: '15000', denom: 'untrn' },
    shares: 150,
    timestamp: '2024-01-18T10:15:00Z',
    status: 'active',
    purchase_price: 100,
    current_value: 105.8,
    total_return: 5.8
  }
];

// Mock feature toggles with comprehensive configuration
export const mockFeatureToggles = {
  'marketplace': {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Enable marketplace tab and asset browsing',
    enabled: true,
    category: 'general',
    requiredRole: 'platform_admin',
    lastModified: '2024-01-15T12:00:00Z',
    modifiedBy: 'cosmos1admin1ghi',
    rolloutPercentage: 100,
    dependencies: [],
    environments: ['development', 'staging', 'production']
  },
  'analytics': {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Enable advanced analytics dashboard and reports',
    enabled: true,
    category: 'general',
    requiredRole: 'platform_admin',
    lastModified: '2024-01-12T09:30:00Z',
    modifiedBy: 'cosmos1admin1ghi',
    rolloutPercentage: 100,
    dependencies: ['marketplace']
  },
  'secondary_trading': {
    id: 'secondary_trading',
    name: 'Secondary Market Trading',
    description: 'Enable trading of assets on secondary market',
    enabled: true,
    category: 'trading',
    requiredRole: 'platform_admin',
    lastModified: '2024-01-18T16:45:00Z',
    modifiedBy: 'cosmos1admin1ghi',
    rolloutPercentage: 85,
    dependencies: ['marketplace'],
    constraints: {
      minUserAge: 30, // days
      minInvestmentAmount: 1000,
      maxDailyVolume: 1000000
    }
  },
  'ai_recommendations': {
    id: 'ai_recommendations',
    name: 'AI-Powered Recommendations',
    description: 'Enable AI-powered investment recommendations',
    enabled: false,
    category: 'ai',
    requiredRole: 'super_admin',
    lastModified: '2024-01-10T14:20:00Z',
    modifiedBy: 'cosmos1superadmin',
    rolloutPercentage: 0,
    dependencies: ['analytics', 'marketplace'],
    betaUsers: ['cosmos1investor1abc', 'cosmos1creator1def']
  },
  'maintenance_mode': {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Enable platform-wide maintenance mode',
    enabled: false,
    category: 'system',
    requiredRole: 'super_admin',
    lastModified: '2024-01-05T08:00:00Z',
    modifiedBy: 'cosmos1superadmin',
    emergencyToggle: true,
    autoDisableAfter: 7200000 // 2 hours in milliseconds
  }
};

// Mock analytics data
export const mockAnalytics = {
  platformMetrics: {
    totalUsers: 1247,
    activeUsers: 892,
    totalProposals: 156,
    activeProposals: 89,
    totalInvestments: 3420,
    totalVolume: { amount: '45750000', denom: 'untrn' },
    averageInvestment: { amount: '13377', denom: 'untrn' },
    successRate: 87.3
  },
  userMetrics: {
    newUsersToday: 23,
    newUsersThisWeek: 156,
    newUsersThisMonth: 678,
    userRetention: {
      day1: 89.5,
      day7: 67.2,
      day30: 45.8
    },
    usersByRole: {
      investor: 987,
      creator: 234,
      admin: 26
    }
  },
  investmentMetrics: {
    totalInvestmentsToday: { amount: '234500', denom: 'untrn' },
    totalInvestmentsThisWeek: { amount: '1678900', denom: 'untrn' },
    totalInvestmentsThisMonth: { amount: '7234500', denom: 'untrn' },
    avgInvestmentSize: { amount: '15678', denom: 'untrn' },
    topCategories: [
      { category: 'renewable_energy', percentage: 42.3 },
      { category: 'sustainable_transport', percentage: 28.7 },
      { category: 'green_buildings', percentage: 18.9 },
      { category: 'waste_management', percentage: 10.1 }
    ]
  }
};

// Mock notifications for different scenarios
export const mockNotifications = [
  {
    id: 'notif-investment-success-1',
    type: 'success',
    title: 'Investment Successful',
    message: 'Your investment of 25,000 NTRN in Community Solar Farm Project has been confirmed',
    timestamp: '2024-01-20T10:30:00Z',
    isRead: false,
    userId: 'user-investor-1',
    actionUrl: '/portfolio/investment-1',
    metadata: {
      investmentId: 'investment-1',
      proposalId: 'proposal-solar-farm-1',
      amount: '25000'
    }
  },
  {
    id: 'notif-dividend-1',
    type: 'info',
    title: 'Dividend Payment Received',
    message: 'You received 1,250 NTRN dividend from your solar farm investment',
    timestamp: '2024-01-19T14:15:00Z',
    isRead: false,
    userId: 'user-investor-1',
    actionUrl: '/portfolio/investment-1',
    metadata: {
      dividendAmount: '1250',
      investmentId: 'investment-1'
    }
  },
  {
    id: 'notif-proposal-milestone-1',
    type: 'info',
    title: 'Project Milestone Achieved',
    message: 'Community Solar Farm Project completed land acquisition milestone',
    timestamp: '2024-01-15T09:00:00Z',
    isRead: true,
    userId: 'user-investor-1',
    actionUrl: '/proposals/proposal-solar-farm-1',
    metadata: {
      proposalId: 'proposal-solar-farm-1',
      milestoneId: '1'
    }
  },
  {
    id: 'notif-system-maintenance-1',
    type: 'warning',
    title: 'Scheduled Maintenance',
    message: 'Platform maintenance scheduled for tomorrow 2:00 AM - 4:00 AM UTC',
    timestamp: '2024-01-19T18:00:00Z',
    isRead: false,
    userId: 'all',
    actionUrl: '/maintenance-info',
    metadata: {
      maintenanceWindow: '2024-01-21T02:00:00Z - 2024-01-21T04:00:00Z'
    }
  }
];

// Mock error scenarios for testing
export const mockErrorScenarios = {
  networkError: {
    name: 'NetworkError',
    message: 'Failed to fetch data from server',
    code: 'NETWORK_ERROR',
    status: 500
  },
  authenticationError: {
    name: 'AuthenticationError',
    message: 'Invalid credentials or session expired',
    code: 'AUTH_ERROR',
    status: 401
  },
  permissionError: {
    name: 'PermissionError',
    message: 'Insufficient permissions to perform this action',
    code: 'PERMISSION_ERROR',
    status: 403
  },
  validationError: {
    name: 'ValidationError',
    message: 'Invalid input data provided',
    code: 'VALIDATION_ERROR',
    status: 400,
    details: {
      fields: ['amount', 'proposalId'],
      constraints: ['amount must be positive', 'proposalId is required']
    }
  }
};

// Mock API responses
export const mockApiResponses = {
  proposals: {
    success: {
      data: mockProposals,
      pagination: {
        page: 1,
        pageSize: 10,
        total: mockProposals.length,
        totalPages: 1
      },
      filters: {
        category: 'all',
        status: 'active',
        riskLevel: 'all'
      }
    },
    error: mockErrorScenarios.networkError
  },
  investments: {
    success: {
      data: mockInvestments,
      summary: {
        totalInvestments: mockInvestments.length,
        totalValue: mockInvestments.reduce((sum, inv) => sum + parseInt(inv.amount.amount), 0),
        totalReturns: mockInvestments.reduce((sum, inv) => sum + (inv.total_return || 0), 0)
      }
    },
    error: mockErrorScenarios.authenticationError
  },
  users: {
    success: {
      data: mockUsers,
      pagination: {
        page: 1,
        pageSize: 50,
        total: mockUsers.length,
        totalPages: 1
      }
    },
    error: mockErrorScenarios.permissionError
  }
};

// Test utilities for mocking hooks and stores
export const createMockStore = (initialState: any = {}) => ({
  ...initialState,
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getState: vi.fn(() => initialState),
  setState: vi.fn(),
  destroy: vi.fn()
});

export const createMockHook = (returnValue: any) => vi.fn(() => returnValue);

// Performance testing data
export const mockPerformanceData = {
  loadTimes: {
    dashboard: 1250, // ms
    proposals: 890,
    portfolio: 1120,
    analytics: 2100
  },
  apiResponseTimes: {
    getProposals: 450,
    getInvestments: 320,
    getUserProfile: 180,
    createInvestment: 890
  },
  bundleSizes: {
    main: 245.6, // KB
    vendors: 1023.4,
    dashboard: 89.2,
    proposals: 156.8
  }
};

// Accessibility testing data
export const mockAccessibilityData = {
  colorContrast: {
    primary: 7.2, // WCAG AAA compliant
    secondary: 4.8, // WCAG AA compliant
    text: 12.1
  },
  keyboardNavigation: {
    focusableElements: 45,
    tabOrder: 'correct',
    skipLinks: true,
    ariaLabels: true
  },
  screenReaderSupport: {
    landmarks: true,
    headingStructure: 'h1->h2->h3',
    altText: true,
    descriptions: true
  }
};

export default {
  mockUsers,
  mockDashboardWidgets,
  mockProposals,
  mockInvestments,
  mockFeatureToggles,
  mockAnalytics,
  mockNotifications,
  mockErrorScenarios,
  mockApiResponses,
  createMockStore,
  createMockHook,
  mockPerformanceData,
  mockAccessibilityData
};