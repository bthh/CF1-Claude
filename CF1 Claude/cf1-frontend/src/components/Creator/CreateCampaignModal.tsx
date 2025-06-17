import React, { useState } from 'react';
import { X, Mail, MessageSquare, Bell, Smartphone, Users, Calendar, Target, Send } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaignData: CommunicationCampaignData) => Promise<void>;
  shareholders: Array<{ 
    id: string; 
    name?: string; 
    tier: string; 
    kycStatus: string;
    communicationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  }>;
}

interface CommunicationCampaignData {
  title: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  targetAudience: {
    type: 'ALL' | 'TIER_BASED' | 'KYC_STATUS' | 'CUSTOM';
    tiers?: string[];
    kycStatuses?: string[];
    customShareholderIds?: string[];
  };
  content: {
    subject?: string;
    body: string;
    attachments?: string[];
    callToAction?: {
      text: string;
      url: string;
    };
  };
  scheduledFor?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  shareholders
}) => {
  const { success, error } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CommunicationCampaignData>({
    title: '',
    type: 'EMAIL',
    targetAudience: {
      type: 'ALL'
    },
    content: {
      body: ''
    },
    priority: 'MEDIUM'
  });
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content.body) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.type === 'EMAIL' && !formData.content.subject) {
      error('Email campaigns require a subject line');
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData);
      success('Communication campaign created successfully');
      handleClose();
    } catch (err) {
      error('Failed to create communication campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: 'EMAIL',
      targetAudience: {
        type: 'ALL'
      },
      content: {
        body: ''
      },
      priority: 'MEDIUM'
    });
    setStep(1);
    setIsScheduled(false);
    onClose();
  };

  const getRecipientCount = () => {
    const { targetAudience } = formData;
    
    if (targetAudience.type === 'ALL') {
      return shareholders.filter(s => {
        const pref = s.communicationPreferences;
        switch (formData.type) {
          case 'EMAIL': return pref.email;
          case 'SMS': return pref.sms;
          case 'PUSH': return pref.push;
          case 'IN_APP': return true;
          default: return true;
        }
      }).length;
    }
    
    if (targetAudience.type === 'TIER_BASED' && targetAudience.tiers) {
      return shareholders.filter(s => 
        targetAudience.tiers!.includes(s.tier) &&
        getPreferenceForType(s.communicationPreferences, formData.type)
      ).length;
    }
    
    if (targetAudience.type === 'KYC_STATUS' && targetAudience.kycStatuses) {
      return shareholders.filter(s => 
        targetAudience.kycStatuses!.includes(s.kycStatus) &&
        getPreferenceForType(s.communicationPreferences, formData.type)
      ).length;
    }
    
    if (targetAudience.type === 'CUSTOM' && targetAudience.customShareholderIds) {
      return targetAudience.customShareholderIds.length;
    }
    
    return 0;
  };

  const getPreferenceForType = (prefs: any, type: string) => {
    switch (type) {
      case 'EMAIL': return prefs.email;
      case 'SMS': return prefs.sms;
      case 'PUSH': return prefs.push;
      case 'IN_APP': return true;
      default: return true;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="w-5 h-5" />;
      case 'SMS': return <MessageSquare className="w-5 h-5" />;
      case 'PUSH': return <Bell className="w-5 h-5" />;
      case 'IN_APP': return <Smartphone className="w-5 h-5" />;
      default: return <Mail className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              {getCampaignTypeIcon(formData.type)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Communication Campaign
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {step} of 3 - {step === 1 ? 'Campaign Type' : step === 2 ? 'Target Audience' : 'Content & Schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    stepNum < step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Campaign Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive campaign title"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Communication Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { type: 'EMAIL', label: 'Email', icon: Mail, desc: 'Rich content with attachments' },
                    { type: 'SMS', label: 'SMS', icon: MessageSquare, desc: 'Short text messages' },
                    { type: 'PUSH', label: 'Push', icon: Bell, desc: 'Mobile notifications' },
                    { type: 'IN_APP', label: 'In-App', icon: Smartphone, desc: 'Platform notifications' }
                  ].map(({ type, label, icon: Icon, desc }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type as any }))}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        formData.type === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 ${
                        formData.type === type ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        <Icon className="w-full h-full" />
                      </div>
                      <p className={`font-medium ${
                        formData.type === type ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Target Audience *
                </label>
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="ALL"
                      checked={formData.targetAudience.type === 'ALL'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        targetAudience: { type: e.target.value as any }
                      }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">All Shareholders</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Send to all shareholders who have opted in for this communication type
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="TIER_BASED"
                      checked={formData.targetAudience.type === 'TIER_BASED'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        targetAudience: { type: e.target.value as any, tiers: [] }
                      }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">Specific Tiers</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Target shareholders based on their tier level
                      </p>
                      {formData.targetAudience.type === 'TIER_BASED' && (
                        <div className="mt-3 space-y-2">
                          {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
                            <label key={tier} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.targetAudience.tiers?.includes(tier) || false}
                                onChange={(e) => {
                                  const tiers = formData.targetAudience.tiers || [];
                                  const newTiers = e.target.checked
                                    ? [...tiers, tier]
                                    : tiers.filter(t => t !== tier);
                                  setFormData(prev => ({
                                    ...prev,
                                    targetAudience: { ...prev.targetAudience, tiers: newTiers }
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-900 dark:text-white">{tier}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="targetAudience"
                      value="KYC_STATUS"
                      checked={formData.targetAudience.type === 'KYC_STATUS'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        targetAudience: { type: e.target.value as any, kycStatuses: [] }
                      }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900 dark:text-white">KYC Status</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Target based on verification status
                      </p>
                      {formData.targetAudience.type === 'KYC_STATUS' && (
                        <div className="mt-3 space-y-2">
                          {['VERIFIED', 'PENDING', 'REJECTED'].map((status) => (
                            <label key={status} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.targetAudience.kycStatuses?.includes(status) || false}
                                onChange={(e) => {
                                  const statuses = formData.targetAudience.kycStatuses || [];
                                  const newStatuses = e.target.checked
                                    ? [...statuses, status]
                                    : statuses.filter(s => s !== status);
                                  setFormData(prev => ({
                                    ...prev,
                                    targetAudience: { ...prev.targetAudience, kycStatuses: newStatuses }
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-900 dark:text-white">{status}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    Estimated Recipients: {getRecipientCount()}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Based on communication preferences for {formData.type.toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Content & Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              {formData.type === 'EMAIL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={formData.content.subject || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: { ...prev.content, subject: e.target.value }
                    }))}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content *
                </label>
                <textarea
                  value={formData.content.body}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, body: e.target.value }
                  }))}
                  placeholder={
                    formData.type === 'SMS' 
                      ? 'Keep it short and clear (160 characters recommended)'
                      : 'Write your message content here...'
                  }
                  rows={formData.type === 'SMS' ? 4 : 8}
                  maxLength={formData.type === 'SMS' ? 160 : undefined}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.content.body.length} characters
                  {formData.type === 'SMS' && ` / 160`}
                </p>
              </div>

              {(formData.type === 'EMAIL' || formData.type === 'PUSH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Call to Action (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={formData.content.callToAction?.text || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          content: { 
                            ...prev.content, 
                            callToAction: { 
                              ...prev.content.callToAction,
                              text: e.target.value,
                              url: prev.content.callToAction?.url || ''
                            }
                          }
                        }))}
                        placeholder="Button text (e.g., 'View Details')"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={formData.content.callToAction?.url || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          content: { 
                            ...prev.content, 
                            callToAction: { 
                              ...prev.content.callToAction,
                              text: prev.content.callToAction?.text || '',
                              url: e.target.value
                            }
                          }
                        }))}
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="schedule" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule for later
                  </label>
                </div>
                {isScheduled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Send Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Campaign Summary</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Type:</strong> {formData.type}</p>
                  <p><strong>Recipients:</strong> {getRecipientCount()} shareholders</p>
                  <p><strong>Priority:</strong> {formData.priority}</p>
                  {isScheduled && formData.scheduledFor && (
                    <p><strong>Scheduled:</strong> {new Date(formData.scheduledFor).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isScheduled ? 'Schedule Campaign' : 'Create Campaign'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};