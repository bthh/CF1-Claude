import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Shield, 
  Building,
  ArrowRight
} from 'lucide-react';
import type { VerificationLevel, VerificationStatus } from '../../types/verification';
import { useVerificationStore } from '../../store/verificationStore';

interface VerificationProgressProps {
  currentStep?: string;
  onStepClick?: (step: string) => void;
  compact?: boolean;
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({
  currentStep,
  onStepClick,
  compact = false
}) => {
  const {
    level,
    basicVerification,
    identityVerification,
    accreditedVerification,
    investmentLimits
  } = useVerificationStore();

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name, email, and terms',
      icon: <User className="w-5 h-5" />,
      status: getStepStatus('basic'),
      level: 'basic' as VerificationLevel,
      estimatedTime: '2 minutes',
      benefits: ['Create proposals', 'Browse marketplace', 'Join discussions']
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Government ID and address',
      icon: <Shield className="w-5 h-5" />,
      status: getStepStatus('identity'),
      level: 'verified' as VerificationLevel,
      estimatedTime: '5-10 minutes',
      benefits: ['Invest in offerings', 'Participate in governance', 'Full platform access']
    },
    {
      id: 'accredited',
      title: 'Accredited Investor',
      description: 'Higher investment limits (optional)',
      icon: <Building className="w-5 h-5" />,
      status: getStepStatus('accredited'),
      level: 'accredited' as VerificationLevel,
      estimatedTime: '1-2 business days',
      benefits: ['Unlimited investment amounts', 'Exclusive opportunities', 'Priority access'],
      optional: true
    }
  ];

  function getStepStatus(stepId: string): VerificationStatus {
    switch (stepId) {
      case 'basic':
        return basicVerification?.status || 'not_started';
      case 'identity':
        return identityVerification?.status || 'not_started';
      case 'accredited':
        return accreditedVerification?.status || 'not_started';
      default:
        return 'not_started';
    }
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full" />;
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return 'Completed';
      case 'pending':
        return 'In Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const isStepClickable = (step: any) => {
    if (step.status === 'approved') return false;
    if (step.id === 'basic') return true;
    if (step.id === 'identity') return basicVerification?.status === 'approved';
    if (step.id === 'accredited') return identityVerification?.status === 'approved';
    return false;
  };

  const getCurrentLevelBenefits = () => {
    const currentLevelStep = steps.find(step => step.level === level);
    return currentLevelStep?.benefits || [];
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-2 ${
              step.status === 'approved' ? 'text-green-600' : 
              step.status === 'pending' ? 'text-yellow-600' : 
              'text-gray-400'
            }`}>
              {getStatusIcon(step.status)}
              <span className="text-sm font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-300 mx-3" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Level Summary */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verification Level: {level.charAt(0).toUpperCase() + level.slice(1)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {level === 'anonymous' && 'Complete verification to unlock platform features'}
              {level === 'basic' && 'You can create proposals and browse the marketplace'}
              {level === 'verified' && 'You have full access to invest and participate in governance'}
              {level === 'accredited' && 'You have unlimited investment access and priority features'}
            </p>
          </div>
          
          {investmentLimits && level !== 'anonymous' && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Investment Limit</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {investmentLimits.annualLimit === Infinity 
                  ? 'Unlimited' 
                  : `$${investmentLimits.annualLimit.toLocaleString()}`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Verification Steps
        </h4>
        
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isClickable = isStepClickable(step);
          
          return (
            <div
              key={step.id}
              className={`relative p-6 border rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : step.status === 'approved'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : step.status === 'pending'
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              } ${!isClickable ? 'cursor-default' : ''}`}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              {/* Step indicator line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-8 top-16 w-0.5 h-8 ${
                  step.status === 'approved' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  step.status === 'approved' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : step.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                        {step.title}
                        {step.optional && (
                          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            Optional
                          </span>
                        )}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(step.status)}`}>
                          {getStatusText(step.status)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {step.estimatedTime}
                        </p>
                      </div>
                      {getStatusIcon(step.status)}
                    </div>
                  </div>
                  
                  {/* Benefits */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Benefits:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.benefits.map((benefit, benefitIndex) => (
                        <span
                          key={benefitIndex}
                          className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {isClickable && step.status === 'not_started' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStepClick?.(step.id);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                    >
                      <span>Start Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  
                  {step.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          We're reviewing your submission. You'll be notified once it's complete.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {step.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Verification was rejected. Please review and resubmit.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Current Benefits */}
      {level !== 'anonymous' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Your Current Benefits:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getCurrentLevelBenefits().map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};