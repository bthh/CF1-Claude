import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CF1Button from '../components/UI/CF1Button';
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
  AlertTriangle,
  Brain,
  X,
  Plus
} from 'lucide-react';
import { useSubmissionStore } from '../store/submissionStore';
import { usePlatformConfigStore } from '../store/platformConfigStore';
import { useNotifications } from '../hooks/useNotifications';
import { useSessionStore } from '../store/sessionStore';
import { useCosmJS } from '../hooks/useCosmJS';
import { useProposalNotifications } from '../hooks/useProposalNotifications';
import { TouchInput, TouchSelect, TouchTextarea } from '../components/TouchOptimized';
import AIProposalAssistant from '../components/AIProposalAssistant/AIProposalAssistant';
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
import { storeAllFiles, retrieveAllFiles, cleanupDraftFiles } from '../utils/draftFileStorage';

interface FormData {
  // Asset Details
  assetName: string;
  assetType: string;
  category: string;
  customCategory: string;
  location: string;
  description: string;
  assetVotingType: 'open' | 'closed';
  
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
  
  // Cost & Services
  services: Array<{
    id: string;
    serviceName: string;
    personName: string;
    cost: string;
    paymentMethod: string;
    description: string;
  }>;
  
  // Additional Info
  riskFactors: string;
  useOfFunds: string;
}

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSubmission, addBackendProposalReference, saveDraft, updateDraft, getSubmissionById, deleteDraft } = useSubmissionStore();
  const { validateAPY } = usePlatformConfigStore();
  const { success, error: showError, info } = useNotifications();
  const { selectedRole } = useSessionStore();
  const { isConnected, address } = useCosmJS();
  const { scheduleNotificationsForProposal, hasConfiguredNotifications } = useProposalNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [platformConfig] = useState(() => getPlatformConfig());
  const [tokenPriceError, setTokenPriceError] = useState<string | null>(null);
  const [apyError, setAPYError] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    assetName: '',
    assetType: '',
    category: '',
    customCategory: '',
    location: '',
    description: '',
    assetVotingType: 'open',
    targetAmount: '',
    tokenPrice: '',
    expectedAPY: '',
    fundingDays: null,
    businessPlan: null,
    financialProjections: null,
    legalDocuments: null,
    assetValuation: null,
    services: [],
    riskFactors: '',
    useOfFunds: ''
  });

  // Check authentication - require wallet connection or user session
  useEffect(() => {
    const isAuthenticated = address || selectedRole;
    console.log('🔍 Authentication check:', { 
      hasConnection: isConnected, 
      connectionAddress: address,
      hasSelectedRole: !!selectedRole,
      selectedRole,
      isAuthenticated 
    });
    
    // Temporarily allow wallet connection even if backend auth fails
    const hasWalletConnection = address;
    if (!isAuthenticated && !hasWalletConnection) {
      showError(
        'Authentication Required',
        'You must connect your wallet or log in to create proposals. Please connect your wallet from the header menu.'
      );
      navigate('/launchpad');
      return;
    }
  }, [isConnected, address, selectedRole, navigate, showError]);

  // Load draft or submission for editing
  useEffect(() => {
    const draftParam = searchParams.get('draft');
    const editParam = searchParams.get('edit');
    const submissionId = draftParam || editParam;
    
    if (submissionId) {
      const submission = getSubmissionById(submissionId);
      if (submission && (submission.status === 'draft' || submission.status === 'changes_requested')) {
        // Check if this draft belongs to the current wallet address
        if (submission.createdBy && submission.createdBy !== address) {
          showError('Access Denied', 'This draft belongs to a different wallet address.');
          navigate('/launchpad');
          return;
        }
        
        setIsEditingDraft(true);
        setDraftId(submissionId);
        setCurrentSubmission(submission);
        
        // Convert old funding deadline to days if needed
        let fundingDays = null;
        if (submission.fundingDeadline) {
          const deadlineDate = new Date(submission.fundingDeadline);
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          fundingDays = diffDays > 0 ? diffDays : null;
        }
        
        // Retrieve stored files for this draft/submission
        const storedFiles = retrieveAllFiles(submissionId);
        
        // Show success message if files were restored
        const restoredFileCount = Object.values(storedFiles).filter(file => file !== null).length;
        if (restoredFileCount > 0) {
          info('Files Restored', `${restoredFileCount} uploaded file(s) have been restored from your ${submission.status === 'draft' ? 'draft' : 'submission'}.`);
        }
        
        // Show specific message for changes requested
        if (submission.status === 'changes_requested') {
          info('Editing Submission', 'You are editing a submission that requires changes. Please review the admin comments and make the necessary updates.');
        }
        
        setFormData({
          assetName: submission.assetName,
          assetType: submission.assetType,
          category: submission.category,
          customCategory: submission.customCategory || '',
          location: submission.location,
          description: submission.description,
          assetVotingType: submission.assetVotingType || 'open',
          targetAmount: submission.targetAmount,
          tokenPrice: submission.tokenPrice,
          expectedAPY: submission.expectedAPY,
          fundingDays: fundingDays,
          businessPlan: storedFiles.businessPlan,
          financialProjections: storedFiles.financialProjections,
          legalDocuments: storedFiles.legalDocuments,
          assetValuation: storedFiles.assetValuation,
          services: submission.services || [],
          riskFactors: submission.riskFactors,
          useOfFunds: submission.useOfFunds
        });
      }
    }
  }, [searchParams, getSubmissionById, address, navigate, showError]);

  const totalSteps = 5;

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
      title: 'Cost & Services', 
      description: 'Services and associated costs',
      icon: <Users className="w-5 h-5" />
    },
    { 
      number: 5, 
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

    // Validate APY in real-time using platform configuration
    if (field === 'expectedAPY' && typeof value === 'string') {
      const numericAPY = parseFloat(value.replace('%', ''));
      if (!isNaN(numericAPY) && numericAPY > 0) {
        const apyValidation = validateAPY(numericAPY);
        setAPYError(apyValidation.isValid ? null : apyValidation.error || null);
      } else {
        setAPYError(null);
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
        return !!(formData.assetName && formData.assetType && categoryValid && formData.location && formData.description && formData.assetVotingType);
      case 2:
        const hasRequiredFields = !!(formData.targetAmount && formData.tokenPrice && formData.expectedAPY && formData.fundingDays);
        const hasValidTokenPrice = !tokenPriceError && parseNumericValue(formData.tokenPrice) >= platformConfig.minTokenPrice;
        const hasValidAPY = !apyError;
        return hasRequiredFields && hasValidTokenPrice && hasValidAPY;
      case 3:
        return !!(formData.businessPlan && formData.financialProjections && formData.legalDocuments);
      case 4:
        // For services step - at least one service is required
        return formData.services.length > 0 && formData.services.every(service => 
          service.serviceName.trim() && service.personName.trim() && service.cost.trim() && service.paymentMethod.trim()
        );
      case 5:
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

  const handleSaveDraft = async () => {
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
      assetVotingType: formData.assetVotingType,
      targetAmount: formData.targetAmount,
      tokenPrice: formData.tokenPrice,
      minimumInvestment: calculatedValues.minimumInvestment.toString(), // Use calculated value
      expectedAPY: formData.expectedAPY,
      fundingDeadline: fundingDeadline,
      businessPlan: formData.businessPlan?.name,
      financialProjections: formData.financialProjections?.name,
      legalDocuments: formData.legalDocuments?.name,
      assetValuation: formData.assetValuation?.name,
      services: formData.services,
      riskFactors: formData.riskFactors,
      useOfFunds: formData.useOfFunds,
      createdBy: address // Add wallet address to associate draft with user
    };

    let currentDraftId = draftId;

    if (isEditingDraft && draftId) {
      updateDraft(draftId, submissionData);
      success('Draft Updated', 'Your proposal draft has been saved with the latest changes.');
    } else {
      const newDraftId = saveDraft(submissionData);
      setDraftId(newDraftId);
      setIsEditingDraft(true);
      currentDraftId = newDraftId;
      success(
        'Draft Saved', 
        'Your proposal has been saved as a draft. You can continue editing or submit it later.',
        {
          actionLabel: 'View All Drafts',
          onAction: () => navigate('/launchpad/drafts')
        }
      );
    }

    // Store files separately using the draft ID
    if (currentDraftId) {
      try {
        await storeAllFiles(currentDraftId, {
          businessPlan: formData.businessPlan,
          financialProjections: formData.financialProjections,
          legalDocuments: formData.legalDocuments,
          assetValuation: formData.assetValuation
        });
        console.log('📄 Files stored successfully for draft:', currentDraftId);
      } catch (error) {
        console.error('Error storing files for draft:', error);
        showError('File Storage Warning', 'Your draft was saved but uploaded files may not persist between sessions.');
      }
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitConfirm(true);
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
      assetVotingType: formData.assetVotingType,
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
      services: formData.services,
      riskFactors: formData.riskFactors,
      useOfFunds: formData.useOfFunds
    };
    
    // Client-side validation
    const validation = validateProposalData(submissionData);
    if (!validation.isValid) {
      showError(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      
      // Submit to backend API
      const result = await createProposal(submissionData);
      
      if (result.success && result.data) {
        const proposalId = result.data.id || result.data.proposalId;
        
        console.log('✅ [CREATE PROPOSAL] Backend submission successful:', proposalId);
        
        // Add a reference to the backend proposal in our local store for tracking
        addBackendProposalReference(proposalId, {
          assetName: formData.assetName,
          assetType: formData.assetType,
          category: formData.category,
          location: formData.location,
          description: formData.description,
          targetAmount: formData.targetAmount,
          tokenPrice: formData.tokenPrice,
          expectedAPY: formData.expectedAPY,
          fundingDeadline: fundingDeadline,
          riskFactors: formData.riskFactors,
          useOfFunds: formData.useOfFunds
        });

        // If we were editing a draft, remove it from local store since it's now submitted to backend
        if (isEditingDraft && draftId) {
          deleteDraft(draftId);
          // Also cleanup stored files
          cleanupDraftFiles(draftId);
          console.log('🗑️ [CREATE PROPOSAL] Removed local draft and files after successful backend submission');
        }
        
        // Trigger AI analysis if suitable documents are available
        if (proposalId) {
          triggerAIAnalysis(proposalId);
        }
        
        // Schedule auto-communications for the new proposal
        if (proposalId) {
          try {
            await scheduleNotificationsForProposal(proposalId, 'current_user_id');
            
            // Only show notification info if auto-communications are configured
            if (hasConfiguredNotifications('current_user_id')) {
              info(
                'Auto-Communications Scheduled',
                'Investor notifications will be sent automatically based on your configured settings.',
                { duration: 5000 }
              );
            }
          } catch (error) {
            console.error('Failed to schedule auto-communications:', error);
            // Don't block submission for notification scheduling failures
          }
        }
        
        success(
          'Proposal Successfully Submitted!', 
          'Your proposal has been submitted to our backend system for review and will be evaluated within 3-5 business days. You will receive notifications about the review status.',
          {
            duration: 8000,
            actionLabel: 'View Backend Proposals',
            onAction: () => navigate('/marketplace') // Navigate to marketplace where backend proposals are displayed
          }
        );
        
        // Show follow-up info notification
        setTimeout(() => {
          info(
            'Proposal in Review Queue',
            'Your proposal is now in our backend system awaiting admin review. Check the marketplace to see all active proposals.',
            { duration: 10000 }
          );
        }, 3000);
        
        // Navigate to marketplace to see backend proposals
        navigate('/marketplace');
      } else {
        // Handle API errors - fallback to local store
        console.log('🔄 [CREATE PROPOSAL] API failed, falling back to local store');
        
        const localResult = addSubmission({
          ...submissionData,
          minimumInvestment: calculatedValues.minimumInvestment.toString(),
          fundingDeadline: fundingDeadline
        });
        
        if (localResult.success && localResult.proposalId) {
          // Trigger AI analysis if suitable documents are available
          triggerAIAnalysis(localResult.proposalId);
          
          success(
            'Proposal Submitted Successfully!', 
            'Your proposal has been submitted locally and will be synced when the server connection is restored.',
            {
              duration: 6000,
              actionLabel: 'View Status',
              onAction: () => navigate('/my-submissions')
            }
          );
          
          navigate('/my-submissions');
        } else {
          showError(result.error || 'Failed to submit proposal. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      
      // Fallback to local store for network errors
      console.log('🔄 [CREATE PROPOSAL] Network error, falling back to local store');
      
      const localResult = addSubmission({
        ...submissionData,
        minimumInvestment: calculatedValues.minimumInvestment.toString(),
        fundingDeadline: fundingDeadline
      });
      
      if (localResult.success && localResult.proposalId) {
        // Trigger AI analysis if suitable documents are available
        triggerAIAnalysis(localResult.proposalId);
        
        success(
          'Proposal Submitted Successfully!', 
          'Your proposal has been submitted offline and will be synced when connection is restored.',
          {
            duration: 6000,
            actionLabel: 'View Status',
            onAction: () => navigate('/my-submissions')
          }
        );
        
        navigate('/my-submissions');
      } else {
        showError('Failed to save proposal offline. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save functionality
  const performAutoSave = async () => {
    if (!autoSaveEnabled || isAutoSaving) return;
    
    // Only auto-save if there's meaningful content
    const hasContent = formData.assetName || formData.description || formData.assetType;
    if (!hasContent) return;

    setIsAutoSaving(true);
    
    try {
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
        assetVotingType: formData.assetVotingType,
        targetAmount: formData.targetAmount,
        tokenPrice: formData.tokenPrice,
        minimumInvestment: calculatedValues.minimumInvestment.toString(),
        expectedAPY: formData.expectedAPY,
        fundingDeadline: fundingDeadline,
        businessPlan: formData.businessPlan?.name,
        financialProjections: formData.financialProjections?.name,
        legalDocuments: formData.legalDocuments?.name,
        assetValuation: formData.assetValuation?.name,
        services: formData.services,
        riskFactors: formData.riskFactors,
        useOfFunds: formData.useOfFunds
      };

      let currentDraftId = draftId;

      if (isEditingDraft && draftId) {
        updateDraft(draftId, submissionData);
      } else {
        const newDraftId = saveDraft(submissionData);
        setDraftId(newDraftId);
        setIsEditingDraft(true);
        currentDraftId = newDraftId;
      }

      // Auto-save files if any are present (don't await to avoid blocking UI)
      if (currentDraftId && (formData.businessPlan || formData.financialProjections || formData.legalDocuments || formData.assetValuation)) {
        storeAllFiles(currentDraftId, {
          businessPlan: formData.businessPlan,
          financialProjections: formData.financialProjections,
          legalDocuments: formData.legalDocuments,
          assetValuation: formData.assetValuation
        }).catch(error => {
          console.error('Auto-save file storage failed:', error);
        });
      }
      
      setLastAutoSave(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const autoSaveTimer = setTimeout(() => {
      performAutoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, autoSaveEnabled, isEditingDraft, draftId]);

  // Auto-save on form changes (debounced)
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const debounceTimer = setTimeout(() => {
      performAutoSave();
    }, 5000); // Auto-save 5 seconds after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [
    formData.assetName,
    formData.description,
    formData.assetType,
    formData.category,
    formData.location,
    formData.targetAmount,
    formData.tokenPrice,
    formData.expectedAPY,
    formData.riskFactors,
    formData.useOfFunds
  ]);

  // AI Assistant handlers
  const handleAISuggestionApply = (field: string, value: string) => {
    handleInputChange(field as keyof FormData, value);
  };

  const handleAIFieldGenerate = (field: string) => {
    // This is handled by the AI Assistant component
    // The generated content will be applied via handleAISuggestionApply
  };

  // Service management functions
  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      serviceName: '',
      personName: '',
      cost: '',
      paymentMethod: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const removeService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    }));
  };

  const updateService = (serviceId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    }));
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
        assetVotingType: formData.assetVotingType,
        targetAmount: formData.targetAmount,
        tokenPrice: formData.tokenPrice,
        minimumInvestment: calculatedValues.minimumInvestment.toString(), // Use calculated value
        expectedAPY: formData.expectedAPY,
        fundingDeadline: fundingDeadline,
        businessPlan: formData.businessPlan?.name,
        financialProjections: formData.financialProjections?.name,
        legalDocuments: formData.legalDocuments?.name,
        assetValuation: formData.assetValuation?.name,
        services: formData.services,
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
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                  : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'
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

      <TouchSelect
        label="Asset Voting Type *"
        value={formData.assetVotingType}
        onChange={(value) => handleInputChange('assetVotingType', value as string)}
        options={[
          { value: 'open', label: 'Open Asset' },
          { value: 'closed', label: 'Closed Asset' }
        ]}
        placeholder="Select voting type"
        size="lg"
        helper="Open: Shareholders can submit voting proposals. Closed: Only creator/owner can submit voting proposals."
        required
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
            error={apyError}
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

  const renderCostServices = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Cost & Services
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Outline all services that will be provided by the asset creator, associated coworkers, or employees. 
          Include service details, personnel information, costs, and payment methods.
        </p>
      </div>

      {formData.services.map((service, index) => (
        <div key={service.id} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Service {index + 1}
            </h4>
            {formData.services.length > 1 && (
              <button
                onClick={() => removeService(service.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Remove service"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TouchInput
              label="Service Name *"
              type="text"
              value={service.serviceName}
              onChange={(e) => updateService(service.id, 'serviceName', e.target.value)}
              placeholder="e.g., Property Management, Financial Consulting"
              size="lg"
              required
            />

            <TouchInput
              label="Person/Team Name *"
              type="text"
              value={service.personName}
              onChange={(e) => updateService(service.id, 'personName', e.target.value)}
              placeholder="e.g., John Smith, Management Team"
              size="lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TouchInput
              label="Cost *"
              type="text"
              value={service.cost}
              onChange={(e) => updateService(service.id, 'cost', formatCurrency(e.target.value))}
              placeholder="e.g., $5,000, 2% of revenue"
              size="lg"
              leftIcon={<DollarSign />}
              helper="Include currency and specify if it's a flat fee, percentage, etc."
              required
            />

            <TouchSelect
              label="Payment Method *"
              value={service.paymentMethod}
              onChange={(value) => updateService(service.id, 'paymentMethod', value as string)}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annually', label: 'Annually' },
                { value: 'one-time', label: 'One-time Payment' },
                { value: 'per-transaction', label: 'Per Transaction' },
                { value: 'percentage', label: 'Percentage of Revenue' },
                { value: 'milestone', label: 'Milestone-based' }
              ]}
              placeholder="Select payment method"
              size="lg"
              required
            />
          </div>

          <div className="mt-6">
            <TouchTextarea
              label="Service Description"
              value={service.description}
              onChange={(e) => updateService(service.id, 'description', e.target.value)}
              placeholder="Detailed description of the service, responsibilities, and deliverables..."
              size="lg"
              autoResize
              maxHeight={150}
              showCharCount
              maxLength={500}
              helper="Optional: Provide additional details about this service"
            />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-center">
        <button
          onClick={addService}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Service</span>
        </button>
      </div>

      {formData.services.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Services Added
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add at least one service to continue with your proposal.
          </p>
          <CF1Button
            onClick={addService}
            variant="primary"
            size="md"
            icon={Plus}
            iconPosition="left"
          >
            Add First Service
          </CF1Button>
        </div>
      )}
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
          Submission Process
        </h4>
        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
          <p>
            <strong>When you click "Submit Proposal for Review":</strong>
          </p>
          <ul className="ml-4 space-y-1">
            <li>• Your proposal will be sent to our compliance team for review</li>
            <li>• You'll receive a confirmation notification immediately</li>
            <li>• The review process takes 3-5 business days</li>
            <li>• You'll be notified of the decision via email and in-app notifications</li>
            <li>• If approved, your proposal will go live for investor funding</li>
          </ul>
          <p className="text-xs mt-3 opacity-80">
            Note: This is different from saving a draft, which keeps your work private until you're ready to submit.
          </p>
        </div>
      </div>
    </div>
  );

  // Don't render the component if user is not authenticated
  const isAuthenticated = address || selectedRole;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to create proposals.
          </p>
        </div>
      </div>
    );
  }

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
            {currentSubmission?.status === 'changes_requested' ? 'Address Required Changes' : 
             isEditingDraft ? 'Edit Draft Proposal' : 'Submit New Proposal'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentSubmission?.status === 'changes_requested' ? 'Update your proposal based on admin feedback' :
             isEditingDraft ? 'Edit and submit your saved draft' : 'Create a new tokenized asset proposal'}
          </p>
          
          {/* Auto-save status */}
          {autoSaveEnabled && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              {isAutoSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Auto-saving...</span>
                </>
              ) : lastAutoSave ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Draft saved at {lastAutoSave}
                  </span>
                </>
              ) : null}
              <button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                title={autoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
              >
                {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
              </button>
            </div>
          )}
        </div>
        
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Admin Comments Section - Show for changes requested */}
      {currentSubmission && currentSubmission.status === 'changes_requested' && currentSubmission.reviewComments && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-2">
                Changes Requested by Admin
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {currentSubmission.reviewComments}
                </p>
              </div>
              {currentSubmission.reviewDate && (
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Reviewed on {new Date(currentSubmission.reviewDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8">
        {renderStepIndicator()}

        <div className="min-h-[500px]">
          {currentStep === 1 && renderAssetDetails()}
          {currentStep === 2 && renderFinancialTerms()}
          {currentStep === 3 && renderDocumentation()}
          {currentStep === 4 && renderCostServices()}
          {currentStep === 5 && renderReviewSubmit()}
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
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                title={isEditingDraft ? 'Save changes to your draft' : 'Save your work as a draft'}
              >
                <Save className="w-4 h-4" />
                <span>{isEditingDraft ? 'Update Draft' : 'Save as Draft'}</span>
              </button>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <CF1Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                variant={validateStep(currentStep) ? "primary" : "secondary"}
                size="md"
                icon={ArrowRight}
                iconPosition="right"
              >
                Next
              </CF1Button>
            ) : (
              <CF1Button
                onClick={handleSubmitConfirm}
                disabled={!validateStep(currentStep) || isSubmitting}
                variant={validateStep(currentStep) && !isSubmitting ? "primary" : "secondary"}
                size="md"
                loading={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Proposal for Review</span>
                  </>
                )}
              </CF1Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Proposal Assistant */}
      <AIProposalAssistant
        formData={formData}
        onSuggestionApply={handleAISuggestionApply}
        onFieldGenerate={handleAIFieldGenerate}
        isVisible={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Submit Proposal for Review
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you ready to submit "<strong>{formData.assetName}</strong>" for review? 
              Once submitted, your proposal will be evaluated by our team within 3-5 business days.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                What happens next:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Your proposal enters the review queue</li>
                <li>• Our team evaluates all documentation</li>
                <li>• You'll receive status updates via notifications</li>
                <li>• If approved, your proposal goes live for investors</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <CF1Button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
                variant="primary"
                size="md"
                loading={isSubmitting}
                fullWidth
              >
                Submit Proposal
              </CF1Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProposal;