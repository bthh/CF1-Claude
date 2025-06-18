/**
 * CF1 Backend - Assets API Routes
 * Handles asset data retrieval and management
 */

import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Asset interface matching frontend expectations
interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  currentPrice: string;
  priceChange24h: string;
  volume24h: string;
  marketCap: string;
  expectedAPY: string;
  rating: number;
  totalTokens: number;
  availableTokens: number;
  totalHolders: number;
  totalValue: string;
  tokenPrice: string;
  tags: string[];
  imageUrl: string;
  status?: string;
  volume24hNumeric?: number;
  performance?: number;
}

// Mock asset database - In production, this would be from a real database
// These match the marketplace assets to ensure consistent routing
const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Manhattan Office Complex',
    type: 'Commercial Real Estate',
    location: 'New York, NY',
    description: 'Prime commercial real estate in the heart of Manhattan\'s financial district. This Class A office building features modern amenities, AAA tenants, and long-term lease agreements providing stable rental income.',
    currentPrice: '$100.00',
    priceChange24h: '+1.52%',
    volume24h: '$125,400',
    marketCap: '$2.5M',
    expectedAPY: '8.5%',
    rating: 4.8,
    totalTokens: 25000,
    availableTokens: 15000,
    totalHolders: 127,
    totalValue: '$2.5M',
    tokenPrice: '$100',
    tags: ['Prime Location', 'High Yield'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 125400,
    performance: 1.52
  },
  {
    id: '2',
    name: 'Gold Bullion Vault',
    type: 'Precious Metals',
    location: 'Swiss Bank',
    description: 'Professionally managed gold bullion storage in secure Swiss banking vaults. This investment provides direct exposure to physical gold with institutional-grade security and insurance coverage.',
    currentPrice: '$50.00',
    priceChange24h: '+2.15%',
    volume24h: '$68,000',
    marketCap: '$1.2M',
    expectedAPY: '6.2%',
    rating: 4.9,
    totalTokens: 24000,
    availableTokens: 8000,
    totalHolders: 89,
    totalValue: '$1.2M',
    tokenPrice: '$50',
    tags: ['Stable', 'Inflation Hedge'],
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 68000,
    performance: 2.15
  },
  {
    id: '3',
    name: 'Modern Art Collection',
    type: 'Fine Art',
    location: 'Private Gallery',
    description: 'Curated collection of contemporary and modern artworks from renowned artists. The collection is professionally managed with authentication, insurance, and climate-controlled storage in a private gallery setting.',
    currentPrice: '$200.00',
    priceChange24h: '+1.80%',
    volume24h: '$420,000',
    marketCap: '$800K',
    expectedAPY: '12.3%',
    rating: 4.6,
    totalTokens: 4000,
    availableTokens: 2000,
    totalHolders: 203,
    totalValue: '$800K',
    tokenPrice: '$200',
    tags: ['Appreciation', 'Exclusive'],
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 420000,
    performance: 1.80
  },
  {
    id: '4',
    name: 'Luxury Car Fleet',
    type: 'Collectible Vehicles',
    location: 'Monaco',
    description: 'Portfolio of high-end collectible vehicles including classic Ferrari, Lamborghini, and Porsche models. The fleet generates rental income from luxury car rental services while offering long-term appreciation potential.',
    currentPrice: '$150.00',
    priceChange24h: '+2.10%',
    volume24h: '$67,800',
    marketCap: '$1.8M',
    expectedAPY: '9.1%',
    rating: 4.7,
    totalTokens: 12000,
    availableTokens: 5000,
    totalHolders: 567,
    totalValue: '$1.8M',
    tokenPrice: '$150',
    tags: ['Collectible', 'Rental Income'],
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 67800,
    performance: 2.10
  },
  {
    id: '5',
    name: 'Miami Beach Resort',
    type: 'Hospitality Real Estate',
    location: 'Miami, FL',
    description: 'Luxury beachfront resort property with 150 rooms, multiple restaurants, spa facilities, and private beach access. The property generates strong seasonal revenue with expansion opportunities for additional amenities.',
    currentPrice: '$250.00',
    priceChange24h: '+1.85%',
    volume24h: '$234,500',
    marketCap: '$5.2M',
    expectedAPY: '11.2%',
    rating: 4.9,
    totalTokens: 20800,
    availableTokens: 12000,
    totalHolders: 1523,
    totalValue: '$5.2M',
    tokenPrice: '$250',
    tags: ['Tourism', 'Seasonal Income'],
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 234500,
    performance: 1.85
  },
  {
    id: '6',
    name: 'Silver Mining Rights',
    type: 'Natural Resources',
    location: 'Colorado, US',
    description: 'Mining rights for a proven silver deposit in Colorado with established extraction operations. The investment provides direct exposure to silver commodity prices with operational income from ongoing mining activities.',
    currentPrice: '$75.00',
    priceChange24h: '+5.60%',
    volume24h: '$156,700',
    marketCap: '$950K',
    expectedAPY: '7.8%',
    rating: 4.4,
    totalTokens: 12667,
    availableTokens: 7500,
    totalHolders: 445,
    totalValue: '$950K',
    tokenPrice: '$75',
    tags: ['Mining', 'Commodity'],
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
    status: 'active',
    volume24hNumeric: 156700,
    performance: 5.60
  },
  // Additional assets for Spotlight sections
  {
    id: '7',
    name: 'AI Data Center Complex',
    type: 'Technology Infrastructure',
    location: 'Austin, TX',
    description: 'State-of-the-art data center facility optimized for artificial intelligence and machine learning workloads',
    currentPrice: '$128.75',
    priceChange24h: '+8.50%',
    volume24h: '$2,340,000',
    marketCap: '$3.2M',
    expectedAPY: '15.2%',
    rating: 4.8,
    totalTokens: 20000,
    availableTokens: 8500,
    totalHolders: 1876,
    totalValue: '$3.2M',
    tokenPrice: '$125.00',
    tags: ['AI', 'Infrastructure'],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    status: 'trending',
    volume24hNumeric: 2340000,
    performance: 8.5
  },
  {
    id: '8',
    name: 'Renewable Energy Farm',
    type: 'Green Energy',
    location: 'California, US',
    description: 'Large-scale solar and wind energy installation with long-term power purchase agreements',
    currentPrice: '$88.90',
    priceChange24h: '+6.20%',
    volume24h: '$1,850,000',
    marketCap: '$2.1M',
    expectedAPY: '12.8%',
    rating: 4.7,
    totalTokens: 25000,
    availableTokens: 12300,
    totalHolders: 1456,
    totalValue: '$2.1M',
    tokenPrice: '$85.50',
    tags: ['Renewable', 'ESG'],
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
    status: 'trending',
    volume24hNumeric: 1850000,
    performance: 6.2
  }
];

