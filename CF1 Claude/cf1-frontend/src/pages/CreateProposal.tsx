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
  Save,
  AlertTriangle
} from 'lucide-react';
import { useSubmissionStore } from '../store/submissionStore';
import { useNotifications } from '../hooks/useNotifications';
import { TouchInput, TouchSelect, TouchTextarea } from '../components/TouchOptimized';
import { aiAnalysisService } from '../services/aiAnalysis';
import { 
  getPlatformConfig, 
  calculateMinimumInvestment, 
  calculateTotalSupply, 
  validateTokenPrice,
  getFundingDeadlineOptions,
  validateProposalFinancials
} from '../services/platformConfig';
import { createProposal, validateProposalData } from '../services/proposalService';

interface FormData {
  // Asset Details
  assetName: string;
  assetType: string;
  category: string;
  customCategory: string;
  location: string;
  description: string;
  
  // Financial Terms
  targetAmount: string;
  tokenPrice: string;
  expectedAPY: string;
  fundingDays: number | null; // Changed from fundingDeadline string to days number
  
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
  const [platformConfig] = useState(() => getPlatformConfig());
  const [tokenPriceError, setTokenPriceError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    assetName: '',
    assetType: '',
    category: '',
    customCategory: '',
    location: '',
    description: '',
    targetAmount: '',
    tokenPrice: '',
    expectedAPY: '',
    fundingDays: null,
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
        
        // Convert old funding deadline to days if needed
        let fundingDays = null;
        if (draft.fundingDeadline) {
          const deadlineDate = new Date(draft.fundingDeadline);
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          fundingDays = diffDays > 0 ? diffDays : null;
        }
        
        setFormData({
          assetName: draft.assetName,
          assetType: draft.assetType,
          category: draft.category,
          customCategory: draft.customCategory || '',
          location: draft.location,
          description: draft.description,
          targetAmount: draft.targetAmount,
          tokenPrice: draft.tokenPrice,
          expectedAPY: draft.expectedAPY,
          fundingDays: fundingDays,
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

  // Auto-calculation and formatting helpers
  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return parts.join('.');
  };

  const formatPercentage = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }
    return parts.join('.');
  };

  const parseNumericValue = (value: string): number => {
    return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
  };

  // Calculate derived values using platform config
  const targetAmountNum = parseNumericValue(formData.targetAmount);
  const tokenPriceNum = parseNumericValue(formData.tokenPrice);
  
  const calculatedValues = {
    totalSupply: targetAmountNum > 0 && tokenPriceNum > 0 
      ? calculateTotalSupply(targetAmountNum, tokenPriceNum)
      : 0,
    minimumInvestment: targetAmountNum > 0 
      ? calculateMinimumInvestment(targetAmountNum, platformConfig.maxInvestorsPerProposal)
      : 0,
    minimumTokens: targetAmountNum > 0 && tokenPriceNum > 0
      ? Math.ceil(calculateMinimumInvestment(targetAmountNum, platformConfig.maxInvestorsPerProposal) / tokenPriceNum)
      : 0,
    maxInvestors: platformConfig.maxInvestorsPerProposal
  };

