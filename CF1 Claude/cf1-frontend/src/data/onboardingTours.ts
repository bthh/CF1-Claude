import type { OnboardingTour } from '../hooks/useOnboarding';

export const CF1_ONBOARDING_TOURS: OnboardingTour[] = [
  {
    id: 'welcome-tour',
    name: 'Welcome to CF1',
    description: 'Get started with Real-World Asset tokenization',
    category: 'welcome',
    estimatedTime: 3,
    icon: '👋',
    steps: [
      {
        id: 'welcome-intro',
        title: 'Welcome to CF1 Platform',
        content: 'CF1 is your gateway to Real-World Asset (RWA) tokenization. Invest in real estate, precious metals, art, and more through blockchain technology.',
        placement: 'modal',
        nextButtonText: 'Start Tour',
        skipAble: true
      },
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        content: 'This is your personal dashboard where you can see portfolio performance, recent activity, and quick actions.',
        target: '[data-tour="dashboard"]',
        placement: 'tooltip',
        position: 'bottom',
        page: '/',
        nextButtonText: 'Next'
      },
      {
        id: 'navigation-header',
        title: 'Platform Navigation',
        content: 'Use the header navigation to access different sections: Marketplace, Portfolio, Launchpad, and Voting.',
        target: '[data-tour="main-nav"]',
        placement: 'tooltip',
        position: 'bottom',
        nextButtonText: 'Got it'
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        content: 'Access common actions quickly from this dropdown menu.',
        target: '[data-tour="quick-actions"]',
        placement: 'tooltip',
        position: 'left',
        action: 'click',
        actionTarget: '[data-tour="quick-actions"]',
        nextButtonText: 'Continue'
      },
      {
        id: 'wallet-connection',
        title: 'Connect Your Wallet',
        content: 'Connect your Keplr wallet to start investing. This is required for all transactions on the platform.',
        target: '[data-tour="wallet-connect"]',
        placement: 'tooltip',
        position: 'left',
        nextButtonText: 'Understood'
      }
    ]
  },
  {
    id: 'marketplace-tour',
    name: 'Discover Assets',
    description: 'Learn how to explore and invest in tokenized assets',
    category: 'feature',
    estimatedTime: 4,
    icon: '🏪',
    steps: [
      {
        id: 'marketplace-intro',
        title: 'Asset Marketplace',
        content: 'Browse and discover tokenized real-world assets available for investment.',
        target: '[data-tour="marketplace-header"]',
        placement: 'tooltip',
        position: 'bottom',
        page: '/marketplace',
        nextButtonText: 'Explore'
      },
      {
        id: 'search-assets',
        title: 'Search & Filter',
        content: 'Use the search bar to find specific assets, or apply filters to narrow down your options.',
        target: '[data-tour="asset-search"]',
        placement: 'tooltip',
        position: 'bottom',
        action: 'focus',
        actionTarget: '[data-tour="asset-search"] input',
        nextButtonText: 'Next'
      },
      {
        id: 'advanced-filters',
        title: 'Advanced Filtering',
        content: 'Click here to access advanced filters including price range, APY, and availability options.',
        target: '[data-tour="advanced-filters"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Continue'
      },
      {
        id: 'asset-categories',
        title: 'Asset Categories',
        content: 'Browse assets by category: Real Estate, Precious Metals, Art & Collectibles, and more.',
        target: '[data-tour="asset-categories"]',
        placement: 'tooltip',
        position: 'right',
        nextButtonText: 'Next'
      },
      {
        id: 'asset-cards',
        title: 'Asset Information',
        content: 'Each card shows key details: price, APY, availability, and more. Click any card to view full details.',
        target: '[data-tour="asset-card"]:first-child',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Got it'
      }
    ]
  },
  {
    id: 'investment-tour',
    name: 'Making Investments',
    description: 'Learn how to invest in tokenized assets',
    category: 'feature',
    estimatedTime: 5,
    icon: '💰',
    steps: [
      {
        id: 'asset-detail-view',
        title: 'Asset Details',
        content: 'View comprehensive information about an asset including financial projections, risk factors, and documentation.',
        target: '[data-tour="asset-detail"]',
        placement: 'tooltip',
        position: 'top',
        page: '/marketplace/assets/1',
        nextButtonText: 'Continue'
      },
      {
        id: 'investment-modal',
        title: 'Investment Interface',
        content: 'Enter your investment amount and review the transaction details before confirming.',
        target: '[data-tour="invest-button"]',
        placement: 'tooltip',
        position: 'top',
        action: 'click',
        actionTarget: '[data-tour="invest-button"]',
        nextButtonText: 'Next'
      },
      {
        id: 'investment-calculation',
        title: 'Real-time Calculations',
        content: 'See how many tokens you\'ll receive and estimated returns as you type your investment amount.',
        target: '[data-tour="investment-calculator"]',
        placement: 'tooltip',
        position: 'right',
        nextButtonText: 'Understood'
      },
      {
        id: 'transaction-security',
        title: 'Secure Transactions',
        content: 'All transactions are secured by blockchain technology. Review gas fees and confirm in your wallet.',
        target: '[data-tour="transaction-info"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Next'
      }
    ]
  },
  {
    id: 'portfolio-tour',
    name: 'Portfolio Management',
    description: 'Track and manage your investments',
    category: 'feature',
    estimatedTime: 3,
    icon: '📊',
    steps: [
      {
        id: 'portfolio-overview',
        title: 'Your Portfolio',
        content: 'Track all your investments, performance metrics, and asset allocation in one place.',
        target: '[data-tour="portfolio-stats"]',
        placement: 'tooltip',
        position: 'bottom',
        page: '/portfolio',
        nextButtonText: 'Show me'
      },
      {
        id: 'performance-charts',
        title: 'Performance Analytics',
        content: 'View detailed performance charts and analytics to track your investment growth over time.',
        target: '[data-tour="performance-chart"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Next'
      },
      {
        id: 'asset-breakdown',
        title: 'Asset Breakdown',
        content: 'See detailed information about each asset in your portfolio, including current value and returns.',
        target: '[data-tour="portfolio-assets"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Continue'
      },
      {
        id: 'transaction-history',
        title: 'Transaction History',
        content: 'Review all your past transactions, dividends received, and account activity.',
        target: '[data-tour="transaction-history"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Got it'
      }
    ]
  },
  {
    id: 'governance-tour',
    name: 'Asset Governance',
    description: 'Participate in asset decision-making',
    category: 'feature',
    estimatedTime: 4,
    icon: '🗳️',
    steps: [
      {
        id: 'governance-intro',
        title: 'Asset Governance',
        content: 'As a token holder, you have voting rights on important decisions affecting your investments.',
        target: '[data-tour="governance-header"]',
        placement: 'tooltip',
        position: 'bottom',
        page: '/governance',
        nextButtonText: 'Learn more'
      },
      {
        id: 'voting-power',
        title: 'Your Voting Power',
        content: 'Your voting power is based on the number of tokens you hold. More tokens = more influence.',
        target: '[data-tour="voting-power"]',
        placement: 'tooltip',
        position: 'left',
        nextButtonText: 'Understood'
      },
      {
        id: 'active-proposals',
        title: 'Active Proposals',
        content: 'Browse active proposals that need your vote. Each proposal affects specific assets in your portfolio.',
        target: '[data-tour="proposals-list"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Next'
      },
      {
        id: 'proposal-voting',
        title: 'Casting Your Vote',
        content: 'Click on any proposal to view details and cast your vote. Your vote helps shape the future of your investments.',
        target: '[data-tour="vote-button"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Got it'
      }
    ]
  },
  {
    id: 'launchpad-tour',
    name: 'Asset Launchpad',
    description: 'Discover new tokenization opportunities',
    category: 'feature',
    estimatedTime: 3,
    icon: '🚀',
    steps: [
      {
        id: 'launchpad-intro',
        title: 'Asset Launchpad',
        content: 'Discover new assets being tokenized and get early access to investment opportunities.',
        target: '[data-tour="launchpad-header"]',
        placement: 'tooltip',
        position: 'bottom',
        page: '/launchpad',
        nextButtonText: 'Explore'
      },
      {
        id: 'funding-progress',
        title: 'Funding Progress',
        content: 'See how close each proposal is to reaching its funding goal. Join early for potential benefits.',
        target: '[data-tour="funding-progress"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Next'
      },
      {
        id: 'early-investment',
        title: 'Early Investment',
        content: 'Invest in promising assets before they\'re fully funded and available on the marketplace.',
        target: '[data-tour="invest-early"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Understood'
      }
    ]
  },
  {
    id: 'advanced-features',
    name: 'Advanced Features',
    description: 'Master the platform\'s powerful tools',
    category: 'advanced',
    estimatedTime: 6,
    icon: '⚡',
    steps: [
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: 'Press Shift+? anywhere to view keyboard shortcuts for faster navigation.',
        placement: 'modal',
        nextButtonText: 'Try it'
      },
      {
        id: 'dark-mode',
        title: 'Dark Mode',
        content: 'Toggle between light and dark themes from your profile menu for comfortable viewing.',
        target: '[data-tour="profile-menu"]',
        placement: 'tooltip',
        position: 'left',
        nextButtonText: 'Next'
      },
      {
        id: 'notifications',
        title: 'Smart Notifications',
        content: 'Get real-time updates about your investments, governance votes, and market changes.',
        target: '[data-tour="notifications"]',
        placement: 'tooltip',
        position: 'left',
        nextButtonText: 'Continue'
      },
      {
        id: 'advanced-search',
        title: 'Advanced Search',
        content: 'Use powerful search and filtering to find exactly what you\'re looking for across the platform.',
        placement: 'modal',
        nextButtonText: 'Master it'
      },
      {
        id: 'data-export',
        title: 'Data Export',
        content: 'Export your transaction history and portfolio data for tax reporting and analysis.',
        target: '[data-tour="export-data"]',
        placement: 'tooltip',
        position: 'top',
        nextButtonText: 'Got it'
      }
    ]
  }
];

// Helper function to get tours by category
export const getToursByCategory = (category: OnboardingTour['category']) => {
  return CF1_ONBOARDING_TOURS.filter(tour => tour.category === category);
};

// Helper function to get tour by ID
export const getTourById = (id: string) => {
  return CF1_ONBOARDING_TOURS.find(tour => tour.id === id);
};

// Helper function to get recommended tours for new users
export const getRecommendedTours = () => {
  return [
    'welcome-tour',
    'marketplace-tour',
    'investment-tour',
    'portfolio-tour'
  ];
};

// Helper function to get all tour IDs
export const getAllTourIds = () => {
  return CF1_ONBOARDING_TOURS.map(tour => tour.id);
};