/**
 * CF1 Backend - Feature Toggle Routes
 * API endpoints for persistent feature toggle management
 */

import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { FeatureToggle } from '../models/FeatureToggle';
import { requireAdmin, requirePermission, AdminAuthenticatedRequest } from '../middleware/adminAuth';

const router = Router();

// Default feature toggles to seed database
const defaultFeatures = [
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Enable marketplace tab and asset browsing',
    enabled: false,
    category: 'general',
    requiredRole: 'platform_admin'
  },
  {
    id: 'analytics',
    name: 'Analytics', 
    description: 'Enable analytics dashboard and reports',
    enabled: false,
    category: 'general',
    requiredRole: 'platform_admin'
  },
  {
    id: 'secondary_trading',
    name: 'Secondary Trading',
    description: 'Enable secondary market trading',
    enabled: true,
    category: 'trading',
    requiredRole: 'platform_admin'
  },
  {
    id: 'governance',
    name: 'Governance',
    description: 'Enable governance proposals and voting',
    enabled: true,
    category: 'governance',
    requiredRole: 'super_admin'
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    description: 'Enable new project launches',
    enabled: true,
    category: 'launchpad',
    requiredRole: 'super_admin'
  },
  {
    id: 'kyc_required',
    name: 'KYC Required',
    description: 'Require KYC verification for all investments',
    enabled: true,
    category: 'general',
    requiredRole: 'super_admin'
  },
  {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Enable maintenance mode (read-only access)',
    enabled: false,
    category: 'general',
    requiredRole: 'super_admin'
  },
  {
    id: 'dashboard_v2',
    name: 'Dashboard V2',
    description: 'Enable new role-based dashboard variants',
    enabled: true,
    category: 'general',
    requiredRole: 'platform_admin'
  },
  {
    id: 'dashboard_platform_highlights',
    name: 'Platform Highlights',
    description: 'Show platform highlights section on dashboard',
    enabled: true,
    category: 'dashboard',
    requiredRole: 'platform_admin'
  },
  {
    id: 'dashboard_featured_opportunities',
    name: 'Featured Investment Opportunities',
    description: 'Show featured investment opportunities section on dashboard',
    enabled: true,
    category: 'dashboard',
    requiredRole: 'platform_admin'
  },
  {
    id: 'portfolio_performance',
    name: 'Portfolio Performance Tab',
    description: 'Show performance analytics tab in portfolio sections',
    enabled: true,
    category: 'portfolio',
    requiredRole: 'platform_admin'
  }
];

// Initialize default features if database is empty
const initializeDefaultFeatures = async () => {
  const repository = AppDataSource.getRepository(FeatureToggle);
  const count = await repository.count();
  
  if (count === 0) {
    console.log('🔧 Initializing default feature toggles...');
    await repository.save(defaultFeatures.map(feature => ({
      ...feature,
      createdAt: new Date(),
      lastModified: new Date()
    })));
    console.log('✅ Default feature toggles initialized');
  }
};

// GET /api/feature-toggles - Get all feature toggles (public endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    await initializeDefaultFeatures();
    
    const repository = AppDataSource.getRepository(FeatureToggle);
    const features = await repository.find();
    
    // Convert to the format expected by frontend
    const featuresMap = features.reduce((acc, feature) => {
      acc[feature.id] = {
        id: feature.id,
        name: feature.name,
        description: feature.description,
        enabled: feature.enabled,
        category: feature.category,
        requiredRole: feature.requiredRole,
        lastModified: feature.lastModified.toISOString(),
        modifiedBy: feature.modifiedBy
      };
      return acc;
    }, {} as Record<string, any>);
    
    res.json({ features: featuresMap });
  } catch (error) {
    console.error('Error fetching feature toggles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feature toggles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/feature-toggles/:id - Update feature toggle
router.put('/:id', 
  requireAdmin,
  requirePermission('admin'),
  async (req: AdminAuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { enabled, modifiedBy } = req.body;
      
      const repository = AppDataSource.getRepository(FeatureToggle);
      const feature = await repository.findOne({ where: { id } });
      
      if (!feature) {
        return res.status(404).json({ error: 'Feature toggle not found' });
      }
      
      // All authenticated admins can toggle features for now
      // TODO: Add more granular role-based permissions
      
      feature.enabled = enabled;
      feature.modifiedBy = modifiedBy || req.adminUser?.username || 'unknown';
      feature.lastModified = new Date();
      
      await repository.save(feature);
      
      res.json({ 
        success: true, 
        feature: {
          id: feature.id,
          name: feature.name,
          description: feature.description,
          enabled: feature.enabled,
          category: feature.category,
          requiredRole: feature.requiredRole,
          lastModified: feature.lastModified.toISOString(),
          modifiedBy: feature.modifiedBy
        }
      });
    } catch (error) {
      console.error('Error updating feature toggle:', error);
      res.status(500).json({ 
        error: 'Failed to update feature toggle',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// POST /api/feature-toggles/reset - Reset all features to defaults
router.post('/reset',
  requireAdmin,
  requirePermission('admin'),
  async (_req: AdminAuthenticatedRequest, res: Response) => {
    try {
      const repository = AppDataSource.getRepository(FeatureToggle);
      
      // Delete all existing features
      await repository.clear();
      
      // Re-initialize defaults
      await initializeDefaultFeatures();
      
      // Fetch and return new features
      const features = await repository.find();
      const featuresMap = features.reduce((acc, feature) => {
        acc[feature.id] = {
          id: feature.id,
          name: feature.name,
          description: feature.description,
          enabled: feature.enabled,
          category: feature.category,
          requiredRole: feature.requiredRole,
          lastModified: feature.lastModified.toISOString(),
          modifiedBy: feature.modifiedBy
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json({ 
        success: true, 
        message: 'Feature toggles reset to defaults',
        features: featuresMap 
      });
    } catch (error) {
      console.error('Error resetting feature toggles:', error);
      res.status(500).json({ 
        error: 'Failed to reset feature toggles',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;