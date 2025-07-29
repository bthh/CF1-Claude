import React, { useState, useEffect, createContext, useContext } from 'react';
import { useCosmJS } from './useCosmJS';
import { useSessionStore } from '../store/sessionStore';
import { SecureSessionStorage, SecurityUtils } from '../utils/secureStorage';

// Production security configuration
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
const DEMO_MODE_ENABLED = process.env.VITE_DEMO_MODE === 'true' && !IS_PRODUCTION;

// Secure session storage functions
const storeSecureSession = async (adminUser: AdminUser, token: string): Promise<void> => {
  try {
    SecureSessionStorage.setAdminSession(adminUser, token);
  } catch (error) {
    console.error('Failed to store secure session:', error);
    throw new Error('Session storage failed');
  }
};

// Get stored token
const getStoredToken = async (): Promise<string | null> => {
  try {
    return SecureSessionStorage.getAdminToken();
  } catch (error) {
    console.error('Failed to retrieve stored token:', error);
    return null;
  }
};

// Get stored session
const getStoredSession = async (): Promise<any | null> => {
  try {
    return SecureSessionStorage.getAdminSession();
  } catch (error) {
    console.error('Failed to retrieve stored session:', error);
    return null;
  }
};

// Clear secure session
const clearSecureSession = (): void => {
  try {
    SecureSessionStorage.clearAdminSession();
  } catch (error) {
    console.error('Failed to clear secure session:', error);
  }
};

// Validate session security
const isSessionValid = (sessionData: any): boolean => {
  if (!sessionData || !SecurityUtils.validateDataIntegrity(sessionData)) {
    return false;
  }
  return true;
};

export type AdminRole = 'creator' | 'super_admin' | 'owner' | null;

export interface AdminUser {
  address: string;
  role: AdminRole;
  permissions: string[];
  name?: string;
  email?: string;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

export interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  isAdmin: boolean;
  isCreatorAdmin: boolean;
  isSuperAdmin: boolean;
  isPlatformAdmin: boolean;
  isOwner: boolean;
  adminRole: AdminRole;
  checkPermission: (permission: string) => boolean;
  hasAccessToCreatorAdmin: () => boolean;
  hasAccessToPlatformAdmin: () => boolean;
  hasAccessToFeatureToggles: () => boolean;
  hasAccessToSuperAdminManagement: () => boolean;
  loginAsAdmin: (role: AdminRole) => Promise<void>;
  logoutAdmin: () => void;
  refreshAdminData: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = (): AdminAuthContextType => {
  const { address, isConnected } = useCosmJS();
  const { selectedRole, isRoleSelected } = useSessionStore();
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Define role permissions with granular access control
  const rolePermissions: Record<string, string[]> = {
    creator: [
      'view_proposals',
      'edit_proposals', 
      'delete_proposals',
      'manage_tokens',
      'view_analytics',
      'manage_distribution',
      'access_creator_admin'
    ],
    super_admin: [
      // Creator permissions
      'view_proposals',
      'edit_proposals',
      'delete_proposals',
      'manage_tokens',
      'view_analytics',
      'manage_distribution',
      'access_creator_admin',
      
      // Platform admin permissions (formerly platform_admin)
      'manage_users',
      'view_system_logs',
      'manage_compliance',
      'moderate_content',
      'manage_support_tickets',
      'view_audit_logs',
      'access_platform_admin',
      'manage_user_roles',
      'view_financial_reports',
      'manage_launchpad_proposals',
      'manage_governance_proposals',
      
      // Super admin exclusive permissions
      'manage_platform_config',
      'emergency_controls',
      'financial_reports',
      'manage_feature_toggles',
      'manage_admin_users',
      'system_maintenance'
    ],
    owner: [
      'view_proposals',
      'edit_proposals',
      'delete_proposals',
      'manage_tokens',
      'view_analytics',
      'manage_distribution',
      'manage_platform_config',
      'manage_users',
      'view_system_logs',
      'manage_compliance',
      'emergency_controls',
      'financial_reports',
      'access_creator_admin',
      'access_platform_admin',
      'manage_feature_toggles',
      'manage_admin_users',
      'manage_super_admins',  // Owner exclusive
      'system_maintenance',
      'platform_ownership',   // Owner exclusive
      'manage_billing',       // Owner exclusive
      'data_export',          // Owner exclusive
      'manage_launchpad_proposals',
      'manage_governance_proposals'
    ]
  };

  // Mock admin users for demo
  const mockAdmins: AdminUser[] = [
    {
      address: address || '',
      role: 'creator',
      permissions: rolePermissions.creator,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      createdAt: '2024-01-15T10:00:00Z',
      lastActive: new Date().toISOString(),
      isActive: true
    },
    {
      address: 'neutron1superadmin123...',
      role: 'super_admin',
      permissions: rolePermissions.super_admin,
      name: 'Bob Chen',
      email: 'bob@cf1platform.com',
      createdAt: '2024-01-01T00:00:00Z',
      lastActive: new Date().toISOString(),
      isActive: true
    }
  ];

  const checkPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    return currentAdmin.permissions.includes(permission);
  };

