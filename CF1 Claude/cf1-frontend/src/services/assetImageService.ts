/**
 * Asset Image Service
 * 
 * Centralized service for managing professional stock images for CF1 asset demos.
 * Provides high-quality imagery that fits the "TradFi Feel, DeFi Engine" philosophy.
 */

export interface AssetImageConfig {
  url: string;
  alt: string;
  category: string;
  subcategory?: string;
  quality: 'standard' | 'high' | 'ultra';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:2';
}

export interface ImageCollection {
  [key: string]: AssetImageConfig[];
}

// Professional stock image collections organized by asset category
export const ASSET_IMAGE_COLLECTIONS: ImageCollection = {
  // Commercial Real Estate
  commercial_real_estate: [
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80',
      alt: 'Modern office skyscraper with glass facade',
      category: 'Commercial Real Estate',
      subcategory: 'Office Buildings',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop&q=80',
      alt: 'Premium commercial office complex',
      category: 'Commercial Real Estate',
      subcategory: 'Office Complex',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=300&fit=crop&q=80',
      alt: 'Corporate headquarters building',
      category: 'Commercial Real Estate',
      subcategory: 'Corporate Buildings',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=300&fit=crop&q=80',
      alt: 'Financial district skyscrapers',
      category: 'Commercial Real Estate',
      subcategory: 'Financial District',
      quality: 'ultra',
      aspectRatio: '4:3'
    }
  ],

  // Residential Real Estate
  residential_real_estate: [
    {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80',
      alt: 'Luxury residential property exterior',
      category: 'Residential Real Estate',
      subcategory: 'Luxury Homes',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop&q=80',
      alt: 'Modern residential complex',
      category: 'Residential Real Estate',
      subcategory: 'Apartment Complex',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&q=80',
      alt: 'Contemporary luxury home',
      category: 'Residential Real Estate',
      subcategory: 'Contemporary Homes',
      quality: 'ultra',
      aspectRatio: '4:3'
    }
  ],

  // Precious Metals
  precious_metals: [
    {
      url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=300&fit=crop&q=80',
      alt: 'Gold bars in secure vault',
      category: 'Precious Metals',
      subcategory: 'Gold',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop&q=80',
      alt: 'Silver bullion collection',
      category: 'Precious Metals',
      subcategory: 'Silver',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1594736797933-d0400c4d4b5e?w=400&h=300&fit=crop&q=80',
      alt: 'Platinum and precious metals',
      category: 'Precious Metals',
      subcategory: 'Mixed Metals',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=400&h=300&fit=crop&q=80',
      alt: 'Gold coins and investment metals',
      category: 'Precious Metals',
      subcategory: 'Coins',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Renewable Energy & Green Infrastructure
  renewable_energy: [
    {
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop&q=80',
      alt: 'Solar panel installation field',
      category: 'Renewable Energy',
      subcategory: 'Solar Energy',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop&q=80',
      alt: 'Wind turbine farm',
      category: 'Renewable Energy',
      subcategory: 'Wind Energy',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80',
      alt: 'Green energy infrastructure',
      category: 'Renewable Energy',
      subcategory: 'Infrastructure',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop&q=80',
      alt: 'Hydroelectric power facility',
      category: 'Renewable Energy',
      subcategory: 'Hydroelectric',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Fine Art & Collectibles
  fine_art: [
    {
      url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&q=80',
      alt: 'Contemporary art gallery interior',
      category: 'Fine Art',
      subcategory: 'Contemporary Art',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80',
      alt: 'Fine art museum collection',
      category: 'Fine Art',
      subcategory: 'Museum Quality',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1536924940846-227480903aa7?w=400&h=300&fit=crop&q=80',
      alt: 'Art investment portfolio',
      category: 'Fine Art',
      subcategory: 'Investment Art',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Luxury Vehicles & Collectibles
  luxury_vehicles: [
    {
      url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&q=80',
      alt: 'Luxury sports car collection',
      category: 'Luxury Vehicles',
      subcategory: 'Sports Cars',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&q=80',
      alt: 'Classic vintage automobile',
      category: 'Luxury Vehicles',
      subcategory: 'Classic Cars',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop&q=80',
      alt: 'Luxury vehicle showroom',
      category: 'Luxury Vehicles',
      subcategory: 'Showroom',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Hospitality & Tourism Real Estate
  hospitality_real_estate: [
    {
      url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&q=80',
      alt: 'Luxury resort exterior view',
      category: 'Hospitality Real Estate',
      subcategory: 'Luxury Resorts',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80',
      alt: 'Premium hotel property',
      category: 'Hospitality Real Estate',
      subcategory: 'Hotels',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&q=80',
      alt: 'Beachfront resort development',
      category: 'Hospitality Real Estate',
      subcategory: 'Beachfront Properties',
      quality: 'ultra',
      aspectRatio: '4:3'
    }
  ],

  // Government Bonds & Infrastructure
  government_bonds: [
    {
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&q=80',
      alt: 'Government building architecture',
      category: 'Government Bonds',
      subcategory: 'Infrastructure',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80',
      alt: 'Public infrastructure project',
      category: 'Government Bonds',
      subcategory: 'Public Works',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Technology & Innovation
  technology: [
    {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop&q=80',
      alt: 'Technology innovation center',
      category: 'Technology',
      subcategory: 'Innovation',
      quality: 'ultra',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&q=80',
      alt: 'Data center infrastructure',
      category: 'Technology',
      subcategory: 'Data Centers',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ],

  // Agriculture & Commodities
  agriculture: [
    {
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&q=80',
      alt: 'Modern agricultural facility',
      category: 'Agriculture',
      subcategory: 'Modern Farming',
      quality: 'high',
      aspectRatio: '4:3'
    },
    {
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80',
      alt: 'Sustainable agriculture project',
      category: 'Agriculture',
      subcategory: 'Sustainable Farming',
      quality: 'high',
      aspectRatio: '4:3'
    }
  ]
};

// Asset type mapping to image collections
export const ASSET_TYPE_TO_COLLECTION: Record<string, string> = {
  'Commercial Real Estate': 'commercial_real_estate',
  'Residential Real Estate': 'residential_real_estate',
  'Retail Real Estate': 'commercial_real_estate',
  'Hospitality Real Estate': 'hospitality_real_estate',
  'Precious Metals': 'precious_metals',
  'Green Infrastructure': 'renewable_energy',
  'Renewable Energy': 'renewable_energy',
  'Fine Art': 'fine_art',
  'Luxury Vehicles': 'luxury_vehicles',
  'Collectible Vehicles': 'luxury_vehicles',
  'Government Bonds': 'government_bonds',
  'Technology': 'technology',
  'Agriculture': 'agriculture',
  'Diversified': 'commercial_real_estate', // Default fallback
  'Test Category': 'commercial_real_estate', // For development
  'Another Test Category': 'precious_metals' // For development
};

/**
 * Get a random image for a specific asset type
 */
export const getAssetImage = (assetType: string, index?: number): AssetImageConfig | null => {
  const collectionKey = ASSET_TYPE_TO_COLLECTION[assetType];
  if (!collectionKey) {
    console.warn(`No image collection found for asset type: ${assetType}`);
    return getDefaultAssetImage();
  }

  const collection = ASSET_IMAGE_COLLECTIONS[collectionKey];
  if (!collection || collection.length === 0) {
    console.warn(`Empty or missing image collection: ${collectionKey}`);
    return getDefaultAssetImage();
  }

  // Use index if provided, otherwise random
  const imageIndex = index !== undefined ? index % collection.length : Math.floor(Math.random() * collection.length);
  return collection[imageIndex];
};

/**
 * Get multiple images for an asset type (for carousels, galleries, etc.)
 */
export const getAssetImages = (assetType: string, count: number = 3): AssetImageConfig[] => {
  const collectionKey = ASSET_TYPE_TO_COLLECTION[assetType];
  if (!collectionKey) {
    return Array(count).fill(getDefaultAssetImage()).filter(Boolean);
  }

  const collection = ASSET_IMAGE_COLLECTIONS[collectionKey];
  if (!collection || collection.length === 0) {
    return Array(count).fill(getDefaultAssetImage()).filter(Boolean);
  }

  // Shuffle and take the requested count
  const shuffled = [...collection].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Get default fallback image
 */
export const getDefaultAssetImage = (): AssetImageConfig => ({
  url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80',
  alt: 'Professional investment asset',
  category: 'General',
  quality: 'high',
  aspectRatio: '4:3'
});

/**
 * Generate optimized image URL with specific dimensions and quality
 */
export const getOptimizedImageUrl = (
  baseUrl: string, 
  width: number = 400, 
  height: number = 300, 
  quality: number = 80
): string => {
  if (!baseUrl.includes('unsplash.com')) {
    return baseUrl;
  }

  // Extract the base Unsplash URL and add our parameters
  const baseUnsplashUrl = baseUrl.split('?')[0];
  return `${baseUnsplashUrl}?w=${width}&h=${height}&fit=crop&q=${quality}`;
};

/**
 * Get scenario-specific image optimizations
 */
export const getScenarioOptimizedImage = (
  assetType: string, 
  scenario: string,
  index?: number
): AssetImageConfig | null => {
  const baseImage = getAssetImage(assetType, index);
  if (!baseImage) return null;

  // Adjust quality based on scenario
  let quality = 80;
  switch (scenario) {
    case 'investor_presentation':
      quality = 90; // Higher quality for presentations
      break;
    case 'sales_demo':
      quality = 85;
      break;
    case 'user_onboarding':
      quality = 75; // Lower quality for faster loading during tutorials
      break;
    default:
      quality = 80;
  }

  return {
    ...baseImage,
    url: getOptimizedImageUrl(baseImage.url, 400, 300, quality)
  };
};

/**
 * Preload images for smooth demo experience
 */
export const preloadAssetImages = (assetTypes: string[]): Promise<void[]> => {
  const imageUrls = assetTypes
    .map(type => getAssetImage(type))
    .filter(Boolean)
    .map(img => img!.url);

  const preloadPromises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  return Promise.all(preloadPromises);
};