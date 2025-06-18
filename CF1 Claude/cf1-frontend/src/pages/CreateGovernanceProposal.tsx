import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Users, TrendingUp, Eye, DollarSign, Save } from 'lucide-react';
import { useGovernanceStore } from '../store/governanceStore';

interface ProposalFormData {
  proposalType: 'dividend' | 'renovation' | 'sale' | 'management' | 'expansion';
  assetId: string;
  title: string;
  description: string;
  rationale: string;
  requiredAmount?: string;
  expectedImpact: string;
  votingDuration: string;
  additionalDetails: string;
  isPrivate: boolean; // For Card 22: Public/Private visibility
}

const CreateGovernanceProposal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addProposal, saveDraft, updateDraft, getProposalById } = useGovernanceStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    proposalType: 'dividend',
    assetId: '',
    title: '',
    description: '',
    rationale: '',
    requiredAmount: '',
    expectedImpact: '',
    votingDuration: '7',
    additionalDetails: '',
    isPrivate: false // Default to public
  });

  const proposalTypes = [
    {
      id: 'dividend' as const,
      name: 'Dividend Distribution',
      description: 'Propose distribution of earnings to token holders',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'renovation' as const,
      name: 'Property Improvement',
      description: 'Propose renovations or improvements to increase asset value',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      id: 'management' as const,
      name: 'Management Changes',
      description: 'Propose changes to asset management or operational procedures',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'expansion' as const,
      name: 'Business Expansion',
      description: 'Propose expansion of asset capabilities or business operations',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'sale' as const,
      name: 'Asset Sale',
      description: 'Propose partial or complete sale of asset',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  // Load draft if editing
  useEffect(() => {
    const draftParam = searchParams.get('draft');
    if (draftParam) {
      const draft = getProposalById(draftParam);
      if (draft && draft.status === 'draft') {
        setIsEditingDraft(true);
        setDraftId(draftParam);
        setFormData({
          proposalType: draft.proposalType,
          assetId: draft.assetId,
          title: draft.title,
          description: draft.description,
          rationale: draft.rationale,
          requiredAmount: draft.requiredAmount || '',
          expectedImpact: draft.impact,
          votingDuration: draft.votingDuration.toString(),
          additionalDetails: draft.additionalDetails || ''
        });
      }
    }
  }, [searchParams, getProposalById]);

  // Mock user assets data
  const userAssets = [
    { id: 'manhattan-office', name: 'Manhattan Office Complex', tokens: 450, type: 'Commercial Real Estate' },
    { id: 'gold-vault', name: 'Gold Bullion Vault', tokens: 580, type: 'Precious Metals' },
    { id: 'art-collection', name: 'Contemporary Art Collection', tokens: 125, type: 'Art & Collectibles' },
    { id: 'wine-collection', name: 'Rare Wine Collection', tokens: 92, type: 'Collectibles' }
  ];

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    const selectedAsset = userAssets.find(asset => asset.id === formData.assetId);
    if (!selectedAsset) return;

    const proposalData = {
      title: formData.title,
      description: formData.description,
      assetName: selectedAsset.name,
      assetType: selectedAsset.type,
      assetId: formData.assetId,
      proposalType: formData.proposalType,
      rationale: formData.rationale,
      impact: formData.expectedImpact,
      requiredAmount: formData.requiredAmount,
      additionalDetails: formData.additionalDetails,
      votingDuration: parseInt(formData.votingDuration),
      userTokens: selectedAsset.tokens,
      userVotingPower: selectedAsset.tokens
    };

    if (isEditingDraft && draftId) {
      updateDraft(draftId, proposalData);
      alert('Draft updated successfully!');
    } else {
      const newDraftId = saveDraft(proposalData);
      setDraftId(newDraftId);
      setIsEditingDraft(true);
      alert('Draft saved successfully!');
    }
  };

  const handleSubmit = () => {
    const selectedAsset = userAssets.find(asset => asset.id === formData.assetId);
    if (!selectedAsset) return;

    const proposalData = {
      title: formData.title,
      description: formData.description,
      assetName: selectedAsset.name,
      assetType: selectedAsset.type,
      assetId: formData.assetId,
      proposalType: formData.proposalType,
      rationale: formData.rationale,
      impact: formData.expectedImpact,
      requiredAmount: formData.requiredAmount,
      additionalDetails: formData.additionalDetails,
      votingDuration: parseInt(formData.votingDuration),
      userTokens: selectedAsset.tokens,
      userVotingPower: selectedAsset.tokens,
      isPrivate: formData.isPrivate, // Add privacy setting
      visibilityPolicy: 'creator_decides' // For now, assume creator decides policy
    };

    const result = addProposal(proposalData);
    
    if (result.success && result.proposalId) {
      alert('Governance proposal submitted successfully! Your proposal will be reviewed by platform administrators before being made available for voting. You will be notified of the review decision.');
      navigate('/governance'); // Redirect to main governance page since proposal won't be immediately visible
    } else {
      // Save as draft if submission fails
      const draftId = saveDraft(proposalData);
      
      // Show error message with draft navigation
      const errorModal = document.createElement('div');
      errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      errorModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Submission Failed</h3>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            ${result.error || 'There was a problem submitting your proposal. It has been saved to drafts.'}
          </p>
          <div class="flex space-x-3">
            <button id="close-modal" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Stay Here
            </button>
            <button id="go-to-drafts" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              View Drafts
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorModal);
      
      document.getElementById('close-modal')?.addEventListener('click', () => {
        document.body.removeChild(errorModal);
      });
      
      document.getElementById('go-to-drafts')?.addEventListener('click', () => {
        document.body.removeChild(errorModal);
        navigate('/governance/drafts');
      });
    }
  };

  const selectedProposalType = proposalTypes.find(type => type.id === formData.proposalType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/governance')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditingDraft ? 'Edit Draft Proposal' : 'Create Governance Proposal'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditingDraft ? 'Edit and submit your saved draft' : 'Submit a proposal for asset governance decisions'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {currentStep > step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              {step < 3 && (
                <div className={`w-24 h-0.5 mx-4 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentStep === 1 && 'Proposal Type & Asset'}
            {currentStep === 2 && 'Proposal Details'}
            {currentStep === 3 && 'Review & Submit'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentStep === 1 && 'Select the type of proposal and target asset'}
            {currentStep === 2 && 'Provide detailed information about your proposal'}
            {currentStep === 3 && 'Review your proposal before submission'}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Proposal Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Proposal Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proposalTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.proposalType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleInputChange('proposalType', type.id)}
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${type.bgColor}`}>
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Asset Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Target Asset</h3>
              <div className="space-y-3">
                {userAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.assetId === asset.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleInputChange('assetId', asset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{asset.tokens} tokens</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your holdings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief, descriptive title for your proposal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voting Duration
                </label>
                <select
                  value={formData.votingDuration}
                  onChange={(e) => handleInputChange('votingDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPrivate}
                      onChange={() => handleInputChange('isPrivate', false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPrivate}
                      onChange={() => handleInputChange('isPrivate', true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Private</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.isPrivate ? 'Only token holders can see this proposal' : 'Everyone can see this proposal'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proposal Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of what you're proposing..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rationale *
              </label>
              <textarea
                value={formData.rationale}
                onChange={(e) => handleInputChange('rationale', e.target.value)}
                placeholder="Why is this proposal necessary? What problem does it solve?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {(formData.proposalType === 'renovation' || formData.proposalType === 'expansion') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Required Amount (USD)
                </label>
                <input
                  type="text"
                  value={formData.requiredAmount}
                  onChange={(e) => handleInputChange('requiredAmount', e.target.value)}
                  placeholder="$0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Impact *
              </label>
              <input
                type="text"
                value={formData.expectedImpact}
                onChange={(e) => handleInputChange('expectedImpact', e.target.value)}
                placeholder="e.g., +$2.50/token, +8% property value, -0.5% fees"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Details
              </label>
              <textarea
                value={formData.additionalDetails}
                onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                placeholder="Any additional information, timelines, or considerations..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proposal Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Proposal Type</h4>
                  <div className="flex items-center space-x-2">
                    {selectedProposalType && (
                      <>
                        <div className={`p-2 rounded-lg ${selectedProposalType.bgColor}`}>
                          <selectedProposalType.icon className={`w-4 h-4 ${selectedProposalType.color}`} />
                        </div>
                        <span>{selectedProposalType.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Target Asset</h4>
                  <p>{userAssets.find(asset => asset.id === formData.assetId)?.name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Title</h4>
                  <p>{formData.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Voting Duration</h4>
                  <p>{formData.votingDuration} days</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300">{formData.description}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Expected Impact</h4>
                  <p className="text-green-600 font-medium">{formData.expectedImpact}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    Once submitted, your proposal will be reviewed by platform administrators before becoming visible to token holders. 
                    If approved, voting will begin and last for {formData.votingDuration} days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="flex space-x-3">
            {/* Save Draft Button - only show if not in final step */}
            {currentStep < 3 && formData.title && formData.assetId && (
              <button
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingDraft ? 'Update Draft' : 'Save Draft'}</span>
              </button>
            )}
            
            <button
              onClick={() => navigate('/governance')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.proposalType || !formData.assetId)) ||
                  (currentStep === 2 && (!formData.title || !formData.description || !formData.rationale || !formData.expectedImpact))
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <div className="flex space-x-3">
                {/* Save Draft Button in final step */}
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditingDraft ? 'Update Draft' : 'Save as Draft'}</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {isEditingDraft ? 'Submit Proposal' : 'Submit Proposal'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGovernanceProposal;