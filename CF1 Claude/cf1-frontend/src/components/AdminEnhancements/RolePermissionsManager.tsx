import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Crown, 
  Settings, 
  Check, 
  X,
  Edit,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'content' | 'users' | 'financial' | 'system';
  level: 'read' | 'write' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  permissions: string[];
  userCount?: number;
}

const RolePermissionsManager: React.FC = () => {
  const { checkPermission } = useAdminAuthContext();
  const { success, error, warning } = useNotifications();
  
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // Default permissions available in the system
  const availablePermissions: Permission[] = [
    // Platform Permissions
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'platform', level: 'read' },
    { id: 'view_marketplace', name: 'View Marketplace', description: 'Browse marketplace and assets', category: 'platform', level: 'read' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics and reports', category: 'platform', level: 'read' },
    
    // Content Permissions
    { id: 'create_proposals', name: 'Create Proposals', description: 'Submit new funding proposals', category: 'content', level: 'write' },
    { id: 'edit_proposals', name: 'Edit Proposals', description: 'Modify existing proposals', category: 'content', level: 'write' },
    { id: 'delete_proposals', name: 'Delete Proposals', description: 'Remove proposals from platform', category: 'content', level: 'admin' },
    { id: 'approve_proposals', name: 'Approve Proposals', description: 'Review and approve proposals', category: 'content', level: 'admin' },
    
    // User Permissions
    { id: 'invest', name: 'Make Investments', description: 'Participate in funding rounds', category: 'users', level: 'write' },
    { id: 'vote', name: 'Vote on Governance', description: 'Participate in governance voting', category: 'users', level: 'write' },
    { id: 'manage_users', name: 'Manage Users', description: 'View and manage user accounts', category: 'users', level: 'admin' },
    { id: 'view_user_details', name: 'View User Details', description: 'Access detailed user information', category: 'users', level: 'read' },
    
    // Financial Permissions
    { id: 'view_transactions', name: 'View Transactions', description: 'Access transaction history', category: 'financial', level: 'read' },
    { id: 'manage_tokens', name: 'Manage Tokens', description: 'Create and distribute tokens', category: 'financial', level: 'admin' },
    { id: 'manage_distribution', name: 'Manage Distribution', description: 'Handle token distributions', category: 'financial', level: 'admin' },
    { id: 'financial_reports', name: 'Financial Reports', description: 'Generate financial reports', category: 'financial', level: 'admin' },
    
    // System Permissions
    { id: 'manage_platform_config', name: 'Platform Configuration', description: 'Modify platform settings', category: 'system', level: 'admin' },
    { id: 'emergency_controls', name: 'Emergency Controls', description: 'Access emergency system controls', category: 'system', level: 'admin' },
    { id: 'view_system_logs', name: 'System Logs', description: 'Access system audit logs', category: 'system', level: 'read' },
    { id: 'manage_compliance', name: 'Manage Compliance', description: 'Handle compliance and KYC', category: 'system', level: 'admin' },
    { id: 'moderate_content', name: 'Moderate Content', description: 'Review and moderate content', category: 'system', level: 'admin' }
  ];

  // Default roles with their permissions
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'user',
      name: 'Regular User',
      description: 'Standard platform user with basic access',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      isSystem: true,
      userCount: 1245,
      permissions: [
        'view_dashboard',
        'view_marketplace', 
        'invest',
        'vote',
        'view_transactions'
      ]
    },
    {
      id: 'creator',
      name: 'Project Creator',
      description: 'Can create and manage proposals',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      isSystem: true,
      userCount: 89,
      permissions: [
        'view_dashboard',
        'view_marketplace',
        'view_analytics',
        'create_proposals',
        'edit_proposals',
        'invest',
        'vote',
        'view_transactions',
        'manage_tokens',
        'manage_distribution'
      ]
    },
    {
      id: 'platform_admin',
      name: 'Platform Admin',
      description: 'Administrative access to platform management',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      isSystem: true,
      userCount: 5,
      permissions: [
        'view_dashboard',
        'view_marketplace',
        'view_analytics',
        'create_proposals',
        'edit_proposals',
        'approve_proposals',
        'invest',
        'vote',
        'manage_users',
        'view_user_details',
        'view_transactions',
        'manage_tokens',
        'manage_distribution',
        'financial_reports',
        'manage_platform_config',
        'view_system_logs',
        'manage_compliance',
        'moderate_content'
      ]
    },
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access with emergency controls',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      isSystem: true,
      userCount: 2,
      permissions: availablePermissions.map(p => p.id) // All permissions
    }
  ]);

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const [editedPermissions, setEditedPermissions] = useState<string[]>(selectedRoleData?.permissions || []);

  const handleRoleSelect = (roleId: string) => {
    if (isEditing) {
      warning('Please save or cancel your current changes first');
      return;
    }
    setSelectedRole(roleId);
    const role = roles.find(r => r.id === roleId);
    setEditedPermissions(role?.permissions || []);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!isEditing) return;
    
    setEditedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSaveChanges = () => {
    if (!selectedRoleData) return;

    // Check if user has permission to modify this role
    if (selectedRoleData.isSystem && !checkPermission('emergency_controls')) {
      error('You need Super Admin permissions to modify system roles');
      return;
    }

    setRoles(prev => prev.map(role => 
      role.id === selectedRole 
        ? { ...role, permissions: editedPermissions }
        : role
    ));

    setIsEditing(false);
    success(`Role "${selectedRoleData.name}" permissions updated successfully`);
  };

  const handleCancelEdit = () => {
    setEditedPermissions(selectedRoleData?.permissions || []);
    setIsEditing(false);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      error('Role name is required');
      return;
    }

    const newRole: Role = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      name: newRoleName,
      description: newRoleDescription,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      isSystem: false,
      userCount: 0,
      permissions: []
    };

    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole.id);
    setEditedPermissions([]);
    setNewRoleName('');
    setNewRoleDescription('');
    setShowAddRole(false);
    success(`Role "${newRole.name}" created successfully`);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystem) {
      error('Cannot delete system roles');
      return;
    }

    if (!checkPermission('emergency_controls')) {
      error('You need Super Admin permissions to delete roles');
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      if (selectedRole === roleId) {
        setSelectedRole('user');
        setEditedPermissions(roles.find(r => r.id === 'user')?.permissions || []);
      }
      success(`Role "${role.name}" deleted successfully`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'platform': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'content': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'users': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'read': return <Shield className="w-3 h-3 text-blue-600" />;
      case 'write': return <Edit className="w-3 h-3 text-green-600" />;
      case 'admin': return <Crown className="w-3 h-3 text-red-600" />;
      default: return <Shield className="w-3 h-3 text-gray-600" />;
    }
  };

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Role & Permissions Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure user roles and their associated permissions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {checkPermission('emergency_controls') && (
              <button
                onClick={() => setShowAddRole(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">
              Important: Permission changes affect user access immediately
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-1">
              System roles (User, Creator, Platform Admin, Super Admin) are protected and require Super Admin permissions to modify.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Roles
          </h3>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRole === role.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${role.color}`}>
                      {role.name}
                    </span>
                    {role.isSystem && (
                      <Shield className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  
                  {!role.isSystem && checkPermission('emergency_controls') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {role.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{role.permissions.length} permissions</span>
                  {role.userCount !== undefined && (
                    <span>{role.userCount} users</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRoleData?.name} Permissions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRoleData?.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={selectedRoleData?.isSystem && !checkPermission('emergency_controls')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 capitalize flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {permissions.map((permission) => {
                      const isEnabled = isEditing 
                        ? editedPermissions.includes(permission.id)
                        : selectedRoleData?.permissions.includes(permission.id);
                      
                      return (
                        <div
                          key={permission.id}
                          onClick={() => handlePermissionToggle(permission.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isEditing 
                              ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' 
                              : 'cursor-default'
                          } ${
                            isEnabled
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-600'
                            }`}>
                              {isEnabled ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {permission.name}
                                </p>
                                {getLevelIcon(permission.level)}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Role
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Content Moderator"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this role does..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRole(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsManager;