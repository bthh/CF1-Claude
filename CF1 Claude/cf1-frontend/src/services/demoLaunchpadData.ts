import { useDemoModeStore, DemoScenario } from '../store/demoModeStore';

export interface LaunchpadProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  raisedPercentage: number;
  backers: number;
  daysLeft: number;
  expectedAPY: string;
  minimumInvestment: string;
  imageUrl?: string;
  status: 'active' | 'funded' | 'upcoming';
  isUserSubmission: boolean;
}

// Utility function to add realistic variance to numbers
const varyNumber = (base: number, variance: number = 0.02, maxValue?: number): number => {
  const variation = (Math.random() - 0.5) * 2 * variance;
  const result = Math.round(base * (1 + variation));
  return maxValue !== undefined ? Math.min(result, maxValue) : result;
};

// Generate demo proposals for different scenarios
const generateDemoProposals = (scenario: DemoScenario): LaunchpadProposal[] => {
  switch (scenario) {
    case 'investor_presentation':
      return [
        {
          id: 'demo-inv-1',
          title: 'Prime Manhattan Financial District Tower',
          description: 'Flagship commercial property in NYC\'s financial heart. 98% occupied by Fortune 500 tenants with 15-year average lease terms.',
          category: 'Commercial Real Estate',
          location: 'New York, NY',
          targetAmount: `$${varyNumber(12000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(10200000).toLocaleString()}`,
          raisedPercentage: varyNumber(85, 0.05, 100),
          backers: varyNumber(340),
          daysLeft: varyNumber(8),
          expectedAPY: `${Math.min(varyNumber(14, 0.05), 15).toFixed(1)}%`,
          minimumInvestment: '$25,000',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-inv-2',
          title: 'Swiss Private Banking Gold Reserve',
          description: 'Institutional-grade precious metals portfolio managed by Switzerland\'s premier private bank with 200-year heritage.',
          category: 'Precious Metals',
          location: 'Zurich, Switzerland',
          targetAmount: `$${varyNumber(8500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(8500000).toLocaleString()}`,
          raisedPercentage: 100,
          backers: varyNumber(180),
          daysLeft: 0,
          expectedAPY: `${Math.min(varyNumber(12, 0.05), 15).toFixed(1)}%`,
          minimumInvestment: '$50,000',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
          status: 'funded',
          isUserSubmission: false
        },
        {
          id: 'demo-inv-3',
          title: 'California Renewable Energy Portfolio',
          description: 'Diversified clean energy infrastructure including solar, wind, and battery storage across prime California locations.',
          category: 'Green Infrastructure',
          location: 'California, US',
          targetAmount: `$${varyNumber(18000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(14400000).toLocaleString()}`,
          raisedPercentage: varyNumber(80, 0.05, 100),
          backers: varyNumber(450),
          daysLeft: varyNumber(12),
          expectedAPY: `${Math.min(varyNumber(13, 0.05), 15).toFixed(1)}%`,
          minimumInvestment: '$10,000',
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        }
      ];

    case 'sales_demo':
      return [
        {
          id: 'demo-sales-1',
          title: 'Austin Tech Hub Office Complex',
          description: 'Modern workspace in Austin\'s booming tech corridor. Pre-leased to growing startups and established tech companies.',
          category: 'Commercial Real Estate',
          location: 'Austin, TX',
          targetAmount: `$${varyNumber(4200000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(2940000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(185),
          daysLeft: varyNumber(22),
          expectedAPY: `${varyNumber(9, 0.1).toFixed(1)}%`,
          minimumInvestment: '$1,000',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-2',
          title: 'Diversified Precious Metals Fund',
          description: 'Strategic allocation across gold, silver, platinum, and palladium with professional vault storage and insurance.',
          category: 'Precious Metals',
          location: 'Secure Facilities',
          targetAmount: `$${varyNumber(2800000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(1960000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(142),
          daysLeft: varyNumber(18),
          expectedAPY: `${varyNumber(7, 0.1).toFixed(1)}%`,
          minimumInvestment: '$500',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-3',
          title: 'Contemporary Art Investment Portfolio',
          description: 'Curated collection of emerging and established contemporary artists with gallery partnerships and expert authentication.',
          category: 'Fine Art',
          location: 'Gallery Network',
          targetAmount: `$${varyNumber(1500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(975000).toLocaleString()}`,
          raisedPercentage: varyNumber(65, 0.1, 100),
          backers: varyNumber(87),
          daysLeft: varyNumber(15),
          expectedAPY: `${varyNumber(11, 0.1).toFixed(1)}%`,
          minimumInvestment: '$2,000',
          imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-4',
          title: 'Clean Energy Infrastructure Fund',
          description: 'Next-generation renewable energy projects with guaranteed power purchase agreements and government incentives.',
          category: 'Renewable Energy',
          location: 'Multi-State',
          targetAmount: `$${varyNumber(6500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(4550000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(298),
          daysLeft: varyNumber(25),
          expectedAPY: `${varyNumber(10, 0.1).toFixed(1)}%`,
          minimumInvestment: '$2,500',
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-5',
          title: 'Luxury Vehicle Collection Fund',
          description: 'Investment-grade classic and exotic vehicles with comprehensive authentication and professional management.',
          category: 'Luxury Vehicles',
          location: 'Secure Storage',
          targetAmount: `$${varyNumber(3200000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(3200000).toLocaleString()}`,
          raisedPercentage: 100,
          backers: varyNumber(156),
          daysLeft: 0,
          expectedAPY: `${varyNumber(8, 0.1).toFixed(1)}%`,
          minimumInvestment: '$5,000',
          imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop',
          status: 'funded',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-6',
          title: 'Miami Beach Resort Development',
          description: 'Luxury beachfront resort with 150 rooms, spa, and conference facilities in prime South Beach location.',
          category: 'Hospitality Real Estate',
          location: 'Miami Beach, FL',
          targetAmount: `$${varyNumber(12000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(8400000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(485),
          daysLeft: varyNumber(19),
          expectedAPY: `${varyNumber(12, 0.1).toFixed(1)}%`,
          minimumInvestment: '$2,500',
          imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-7',
          title: 'Industrial Warehouse Complex',
          description: 'Multi-tenant warehouse facility in Phoenix logistics hub with e-commerce distribution focus.',
          category: 'Industrial Real Estate',
          location: 'Phoenix, AZ',
          targetAmount: `$${varyNumber(7800000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(5460000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(327),
          daysLeft: varyNumber(28),
          expectedAPY: `${varyNumber(9, 0.1).toFixed(1)}%`,
          minimumInvestment: '$1,500',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-8',
          title: 'Vintage Wine Investment Collection',
          description: 'Curated selection of premium Bordeaux and Burgundy wines with 10-15 year aging potential.',
          category: 'Collectibles',
          location: 'Napa Valley, CA',
          targetAmount: `$${varyNumber(2200000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(1540000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(143),
          daysLeft: varyNumber(16),
          expectedAPY: `${varyNumber(11, 0.1).toFixed(1)}%`,
          minimumInvestment: '$3,000',
          imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-9',
          title: 'Student Housing Complex Austin',
          description: 'Modern student housing near UT campus with 400 beds and premium amenities for undergraduate students.',
          category: 'Educational Real Estate',
          location: 'Austin, TX',
          targetAmount: `$${varyNumber(5600000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(5600000).toLocaleString()}`,
          raisedPercentage: 100,
          backers: varyNumber(278),
          daysLeft: 0,
          expectedAPY: `${varyNumber(8, 0.1).toFixed(1)}%`,
          minimumInvestment: '$1,000',
          imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e460b1e1?w=600&h=400&fit=crop',
          status: 'funded',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-10',
          title: 'Green Building Office Park',
          description: 'LEED Platinum certified office complex with renewable energy systems and EV charging stations.',
          category: 'Sustainable Real Estate',
          location: 'Portland, OR',
          targetAmount: `$${varyNumber(9500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(6650000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(456),
          daysLeft: varyNumber(33),
          expectedAPY: `${varyNumber(10, 0.1).toFixed(1)}%`,
          minimumInvestment: '$2,000',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-11',
          title: 'Cryptocurrency Data Center',
          description: 'High-efficiency mining facility with renewable energy sources and institutional-grade security.',
          category: 'Digital Infrastructure',
          location: 'Wyoming, US',
          targetAmount: `$${varyNumber(6200000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(4340000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(234),
          daysLeft: varyNumber(24),
          expectedAPY: `${varyNumber(14, 0.1).toFixed(1)}%`,
          minimumInvestment: '$2,500',
          imageUrl: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-12',
          title: 'Agricultural Farmland Portfolio',
          description: 'Diversified crop production across 2,500 acres of prime Iowa farmland with water rights.',
          category: 'Agricultural Real Estate',
          location: 'Iowa, US',
          targetAmount: `$${varyNumber(8800000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(6160000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(398),
          daysLeft: varyNumber(26),
          expectedAPY: `${varyNumber(7, 0.1).toFixed(1)}%`,
          minimumInvestment: '$1,000',
          imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-13',
          title: 'Medical Office Building Network',
          description: 'Three-building medical complex with long-term physician leases and imaging center anchor.',
          category: 'Healthcare Real Estate',
          location: 'Dallas, TX',
          targetAmount: `$${varyNumber(11200000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(7840000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(521),
          daysLeft: varyNumber(21),
          expectedAPY: `${varyNumber(8, 0.1).toFixed(1)}%`,
          minimumInvestment: '$3,000',
          imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-14',
          title: 'Self-Storage Facility Chain',
          description: 'Five premium self-storage facilities across growing suburban markets with climate control.',
          category: 'Storage Real Estate',
          location: 'Multi-State',
          targetAmount: `$${varyNumber(4500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(3150000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(189),
          daysLeft: varyNumber(31),
          expectedAPY: `${varyNumber(9, 0.1).toFixed(1)}%`,
          minimumInvestment: '$750',
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-sales-15',
          title: 'Luxury Shopping Center',
          description: 'High-end retail plaza with premium brand tenants and experiential dining in affluent suburb.',
          category: 'Retail Real Estate',
          location: 'Scottsdale, AZ',
          targetAmount: `$${varyNumber(13500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(9450000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(678),
          daysLeft: varyNumber(18),
          expectedAPY: `${varyNumber(9, 0.1).toFixed(1)}%`,
          minimumInvestment: '$5,000',
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        }
      ];

    case 'user_onboarding':
      return [
        {
          id: 'demo-onboard-1',
          title: 'Beginner Real Estate Investment Trust',
          description: 'Perfect first investment: Diversified residential properties with educational resources and low minimum investment.',
          category: 'Residential Real Estate',
          location: 'Denver, CO',
          targetAmount: `$${varyNumber(750000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(450000).toLocaleString()}`,
          raisedPercentage: varyNumber(60, 0.1, 100),
          backers: varyNumber(234),
          daysLeft: varyNumber(35),
          expectedAPY: `${varyNumber(6, 0.1).toFixed(1)}%`,
          minimumInvestment: '$100',
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-onboard-2',
          title: 'Silver Investment Starter Fund',
          description: 'Learn precious metals investing with this beginner-friendly silver portfolio. Includes educational materials and tutorials.',
          category: 'Precious Metals',
          location: 'Certified Vault',
          targetAmount: `$${varyNumber(300000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(180000).toLocaleString()}`,
          raisedPercentage: varyNumber(60, 0.1, 100),
          backers: varyNumber(156),
          daysLeft: varyNumber(28),
          expectedAPY: `${varyNumber(5, 0.1).toFixed(1)}%`,
          minimumInvestment: '$50',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-onboard-3',
          title: 'Community Solar Learning Project',
          description: 'Educational renewable energy investment with step-by-step guides. Support clean energy while learning to invest.',
          category: 'Renewable Energy',
          location: 'Arizona, US',
          targetAmount: `$${varyNumber(500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(350000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.1, 100),
          backers: varyNumber(198),
          daysLeft: varyNumber(21),
          expectedAPY: `${varyNumber(7, 0.1).toFixed(1)}%`,
          minimumInvestment: '$250',
          imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        }
      ];

    case 'regulatory_showcase':
      return [
        {
          id: 'demo-reg-1',
          title: 'SEC-Compliant Office REIT',
          description: 'Fully regulated real estate investment trust with comprehensive compliance documentation and third-party audits.',
          category: 'Commercial Real Estate',
          location: 'Washington, DC',
          targetAmount: `$${varyNumber(5000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(3000000).toLocaleString()}`,
          raisedPercentage: varyNumber(60, 0.05, 100),
          backers: varyNumber(167),
          daysLeft: varyNumber(45),
          expectedAPY: `${varyNumber(6, 0.05).toFixed(1)}%`,
          minimumInvestment: '$1,000',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-reg-2',
          title: 'Audited Gold Reserve Holdings',
          description: 'Transparent precious metals fund with quarterly third-party audits, regulatory oversight, and full insurance coverage.',
          category: 'Precious Metals',
          location: 'Federal Reserve Vault',
          targetAmount: `$${varyNumber(3000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(2100000).toLocaleString()}`,
          raisedPercentage: varyNumber(70, 0.05, 100),
          backers: varyNumber(134),
          daysLeft: varyNumber(30),
          expectedAPY: `${varyNumber(4, 0.05).toFixed(1)}%`,
          minimumInvestment: '$2,500',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'demo-reg-3',
          title: 'Government-Backed Infrastructure Bonds',
          description: 'AAA-rated municipal infrastructure bonds with government backing and comprehensive regulatory compliance.',
          category: 'Government Bonds',
          location: 'Multi-State',
          targetAmount: `$${varyNumber(8000000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(6400000).toLocaleString()}`,
          raisedPercentage: varyNumber(80, 0.05, 100),
          backers: varyNumber(245),
          daysLeft: varyNumber(20),
          expectedAPY: `${varyNumber(5, 0.05).toFixed(1)}%`,
          minimumInvestment: '$5,000',
          imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        }
      ];

    case 'development_testing':
      return [
        {
          id: 'test-prop-1',
          title: 'Test Proposal Alpha',
          description: 'This is a test proposal for development and QA purposes. All data is simulated for testing.',
          category: 'Test Category',
          location: 'Test Location',
          targetAmount: '$1,000,000',
          raisedAmount: '$500,000',
          raisedPercentage: 50,
          backers: 100,
          daysLeft: 30,
          expectedAPY: '5.0%',
          minimumInvestment: '$100',
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        },
        {
          id: 'test-prop-2',
          title: 'Test Proposal Beta',
          description: 'Another test proposal with different parameters for comprehensive testing scenarios.',
          category: 'Another Test Category',
          location: 'Beta Location',
          targetAmount: '$2,000,000',
          raisedAmount: '$2,000,000',
          raisedPercentage: 100,
          backers: 75,
          daysLeft: 0,
          expectedAPY: '3.0%',
          minimumInvestment: '$250',
          imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
          status: 'funded',
          isUserSubmission: false
        }
      ];

    case 'custom':
    default:
      // Return mixed realistic data for custom scenarios
      return [
        {
          id: 'custom-prop-1',
          title: 'Mixed Portfolio Investment',
          description: 'Diversified investment opportunity with customizable parameters for flexible demo scenarios.',
          category: 'Diversified',
          location: 'Various',
          targetAmount: `$${varyNumber(2500000).toLocaleString()}`,
          raisedAmount: `$${varyNumber(1500000).toLocaleString()}`,
          raisedPercentage: varyNumber(60, 0.2, 100),
          backers: varyNumber(120),
          daysLeft: varyNumber(25),
          expectedAPY: `${varyNumber(8, 0.2).toFixed(1)}%`,
          minimumInvestment: '$1,000',
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
          status: 'active',
          isUserSubmission: false
        }
      ];
  }
};

// Real launchpad proposals (empty when not in demo mode - should come from API)
export const getRealLaunchpadProposals = (): LaunchpadProposal[] => {
  // In production, this would fetch from your API
  // For now, return empty array to show that no real proposals are available yet
  return [];
};

// Demo-aware launchpad data service
export const useLaunchpadProposals = () => {
  const { isEnabled, scenario } = useDemoModeStore();
  
  const getProposals = (): LaunchpadProposal[] => {
    console.log(`🔍 [LAUNCHPAD DATA] Demo Mode State - isEnabled: ${isEnabled}, scenario: ${scenario}`);
    if (isEnabled) {
      console.log(`🎭 [LAUNCHPAD DATA] Demo Mode ON: Loading ${scenario} launchpad proposals`);
      const demoProposals = generateDemoProposals(scenario);
      console.log(`🎭 [LAUNCHPAD DATA] Generated ${demoProposals.length} demo proposals for scenario: ${scenario}`);
      return demoProposals;
    }
    console.log(`🔧 [LAUNCHPAD DATA] Demo Mode OFF: Loading real launchpad proposals (should be empty)`);
    const realProposals = getRealLaunchpadProposals();
    console.log(`🔧 [LAUNCHPAD DATA] Real proposals count: ${realProposals.length} (should be 0)`);
    return realProposals;
  };

  const getProposalStats = () => {
    const proposals = getProposals();
    const activeCount = proposals.filter(p => p.status === 'active').length;
    const fundedCount = proposals.filter(p => p.status === 'funded').length;
    const upcomingCount = proposals.filter(p => p.status === 'upcoming').length;
    
    const totalRaised = proposals.reduce((sum, proposal) => {
      const raised = parseFloat(proposal.raisedAmount.replace(/[$,M]/g, ''));
      return sum + (proposal.raisedAmount.includes('M') ? raised * 1000000 : raised);
    }, 0);

    const avgAPY = proposals.reduce((sum, proposal) => 
      sum + parseFloat(proposal.expectedAPY.replace('%', '')), 0) / proposals.length;

    return {
      total: proposals.length,
      active: activeCount,
      funded: fundedCount,
      upcoming: upcomingCount,
      totalRaised: `$${(totalRaised / 1000000).toFixed(1)}M`,
      avgAPY: `${avgAPY.toFixed(1)}%`
    };
  };

  return {
    proposals: getProposals(),
    stats: getProposalStats(),
    isDemoMode: isEnabled,
    scenario: isEnabled ? scenario : null
  };
};

// Helper function to get demo proposals without using hooks (for stores)
export const getDemoLaunchpadProposals = (scenario: DemoScenario): LaunchpadProposal[] => {
  return generateDemoProposals(scenario);
};