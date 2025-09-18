import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Globe,
  Download,
  RefreshCw,
  Eye,
  FileText,
  MessageSquare,
  Star,
  Settings,
  X,
  Target,
  Vote,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useAdminAuthContext } from '../hooks/useAdminAuth';
import { useUnifiedAuthStore } from '../store/unifiedAuthStore';
import { useNotifications } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/format';
import { adminAPI, type AdminUser, type KycSubmission, type SupportTicketData } from '../lib/api/admin';
import FeatureToggleManager from '../components/AdminEnhancements/FeatureToggleManager';
import RolePermissionsManager from '../components/AdminEnhancements/RolePermissionsManager';
import LaunchpadAdmin from '../components/Admin/LaunchpadAdmin';
import GovernanceAdmin from '../components/Admin/GovernanceAdmin';
import AutoCommunicationsModal from '../components/AutoCommunication/AutoCommunicationsModal';
import { usePlatformConfigStore } from '../store/platformConfigStore';

interface PlatformUser {
  id: string;
  address: string;
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  verificationLevel: 'anonymous' | 'basic' | 'verified' | 'accredited';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  joinedAt: string;
  lastActive: string;
  totalInvestments: number;
  proposalsCreated: number;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  supportTickets: number;
  role?: string;
  permissions?: string[];
  userType?: 'admin' | 'regular';
}

interface ComplianceCase {
  id: string;
  userId: string;
  userName: string;
  type: 'kyc_review' | 'aml_flag' | 'fraud_alert' | 'manual_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  description: string;
  createdAt: string;
  assignedTo?: string;
  evidence?: string[];
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'technical' | 'financial' | 'compliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  lastUpdated: string;
  responses: number;
}