  const loginAsAdmin = async (role: AdminRole, credentials?: { username: string; password: string }): Promise<void> => {
    console.log('loginAsAdmin - isConnected:', isConnected);
    console.log('loginAsAdmin - address:', address);
    console.log('loginAsAdmin - role:', role);
    console.log('loginAsAdmin - production mode:', IS_PRODUCTION);
    
    if (!isConnected || !address) {
      throw new Error('Wallet must be connected');
    }

    setLoading(true);
    try {
      if (IS_PRODUCTION) {
        // Production authentication - require proper JWT authentication
        if (!credentials) {
          throw new Error('Admin credentials required in production');
        }
        
        const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            walletAddress: address,
            requestedRole: role
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Authentication failed');
        }
        
        const authData = await response.json();
        const adminUser: AdminUser = {
          address,
          role,
          permissions: authData.user.permissions,
          name: authData.user.name || `${role} Admin`,
          email: authData.user.email,
          createdAt: authData.user.createdAt || new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isActive: true
        };
        
        setCurrentAdmin(adminUser);
        
        // Store encrypted session data
        await storeSecureSession(adminUser, authData.token);
        
      } else if (DEMO_MODE_ENABLED) {
        // Demo mode - only in development
        console.warn('⚠️  Demo mode authentication - DEVELOPMENT ONLY');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const permissions = rolePermissions[role!] || [];
        
        const adminUser: AdminUser = {
          address,
          role,
          permissions,
          name: role === 'creator' ? 'Demo Creator' : role === 'super_admin' ? 'Demo Super Admin' : 'Demo Platform Admin',
          email: `${role}@demo.com`,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isActive: true
        };

        setCurrentAdmin(adminUser);
        
        // Store in secure storage (development only)
        await storeSecureSession(adminUser, SecurityUtils.generateSecureId());
        
      } else {
        // Neither production nor demo mode enabled
        throw new Error('Authentication not available. Please configure proper authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      if (IS_PRODUCTION && currentAdmin) {
        // Notify backend of logout
        const token = await getStoredToken();
        if (token) {
          await fetch(`${BACKEND_URL}/api/admin/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentAdmin(null);
      clearSecureSession();
    }
  };

  const refreshAdminData = async (): Promise<void> => {
    if (!currentAdmin) return;
    
    setLoading(true);
    try {
      // Simulate refreshing admin data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAdmin = {
        ...currentAdmin,
        lastActive: new Date().toISOString()
      };
      
      setCurrentAdmin(updatedAdmin);
      await storeSecureSession(updatedAdmin, await getStoredToken() || SecurityUtils.generateSecureId());
    } finally {
      setLoading(false);
    }
  };

  // Auto-set admin based on session role
  useEffect(() => {
    const handleRoleChange = async () => {
      if (isConnected && address && selectedRole && isRoleSelected) {
        // Map session roles to admin roles
        const adminRoleMapping: Record<string, AdminRole> = {
          'creator': 'creator',
          'super_admin': 'super_admin',
          'owner': 'owner' // Owner gets full ownership privileges
        };
        
        const mappedRole = adminRoleMapping[selectedRole];
        if (mappedRole) {
          const adminUser: AdminUser = {
            address,
            role: mappedRole,
            permissions: rolePermissions[mappedRole] || [],
            name: `Test ${selectedRole.replace('_', ' ')}`,
            email: `${selectedRole}@test.com`,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            isActive: true
          };
          setCurrentAdmin(adminUser);
          await storeSecureSession(adminUser, SecurityUtils.generateSecureId());
        } else if (selectedRole === 'investor') {
          // Investor role should clear admin status
          setCurrentAdmin(null);
          clearSecureSession();
        }
      } else if (!isRoleSelected || !selectedRole) {
        // No role selected, clear admin status
        setCurrentAdmin(null);
        clearSecureSession();
      }
    };
    
    handleRoleChange();
  }, [address, isConnected, selectedRole, isRoleSelected]);

  // Load admin session on mount with secure production handling
  useEffect(() => {
    const loadSession = async () => {
      if (!isConnected || isRoleSelected) return;
      
      if (IS_PRODUCTION) {
        // Production - verify JWT token
        const token = await getStoredToken();
        if (token) {
          try {
            const response = await fetch(`${BACKEND_URL}/api/admin/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const authData = await response.json();
              if (authData.user.address === address) {
                const adminUser: AdminUser = {
                  address: authData.user.address,
                  role: authData.user.role,
                  permissions: authData.user.permissions,
                  name: authData.user.name,
                  email: authData.user.email,
                  createdAt: authData.user.createdAt,
                  lastActive: new Date().toISOString(),
                  isActive: true
                };
                setCurrentAdmin(adminUser);
              } else {
                // Address mismatch, clear session
                clearSecureSession();
              }
            } else {
              // Token invalid, clear session
              clearSecureSession();
            }
          } catch (error) {
            console.error('Failed to verify admin session:', error);
            clearSecureSession();
          }
        }
      } else if (DEMO_MODE_ENABLED) {
        // Development with demo mode - load from secure storage
        const savedSession = await getStoredSession();
        if (savedSession && savedSession.user) {
          try {
            const adminData = savedSession.user;
            if (adminData.address === address) {
              setCurrentAdmin(adminData);
            } else {
              // Address mismatch, clear session
              clearSecureSession();
            }
          } catch {
            clearSecureSession();
          }
        }
      }
    };
    