/**
 * GET /api/v1/assets
 * Get all assets with optional filtering
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, sortBy, limit } = req.query;
    
    let filteredAssets = [...mockAssets];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredAssets = filteredAssets.filter(asset => 
        asset.type.toLowerCase().includes((category as string).toLowerCase())
      );
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredAssets = filteredAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.type.toLowerCase().includes(searchTerm) ||
        asset.location.toLowerCase().includes(searchTerm) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort assets
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          filteredAssets.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'apy':
          filteredAssets.sort((a, b) => parseFloat(b.expectedAPY) - parseFloat(a.expectedAPY));
          break;
        case 'price':
          filteredAssets.sort((a, b) => parseFloat(b.currentPrice.replace('$', '')) - parseFloat(a.currentPrice.replace('$', '')));
          break;
        case 'performance':
          filteredAssets.sort((a, b) => (b.performance || 0) - (a.performance || 0));
          break;
        case 'volume':
          filteredAssets.sort((a, b) => (b.volume24hNumeric || 0) - (a.volume24hNumeric || 0));
          break;
      }
    }
    
    // Limit results
    if (limit) {
      filteredAssets = filteredAssets.slice(0, parseInt(limit as string));
    }
    
    res.json({
      success: true,
      data: filteredAssets,
      total: filteredAssets.length
    });
    
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assets'
    });
  }
});

/**
 * GET /api/v1/assets/:id
 * Get specific asset by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const asset = mockAssets.find(asset => asset.id === id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        code: 'ASSET_NOT_FOUND'
      });
    }
    
    // Generate price history for the asset
    const priceHistory = generatePriceHistory(parseFloat(asset.currentPrice.replace('$', '')));
    
    res.json({
      success: true,
      data: {
        ...asset,
        priceHistory
      }
    });
    
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset details'
    });
  }
});

/**
 * GET /api/v1/assets/spotlight/:category
 * Get assets for spotlight categories
 */
router.get('/spotlight/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = '4' } = req.query;
    
    let filteredAssets = [...mockAssets];
    
    switch (category) {
      case 'trending':
        filteredAssets = filteredAssets
          .filter(asset => (asset.volume24hNumeric || 0) > 100000)
          .sort((a, b) => (b.volume24hNumeric || 0) - (a.volume24hNumeric || 0));
        break;
      case 'new_launches':
        filteredAssets = filteredAssets
          .filter(asset => asset.status === 'new_launch' || (asset.performance || 0) > 4)
          .sort((a, b) => (b.performance || 0) - (a.performance || 0));
        break;
      case 'high_yield':
        filteredAssets = filteredAssets
          .filter(asset => parseFloat(asset.expectedAPY) > 10)
          .sort((a, b) => parseFloat(b.expectedAPY) - parseFloat(a.expectedAPY));
        break;
      case 'ready_to_launch':
        filteredAssets = filteredAssets
          .filter(asset => (asset.availableTokens / asset.totalTokens) < 0.5)
          .sort((a, b) => (a.availableTokens / a.totalTokens) - (b.availableTokens / b.totalTokens));
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid spotlight category'
        });
    }
    
    // Limit results
    filteredAssets = filteredAssets.slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: filteredAssets,
      category,
      total: filteredAssets.length
    });
    
  } catch (error) {
    console.error('Error fetching spotlight assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spotlight assets'
    });
  }
});

// Helper function to generate price history
function generatePriceHistory(basePrice: number) {
  const data = [];
  const now = new Date();
  
  // Generate 1 year of daily data
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily variation
    const price = basePrice * (1 + randomChange * (365 - i) / 365);
    const volume = Math.floor(Math.random() * 100000 + 50000);
    
    data.push({
      date: date.toISOString(),
      price: Math.max(price, basePrice * 0.5), // Minimum price of 50% of base
      volume
    });
  }
  
  return data;
}

export default router;