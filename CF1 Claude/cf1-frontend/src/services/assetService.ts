/**
 * Asset Service - API calls for asset data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Asset {
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
  priceHistory?: Array<{
    date: string;
    price: number;
    volume: number;
  }>;
}

export interface AssetApiResponse {
  success: boolean;
  data: Asset;
  error?: string;
}

export interface AssetsListResponse {
  success: boolean;
  data: Asset[];
  total: number;
  error?: string;
}

/**
 * Fetch asset by ID
 */
export async function fetchAssetById(id: string): Promise<Asset> {
  try {
    console.log(`Fetching asset with ID: ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Asset not found');
      }
      throw new Error(`Failed to fetch asset: ${response.status}`);
    }

    const result: AssetApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch asset');
    }

    console.log('Asset fetched successfully:', result.data);
    return result.data;

  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
}

/**
 * Fetch all assets with optional filtering
 */
export async function fetchAssets(params?: {
  category?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
}): Promise<Asset[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/api/v1/assets${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    console.log('Fetching assets from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.status}`);
    }

    const result: AssetsListResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch assets');
    }

    console.log('Assets fetched successfully:', result.data.length, 'assets');
    return result.data;

  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Fetch spotlight assets by category
 */
export async function fetchSpotlightAssets(
  category: 'trending' | 'new_launches' | 'high_yield' | 'ready_to_launch',
  limit: number = 4
): Promise<Asset[]> {
  try {
    const url = `${API_BASE_URL}/api/v1/assets/spotlight/${category}?limit=${limit}`;
    
    console.log(`Fetching spotlight assets for category: ${category}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch spotlight assets: ${response.status}`);
    }

    const result: AssetsListResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch spotlight assets');
    }

    console.log(`Spotlight assets fetched for ${category}:`, result.data.length, 'assets');
    return result.data;

  } catch (error) {
    console.error('Error fetching spotlight assets:', error);
    throw error;
  }
}