    loadSession();
  }, [address, isConnected, isRoleSelected]);

  // Clear admin session if wallet disconnected
  useEffect(() => {
    if (!isConnected) {
      setCurrentAdmin(null);
    }
  }, [isConnected]);

  // Access control helper functions
  const hasAccessToCreatorAdmin = (): boolean => {
    return checkPermission('access_creator_admin');
  };

  const hasAccessToPlatformAdmin = (): boolean => {
    return checkPermission('access_platform_admin');
  };

  const hasAccessToFeatureToggles = (): boolean => {
    return checkPermission('manage_feature_toggles');
  };

  const hasAccessToSuperAdminManagement = (): boolean => {
    return checkPermission('manage_super_admins');
  };

  const isAdmin = currentAdmin !== null;
  const isCreatorAdmin = currentAdmin?.role === 'creator';
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const isPlatformAdmin = currentAdmin?.role === 'super_admin'; // super_admin is now the Platform Admin
  const isOwner = currentAdmin?.role === 'owner';
  const adminRole = currentAdmin?.role || null;

  return {
    currentAdmin,
    isAdmin,
    isCreatorAdmin,
    isSuperAdmin,
    isPlatformAdmin,
    isOwner,
    adminRole,
    checkPermission,
    hasAccessToCreatorAdmin,
    hasAccessToPlatformAdmin,
    hasAccessToFeatureToggles,
    hasAccessToSuperAdminManagement,
    loginAsAdmin,
    logoutAdmin,
    refreshAdminData,
    loading
  };
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authValue = useAdminAuth();
  return (
    <AdminAuthContext.Provider value={authValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuthContext must be used within AdminAuthProvider');
  }
  return context;
};