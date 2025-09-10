import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  FileText,
  Image,
  Camera,
  CheckCircle,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfileStore, PersonalInfo, Address } from '../store/userProfileStore';
import { useUnifiedAuthStore } from '../store/unifiedAuthStore';
import { useNotifications } from '../hooks/useNotifications';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotifications();
  const { user } = useUnifiedAuthStore();
  
  const {
    profile,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    draftChanges,
    loadProfile,
    updateProfile,
    updateProfileImage,
    setDraftChanges,
    saveDraftChanges,
    discardDraftChanges,
    validateProfile,
    clearError
  } = useUserProfileStore();

  const [activeSection, setActiveSection] = useState<'personal' | 'address' | 'preferences' | 'privacy'>('personal');
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    personalInfo: PersonalInfo;
    address: Address;
    preferences: any;
  }>(() => ({
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      bio: '',
      occupation: '',
      company: '',
      linkedIn: '',
      twitter: ''
    },
    address: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      newsUpdates: true,
      publicProfile: false
    }
  }));

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        }
      }));
    }
  }, [user]);

  // Load profile on mount
  useEffect(() => {
    if (user?.id && !profile) {
      loadProfile(user.id);
    }
  }, [user, profile, loadProfile]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        personalInfo: profile.personalInfo,
        address: profile.address || {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        },
        preferences: profile.preferences
      });
    }
  }, [profile]);

  // Handle form field changes
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    const newPersonalInfo = { ...formData.personalInfo, [field]: value };
    setFormData({ ...formData, personalInfo: newPersonalInfo });
    setDraftChanges({ personalInfo: { [field]: value } });
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    const newAddress = { ...formData.address, [field]: value };
    setFormData({ ...formData, address: newAddress });
    setDraftChanges({ address: { [field]: value } });
  };

  const handlePreferencesChange = (field: string, value: boolean) => {
    const newPreferences = { ...formData.preferences, [field]: value };
    setFormData({ ...formData, preferences: newPreferences });
    setDraftChanges({ preferences: { [field]: value } });
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        updateProfileImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!profile) return;
    
    const validation = validateProfile();
    if (!validation.isValid) {
      showError(`Please fix the following errors: ${validation.errors.join(', ')}`);
      return;
    }
    
    try {
      await saveDraftChanges();
      success('Profile updated successfully!');
      setShowUnsavedWarning(false);
    } catch (err) {
      showError('Failed to update profile');
    }
  };

  // Discard changes
  const handleDiscard = () => {
    discardDraftChanges();
    if (profile) {
      setFormData({
        personalInfo: profile.personalInfo,
        address: profile.address || formData.address,
        preferences: profile.preferences
      });
    }
    setShowUnsavedWarning(false);
  };

  // Handle navigation with unsaved changes warning
  const handleNavigate = (path: string) => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      return;
    }
    navigate(path);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Unsaved changes</span>
              </div>
            )}
            <button
              onClick={() => handleNavigate('/profile')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <nav className="space-y-2">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'address', label: 'Address', icon: MapPin },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'privacy', label: 'Privacy', icon: Eye }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                </div>

                {/* Profile Image */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={imagePreview || profile.profileImage || `https://ui-avatars.com/api/?name=${formData.personalInfo.firstName} ${formData.personalInfo.lastName}&background=3B82F6&color=fff`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                      />
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        JPG, GIF or PNG. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone || ''}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.personalInfo.dateOfBirth || ''}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.occupation || ''}
                      onChange={(e) => handlePersonalInfoChange('occupation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.company || ''}
                      onChange={(e) => handlePersonalInfoChange('company', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.personalInfo.linkedIn || ''}
                        onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.personalInfo.bio || ''}
                    onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {(formData.personalInfo.bio || '').length}/500 characters
                  </p>
                </div>
              </div>
            )}

            {/* Address Section */}
            {activeSection === 'address' && (
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Address Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.address.street2 || ''}
                      onChange={(e) => handleAddressChange('street2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <select
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive critical alerts via text message' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional content and offers' },
                        { key: 'newsUpdates', label: 'News Updates', desc: 'Stay informed about platform updates' }
                      ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{pref.label}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pref.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.preferences[pref.key]}
                              onChange={(e) => handlePreferencesChange(pref.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Public Profile</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow other users to see your profile information
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.publicProfile}
                        onChange={(e) => handlePreferencesChange('publicProfile', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Data Protection Notice
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {profile && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Profile {profile.profileCompletionScore}% complete
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {hasUnsavedChanges && (
                    <button
                      onClick={handleDiscard}
                      disabled={saving}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Discard Changes
                    </button>
                  )}
                  
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have unsaved changes that will be lost if you leave this page. What would you like to do?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  await handleSave();
                  setShowUnsavedWarning(false);
                  navigate('/profile');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save & Leave
              </button>
              <button
                onClick={() => {
                  handleDiscard();
                  setShowUnsavedWarning(false);
                  navigate('/profile');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Discard & Leave
              </button>
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;