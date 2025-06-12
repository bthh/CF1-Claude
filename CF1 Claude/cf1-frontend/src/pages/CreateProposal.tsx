import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Upload,
  MapPin,
  Percent,
  Users,
  Target,
  Clock,
  Save
} from 'lucide-react';
import { useSubmissionStore } from '../store/submissionStore';
import { useNotifications } from '../hooks/useNotifications';

interface FormData {
  // Asset Details
  assetName: string;
  assetType: string;
  category: string;
  location: string;
  description: string;
  
  // Financial Terms
  targetAmount: string;
  tokenPrice: string;
  minimumInvestment: string;
  expectedAPY: string;
  fundingDeadline: string;
  
  // Documentation
  businessPlan: File | null;
  financialProjections: File | null;
  legalDocuments: File | null;
  assetValuation: File | null;
  
  // Additional Info
  riskFactors: string;
  useOfFunds: string;
}

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSubmission, saveDraft, updateDraft, getSubmissionById } = useSubmissionStore();
  const { success, error: showError, info } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    assetName: '',
    assetType: '',
    category: '',
    location: '',
    description: '',
    targetAmount: '',
    tokenPrice: '',
    minimumInvestment: '',
    expectedAPY: '',
    fundingDeadline: '',
    businessPlan: null,
    financialProjections: null,
    legalDocuments: null,
    assetValuation: null,
    riskFactors: '',
    useOfFunds: ''
  });

  // Load draft if editing
  useEffect(() => {
    const draftParam = searchParams.get('draft');
    if (draftParam) {
      const draft = getSubmissionById(draftParam);
      if (draft && draft.status === 'draft') {
        setIsEditingDraft(true);
        setDraftId(draftParam);
        setFormData({
          assetName: draft.assetName,
          assetType: draft.assetType,
          category: draft.category,
          location: draft.location,
          description: draft.description,
          targetAmount: draft.targetAmount,
          tokenPrice: draft.tokenPrice,
          minimumInvestment: draft.minimumInvestment,
          expectedAPY: draft.expectedAPY,
          fundingDeadline: draft.fundingDeadline,
          businessPlan: null, // Files can't be restored from drafts
          financialProjections: null,
          legalDocuments: null,
          assetValuation: null,
          riskFactors: draft.riskFactors,
          useOfFunds: draft.useOfFunds
        });
      }
    }
  }, [searchParams, getSubmissionById]);

  const totalSteps = 4;

  const steps = [
    { 
      number: 1, 
      title: 'Asset Details', 
      description: 'Basic information about your asset',
      icon: <Building2 className="w-5 h-5" />
    },
    { 
      number: 2, 
      title: 'Financial Terms', 
      description: 'Funding goals and investor terms',
      icon: <DollarSign className="w-5 h-5" />
    },
    { 
      number: 3, 
      title: 'Documentation', 
      description: 'Required legal and financial documents',
      icon: <FileText className="w-5 h-5" />
    },
    { 
      number: 4, 
      title: 'Review & Submit', 
      description: 'Final review of your proposal',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const assetCategories = [
    'Commercial Real Estate',
    'Residential Real Estate',
    'Precious Metals',
    'Fine Art',
    'Collectibles',
    'Luxury Vehicles',
    'Natural Resources',
    'Private Equity',
    'Other'
  ];

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleInputChange(field, file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.assetName && formData.assetType && formData.category && formData.location && formData.description);
      case 2:
        return !!(formData.targetAmount && formData.tokenPrice && formData.minimumInvestment && formData.expectedAPY && formData.fundingDeadline);
      case 3:
        return !!(formData.businessPlan && formData.financialProjections && formData.legalDocuments);
      case 4:
        return !!(formData.riskFactors && formData.useOfFunds);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    const submissionData = {
      assetName: formData.assetName,
      assetType: formData.assetType,
      category: formData.category,
      location: formData.location,
      description: formData.description,
      targetAmount: formData.targetAmount,
      tokenPrice: formData.tokenPrice,
      minimumInvestment: formData.minimumInvestment,
      expectedAPY: formData.expectedAPY,
      fundingDeadline: formData.fundingDeadline,
      businessPlan: formData.businessPlan?.name,
      financialProjections: formData.financialProjections?.name,
      legalDocuments: formData.legalDocuments?.name,
      assetValuation: formData.assetValuation?.name,
      riskFactors: formData.riskFactors,
      useOfFunds: formData.useOfFunds
    };

    if (isEditingDraft && draftId) {
      updateDraft(draftId, submissionData);
      success('Draft Updated', 'Your proposal draft has been saved with the latest changes.');
    } else {
      const newDraftId = saveDraft(submissionData);
      setDraftId(newDraftId);
      setIsEditingDraft(true);
      success(
        'Draft Saved', 
        'Your proposal has been saved as a draft. You can continue editing or submit it later.',
        {
          actionLabel: 'View All Drafts',
          onAction: () => navigate('/launchpad/drafts')
        }
      );
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const submissionData = {
        assetName: formData.assetName,
        assetType: formData.assetType,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        targetAmount: formData.targetAmount,
        tokenPrice: formData.tokenPrice,
        minimumInvestment: formData.minimumInvestment,
        expectedAPY: formData.expectedAPY,
        fundingDeadline: formData.fundingDeadline,
        businessPlan: formData.businessPlan?.name,
        financialProjections: formData.financialProjections?.name,
        legalDocuments: formData.legalDocuments?.name,
        assetValuation: formData.assetValuation?.name,
        riskFactors: formData.riskFactors,
        useOfFunds: formData.useOfFunds
      };
      
      const result = addSubmission(submissionData);
      
      if (result.success && result.proposalId) {
        success(
          'Proposal Submitted!', 
          'Your proposal has been submitted successfully and will be reviewed within 3-5 business days.',
          {
            duration: 6000,
            actionLabel: 'View Status',
            onAction: () => navigate('/my-submissions')
          }
        );
        
        // Show follow-up info notification
        setTimeout(() => {
          info(
            'What Happens Next?',
            'Our team will review your proposal and documentation. You\'ll receive updates via notifications and email.',
            { duration: 10000 }
          );
        }, 3000);
        
        // Navigate to submissions page
        navigate('/my-submissions');
      } else {
        // Save as draft if submission fails
        const draftId = saveDraft(submissionData);
        
        showError(
          'Submission Failed',
          result.error || 'There was a problem submitting your proposal. It has been saved to drafts.',
          {
            persistent: true,
            actionLabel: 'View Drafts',
            onAction: () => navigate('/launchpad/drafts')
          }
        );
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="relative mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                step.number < currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : step.number === currentStep
                  ? 'border-blue-600 text-blue-600 bg-white shadow-lg ring-4 ring-blue-100'
                  : 'border-gray-300 text-gray-400 bg-white'
              }`}>
                {step.number < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Connecting line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 transition-all duration-300 ${
                  step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderAssetDetails = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Asset Name *
        </label>
        <input
          type="text"
          value={formData.assetName}
          onChange={(e) => handleInputChange('assetName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="e.g., Downtown Seattle Office Building"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Asset Type *
          </label>
          <input
            type="text"
            value={formData.assetType}
            onChange={(e) => handleInputChange('assetType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Commercial Real Estate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Category</option>
            {assetCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="e.g., Seattle, WA"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Asset Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Provide a detailed description of your asset, including key features, benefits, and investment highlights..."
        />
      </div>
    </div>
  );

  const renderFinancialTerms = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Target Funding Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="text"
              value={formData.targetAmount}
              onChange={(e) => handleInputChange('targetAmount', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="3,200,000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token Price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="text"
              value={formData.tokenPrice}
              onChange={(e) => handleInputChange('tokenPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Minimum Investment *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="text"
              value={formData.minimumInvestment}
              onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Percent className="w-4 h-4 inline mr-1" />
            Expected APY *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.expectedAPY}
              onChange={(e) => handleInputChange('expectedAPY', e.target.value)}
              className="w-full pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="9.2"
            />
            <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">%</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Funding Deadline *
        </label>
        <input
          type="date"
          value={formData.fundingDeadline}
          onChange={(e) => handleInputChange('fundingDeadline', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );

  const renderDocumentation = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-warning-800 mb-2">Required Documentation</h4>
        <p className="text-sm text-warning-700">
          All documents must be in PDF format and under 10MB each. These will be reviewed by our compliance team.
        </p>
      </div>

      {[
        { field: 'businessPlan', label: 'Business Plan', required: true },
        { field: 'financialProjections', label: 'Financial Projections', required: true },
        { field: 'legalDocuments', label: 'Legal Documents', required: true },
        { field: 'assetValuation', label: 'Asset Valuation Report', required: false }
      ].map((doc) => (
        <div key={doc.field}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            {doc.label} {doc.required && '*'}
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(doc.field as keyof FormData, e)}
              className="hidden"
              id={doc.field}
            />
            <label
              htmlFor={doc.field}
              className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
            >
              Click to upload
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF format, max 10MB</p>
            {formData[doc.field as keyof FormData] && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {(formData[doc.field as keyof FormData] as File)?.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderReviewSubmit = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Factors *
          </label>
          <textarea
            value={formData.riskFactors}
            onChange={(e) => handleInputChange('riskFactors', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Describe potential risks associated with this investment..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Use of Funds *
          </label>
          <textarea
            value={formData.useOfFunds}
            onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Explain how the raised funds will be used..."
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proposal Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Asset Name:</p>
            <p className="font-medium">{formData.assetName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Category:</p>
            <p className="font-medium">{formData.category || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Target Amount:</p>
            <p className="font-medium">${formData.targetAmount || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Expected APY:</p>
            <p className="font-medium">{formData.expectedAPY ? `${formData.expectedAPY}%` : 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Next Steps</h4>
        <p className="text-sm text-blue-700">
          After submission, your proposal will be reviewed by our compliance team within 3-5 business days. 
          You'll receive an email notification once the review is complete.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/launchpad')}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Launchpad</span>
        </button>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditingDraft ? 'Edit Draft Proposal' : 'Submit New Proposal'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditingDraft ? 'Edit and submit your saved draft' : 'Create a new tokenized asset proposal'}
          </p>
        </div>
        
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8">
        {renderStepIndicator()}

        <div className="min-h-[500px]">
          {currentStep === 1 && renderAssetDetails()}
          {currentStep === 2 && renderFinancialTerms()}
          {currentStep === 3 && renderDocumentation()}
          {currentStep === 4 && renderReviewSubmit()}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Save Draft Button - show if form has basic data */}
            {formData.assetName && (
              <button
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingDraft ? 'Update Draft' : 'Save Draft'}</span>
              </button>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  validateStep(currentStep)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                  validateStep(currentStep)
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Proposal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;