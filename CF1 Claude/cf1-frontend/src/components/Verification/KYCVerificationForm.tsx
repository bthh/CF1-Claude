import React, { useState } from 'react';
import { 
  Upload, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Camera,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { useVerificationStore } from '../../store/verificationStore';
import { useNotifications } from '../../hooks/useNotifications';

interface KYCVerificationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const KYCVerificationForm: React.FC<KYCVerificationFormProps> = ({
  isOpen,
  onClose
}) => {
  const { success, error } = useNotifications();
  const verificationStore = useVerificationStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    phone: '',
    ssn: '',
    
    // Documents
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    
    // Additional Information
    occupation: '',
    sourceOfFunds: '',
    investmentExperience: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    riskTolerance: 'low' as 'low' | 'medium' | 'high',
    
    // Declarations
    agreeToTerms: false,
    confirmAccuracy: false,
    authorizeBackground: false
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Identity Documents', icon: FileText },
    { id: 3, title: 'Financial Profile', icon: Calendar },
    { id: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleFileUpload = async (file: File, type: 'id' | 'address') => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      error('Please upload a JPG, PNG, or PDF file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (type === 'id') {
        setFormData({ ...formData, idDocument: file });
      } else {
        setFormData({ ...formData, proofOfAddress: file });
      }
      
      success(`${type === 'id' ? 'ID document' : 'Proof of address'} uploaded successfully!`);
    } catch (err) {
      error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.fullName.trim()) errors.push('Full name is required');
        if (!formData.dateOfBirth) errors.push('Date of birth is required');
        if (!formData.nationality.trim()) errors.push('Nationality is required');
        if (!formData.address.street.trim()) errors.push('Street address is required');
        if (!formData.address.city.trim()) errors.push('City is required');
        if (!formData.address.state.trim()) errors.push('State is required');
        if (!formData.address.zipCode.trim()) errors.push('ZIP code is required');
        if (!formData.phone.trim()) errors.push('Phone number is required');
        if (!formData.ssn.trim()) errors.push('SSN is required');
        break;
        
      case 2: // Documents
        if (!formData.idDocument) errors.push('Government-issued ID is required');
        if (!formData.proofOfAddress) errors.push('Proof of address is required');
        break;
        
      case 3: // Financial Profile
        if (!formData.occupation.trim()) errors.push('Occupation is required');
        if (!formData.sourceOfFunds.trim()) errors.push('Source of funds is required');
        break;
        
      case 4: // Review & Submit
        if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');
        if (!formData.confirmAccuracy) errors.push('You must confirm the accuracy of information');
        if (!formData.authorizeBackground) errors.push('You must authorize background check');
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setValidationErrors([]);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setSubmitting(true);
    try {
      // Simulate verification submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('KYC verification submitted successfully! We will review your application within 2-3 business days.');
      onClose();
    } catch (err) {
      error('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              KYC Identity Verification
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step.id 
                    ? 'bg-blue-600 text-white' 
                    : currentStep === step.id 
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:inline">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 dark:text-red-200 font-medium mb-1">
                    Please fix the following errors:
                  </h4>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Smith Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="United States"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Social Security Number *
                </label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => setFormData({ ...formData, ssn: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123-45-6789"
                  maxLength={9}
                  required
                />
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Residential Address *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, street: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={formData.address.country}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identity Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Government-Issued ID *
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a clear photo of your passport, driver's license, or national ID
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'id');
                      }}
                      className="hidden"
                      id="id-upload"
                    />
                    <label
                      htmlFor="id-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      Choose File
                    </label>
                    {formData.idDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.idDocument.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Proof of Address *
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a recent utility bill, bank statement, or lease agreement (within 3 months)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'address');
                      }}
                      className="hidden"
                      id="address-upload"
                    />
                    <label
                      htmlFor="address-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      Choose File
                    </label>
                    {formData.proofOfAddress && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.proofOfAddress.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Document Requirements
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Documents must be clear and all text must be readable</li>
                  <li>• Photos should be taken in good lighting without shadows</li>
                  <li>• All four corners of the document must be visible</li>
                  <li>• File formats: JPG, PNG, or PDF (max 5MB each)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Financial Profile */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation *
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investment Experience
                  </label>
                  <select
                    value={formData.investmentExperience}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      investmentExperience: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="advanced">Advanced (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={formData.riskTolerance}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      riskTolerance: e.target.value as 'low' | 'medium' | 'high'
                    })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Conservative - Low Risk</option>
                    <option value="medium">Moderate - Medium Risk</option>
                    <option value="high">Aggressive - High Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source of Funds *
                </label>
                <textarea
                  value={formData.sourceOfFunds}
                  onChange={(e) => setFormData({ ...formData, sourceOfFunds: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe the source of funds you will use for investing (e.g., salary, savings, investment income, business profits, etc.)"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Review Your Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Personal Information</h5>
                    <p className="text-gray-600 dark:text-gray-400">Name: {formData.fullName}</p>
                    <p className="text-gray-600 dark:text-gray-400">DOB: {formData.dateOfBirth}</p>
                    <p className="text-gray-600 dark:text-gray-400">Nationality: {formData.nationality}</p>
                    <p className="text-gray-600 dark:text-gray-400">Phone: {formData.phone}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Address</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.address.street}<br/>
                      {formData.address.city}, {formData.address.state} {formData.address.zipCode}<br/>
                      {formData.address.country}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Documents</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      ID: {formData.idDocument?.name || 'Not uploaded'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Address: {formData.proofOfAddress?.name || 'Not uploaded'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Financial Profile</h5>
                    <p className="text-gray-600 dark:text-gray-400">Occupation: {formData.occupation}</p>
                    <p className="text-gray-600 dark:text-gray-400">Experience: {formData.investmentExperience}</p>
                    <p className="text-gray-600 dark:text-gray-400">Risk Tolerance: {formData.riskTolerance}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="confirmAccuracy"
                    checked={formData.confirmAccuracy}
                    onChange={(e) => setFormData({ ...formData, confirmAccuracy: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="confirmAccuracy" className="text-sm text-gray-700 dark:text-gray-300">
                    I confirm that all information provided is accurate and complete to the best of my knowledge
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="authorizeBackground"
                    checked={formData.authorizeBackground}
                    onChange={(e) => setFormData({ ...formData, authorizeBackground: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="authorizeBackground" className="text-sm text-gray-700 dark:text-gray-300">
                    I authorize CF1 Platform to conduct background checks and verify my identity through third-party services
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                      Verification Timeline
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Your verification will be reviewed within 2-3 business days. You'll receive an email notification 
                      once your account is approved. Some applications may require additional documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              disabled={submitting || uploading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex items-center space-x-3">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit for Review</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationForm;