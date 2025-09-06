import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  FileText,
  CreditCard,
  User,
  Building,
  X
} from 'lucide-react';
import type { VerificationLevel } from '../../types/verification';
import { useVerificationStore } from '../../store/verificationStore';

interface VerificationGateProps {
  action: 'invest' | 'create_proposal' | 'vote';
  amount?: number;
  proposalId?: string;
  requiredLevel?: VerificationLevel;
  children: React.ReactNode;
  onVerificationStart?: () => void;
}

export const VerificationGate: React.FC<VerificationGateProps> = ({
  action,
  amount,
  proposalId,
  requiredLevel = 'verified',
  children,
  onVerificationStart
}) => {
  const [showModal, setShowModal] = useState(false);
  const {
    level,
    canPerformAction,
    getRequiredStepsForAction,
    checkInvestmentEligibility,
    basicVerification,
    identityVerification,
    accreditedVerification
  } = useVerificationStore();

  const canPerform = canPerformAction(action);
  const requiredSteps = getRequiredStepsForAction(action);
  
  // Check investment-specific eligibility
  const investmentCheck = action === 'invest' && amount && proposalId 
    ? checkInvestmentEligibility(amount, proposalId)
    : null;

  // Progressive verification logic - allow users to proceed after basic verification for invest action
  if (action === 'invest') {
    // If user has basic verification, let them proceed to investment flow
    // where they'll get more specific guidance about wallet/identity requirements
    if (basicVerification?.status === 'approved') {
      return <>{children}</>;
    }
  } else {
    // For other actions, use the original logic
    if (canPerform && (!investmentCheck || investmentCheck.eligible)) {
      return <>{children}</>;
    }
  }

  // Otherwise render the gate
  const handleClick = () => {
    setShowModal(true);
    onVerificationStart?.();
  };

  const getActionIcon = () => {
    switch (action) {
      case 'invest':
        return <CreditCard className="w-6 h-6" />;
      case 'create_proposal':
        return <FileText className="w-6 h-6" />;
      case 'vote':
        return <Building className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'invest':
        return 'Investment Verification Required';
      case 'create_proposal':
        return 'Proposal Creation Verification Required';
      case 'vote':
        return 'Voting Verification Required';
      default:
        return 'Verification Required';
    }
  };

  const getActionDescription = () => {
    if (investmentCheck && !investmentCheck.eligible) {
      return investmentCheck.reason;
    }

    switch (action) {
      case 'invest':
        return 'SEC regulations require identity verification before investing in Reg CF offerings.';
      case 'create_proposal':
        return 'Basic verification is required to submit asset tokenization proposals.';
      case 'vote':
        return 'Identity verification is required to participate in governance voting.';
      default:
        return 'Verification is required to access this feature.';
    }
  };

  const getVerificationSteps = () => {
    const steps = [];

    // Basic verification
    if (requiredSteps.includes('basic_verification')) {
      steps.push({
        id: 'basic',
        title: 'Basic Information',
        description: 'Name, email, and terms acceptance',
        icon: <User className="w-5 h-5" />,
        status: !basicVerification ? 'pending' : basicVerification.status,
        estimatedTime: '2 minutes',
        required: true
      });
    }

    // Identity verification
    if (requiredSteps.includes('identity_verification')) {
      steps.push({
        id: 'identity',
        title: 'Identity Verification',
        description: 'Government ID and address verification',
        icon: <Shield className="w-5 h-5" />,
        status: !identityVerification ? 'pending' : identityVerification.status,
        estimatedTime: '5-10 minutes',
        required: true
      });
    }

    // Optional accredited investor verification
    if (action === 'invest' && level !== 'accredited') {
      steps.push({
        id: 'accredited',
        title: 'Accredited Investor (Optional)',
        description: 'Higher investment limits for qualified investors',
        icon: <Building className="w-5 h-5" />,
        status: !accreditedVerification ? 'not_started' : accreditedVerification.status,
        estimatedTime: '1-2 business days',
        required: false
      });
    }

    return steps;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <>
      {/* Disabled/Gated Content */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors text-sm"
          >
            {getActionIcon()}
            <span>Verify to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  {getActionIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getActionTitle()}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete verification to proceed
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {getActionDescription()}
                </p>
              </div>

              {/* Investment Limits Info */}
              {investmentCheck && !investmentCheck.eligible && investmentCheck.investmentLimits && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Investment Limits
                  </h4>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p>Maximum this offering: ${investmentCheck.investmentLimits.perOfferingLimit.toLocaleString()}</p>
                    <p>Remaining this year: ${investmentCheck.investmentLimits.remainingThisYear.toLocaleString()}</p>
                    {investmentCheck.amount && (
                      <p className="font-medium">Suggested amount: ${investmentCheck.amount.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Verification Steps
                </h3>
                
                {getVerificationSteps().map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      step.status === 'approved' 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : step.status === 'pending'
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(step.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {step.title}
                            {step.required && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {step.estimatedTime}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {step.description}
                        </p>
                        
                        {step.status === 'pending' && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2 text-xs text-yellow-600 dark:text-yellow-400">
                              <Clock className="w-3 h-3" />
                              <span>Under review</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>* Required for this action</p>
                <p>All data is encrypted and securely stored</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    // Navigate to verification flow
                    window.location.href = '/profile/verification';
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2"
                >
                  <span>Start Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};