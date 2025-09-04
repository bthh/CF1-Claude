import React, { useState } from 'react';
import { X, FileText, Upload, Eye, EyeOff, Calendar, Tag } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface PublishUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (updateData: AssetUpdateData) => Promise<void>;
  assets: Array<{ id: string; name: string; type: string }>;
}

interface AssetUpdateData {
  assetId: string;
  title: string;
  content: string;
  type: 'FINANCIAL' | 'OPERATIONAL' | 'REGULATORY' | 'GENERAL';
  visibility: 'PUBLIC' | 'SHAREHOLDERS_ONLY';
  scheduledFor?: string;
  attachments?: string[];
  tags?: string[];
}

export const PublishUpdateModal: React.FC<PublishUpdateModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  assets
}) => {
  const { success, error } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssetUpdateData>({
    assetId: '',
    title: '',
    content: '',
    type: 'GENERAL',
    visibility: 'PUBLIC',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.title || !formData.content) {
      error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, upload attachments first
      const attachmentUrls = attachments.map(file => file.name); // Mock URLs
      
      await onPublish({
        ...formData,
        attachments: attachmentUrls
      });
      
      success('Asset update published successfully');
      handleClose();
    } catch (err) {
      error('Failed to publish asset update');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      assetId: '',
      title: '',
      content: '',
      type: 'GENERAL',
      visibility: 'PUBLIC',
      tags: []
    });
    setAttachments([]);
    setIsScheduled(false);
    setNewTag('');
    onClose();
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Publish Asset Update
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share important information with your shareholders
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asset *
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Update Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a clear, descriptive title"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GENERAL">General</option>
                <option value="FINANCIAL">Financial</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="REGULATORY">Regulatory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-gray-900 dark:text-white">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={formData.visibility === 'PUBLIC'}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="mr-2"
                  />
                  <Eye className="w-4 h-4 mr-1" />
                  Public
                </label>
                <label className="flex items-center text-gray-900 dark:text-white">
                  <input
                    type="radio"
                    name="visibility"
                    value="SHAREHOLDERS_ONLY"
                    checked={formData.visibility === 'SHAREHOLDERS_ONLY'}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="mr-2"
                  />
                  <EyeOff className="w-4 h-4 mr-1" />
                  Shareholders Only
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your update content here. Be clear and informative..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Upload files
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, XLS, or image files up to 10MB each
                  </p>
                </div>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling */}
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
                  Publication Date & Time
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

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{isScheduled ? 'Schedule Update' : 'Publish Now'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};