  const handleInputChange = (field: keyof FormData, value: string | File | null | number) => {
    let processedValue = value;
    
    // Auto-format financial fields
    if (typeof value === 'string') {
      switch (field) {
        case 'targetAmount':
        case 'tokenPrice':
          processedValue = formatCurrency(value);
          break;
        case 'expectedAPY':
          processedValue = formatPercentage(value);
          break;
      }
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: processedValue
      };
      
      // Clear custom category when category changes from "Other" to something else
      if (field === 'category' && prev.category === 'Other' && value !== 'Other') {
        newData.customCategory = '';
      }
      
      return newData;
    });

    // Validate token price in real-time
    if (field === 'tokenPrice' && typeof value === 'string') {
      const numericPrice = parseNumericValue(value);
      if (numericPrice > 0) {
        const validation = validateTokenPrice(numericPrice);
        setTokenPriceError(validation.isValid ? null : validation.error || null);
      } else {
        setTokenPriceError(null);
      }
    }
  };

  const handleFileUpload = (field: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleInputChange(field, file);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const categoryValid = formData.category && (formData.category !== 'Other' || formData.customCategory.trim());
        return !!(formData.assetName && formData.assetType && categoryValid && formData.location && formData.description);
      case 2:
        const hasRequiredFields = !!(formData.targetAmount && formData.tokenPrice && formData.expectedAPY && formData.fundingDays);
        const hasValidTokenPrice = !tokenPriceError && parseNumericValue(formData.tokenPrice) >= platformConfig.minTokenPrice;
        return hasRequiredFields && hasValidTokenPrice;
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

  // Function to trigger AI analysis for a submitted proposal
  const triggerAIAnalysis = async (proposalId: string) => {
    try {
      // Get the best document for analysis
      const readiness = aiAnalysisService.getAnalysisReadiness({
        businessPlan: formData.businessPlan,
        financialProjections: formData.financialProjections,
        legalDocuments: formData.legalDocuments,
        assetValuation: formData.assetValuation
      });

      if (readiness.bestDocument) {
        console.log(`Initiating AI analysis for proposal ${proposalId}`);
        
        const analysisResult = await aiAnalysisService.initiateAnalysis(
          proposalId,
          readiness.bestDocument
        );

        if (analysisResult.success) {
          // Show success notification about AI analysis
          setTimeout(() => {
            info(
              'AI Analysis Started',
              'Your proposal is being analyzed by our AI system. Results will be available shortly.',
              { duration: 5000 }
            );
          }, 8000); // Show after the submission success message
        } else {
          console.warn('AI analysis initiation failed:', analysisResult.message);
        }
      } else {
        console.log('No suitable documents found for AI analysis');
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      // Don't show error to user as this is a background process
    }
  };

  const handleSaveDraft = () => {
    // Calculate deadline date from funding days
    const fundingDeadline = formData.fundingDays 
      ? new Date(Date.now() + formData.fundingDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : '';
    
    const submissionData = {
      assetName: formData.assetName,
      assetType: formData.assetType,
      category: formData.category,
      customCategory: formData.customCategory,
      location: formData.location,
      description: formData.description,
      targetAmount: formData.targetAmount,
      tokenPrice: formData.tokenPrice,
      minimumInvestment: calculatedValues.minimumInvestment.toString(), // Use calculated value
      expectedAPY: formData.expectedAPY,
      fundingDeadline: fundingDeadline,
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      showError('Please complete all required fields before submitting.');
      return;
    }
    
    // Calculate deadline date from funding days
    const fundingDeadline = formData.fundingDays 
      ? new Date(Date.now() + formData.fundingDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : '';
    
    const submissionData = {
      assetName: formData.assetName,
      assetType: formData.assetType,
      category: formData.category,
      customCategory: formData.customCategory,
      location: formData.location,
      description: formData.description,
      targetAmount: formData.targetAmount,
      tokenPrice: formData.tokenPrice,
      minimumInvestment: calculatedValues.minimumInvestment.toString(), // Use calculated value
      totalSupply: calculatedValues.totalSupply.toString(), // Add calculated total supply
      expectedAPY: formData.expectedAPY,
      fundingDeadline: fundingDeadline,
      businessPlan: formData.businessPlan?.name || '',
      financialProjections: formData.financialProjections?.name || '',
      legalDocuments: formData.legalDocuments?.name || '',
      assetValuation: formData.assetValuation?.name || '',
      riskFactors: formData.riskFactors,
      useOfFunds: formData.useOfFunds
    };
    
    // Client-side validation
    const validation = validateProposalData(submissionData);
    if (!validation.isValid) {
      showError(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }
    
    try {
      // Submit to backend API
      const result = await createProposal(submissionData);
      
      if (result.success && result.data) {
        // Also save to local store for backwards compatibility
        const localResult = addSubmission({
          ...submissionData,
          minimumInvestment: calculatedValues.minimumInvestment.toString(),
          fundingDeadline: fundingDeadline
        });
        
        // Trigger AI analysis if suitable documents are available
        if (localResult.proposalId) {
          triggerAIAnalysis(localResult.proposalId);
        }
        
        success(
          'Proposal Submitted!', 
          'Your proposal has been created successfully with server-side validation and will be reviewed within 3-5 business days.',
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
        // Handle API errors
        if (result.code === 'VALIDATION_ERROR' && result.details) {
          showError(`Server validation failed: ${result.details.join(', ')}`);
        } else {
          showError(result.error || 'Failed to submit proposal. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      showError('An unexpected error occurred. Please try again.');
    }
  };

  // Keep the old mock submission as fallback
  const handleMockSubmit = () => {
    if (validateStep(currentStep)) {
      // Calculate deadline date from funding days
      const fundingDeadline = formData.fundingDays 
        ? new Date(Date.now() + formData.fundingDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '';
      
      const submissionData = {
        assetName: formData.assetName,
        assetType: formData.assetType,
        category: formData.category,
        customCategory: formData.customCategory,
        location: formData.location,
        description: formData.description,
        targetAmount: formData.targetAmount,
        tokenPrice: formData.tokenPrice,
        minimumInvestment: calculatedValues.minimumInvestment.toString(), // Use calculated value
        expectedAPY: formData.expectedAPY,
        fundingDeadline: fundingDeadline,
        businessPlan: formData.businessPlan?.name,
        financialProjections: formData.financialProjections?.name,
        legalDocuments: formData.legalDocuments?.name,
        assetValuation: formData.assetValuation?.name,
        riskFactors: formData.riskFactors,
        useOfFunds: formData.useOfFunds
      };
      
      const result = addSubmission(submissionData);
      
      if (result.success && result.proposalId) {
        // Trigger AI analysis if suitable documents are available
        triggerAIAnalysis(result.proposalId);
        
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 space-y-6">
      <TouchInput
        label="Asset Name *"
        type="text"
        value={formData.assetName}
        onChange={(e) => handleInputChange('assetName', e.target.value)}
        placeholder="e.g., Downtown Seattle Office Building"
        size="lg"
        leftIcon={<Building2 />}
        clearable
        onClear={() => handleInputChange('assetName', '')}
        required
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TouchInput
          label="Asset Type *"
          type="text"
          value={formData.assetType}
          onChange={(e) => handleInputChange('assetType', e.target.value)}
          placeholder="e.g., Commercial Real Estate"
          size="lg"
          clearable
          onClear={() => handleInputChange('assetType', '')}
          required
        />

        <TouchSelect
          label="Category *"
          value={formData.category}
          onChange={(value) => handleInputChange('category', value as string)}
          options={assetCategories.map(category => ({
            value: category,
            label: category
          }))}
          placeholder="Select Category"
          size="lg"
          searchable
          clearable
          onClear={() => {
            handleInputChange('category', '');
            handleInputChange('customCategory', '');
          }}
          required
        />
      </div>

      {/* Conditional "Other" category input */}
      {formData.category === 'Other' && (
        <TouchInput
          label="Custom Category *"
          type="text"
          value={formData.customCategory}
          onChange={(e) => handleInputChange('customCategory', e.target.value)}
          placeholder="e.g., Cryptocurrency Mining Equipment, Digital Assets"
          size="lg"
          clearable
          onClear={() => handleInputChange('customCategory', '')}
          helper="Specify your custom asset category"
          required
        />
      )}

      <TouchInput
        label="Location *"
        type="text"
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        placeholder="e.g., Seattle, WA"
        size="lg"
        leftIcon={<MapPin />}
        clearable
        onClear={() => handleInputChange('location', '')}
        required
      />

      <TouchTextarea
        label="Asset Description *"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Provide a detailed description of your asset, including key features, benefits, and investment highlights..."
        size="lg"
        autoResize
        maxHeight={200}
        showCharCount
        maxLength={2000}
        clearable
        onClear={() => handleInputChange('description', '')}
      />
    </div>
  );

  const renderFinancialTerms = () => {
    const fundingDeadlineOptions = getFundingDeadlineOptions();
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TouchInput
            label="Target Funding Amount *"
            type="text"
            value={formData.targetAmount}
            onChange={(e) => handleInputChange('targetAmount', e.target.value)}
            placeholder="3,200,000"
            size="lg"
            leftIcon={<Target />}
            rightIcon={<span className="text-gray-500 dark:text-gray-400 text-sm">USD</span>}
            clearable
            onClear={() => handleInputChange('targetAmount', '')}
            helper="Enter the total amount you want to raise"
            required
          />

          <TouchInput
            label="Token Price *"
            type="text"
            value={formData.tokenPrice}
            onChange={(e) => handleInputChange('tokenPrice', e.target.value)}
            placeholder={`${platformConfig.minTokenPrice.toFixed(2)}`}
            size="lg"
            leftIcon={<DollarSign />}
            clearable
            onClear={() => handleInputChange('tokenPrice', '')}
            helper={`Price per token in USD (min: $${platformConfig.minTokenPrice.toFixed(2)})`}
            error={tokenPriceError}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Minimum Investment - READ ONLY */}
          <TouchInput
            label="Minimum Investment (Auto-calculated)"
            type="text"
            value={calculatedValues.minimumInvestment > 0 ? `$${calculatedValues.minimumInvestment.toLocaleString()}` : ''}
            onChange={() => {}} // No-op function for read-only
            placeholder="Calculated automatically"
            size="lg"
            leftIcon={<Users />}
            helper={`Automatically calculated: Target Amount ÷ ${platformConfig.maxInvestorsPerProposal} max investors`}
            disabled
            readOnly
          />

          <TouchInput
            label="Expected APY *"
            type="text"
            value={formData.expectedAPY}
            onChange={(e) => handleInputChange('expectedAPY', e.target.value)}
            placeholder="9.2"
            size="lg"
            leftIcon={<Percent />}
            rightIcon={<span className="text-gray-500 dark:text-gray-400 text-sm">%</span>}
            clearable
            onClear={() => handleInputChange('expectedAPY', '')}
            helper="Projected annual percentage yield"
            required
          />
        </div>

        {/* Total Supply - READ ONLY */}
        <TouchInput
          label="Total Supply (Auto-calculated)"
          type="text"
          value={calculatedValues.totalSupply > 0 ? calculatedValues.totalSupply.toLocaleString() : ''}
          onChange={() => {}} // No-op function for read-only
          placeholder="Calculated automatically"
          size="lg"
          leftIcon={<Target />}
          rightIcon={<span className="text-gray-500 dark:text-gray-400 text-sm">Tokens</span>}
          helper="Automatically calculated: Target Amount ÷ Token Price"
          disabled
          readOnly
        />

        {/* Funding Deadline - DROPDOWN */}
        <TouchSelect
          label="Funding Deadline *"
          value={formData.fundingDays ? formData.fundingDays.toString() : ''}
          onChange={(value) => handleInputChange('fundingDays', parseInt(value as string))}
          options={fundingDeadlineOptions.map(option => ({
            value: option.value.toString(),
            label: option.label,
            description: `Deadline: ${new Date(option.date).toLocaleDateString()}`
          }))}
          placeholder="Select funding period"
          size="lg"
          leftIcon={<Clock />}
          helper={`Choose from ${platformConfig.fundingDeadlineRange.minDays} to ${platformConfig.fundingDeadlineRange.maxDays} days`}
          searchable
          required
        />

      {/* Platform Configuration Display */}
      {(formData.targetAmount || formData.tokenPrice) && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Proposal Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Supply</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {calculatedValues.totalSupply > 0 ? calculatedValues.totalSupply.toLocaleString() : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tokens to be issued
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Minimum Investment</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {calculatedValues.minimumInvestment > 0 ? `$${calculatedValues.minimumInvestment.toLocaleString()}` : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Per investor minimum
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Maximum Investors</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {calculatedValues.maxInvestors.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Platform limit
              </p>
            </div>
          </div>
          
          {/* Validation messages */}
          {formData.targetAmount && formData.tokenPrice && !tokenPriceError && (
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                All calculations are valid and ready for submission
              </span>
            </div>
          )}
          
          {tokenPriceError && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-400">
                {tokenPriceError}
              </span>
            </div>
          )}
          
          {(!formData.targetAmount || !formData.tokenPrice) && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-orange-700 dark:text-orange-400">
                Enter Target Amount and Token Price to see calculations
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TouchTextarea
          label="Risk Factors *"
          value={formData.riskFactors}
          onChange={(e) => handleInputChange('riskFactors', e.target.value)}
          placeholder="Describe potential risks associated with this investment..."
          size="lg"
          autoResize
          maxHeight={150}
          showCharCount
          maxLength={1000}
          clearable
          onClear={() => handleInputChange('riskFactors', '')}
          helper="Detail the main investment risks"
          required
        />

        <TouchTextarea
          label="Use of Funds *"
          value={formData.useOfFunds}
          onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
          placeholder="Explain how the raised funds will be used..."
          size="lg"
          autoResize
          maxHeight={150}
          showCharCount
          maxLength={1000}
          clearable
          onClear={() => handleInputChange('useOfFunds', '')}
          helper="Breakdown of fund allocation"
          required
        />
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
          Proposal Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Asset Name</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {formData.assetName || 'Not specified'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {formData.category === 'Other' && formData.customCategory 
                ? formData.customCategory 
                : formData.category || 'Not specified'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Amount</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              ${formData.targetAmount || 'Not specified'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expected APY</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {formData.expectedAPY ? `${formData.expectedAPY}%` : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Next Steps
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
          After submission, your proposal will be reviewed by our compliance team within 3-5 business days. 
          You'll receive an email notification once the review is complete and your proposal status updates.
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
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
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