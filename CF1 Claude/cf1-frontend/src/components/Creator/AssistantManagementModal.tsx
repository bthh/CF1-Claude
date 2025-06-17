import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Shield, User, Mail, Key, Search, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface AssistantManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  assets: Array<{ id: string; name: string; type: string }>;
}

interface CreatorAssistant {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  invitedAt: string;
  lastActive?: string;
  permissions: {
    // Asset Management
    canViewAssets: boolean;
    canEditAssets: boolean;
    canPublishUpdates: boolean;
    
    // Shareholder Management
    canViewShareholders: boolean;
    canManageTiers: boolean;
    canViewEngagements: boolean;
    canRespondToEngagements: boolean;
    
    // Communication
    canCreateCampaigns: boolean;
    canSendCampaigns: boolean;
    canViewCampaignAnalytics: boolean;
    
    // Analytics
    canViewAnalytics: boolean;
    canExportData: boolean;
  };
  assetAccess: string[]; // Array of asset IDs they can access
}

interface InviteAssistantData {
  email: string;
  name: string;
  role: string;
  permissions: CreatorAssistant['permissions'];
  assetAccess: string[];
  message?: string;
}

const DEFAULT_PERMISSIONS: CreatorAssistant['permissions'] = {
  canViewAssets: false,
  canEditAssets: false,
  canPublishUpdates: false,
  canViewShareholders: false,
  canManageTiers: false,
  canViewEngagements: false,
  canRespondToEngagements: false,
  canCreateCampaigns: false,
  canSendCampaigns: false,
  canViewCampaignAnalytics: false,
  canViewAnalytics: false,
  canExportData: false
};

const ROLE_TEMPLATES = {
  'Asset Manager': {
    canViewAssets: true,
    canEditAssets: true,
    canPublishUpdates: true,
    canViewShareholders: true,
    canViewEngagements: true,
    canRespondToEngagements: true,
    canViewAnalytics: true,
    canExportData: false,
    canManageTiers: false,
    canCreateCampaigns: false,
    canSendCampaigns: false,
    canViewCampaignAnalytics: false
  },
  'Communications Manager': {
    canViewShareholders: true,
    canViewEngagements: true,
    canRespondToEngagements: true,
    canCreateCampaigns: true,
    canSendCampaigns: true,
    canViewCampaignAnalytics: true,
    canViewAnalytics: true,
    canViewAssets: true,
    canEditAssets: false,
    canPublishUpdates: false,
    canManageTiers: false,
    canExportData: false
  },
  'Customer Support': {
    canViewShareholders: true,
    canViewEngagements: true,
    canRespondToEngagements: true,
    canViewAssets: true,
    canViewAnalytics: false,
    canEditAssets: false,
    canPublishUpdates: false,
    canManageTiers: false,
    canCreateCampaigns: false,
    canSendCampaigns: false,
    canViewCampaignAnalytics: false,
    canExportData: false
  },
  'Analyst': {
    canViewAssets: true,
    canViewShareholders: true,
    canViewEngagements: true,
    canViewAnalytics: true,
    canViewCampaignAnalytics: true,
    canExportData: true,
    canEditAssets: false,
    canPublishUpdates: false,
    canManageTiers: false,
    canRespondToEngagements: false,
    canCreateCampaigns: false,
    canSendCampaigns: false
  },
  'Custom': DEFAULT_PERMISSIONS
};

