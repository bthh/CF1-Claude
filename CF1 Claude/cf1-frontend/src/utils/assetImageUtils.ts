/**
 * Asset Image Utilities
 * Provides consistent asset images across all pages (portfolio, rewards, launchpad, voting)
 */

export interface AssetImageMapping {
  [key: string]: string;
}

// Consistent asset image mapping used across the entire platform
export const ASSET_IMAGES: AssetImageMapping = {
  // Specific assets (by ID or name)
  'manhattan_office': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=300&fit=crop',
  'manhattan_premium_office_tower': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=300&fit=crop',
  'solar_nevada': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop',
  'solar_energy_project_nevada': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop',
  'vintage_wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
  'vintage_wine_collection_series_a': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
  'miami_resort': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=300&fit=crop',
  'miami_beach_luxury_resort': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=300&fit=crop',
  'gold_vault': 'https://images.unsplash.com/photo-1518544866273-fc5c5d2b7a0b?w=300&h=300&fit=crop',
  'gold_bullion_vault': 'https://images.unsplash.com/photo-1518544866273-fc5c5d2b7a0b?w=300&h=300&fit=crop',
  'art_collection': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
  'contemporary_art_collection': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
  'wine_collection': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
  'rare_wine_collection': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
  
  // Type-based fallbacks
  'default_real_estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=300&fit=crop',
  'default_commercial_real_estate': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=300&fit=crop',
  'default_hospitality_real_estate': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=300&fit=crop',
  'default_renewable_energy': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop',
  'default_renewable': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop',
  'default_collectibles': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
  'default_art_collectibles': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
  'default_precious_metals': 'https://images.unsplash.com/photo-1518544866273-fc5c5d2b7a0b?w=300&h=300&fit=crop',
  'default_infrastructure': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop',
  'default_natural_resources': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop'
};

/**
 * Get consistent asset image URL based on asset identifier
 * @param assetIdentifier - Asset ID, name, or type
 * @param assetType - Optional asset type for better matching
 * @returns Image URL string
 */
export const getAssetImage = (assetIdentifier: string, assetType?: string): string => {
  if (!assetIdentifier) {
    return ASSET_IMAGES.default_real_estate;
  }

  // Normalize identifier for matching
  const normalizedId = assetIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try exact match first
  if (ASSET_IMAGES[normalizedId]) {
    return ASSET_IMAGES[normalizedId];
  }

  // Try original identifier
  if (ASSET_IMAGES[assetIdentifier]) {
    return ASSET_IMAGES[assetIdentifier];
  }

  // Fallback to type-based matching
  const identifier = assetIdentifier.toLowerCase();
  const type = assetType?.toLowerCase() || '';

  // Real Estate matching
  if (identifier.includes('office') || identifier.includes('commercial') || type.includes('commercial')) {
    return ASSET_IMAGES.default_commercial_real_estate;
  }
  if (identifier.includes('resort') || identifier.includes('hotel') || identifier.includes('hospitality') || type.includes('hospitality')) {
    return ASSET_IMAGES.default_hospitality_real_estate;
  }
  if (identifier.includes('real estate') || identifier.includes('property') || type.includes('real estate')) {
    return ASSET_IMAGES.default_real_estate;
  }

  // Energy matching
  if (identifier.includes('solar') || identifier.includes('renewable') || identifier.includes('energy') || type.includes('renewable') || type.includes('energy')) {
    return ASSET_IMAGES.default_renewable;
  }

  // Collectibles matching
  if (identifier.includes('wine') || identifier.includes('vintage')) {
    return ASSET_IMAGES.vintage_wine;
  }
  if (identifier.includes('art') || identifier.includes('collectible') || type.includes('art') || type.includes('collectible')) {
    return ASSET_IMAGES.default_art_collectibles;
  }

  // Precious metals matching
  if (identifier.includes('gold') || identifier.includes('bullion') || identifier.includes('precious') || type.includes('precious metals')) {
    return ASSET_IMAGES.default_precious_metals;
  }

  // Infrastructure matching
  if (identifier.includes('infrastructure') || type.includes('infrastructure')) {
    return ASSET_IMAGES.default_infrastructure;
  }

  // Natural resources matching
  if (identifier.includes('natural') || identifier.includes('resources') || type.includes('natural resources')) {
    return ASSET_IMAGES.default_natural_resources;
  }

  // Ultimate fallback
  return ASSET_IMAGES.default_real_estate;
};

/**
 * Get asset image with error fallback support
 * @param assetIdentifier - Asset ID, name, or type  
 * @param assetType - Optional asset type for better matching
 * @param fallbackText - Text to show if image fails (e.g., first letter of asset name)
 * @returns Object with image URL and fallback configuration
 */
export const getAssetImageWithFallback = (assetIdentifier: string, assetType?: string, fallbackText?: string) => {
  return {
    imageUrl: getAssetImage(assetIdentifier, assetType),
    fallbackText: fallbackText || assetIdentifier?.charAt(0)?.toUpperCase() || '?',
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
      const parent = target.parentElement;
      if (parent) {
        parent.className = "w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold";
        parent.innerHTML = fallbackText || assetIdentifier?.charAt(0)?.toUpperCase() || '?';
      }
    }
  };
};

/**
 * Asset Image Component Props Helper
 * @param asset - Asset object with id, name, and type
 * @returns Props ready for img element
 */
export const getAssetImageProps = (asset: { id?: string; name: string; type?: string }) => {
  const imageData = getAssetImageWithFallback(asset.id || asset.name, asset.type, asset.name.charAt(0));
  
  return {
    src: imageData.imageUrl,
    alt: asset.name,
    onError: imageData.onError
  };
};