// Platform Configuration Section Component
const PlatformConfigSection: React.FC = () => {
  const { config, updateMaxAPY, getMaxAPY, validateAPY, resetToDefaults } = usePlatformConfigStore();
  const { success, error } = useNotifications();
  const [newMaxAPY, setNewMaxAPY] = useState<string>(() => {
    // Safely initialize with fallback
    return config?.maxAllowedAPY?.toString() || '50';
  });
  const [isEditing, setIsEditing] = useState(false);

  // Sync state with store when config changes
  useEffect(() => {
    if (config?.maxAllowedAPY !== undefined) {
      setNewMaxAPY(config.maxAllowedAPY.toString());
    }
  }, [config?.maxAllowedAPY]);

  const handleSaveAPY = () => {
    const apyValue = parseFloat(newMaxAPY);
    
    if (isNaN(apyValue) || apyValue < 0) {
      error('Please enter a valid APY percentage (0 or higher)');
      return;
    }
    
    if (apyValue > 200) {
      error('APY cannot exceed 200% for platform safety');
      return;
    }
    
    updateMaxAPY(apyValue);
    setIsEditing(false);
    success(`Maximum allowed APY updated to ${apyValue}%`);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all platform settings to defaults? This cannot be undone.')) {
      resetToDefaults();
      // Use fallback value since config might be reset
      setNewMaxAPY('50');
      setIsEditing(false);
      success('Platform settings reset to defaults');
    }
  };

  const handleCancel = () => {
    setNewMaxAPY(config?.maxAllowedAPY?.toString() || '50');
    setIsEditing(false);
  };

  // Safety check - don't render if config is not available
  if (!config) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading platform configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="tabpanel" id="platform-config-panel">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Configuration</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage platform-wide settings and guardrails</p>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Super Admin Access Required</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                These settings affect all users and assets on the platform. Changes should be made carefully and with proper consideration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* APY Guardrail Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">APY Guardrail</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set maximum allowed Expected APY for asset proposals</p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Allowed APY (%)
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="number"
                  value={newMaxAPY}
                  onChange={(e) => setNewMaxAPY(e.target.value)}
                  min="0"
                  max="200"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter maximum APY percentage"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveAPY}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {config.maxAllowedAPY}%
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How This Works</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <span>Asset proposals with Expected APY above this limit will be flagged</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <span>Creators must provide documentation to justify high APY projections</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <span>Helps protect investors from unrealistic return expectations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* APY Validation Test */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Test APY Validation</h4>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              placeholder="Enter APY to test"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-40"
              onBlur={(e) => {
                const testAPY = parseFloat(e.target.value);
                if (!isNaN(testAPY)) {
                  const result = validateAPY(testAPY);
                  if (result.isValid) {
                    success(`APY of ${testAPY}% is within acceptable limits`);
                  } else {
                    error(result.error || 'APY validation failed');
                  }
                }
              }}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Enter a value to test against current limits
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Danger Zone</h3>
            <p className="text-sm text-red-700 dark:text-red-300">Irreversible actions that affect the entire platform</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-200">Reset Platform Settings</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Reset all platform configuration to default values. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PlatformAdmin: React.FC = () => {
  const { 
    currentAdmin, 
    checkPermission, 
    hasAccessToPlatformAdmin, 
    hasAccessToFeatureToggles, 
    hasAccessToSuperAdminManagement 
  } = useAdminAuthContext();
  const { user: unifiedUser, isAuthenticated: isUnifiedAuthenticated, refreshUserData } = useUnifiedAuthStore();
  
  // Get admin role for permissions check
  const adminRole = currentAdmin?.role;
  
  // Combined permission checking for unified auth users
  const combinedCheckPermission = (permission: string) => {
    // Check old admin system first
    if (currentAdmin && checkPermission(permission)) return true;
    
    // Check unified auth system
    if (unifiedUser && isUnifiedAuthenticated) {
      // Super_admin and owner have all permissions
      if (unifiedUser.role === 'super_admin' || unifiedUser.role === 'owner') {
        return true;
      }
      
      // Check if user has the specific permission in their permissions array
      if (unifiedUser.permissions && unifiedUser.permissions.includes(permission)) {
        return true;
      }
      
      // Role-based permission checks for common admin permissions
      if (unifiedUser.role === 'platform_admin') {
        const platformAdminPermissions = [
          'manage_users', 'view_admin_dashboard', 'manage_platform', 
          'view_analytics', 'financial_operations', 'approve_proposals',
          'manage_investments', 'execute_governance'
        ];
        return platformAdminPermissions.includes(permission);
      }
      
      if (unifiedUser.role === 'creator_admin') {
        const creatorAdminPermissions = [
          'view_admin_dashboard', 'view_analytics', 'create_proposals', 
          'edit_proposals', 'create_governance_proposals'
        ];
        return creatorAdminPermissions.includes(permission);
      }
    }
    
    return false;
  };
  
  const combinedHasAccessToFeatureToggles = () => {
    // Check old admin system first
    if (hasAccessToFeatureToggles()) return true;
    
    // Check unified auth system
    return unifiedUser && isUnifiedAuthenticated && 
           (unifiedUser.role === 'super_admin' || unifiedUser.role === 'owner');
  };
  
  const combinedAdminRole = currentAdmin?.role || unifiedUser?.role;
  const { success, error } = useNotifications();
  
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [complianceCases, setComplianceCases] = useState<ComplianceCase[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'roles' | 'features' | 'launchpad' | 'governance' | 'compliance' | 'support' | 'platform-config' | 'notifications' | 'analytics'>('users');
  const [selectedSubTab, setSelectedSubTab] = useState<string>('proposals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [showPlatformAutoCommunicationsModal, setShowPlatformAutoCommunicationsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingUserData, setEditingUserData] = useState<Partial<PlatformUser>>({});

  // Get current admin user from auth store
  const { user: currentAdminUser, accessToken } = useUnifiedAuthStore();

  useEffect(() => {
    loadPlatformData().catch((err) => {
      console.error('Failed to load platform admin data:', err);
      // Note: error notification function would need to be imported/defined here
      setLoading(false);
    });
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      // Use Promise.allSettled to allow partial success - users can load even if other APIs fail
      const results = await Promise.allSettled([
        loadUsers(),
        loadComplianceCases(),
        loadSupportTickets()
      ]);
      
      // Log which operations succeeded/failed
      results.forEach((result, index) => {
        const operationNames = ['loadUsers', 'loadComplianceCases', 'loadSupportTickets'];
        if (result.status === 'rejected') {
          console.warn(`🔍 PlatformAdmin: ${operationNames[index]} failed:`, result.reason);
        } else {
          console.log(`🔍 PlatformAdmin: ${operationNames[index]} succeeded`);
        }
      });
      
    } catch (err) {
      console.error('Error loading platform admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (): Promise<void> => {
    try {
      // Use the unified endpoint that returns both admin and regular users with correct userType
      const response = await adminAPI.getUsers({ limit: 100 });
      
      console.log('🔍 All users loaded from unified endpoint:', response.users.length);
      console.log('🔍 Raw API response users:', response.users.map(u => ({ id: u.id, email: u.email, userType: u.userType })));

      // Process all users and preserve the userType from backend
      const allUsers: PlatformUser[] = response.users.map(user => {
        // The backend already sets userType correctly, so we use it directly
        const isAdmin = user.userType === 'admin';
        
        console.log('🔍 Processing user:', {
          id: user.id,
          email: user.email,
          userType: user.userType,
          isAdmin,
          role: user.role
        });
        
        return {
          id: user.id,
          address: user.walletAddress || `${isAdmin ? 'admin' : 'user'}_${user.username}_${user.id.slice(0, 8)}...`,
          email: user.email,
          name: user.name || user.username || (isAdmin ? 'Admin User' : 'Platform User'),
          phone: user.phoneNumber || undefined,
          country: undefined,
          verificationLevel: isAdmin ? 'verified' : (user.email ? 'basic' : 'anonymous') as 'anonymous' | 'basic' | 'verified' | 'accredited',
          status: user.isActive ? 'active' : 'suspended' as 'active' | 'suspended' | 'banned' | 'pending',
          kycStatus: isAdmin ? 'approved' : (user.kycStatus || 'not_started') as 'not_started' | 'pending' | 'approved' | 'rejected',
          joinedAt: user.createdAt || new Date().toISOString(),
          lastActive: user.lastLoginAt || user.updatedAt || new Date().toISOString(),
          totalInvestments: 0,
          proposalsCreated: 0,
          complianceScore: isAdmin ? 95 : (user.isActive ? 75 : 25),
          riskLevel: (user.role === 'super_admin' || user.role === 'owner' ? 'low' : 'medium') as 'low' | 'medium' | 'high',
          supportTickets: 0,
          role: user.role || 'user',
          permissions: user.permissions || [],
          userType: user.userType || 'regular' // Preserve userType from backend
        };
      });

      console.log('🔍 Total users processed:', allUsers.length, 'User types:', allUsers.map(u => ({ email: u.email, userType: u.userType })));
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      throw error;
    }
  };

  const loadComplianceCases = async (): Promise<void> => {
    try {
      const response = await adminAPI.getKycSubmissions({ limit: 50 });
      
      // Transform KycSubmission to ComplianceCase format for compatibility
      const transformedCases: ComplianceCase[] = response.submissions.map(submission => ({
        id: `case_${submission.id}`,
        userId: submission.id,
        userName: submission.fullName,
        type: 'kyc_review' as const,
        severity: submission.kycStatus === 'rejected' ? 'high' : 
                 submission.kycStatus === 'pending' ? 'medium' : 'low',
        status: submission.kycStatus === 'pending' ? 'in_review' :
               submission.kycStatus === 'verified' ? 'resolved' :
               submission.kycStatus === 'rejected' ? 'escalated' : 'open',
        description: `KYC ${submission.kycStatus === 'pending' ? 'review pending' :
                           submission.kycStatus === 'verified' ? 'approved' : 
                           submission.kycStatus === 'rejected' ? 'rejected - requires attention' : 
                           'awaiting submission'} for ${submission.fullName}`,
        createdAt: submission.submittedAt,
        assignedTo: submission.kycStatus === 'rejected' ? 'Senior Compliance Officer' :
                   submission.kycStatus === 'pending' ? 'Compliance Officer' : undefined,
        evidence: submission.documents.map(doc => doc.name || 'document.pdf')
      }));
      
      setComplianceCases(transformedCases);
    } catch (error) {
      console.error('Failed to load compliance cases:', error);
      // Fallback to empty array on error
      setComplianceCases([]);
      throw error;
    }
  };

  const loadSupportTickets = async (): Promise<void> => {
    try {
      const response = await adminAPI.getSupportTickets({ limit: 50 });
      
      // Transform SupportTicketData to SupportTicket format for compatibility
      const transformedTickets: SupportTicket[] = response.tickets.map(ticket => ({
        id: ticket.id,
        userId: ticket.createdBy,
        userName: ticket.createdByEmail.split('@')[0], // Extract username from email
        subject: ticket.subject,
        category: ticket.category as 'technical' | 'financial' | 'compliance' | 'general',
        priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: ticket.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        description: ticket.description,
        createdAt: ticket.createdAt,
        lastUpdated: ticket.createdAt, // Backend doesn't have lastUpdated yet
        responses: 0 // Backend doesn't track responses yet
      }));
      
      setSupportTickets(transformedTickets);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
      // Fallback to empty array on error
      setSupportTickets([]);
      throw error;
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend' | 'ban' | 'verify') => {
    if (!combinedCheckPermission('manage_users')) {
      error('Insufficient permissions to manage users');
      return;
    }

    try {
      // Find the user to determine correct endpoint
      const user = users.find(u => u.id === userId);
      if (!user) {
        error('User not found');
        return;
      }

      // Map actions to API update data
      const updateData = {
        accountStatus: action === 'activate' ? 'active' : 
                     action === 'suspend' ? 'suspended' : 
                     action === 'ban' ? 'locked' : // Use 'locked' for banned users (backend doesn't support 'banned')
                     action === 'verify' ? 'active' : undefined,
        kycStatus: action === 'verify' ? 'approved' : undefined,
        emailVerified: action === 'verify' ? true : undefined
      };

      // Filter out undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // Use the correct endpoint based on user type
      if (user.userType === 'admin') {
        // For admin users, use admin endpoint
        const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`;
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            isActive: action === 'activate',
            ...cleanUpdateData
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update admin user');
        }
      } else {
        // For regular users, use the correct status endpoint
        const endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/regular/${userId}/status`;
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify(cleanUpdateData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update regular user status');
        }
      }
      
      // Update local state to reflect changes
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: (action === 'ban' ? 'banned' : 
                      updateData.accountStatus === 'locked' ? 'banned' :
                      updateData.accountStatus || u.status) as 'active' | 'suspended' | 'banned' | 'pending',
              kycStatus: updateData.kycStatus === 'approved' ? 'approved' : u.kycStatus,
              verificationLevel: action === 'verify' ? 'verified' : u.verificationLevel
            }
          : u
      ));

      // If the status change is for the currently logged-in user, refresh their session data
      if (unifiedUser && isUnifiedAuthenticated && unifiedUser.id === userId) {
        console.log(`🔄 Status changed for current user (${action}), refreshing session data...`);
        try {
          await refreshUserData();
          console.log('✅ User session data refreshed successfully after status change');
        } catch (refreshError) {
          console.error('❌ Failed to refresh user session data:', refreshError);
          // Don't show error to user as the status change was successful
        }
      }
      
      success(`User ${action}${action.endsWith('e') ? 'd' : action.endsWith('y') ? 'ied' : 'ned'} successfully`);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      error(`Failed to ${action} user`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!combinedCheckPermission('manage_users')) {
      error('Insufficient permissions to change user roles');
      return;
    }

    try {
      // Determine the correct endpoint based on user type
      const user = users.find(u => u.id === userId);
      if (!user) {
        error('User not found');
        return;
      }

      console.log(`🔍 Role change debug - User ID: ${userId}, UserType: ${user.userType}, Email: ${user.email}`);
      
      // Try regular user endpoint first (most users are regular users)
      let endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/regular/${userId}`;
      let response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      // If regular user endpoint fails with 404, try admin endpoint
      if (!response.ok && response.status === 404) {
        console.log(`🔍 Regular user endpoint failed, trying admin endpoint for user ${userId}`);
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`;
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({ role: newRole }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update user role via ${endpoint.includes('/regular/') ? 'regular' : 'admin'} endpoint`);
      }

      // Update local state to reflect the role change
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      // Always refresh user session data for any role change (in case changed user is logged in elsewhere)
      console.log('🔄 Role change successful, refreshing all user session data...');
      try {
        await refreshUserData();
        console.log('✅ User session data refreshed successfully after role change');
      } catch (refreshError) {
        console.error('❌ Failed to refresh user session data:', refreshError);
        // Don't show error to user as the role change was successful
      }
      
      // Show additional message if this was the current user
      if (unifiedUser && isUnifiedAuthenticated && unifiedUser.id === userId) {
        success(`Your role has been updated! The changes will be reflected immediately.`);
      }

      success(`User role updated to ${newRole === 'super_admin' ? 'Super Admin' : newRole === 'platform_admin' ? 'Platform Admin' : newRole === 'creator_admin' ? 'Creator Admin' : newRole === 'investor' ? 'Investor' : 'User'} successfully`);
    } catch (err) {
      console.error('Failed to update user role:', err);
      error(`Failed to update user role: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleComplianceAction = async (caseId: string, action: 'approve' | 'reject' | 'escalate') => {
    try {
      // Extract the actual user ID from the case ID (remove 'case_' prefix)
      const userId = caseId.replace('case_', '');
      
      const updateData = {
        status: action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'pending',
        notes: action === 'escalate' ? 'Case escalated for further review' : 
              action === 'reject' ? 'KYC documents rejected' :
              'KYC approved'
      };

      await adminAPI.updateKycStatus(userId, updateData);
      
      // Update local state to reflect changes
      setComplianceCases(prev => prev.map(case_ => 
        case_.id === caseId 
          ? { 
              ...case_, 
              status: action === 'approve' ? 'resolved' : action === 'reject' ? 'resolved' : 'escalated'
            }
          : case_
      ));
      
      success(`Compliance case ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully`);
    } catch (err) {
      console.error(`Failed to ${action} compliance case:`, err);
      error(`Failed to ${action} compliance case`);
    }
  };

  const handleTicketAction = async (ticketId: string, action: 'assign' | 'resolve' | 'close') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSupportTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: action === 'assign' ? 'in_progress' : action === 'resolve' ? 'resolved' : 'closed',
              lastUpdated: new Date().toISOString()
            }
          : ticket
      ));
      
      success(`Support ticket ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully`);
    } catch (err) {
      error(`Failed to ${action} support ticket`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'locked': case 'banned': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending': case 'pending_verification': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'open': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'in_progress': case 'in_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'resolved': case 'closed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'escalated': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      user.status === statusFilter ||
      (statusFilter === 'banned' && (user.status === 'locked' || user.status === 'banned')) ||
      (statusFilter === 'locked' && (user.status === 'locked' || user.status === 'banned'));
    
    return matchesSearch && matchesStatus;
  });

  // Combined access check for both old admin system and unified auth system
  const hasOldAdminAccess = currentAdmin && hasAccessToPlatformAdmin();
  const hasUnifiedAdminAccess = unifiedUser && isUnifiedAuthenticated && 
    (unifiedUser.role === 'super_admin' || unifiedUser.role === 'owner');
  
  if (!hasOldAdminAccess && !hasUnifiedAdminAccess) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Admin Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have sufficient permissions to access the Platform Admin panel.
            {currentAdmin?.role === 'creator' && (
              <><br />Try accessing the Creator Admin panel instead.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Platform Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              User management, compliance monitoring, and support operations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadPlatformData}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="flex flex-wrap gap-2" role="tablist">
            {[
              { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, count: users.length, color: 'gray', permission: 'manage_users' },
              { id: 'roles', label: 'Roles & Permissions', icon: <Shield className="w-4 h-4" />, color: 'gray', permission: 'manage_user_roles' },
              { id: 'features', label: 'Feature Toggles', icon: <Settings className="w-4 h-4" />, color: 'gray', requiresFeatureToggleAccess: true },
              { id: 'launchpad', label: 'Launchpad', icon: <Target className="w-4 h-4" />, color: 'gray', permission: 'manage_launchpad_proposals' },
              { id: 'governance', label: 'Governance', icon: <Vote className="w-4 h-4" />, color: 'gray', permission: 'manage_governance_proposals' },
              { id: 'compliance', label: 'Compliance', icon: <AlertCircle className="w-4 h-4" />, count: complianceCases.filter(c => c.status !== 'resolved').length, color: 'gray', permission: 'manage_compliance' },
              { id: 'support', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" />, count: supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length, color: 'gray', permission: 'manage_support_tickets' },
              { id: 'platform-config', label: 'Platform Settings', icon: <Settings className="w-4 h-4" />, color: 'gray', requiresSuperAdmin: true },
              { id: 'notifications', label: 'Auto Communications', icon: <Mail className="w-4 h-4" />, color: 'gray', requiresSuperAdmin: true },
              { id: 'analytics', label: 'Analytics', icon: <FileText className="w-4 h-4" />, color: 'gray', permission: 'view_analytics' }
            ].filter((tab) => {
              // Role-based tab filtering using combined functions
              if (tab.requiresFeatureToggleAccess) {
                return combinedHasAccessToFeatureToggles();
              }
              if (tab.requiresSuperAdmin) {
                return combinedAdminRole === 'super_admin' || combinedAdminRole === 'owner';
              }
              if (tab.permission) {
                return combinedCheckPermission(tab.permission);
              }
              return true; // Show tab if no specific permission required
            }).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                role="tab"
                aria-selected={selectedTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                  selectedTab === tab.id
                    ? 'bg-gray-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  selectedTab === tab.id
                    ? 'bg-white/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {tab.icon}
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                    selectedTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && selectedTab !== tab.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading platform data...</span>
        </div>
      ) : (
        <>
          {/* Users Tab - Real Data Implementation */}
          
          {selectedTab === 'roles' && (() => {
            try {
              console.log('Rendering RolePermissionsManager component');
              return <RolePermissionsManager />;
            } catch (error) {
              console.error('RolePermissionsManager error:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Roles & Permissions Error</h3>
                    <p className="text-gray-600 dark:text-gray-400">Failed to load roles management interface.</p>
                  </div>
                </div>
              );
            }
          })()}
          
          {selectedTab === 'features' && (() => {
            try {
              console.log('Rendering FeatureToggleManager component');
              return <FeatureToggleManager />;
            } catch (error) {
              console.error('FeatureToggleManager error:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feature Toggles Error</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load feature toggle interface.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Error: {error?.message}</p>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Launchpad Tab */}
          {selectedTab === 'launchpad' && (() => {
            try {
              console.log('Rendering LaunchpadAdmin component');
              return (
                <LaunchpadAdmin 
                  selectedSubTab={selectedSubTab} 
                  setSelectedSubTab={setSelectedSubTab} 
                />
              );
            } catch (error) {
              console.error('LaunchpadAdmin error:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Target className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Launchpad Admin Error</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load launchpad management interface.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Error: {error?.message}</p>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Governance Tab */}
          {selectedTab === 'governance' && (() => {
            try {
              console.log('Rendering GovernanceAdmin component');
              return (
                <GovernanceAdmin 
                  selectedSubTab={selectedSubTab} 
                  setSelectedSubTab={setSelectedSubTab} 
                />
              );
            } catch (error) {
              console.error('GovernanceAdmin error:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Vote className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Governance Admin Error</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load governance management interface.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Error: {error?.message}</p>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Platform Configuration Tab */}
          {selectedTab === 'platform-config' && (() => {
            try {
              console.log('Rendering PlatformConfigSection component');
              return <PlatformConfigSection />;
            } catch (error) {
              console.error('PlatformConfigSection error:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Platform Settings Error</h3>
                    <p className="text-gray-600 dark:text-gray-400">Failed to load platform configuration interface.</p>
                  </div>
                </div>
              );
            }
          })()}

          {/* Auto Communications Tab */}
          {selectedTab === 'notifications' && (() => {
            try {
              return (
                <div className="space-y-6" role="tabpanel" id="notifications-panel">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Platform Auto-Communications
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Configure default auto-communication templates for all creators
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          try {
                            setShowPlatformAutoCommunicationsModal(true);
                          } catch (error) {
                            console.error('Error opening modal:', error);
                            error('Failed to open auto-communications modal');
                          }
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage Platform Defaults</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Time-Based Alerts</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Deadline notifications</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">7 Days Before</span>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">48 Hours Before</span>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">6 Hours Final</span>
                            <span className="text-gray-400 font-medium">Disabled</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Milestone Alerts</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Funding progress</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">75% Funded</span>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">90% Funded</span>
                            <span className="text-gray-400 font-medium">Disabled</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Goal Reached</span>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Channel Settings</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery preferences</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Email</span>
                            <span className="text-green-600 font-medium">Enabled</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">In-App</span>
                            <span className="text-green-600 font-medium">Enabled</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">SMS</span>
                            <span className="text-slate-600 font-medium">Optional</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                            Platform Default Templates
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            These templates serve as defaults for all creators. Creators can view and customize 
                            these defaults for their specific assets. Changes here will affect all new proposals 
                            and existing proposals that haven't been customized by their creators.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering Auto Communication tab:', error);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Auto Communication Error
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      There was an error loading the auto-communication settings.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reload Page</span>
                    </button>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Remove the hidden duplicate user management section */}
          {selectedTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="locked">Banned</option>
                      <option value="pending">Pending</option>
                      <option value="pending_verification">Pending Verification</option>
                    </select>
                    
                    <button className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.name || 'Anonymous User'}
                              </h3>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status === 'locked' ? 'Banned' : 
                                 user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.kycStatus)}`}>
                                KYC: {user.kycStatus ? user.kycStatus.replace('_', ' ').charAt(0).toUpperCase() + user.kycStatus.replace('_', ' ').slice(1) : 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{user.address.slice(0, 12)}...{user.address.slice(-6)}</span>
                              {user.email && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{user.email}</span>
                                  </span>
                                </>
                              )}
                              {user.country && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center space-x-1">
                                    <Globe className="w-3 h-3" />
                                    <span>{user.country}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verification</p>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                              {user.verificationLevel.replace('_', ' ')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Investments</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${user.totalInvestments.toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Compliance Score</p>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.complianceScore}
                              </p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < Math.floor(user.complianceScore / 20) ? 'text-blue-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
                            <p className={`font-semibold ${getRiskColor(user.riskLevel)}`}>
                              {user.riskLevel ? user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1) : 'Unknown'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatTimeAgo(user.lastActive)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditingUserData({
                              name: user.name,
                              email: user.email,
                              phone: user.phone,
                              role: user.role
                            });
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {user.status === 'active' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/20 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(user.kycStatus === 'pending' || user.kycStatus === 'not_started' || user.status === 'pending') && (
                          <button
                            onClick={() => handleUserAction(user.id, 'verify')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approve User/KYC"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.status !== 'locked' && user.status !== 'banned' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to ban ${user.name || user.email}? This will prevent them from accessing the platform.`)) {
                                handleUserAction(user.id, 'ban');
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(user.status === 'locked' || user.status === 'banned') && (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Unban User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Edit User Modal */}
                    {editingUser === user.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Edit User Details
                            </h3>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditingUserData({});
                              }}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                              </label>
                              <input
                                type="text"
                                value={editingUserData.name || ''}
                                onChange={(e) => setEditingUserData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                              </label>
                              <input
                                type="email"
                                value={editingUserData.email || ''}
                                onChange={(e) => setEditingUserData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={editingUserData.phone || ''}
                                onChange={(e) => setEditingUserData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            {(hasOldAdminAccess || hasUnifiedAdminAccess || currentAdminUser || unifiedUser) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Role
                                </label>
                                <select
                                  value={editingUserData.role || user.role || 'investor'}
                                  onChange={(e) => setEditingUserData(prev => ({ ...prev, role: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="investor">Investor</option>
                                  <option value="creator_admin">Creator Admin</option>
                                  <option value="platform_admin">Platform Admin</option>
                                  <option value="super_admin">Super Admin</option>
                                </select>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3 mt-6">
                            <button
                              onClick={async () => {
                                try {
                                  if (!combinedCheckPermission('manage_users')) {
                                    error('Insufficient permissions to edit users');
                                    return;
                                  }

                                  // Handle role change separately if role was changed
                                  const roleChanged = editingUserData.role && editingUserData.role !== user.role;
                                  if (roleChanged) {
                                    await handleRoleChange(user.id, editingUserData.role!);
                                    // Remove role from the general update data
                                    const { role, ...otherData } = editingUserData;
                                    
                                    if (Object.keys(otherData).length > 0) {
                                      // Update other fields if any - try regular endpoint first
                                      let endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/regular/${user.id}`;
                                      let response = await fetch(endpoint, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${accessToken}`,
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify(otherData),
                                      });

                                      // If regular user endpoint fails with 404, try admin endpoint
                                      if (!response.ok && response.status === 404) {
                                        endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${user.id}`;
                                        response = await fetch(endpoint, {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${accessToken}`,
                                          },
                                          credentials: 'include',
                                          body: JSON.stringify(otherData),
                                        });
                                      }

                                      if (!response.ok) {
                                        const errorData = await response.json().catch(() => ({}));
                                        throw new Error(errorData.error || 'Failed to update user data');
                                      }
                                      
                                      // Update local state for other fields
                                      setUsers(prev => prev.map(u => 
                                        u.id === user.id ? { ...u, ...otherData } : u
                                      ));
                                    }
                                  } else {
                                    // No role change, update normally - try regular endpoint first
                                    let endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/regular/${user.id}`;
                                    let response = await fetch(endpoint, {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`,
                                      },
                                      credentials: 'include',
                                      body: JSON.stringify(editingUserData),
                                    });

                                    // If regular user endpoint fails with 404, try admin endpoint
                                    if (!response.ok && response.status === 404) {
                                      endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${user.id}`;
                                      response = await fetch(endpoint, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${accessToken}`,
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify(editingUserData),
                                      });
                                    }

                                    if (!response.ok) {
                                      const errorData = await response.json().catch(() => ({}));
                                      throw new Error(errorData.error || 'Failed to update user');
                                    }

                                    // Update local state
                                    setUsers(prev => prev.map(u => 
                                      u.id === user.id ? { ...u, ...editingUserData } : u
                                    ));
                                  }
                                  
                                  setEditingUser(null);
                                  setEditingUserData({});
                                  success('User updated successfully');
                                } catch (err) {
                                  console.error('Failed to update user:', err);
                                  error(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save Changes
                            </button>
                            
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditingUserData({});
                              }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* User Details Expansion */}
                    {showUserDetails === user.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              {user.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">{user.phone}</span>
                                </div>
                              )}
                              {user.country && (
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">{user.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="text-gray-700 dark:text-gray-300">Proposals Created: {user.proposalsCreated}</div>
                              <div className="text-gray-700 dark:text-gray-300">Support Tickets: {user.supportTickets}</div>
                              <div className="text-gray-700 dark:text-gray-300">Member Since: {new Date(user.joinedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Compliance & Permissions</h4>
                            <div className="space-y-2 text-sm">
                              <div className="text-gray-700 dark:text-gray-300">Verification Level: {user.verificationLevel}</div>
                              <div className="text-gray-700 dark:text-gray-300">KYC Status: {user.kycStatus}</div>
                              <div className="text-gray-700 dark:text-gray-300">Risk Assessment: {user.riskLevel}</div>
                              <div className="text-gray-700 dark:text-gray-300">
                                User Level: 
                                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'super_admin' ? 'text-red-600 bg-red-100 dark:bg-red-900/30' :
                                  user.role === 'platform_admin' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' :
                                  user.role === 'creator_admin' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
                                  user.role === 'investor' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' :
                                  'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
                                }`}>
                                  {user.role === 'super_admin' ? 'Super Admin' :
                                   user.role === 'platform_admin' ? 'Platform Admin' :
                                   user.role === 'creator_admin' ? 'Creator Admin' :
                                   user.role === 'investor' ? 'Investor' :
                                   'None'}
                                </span>
                              </div>
                              {user.permissions && user.permissions.length > 0 && (
                                <div className="text-gray-700 dark:text-gray-300">
                                  Permissions: 
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {user.permissions.map((permission, index) => (
                                      <span 
                                        key={index}
                                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                                      >
                                        {permission}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Debug: Current Admin User Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                          <details className="mb-4">
                            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">Debug: Current Admin Info</summary>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                              <div>Current Admin User Role: {currentAdminUser?.role || 'undefined'}</div>
                              <div>Has manage_users permission: {combinedCheckPermission('manage_users') ? 'Yes' : 'No'}</div>
                              <div>Current Admin Email: {currentAdminUser?.email || 'undefined'}</div>
                              <div>Unified User Role: {unifiedUser?.role || 'undefined'}</div>
                              <div>Is Unified Authenticated: {isUnifiedAuthenticated ? 'Yes' : 'No'}</div>
                            </div>
                          </details>
                        </div>

                        {/* Role Management Section - For Admins */}
                        {(hasOldAdminAccess || hasUnifiedAdminAccess || currentAdminUser || unifiedUser) && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Role Management</h4>
                            <div className="flex items-center space-x-4">
                              <label className="text-sm text-gray-700 dark:text-gray-300">Change User Level:</label>
                              <select
                                value={user.role || 'investor'}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="investor">Investor</option>
                                <option value="creator_admin">Creator Admin</option>
                                <option value="platform_admin">Platform Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Select the appropriate user level for this user's access permissions
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {selectedTab === 'compliance' && (
            <div className="space-y-6" role="tabpanel" id="compliance-panel">
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compliance Cases</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor and manage compliance issues and investigations</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {['open', 'in_review', 'resolved', 'escalated'].map((status) => {
                    const count = complianceCases.filter(c => c.status === status).length;
                    return (
                      <div key={status} className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className={`text-2xl font-bold ${getStatusColor(status).split(' ')[0]}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {status.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {complianceCases.map((case_) => (
                <div key={case_.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            case_.severity === 'critical' ? 'bg-red-500' :
                            case_.severity === 'high' ? 'bg-red-500' :
                            case_.severity === 'medium' ? 'bg-blue-500' :
                            'bg-blue-500'
                          }`} />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {case_.userName}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status ? case_.status.replace('_', ' ').charAt(0).toUpperCase() + case_.status.replace('_', ' ').slice(1) : 'Unknown'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          case_.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          case_.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          case_.severity === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {case_.severity.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {case_.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Type: {case_.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(case_.createdAt)}</span>
                        {case_.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to: {case_.assignedTo}</span>
                          </>
                        )}
                      </div>
                      
                      {case_.evidence && case_.evidence.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Evidence Files:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {case_.evidence.map((file, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded-lg">
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {case_.status === 'open' || case_.status === 'in_review' ? (
                        <>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'escalate')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Escalate
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Case {case_.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Support Tab */}
          {selectedTab === 'support' && (
            <div className="space-y-6" role="tabpanel" id="support-panel">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage user support requests and technical issues</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {['open', 'in_progress', 'resolved', 'closed'].map((status) => {
                    const count = supportTickets.filter(t => t.status === status).length;
                    return (
                      <div key={status} className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className={`text-2xl font-bold ${getStatusColor(status).split(' ')[0]}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {status.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            ticket.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                            ticket.priority === 'high' ? 'bg-red-500' :
                            ticket.priority === 'medium' ? 'bg-blue-500' :
                            'bg-blue-500'
                          }`} />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {ticket.subject}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status ? ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1) : 'Unknown'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        From: {ticket.userName}
                      </p>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Category: {ticket.category}</span>
                        <span>•</span>
                        <span>Created: {formatTimeAgo(ticket.createdAt)}</span>
                        <span>•</span>
                        <span>Updated: {formatTimeAgo(ticket.lastUpdated)}</span>
                        <span>•</span>
                        <span>{ticket.responses} responses</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 lg:ml-4">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleTicketAction(ticket.id, 'assign')}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
                          aria-label={`Assign ticket ${ticket.id}`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Assign</span>
                        </button>
                      )}
                      
                      {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                        <button
                          onClick={() => handleTicketAction(ticket.id, 'resolve')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
                          aria-label={`Resolve ticket ${ticket.id}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Resolve</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleTicketAction(ticket.id, 'close')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-xl hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
                        aria-label={`Close ticket ${ticket.id}`}
                      >
                        <X className="w-4 h-4" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6" role="tabpanel" id="analytics-panel">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Analytics</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overview of platform metrics and user statistics</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {users.filter(u => u.status === 'active').length} active
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">KYC Pending</p>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.kycStatus === 'pending').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open Cases</p>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {complianceCases.filter(c => c.status !== 'resolved').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open Tickets</p>
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  User Status Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['active', 'suspended', 'banned', 'pending'].map((status) => {
                    const count = users.filter(u => u.status === status).length;
                    const percentage = (count / users.length) * 100;
                    
                    return (
                      <div key={status} className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto ${getStatusColor(status)}`}>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {status}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Platform Auto Communications Modal */}
      <AutoCommunicationsModal
        isOpen={showPlatformAutoCommunicationsModal}
        onClose={() => setShowPlatformAutoCommunicationsModal(false)}
        creatorId="platform"
        isCreatorView={false}
      />
    </div>
  );
};

export default PlatformAdmin;