export const AssistantManagementModal: React.FC<AssistantManagementModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  assets
}) => {
  const { success, error } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [assistants, setAssistants] = useState<CreatorAssistant[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<CreatorAssistant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inviteData, setInviteData] = useState<InviteAssistantData>({
    email: '',
    name: '',
    role: 'Asset Manager',
    permissions: { ...ROLE_TEMPLATES['Asset Manager'] },
    assetAccess: [],
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadAssistants();
    }
  }, [isOpen]);

  const loadAssistants = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAssistants: CreatorAssistant[] = [
        {
          id: 'assist_1',
          email: 'sarah.manager@example.com',
          name: 'Sarah Johnson',
          role: 'Asset Manager',
          status: 'ACTIVE',
          invitedAt: '2024-11-01T10:00:00Z',
          lastActive: '2024-12-05T14:30:00Z',
          permissions: { ...ROLE_TEMPLATES['Asset Manager'] },
          assetAccess: ['asset_solar_1', 'asset_wind_1']
        },
        {
          id: 'assist_2',
          email: 'mike.comms@example.com',
          name: 'Mike Wilson',
          role: 'Communications Manager',
          status: 'ACTIVE',
          invitedAt: '2024-11-15T09:00:00Z',
          lastActive: '2024-12-04T16:45:00Z',
          permissions: { ...ROLE_TEMPLATES['Communications Manager'] },
          assetAccess: assets.map(a => a.id)
        },
        {
          id: 'assist_3',
          email: 'anna.support@example.com',
          name: 'Anna Davis',
          role: 'Customer Support',
          status: 'PENDING',
          invitedAt: '2024-12-01T11:30:00Z',
          permissions: { ...ROLE_TEMPLATES['Customer Support'] },
          assetAccess: ['asset_solar_1']
        }
      ];
      
      setAssistants(mockAssistants);
    } catch (err) {
      error('Failed to load assistants');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAssistant = async () => {
    if (!inviteData.email || !inviteData.name) {
      error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // POST /api/creator-toolkit/assistants/invite
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      success('Assistant invitation sent successfully');
      setShowInviteForm(false);
      setInviteData({
        email: '',
        name: '',
        role: 'Asset Manager',
        permissions: { ...ROLE_TEMPLATES['Asset Manager'] },
        assetAccess: [],
        message: ''
      });
      await loadAssistants();
    } catch (err) {
      error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (assistantId: string, newPermissions: CreatorAssistant['permissions'], newAssetAccess: string[]) => {
    setLoading(true);
    try {
      // PUT /api/creator-toolkit/assistants/:id/permissions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Assistant permissions updated successfully');
      setEditingAssistant(null);
      await loadAssistants();
    } catch (err) {
      error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssistant = async (assistantId: string) => {
    if (!confirm('Are you sure you want to remove this assistant? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // DELETE /api/creator-toolkit/assistants/:id
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Assistant removed successfully');
      await loadAssistants();
    } catch (err) {
      error('Failed to remove assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setInviteData(prev => ({
      ...prev,
      role,
      permissions: { ...ROLE_TEMPLATES[role as keyof typeof ROLE_TEMPLATES] }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'SUSPENDED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPermissionCount = (permissions: CreatorAssistant['permissions']) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assistant Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage team members and their permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Assistant</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading assistants...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssistants.map((assistant) => (
                <div key={assistant.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {assistant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assistant.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {assistant.email}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assistant.status)}`}>
                          {assistant.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                          <p className="font-medium text-gray-900 dark:text-white">{assistant.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Permissions</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getPermissionCount(assistant.permissions)} granted
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Asset Access</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {assistant.assetAccess.length} assets
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>Invited: {new Date(assistant.invitedAt).toLocaleDateString()}</span>
                        {assistant.lastActive && (
                          <span className="ml-4">
                            Last active: {new Date(assistant.lastActive).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingAssistant(assistant)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAssistant(assistant.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Assistant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAssistants.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No assistants found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm ? 'No assistants match your search.' : 'Get started by inviting your first assistant.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Invite Assistant
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Assistant Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Invite Assistant</h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="assistant@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={inviteData.name}
                    onChange={(e) => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Template
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.keys(ROLE_TEMPLATES).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Asset Access
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {assets.map((asset) => (
                    <label key={asset.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={inviteData.assetAccess.includes(asset.id)}
                        onChange={(e) => {
                          const newAccess = e.target.checked
                            ? [...inviteData.assetAccess, asset.id]
                            : inviteData.assetAccess.filter(id => id !== asset.id);
                          setInviteData(prev => ({ ...prev, assetAccess: newAccess }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {asset.name} ({asset.type})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a personal message to the invitation..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteAssistant}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Permissions - {editingAssistant.name}
              </h3>
              <button
                onClick={() => setEditingAssistant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Asset Management
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'canViewAssets', label: 'View Assets' },
                      { key: 'canEditAssets', label: 'Edit Assets' },
                      { key: 'canPublishUpdates', label: 'Publish Updates' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingAssistant.permissions[key as keyof typeof editingAssistant.permissions]}
                          onChange={(e) => setEditingAssistant(prev => prev ? {
                            ...prev,
                            permissions: { ...prev.permissions, [key]: e.target.checked }
                          } : null)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Communications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'canCreateCampaigns', label: 'Create Campaigns' },
                      { key: 'canSendCampaigns', label: 'Send Campaigns' },
                      { key: 'canViewCampaignAnalytics', label: 'View Campaign Analytics' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingAssistant.permissions[key as keyof typeof editingAssistant.permissions]}
                          onChange={(e) => setEditingAssistant(prev => prev ? {
                            ...prev,
                            permissions: { ...prev.permissions, [key]: e.target.checked }
                          } : null)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {editingAssistant && editingAssistant.assetAccess.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Warning: This assistant will not have access to any assets.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEditingAssistant(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePermissions(editingAssistant.id, editingAssistant.permissions, editingAssistant.assetAccess)}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Update Permissions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};