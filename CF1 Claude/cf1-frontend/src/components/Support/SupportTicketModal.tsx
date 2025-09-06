/**
 * CF1 Frontend - Support Ticket Modal
 * Modal component for users to submit support tickets
 */

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  AlertTriangle,
  Send,
  Info,
  HelpCircle,
  Settings,
  DollarSign
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { adminAPI } from '../../lib/api/admin';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ isOpen, onClose }) => {
  const { success, error } = useNotifications();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general' as 'technical' | 'account' | 'kyc' | 'investment' | 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      error('Please provide a subject for your ticket');
      return;
    }
    
    if (!formData.description.trim()) {
      error('Please provide a description of your issue');
      return;
    }

    setIsSubmitting(true);

    try {
      await adminAPI.createSupportTicket({
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority
      });

      success('Support ticket submitted successfully. We will get back to you soon!');
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      
      onClose();
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
      error('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Settings className="w-4 h-4" />;
      case 'account':
        return <HelpCircle className="w-4 h-4" />;
      case 'kyc':
        return <AlertTriangle className="w-4 h-4" />;
      case 'investment':
        return <DollarSign className="w-4 h-4" />;
      case 'general':
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Submit Support Ticket
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get help from our support team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your issue..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'technical', label: 'Technical Issue', desc: 'Platform bugs, errors, performance' },
                  { value: 'account', label: 'Account', desc: 'Login, profile, settings' },
                  { value: 'kyc', label: 'KYC/Verification', desc: 'Identity verification, documents' },
                  { value: 'investment', label: 'Investment', desc: 'Transactions, tokens, funds' },
                  { value: 'general', label: 'General', desc: 'Other questions or feedback' }
                ].map((category) => (
                  <label key={category.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        formData.category === category.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getCategoryIcon(category.value)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          formData.category === category.value
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {category.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {category.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="space-y-2">
                {[
                  { value: 'low', label: 'Low', desc: 'General question, no urgency' },
                  { value: 'medium', label: 'Medium', desc: 'Standard issue, normal response' },
                  { value: 'high', label: 'High', desc: 'Important issue, faster response' },
                  { value: 'urgent', label: 'Urgent', desc: 'Critical issue, immediate attention' }
                ].map((priority) => (
                  <label key={priority.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(priority.value)}`}>
                        {priority.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {priority.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Tips for faster resolution:
                </p>
                <ul className="text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Include specific error messages if any</li>
                  <li>• Mention which browser and device you're using</li>
                  <li>• Describe what you were trying to do when the issue occurred</li>
                  <li>• Include screenshots if helpful</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.subject.trim() || !formData.description.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportTicketModal;