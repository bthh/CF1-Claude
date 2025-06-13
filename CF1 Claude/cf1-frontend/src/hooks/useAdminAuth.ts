import { useState, useEffect, createContext, useContext } from 'react';
import { useCosmJS } from './useCosmJS';

export type AdminRole = 'creator' | 'super_admin' | 'platform_admin' | null;

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
  adminRole: AdminRole;
  checkPermission: (permission: string) => boolean;
  loginAsAdmin: (role: AdminRole) => Promise<void>;
  logoutAdmin: () => void;
  refreshAdminData: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = (): AdminAuthContextType => {
  const { address, isConnected } = useCosmJS();
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Define role permissions
  const rolePermissions: Record<string, string[]> = {
    creator: [
      'view_proposals',
      'edit_proposals', 
      'delete_proposals',
      'manage_tokens',
      'view_analytics',
      'manage_distribution'
    ],
    super_admin: [
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
      'financial_reports'
    ],
    platform_admin: [
      'manage_users',
      'view_system_logs',
      'manage_compliance',
      'view_analytics',
      'moderate_content',
      'manage_support_tickets',
      'view_audit_logs'
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

  const loginAsAdmin = async (role: AdminRole): Promise<void> => {
    if (!isConnected || !address) {
      throw new Error('Wallet must be connected');
    }

    setLoading(true);
    try {
      // Simulate API call to verify admin privileges
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In demo mode, allow any connected wallet to assume admin role
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
      
      // Store in localStorage for persistence
      localStorage.setItem('cf1_admin_session', JSON.stringify(adminUser));
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = (): void => {
    setCurrentAdmin(null);
    localStorage.removeItem('cf1_admin_session');
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
      localStorage.setItem('cf1_admin_session', JSON.stringify(updatedAdmin));
    } finally {
      setLoading(false);
    }
  };

  // Load admin session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('cf1_admin_session');
    if (savedSession && isConnected) {
      try {
        const adminData = JSON.parse(savedSession);
        if (adminData.address === address) {
          setCurrentAdmin(adminData);
        } else {
          // Address mismatch, clear session
          localStorage.removeItem('cf1_admin_session');
        }
      } catch {
        localStorage.removeItem('cf1_admin_session');
      }
    }
  }, [address, isConnected]);

  // Clear admin session if wallet disconnected
  useEffect(() => {
    if (!isConnected) {
      setCurrentAdmin(null);
    }
  }, [isConnected]);

  const isAdmin = currentAdmin !== null;
  const isCreatorAdmin = currentAdmin?.role === 'creator';
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const isPlatformAdmin = currentAdmin?.role === 'platform_admin';
  const adminRole = currentAdmin?.role || null;

  return {
    currentAdmin,
    isAdmin,
    isCreatorAdmin,
    isSuperAdmin,
    isPlatformAdmin,
    adminRole,
    checkPermission,
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