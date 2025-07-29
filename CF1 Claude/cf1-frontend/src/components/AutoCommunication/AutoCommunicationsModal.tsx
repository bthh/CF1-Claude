import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Clock, Users, Mail, Bell, Smartphone, ToggleLeft, ToggleRight, Settings, Copy, Download, Upload, RefreshCw, Send, TestTube } from 'lucide-react';
import { useAutoCommunicationStore, NotificationTrigger } from '../../store/autoCommunicationStore';
import AlertBuilder from './AlertBuilder';
import notificationService, { NotificationRecipient } from '../../services/notificationService';
import { useNotifications } from '../../hooks/useNotifications';

interface AutoCommunicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  isCreatorView?: boolean; // true for creator admin, false for platform admin
}

const AutoCommunicationsModal: React.FC<AutoCommunicationsModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  isCreatorView = true
}) => {
  const {
    platformDefaults,
    creatorConfigs,
    addCreatorTrigger,
    updateCreatorTrigger,
    removeCreatorTrigger,
    addPlatformDefault,
    updatePlatformDefault,
    removePlatformDefault,
    resetCreatorToDefaults,
    exportConfiguration,
    importConfiguration
  } = useAutoCommunicationStore();

  const [showAlertBuilder, setShowAlertBuilder] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<NotificationTrigger | undefined>();
  const [activeTab, setActiveTab] = useState<'active' | 'defaults' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [testingTrigger, setTestingTrigger] = useState<string | null>(null);
  const { success, error } = useNotifications();

  const creatorConfig = creatorConfigs[creatorId];
  const activeTriggersData = creatorConfig?.triggers || platformDefaults;
  
  // Filter triggers based on search
  const filteredActiveTriggers = activeTriggersData.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trigger.template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDefaults = platformDefaults.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trigger.template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setEditingTrigger(undefined);
    setShowAlertBuilder(true);
  };

  const handleEdit = (trigger: NotificationTrigger) => {
    setEditingTrigger(trigger);
    setShowAlertBuilder(true);
  };

  const handleSave = (triggerData: Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTrigger) {
      // Update existing trigger
      if (isCreatorView) {
        updateCreatorTrigger(creatorId, editingTrigger.id, triggerData);
      } else {
        updatePlatformDefault(editingTrigger.id, triggerData);
      }
    } else {
      // Create new trigger
      if (isCreatorView) {
        addCreatorTrigger(creatorId, triggerData);
      } else {
        addPlatformDefault(triggerData);
      }
    }
    setShowAlertBuilder(false);
    setEditingTrigger(undefined);
  };

  const handleDelete = (triggerId: string) => {
    if (confirm('Are you sure you want to delete this auto-communication?')) {
      if (isCreatorView) {
        removeCreatorTrigger(creatorId, triggerId);
      } else {
        removePlatformDefault(triggerId);
      }
    }
  };

  const handleToggle = (triggerId: string, enabled: boolean) => {
    if (isCreatorView) {
      updateCreatorTrigger(creatorId, triggerId, { enabled });
    } else {
      updatePlatformDefault(triggerId, { enabled });
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all creator customizations to platform defaults? This cannot be undone.')) {
      resetCreatorToDefaults(creatorId);
    }
  };

  const handleExport = () => {
    const config = exportConfiguration(isCreatorView ? creatorId : undefined);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-communications-${isCreatorView ? creatorId : 'platform'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          importConfiguration(config, isCreatorView ? creatorId : undefined);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTestNotification = async (trigger: NotificationTrigger) => {
    setTestingTrigger(trigger.id);
    
    try {
      // Create a test recipient (you could allow users to input their own email)
      const testRecipient: NotificationRecipient = {
        id: 'test-user',
        email: 'test@example.com', // In real implementation, get from user input
        walletAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test User',
        hasInvested: false,
        isAccredited: false
      };

      const delivery = await notificationService.sendTestNotification(trigger, testRecipient);
      
      if (delivery.status === 'sent') {
        success(`Test notification sent successfully! Check console for details.`);
      } else {
        error(`Test notification failed. Check console for details.`);
      }
    } catch (err) {
      error('Failed to send test notification');
      console.error('Test notification error:', err);
    } finally {
      setTestingTrigger(null);
    }
  };

  const getChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'email': return <Mail key={channel} className="w-4 h-4" />;
        case 'in_app': return <Bell key={channel} className="w-4 h-4" />;
        case 'sms': return <Smartphone key={channel} className="w-4 h-4" />;
        default: return null;
      }
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const renderTriggerCard = (trigger: NotificationTrigger, isDefault: boolean = false) => (
    <div key={trigger.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{trigger.name}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(trigger.template.urgency)}`}>
              {trigger.template.urgency}
            </span>
            {isDefault && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{trigger.template.subject}</p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>
                {trigger.type === 'time_based' && trigger.timeBeforeDeadline
                  ? `${trigger.timeBeforeDeadline.value} ${trigger.timeBeforeDeadline.unit} before`
                  : trigger.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{trigger.targeting.audience.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getChannelIcons(trigger.template.channels)}
              <span>{trigger.template.channels.length} channel{trigger.template.channels.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => handleTestNotification(trigger)}
            disabled={testingTrigger === trigger.id}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
            title="Send Test Notification"
          >
            {testingTrigger === trigger.id ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 text-blue-600" />
            )}
          </button>
          
          <button
            onClick={() => handleToggle(trigger.id, !trigger.enabled)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={trigger.enabled ? 'Disable' : 'Enable'}
          >
            {trigger.enabled ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {!isDefault && (
            <>
              <button
                onClick={() => handleEdit(trigger)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => handleDelete(trigger.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
        <p className="truncate">{trigger.template.message}</p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Auto-Communications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isCreatorView 
                  ? 'Manage automated notifications for your proposals'
                  : 'Configure platform-wide default auto-communications'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {isCreatorView ? 'My Communications' : 'Platform Defaults'}
                </button>
                {isCreatorView && (
                  <button
                    onClick={() => setActiveTab('defaults')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'defaults'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Platform Defaults
                  </button>
                )}
              </div>
              
              <div className="flex-1" />
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700"
                />
                
                {isCreatorView && activeTab === 'active' && (
                  <button
                    onClick={handleResetToDefaults}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset to Defaults</span>
                  </button>
                )}
                
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                
                <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                
                {(activeTab === 'active' || !isCreatorView) && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {activeTab === 'active' ? (
                <div className="space-y-4">
                  {filteredActiveTriggers.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'No matching communications' : 'No auto-communications configured'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm 
                          ? 'Try adjusting your search terms'
                          : isCreatorView 
                            ? 'Create custom communications or use platform defaults'
                            : 'Create default auto-communications for all creators'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Your First Communication
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredActiveTriggers.map(trigger => renderTriggerCard(trigger))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Platform Defaults</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      These are the default auto-communications set by platform administrators. 
                      You can view them here but cannot modify them. Create custom communications in the "My Communications" tab.
                    </p>
                  </div>
                  
                  {filteredDefaults.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No default communications found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Platform administrators haven't configured any default auto-communications yet.
                      </p>
                    </div>
                  ) : (
                    filteredDefaults.map(trigger => renderTriggerCard(trigger, true))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertBuilder
        isOpen={showAlertBuilder}
        onClose={() => {
          setShowAlertBuilder(false);
          setEditingTrigger(undefined);
        }}
        onSave={handleSave}
        editingTrigger={editingTrigger}
        title={editingTrigger ? 'Edit Auto-Communication' : 'Create Auto-Communication'}
      />
    </>
  );
};

export default AutoCommunicationsModal;