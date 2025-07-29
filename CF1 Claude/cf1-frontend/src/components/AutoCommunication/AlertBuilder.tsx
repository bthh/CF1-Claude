import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Users, Bell, Mail, MessageSquare, Smartphone, AlertTriangle, Settings, Check } from 'lucide-react';
import { NotificationTrigger } from '../../store/autoCommunicationStore';

interface AlertBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTrigger?: NotificationTrigger;
  title?: string;
}

const AlertBuilder: React.FC<AlertBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrigger,
  title = 'Create Auto-Communication'
}) => {
  const [formData, setFormData] = useState<Omit<NotificationTrigger, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    type: 'time_based',
    enabled: true,
    timeBeforeDeadline: { value: 7, unit: 'days' },
    frequency: { type: 'once' },
    template: {
      subject: '',
      message: '',
      channels: ['email', 'in_app'],
      urgency: 'medium'
    },
    targeting: {
      audience: 'all_investors'
    },
    createdBy: 'user',
    isDefault: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTrigger) {
      const { id, createdAt, updatedAt, ...triggerData } = editingTrigger;
      setFormData(triggerData);
    }
  }, [editingTrigger]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (formData.type === 'time_based' && (!formData.timeBeforeDeadline?.value || formData.timeBeforeDeadline.value < 1)) {
          newErrors.timing = 'Time before deadline must be at least 1';
        }
        break;
        
      case 2: // Content
        if (!formData.template.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.template.message.trim()) newErrors.message = 'Message is required';
        if (formData.template.channels.length === 0) newErrors.channels = 'At least one channel is required';
        break;
        
      case 3: // Targeting
        if (formData.targeting.audience === 'specific_segments' && (!formData.targeting.segments || formData.targeting.segments.length === 0)) {
          newErrors.segments = 'At least one segment is required when targeting specific segments';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSave = () => {
    if (validateStep(currentStep)) {
      onSave(formData);
      onClose();
      setCurrentStep(1);
      setErrors({});
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Configuration</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alert Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="e.g., 3 Days Before Deadline"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trigger Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'time_based', label: 'Time Based', icon: Clock, desc: 'Send before deadline' },
            { value: 'milestone_based', label: 'Milestone', icon: Users, desc: 'Send on funding milestones' },
            { value: 'custom', label: 'Custom', icon: Settings, desc: 'Custom logic' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData('type', type.value)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <type.icon className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {formData.type === 'time_based' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Send Before Deadline *
          </label>
          <div className="flex space-x-3">
            <input
              type="number"
              min="1"
              value={formData.timeBeforeDeadline?.value || ''}
              onChange={(e) => updateFormData('timeBeforeDeadline.value', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={formData.timeBeforeDeadline?.unit || 'days'}
              onChange={(e) => updateFormData('timeBeforeDeadline.unit', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
          {errors.timing && <p className="text-red-500 text-sm mt-1">{errors.timing}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="frequency"
              checked={formData.frequency?.type === 'once'}
              onChange={() => updateFormData('frequency.type', 'once')}
              className="mr-2"
            />
            Send once
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="frequency"
              checked={formData.frequency?.type === 'recurring'}
              onChange={() => updateFormData('frequency.type', 'recurring')}
              className="mr-2"
            />
            Send recurring reminders
          </label>
          
          {formData.frequency?.type === 'recurring' && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Repeat every</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.frequency?.interval?.value || 1}
                    onChange={(e) => updateFormData('frequency.interval.value', parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <select
                    value={formData.frequency?.interval?.unit || 'days'}
                    onChange={(e) => updateFormData('frequency.interval.unit', e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum reminders</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.frequency?.maxReminders || 3}
                  onChange={(e) => updateFormData('frequency.maxReminders', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Content</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject Line *
        </label>
        <input
          type="text"
          value={formData.template.subject}
          onChange={(e) => updateFormData('template.subject', e.target.value)}
          placeholder="Proposal deadline approaching..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message Content *
        </label>
        <textarea
          value={formData.template.message}
          onChange={(e) => updateFormData('template.message', e.target.value)}
          placeholder="Your message content here. Use {{proposalTitle}}, {{fundingProgress}}, {{timeLeft}} for dynamic content."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <strong>Available variables:</strong> {`{{proposalTitle}}, {{fundingProgress}}, {{timeLeft}}, {{creatorName}}, {{minimumInvestment}}`}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Delivery Channels *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'email', label: 'Email', icon: Mail },
            { value: 'in_app', label: 'In-App', icon: Bell },
            { value: 'sms', label: 'SMS', icon: Smartphone }
          ].map((channel) => (
            <label key={channel.value} className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={formData.template.channels.includes(channel.value as any)}
                onChange={(e) => {
                  const channels = formData.template.channels;
                  if (e.target.checked) {
                    updateFormData('template.channels', [...channels, channel.value]);
                  } else {
                    updateFormData('template.channels', channels.filter(c => c !== channel.value));
                  }
                }}
                className="rounded"
              />
              <channel.icon className="w-4 h-4" />
              <span className="text-sm">{channel.label}</span>
            </label>
          ))}
        </div>
        {errors.channels && <p className="text-red-500 text-sm mt-1">{errors.channels}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Urgency Level
        </label>
        <select
          value={formData.template.urgency}
          onChange={(e) => updateFormData('template.urgency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="low">Low - Informational</option>
          <option value="medium">Medium - Important</option>
          <option value="high">High - Urgent</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audience Targeting</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target Audience
        </label>
        <div className="space-y-3">
          {[
            { value: 'all_investors', label: 'All Platform Users', desc: 'Everyone on the platform' },
            { value: 'committed_investors', label: 'Committed Investors', desc: 'Users who have already invested' },
            { value: 'potential_investors', label: 'Potential Investors', desc: 'Users who viewed but haven\'t invested' },
            { value: 'specific_segments', label: 'Specific Segments', desc: 'Custom user segments' }
          ].map((audience) => (
            <label key={audience.value} className="flex items-start space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="audience"
                checked={formData.targeting.audience === audience.value}
                onChange={() => updateFormData('targeting.audience', audience.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{audience.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{audience.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.segments && <p className="text-red-500 text-sm mt-1">{errors.segments}</p>}
      </div>

      {formData.targeting.audience === 'specific_segments' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Segments
          </label>
          <div className="space-y-2">
            {['High Net Worth', 'Accredited Investors', 'Retail Investors', 'International', 'Frequent Traders'].map((segment) => (
              <label key={segment} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.targeting.segments?.includes(segment) || false}
                  onChange={(e) => {
                    const segments = formData.targeting.segments || [];
                    if (e.target.checked) {
                      updateFormData('targeting.segments', [...segments, segment]);
                    } else {
                      updateFormData('targeting.segments', segments.filter(s => s !== segment));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{segment}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Minimum Investment Amount (Optional)
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="0"
            value={formData.targeting.minimumInvestment || ''}
            onChange={(e) => updateFormData('targeting.minimumInvestment', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="0"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Only send to users with investments above this amount
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Confirm</h3>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Alert Configuration</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Type:</strong> {formData.type.replace('_', ' ')}</p>
            {formData.type === 'time_based' && (
              <p><strong>Timing:</strong> {formData.timeBeforeDeadline?.value} {formData.timeBeforeDeadline?.unit} before deadline</p>
            )}
            <p><strong>Frequency:</strong> {formData.frequency?.type === 'once' ? 'Send once' : `Recurring every ${formData.frequency?.interval?.value} ${formData.frequency?.interval?.unit}`}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Message</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <p><strong>Subject:</strong> {formData.template.subject}</p>
            <p><strong>Channels:</strong> {formData.template.channels.join(', ')}</p>
            <p><strong>Urgency:</strong> {formData.template.urgency}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Targeting</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <p><strong>Audience:</strong> {formData.targeting.audience.replace('_', ' ')}</p>
            {formData.targeting.minimumInvestment && (
              <p><strong>Min Investment:</strong> ${formData.targeting.minimumInvestment}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-blue-600" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          This auto-communication will be active immediately after saving. Make sure all details are correct.
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Auto-Communication
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBuilder;