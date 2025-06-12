import React, { useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VerificationProgress } from '../components/Verification/VerificationProgress';
import { BasicVerificationForm } from '../components/Verification/BasicVerificationForm';
import { useVerificationStore } from '../store/verificationStore';

const Verification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const { level, getNextVerificationStep } = useVerificationStore();

  // Auto-select next step if none selected
  React.useEffect(() => {
    if (!currentStep) {
      const nextStep = getNextVerificationStep();
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [currentStep, getNextVerificationStep]);

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleStepComplete = () => {
    // Move to next step or show completion
    const nextStep = getNextVerificationStep();
    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      setCurrentStep(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(null);
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicVerificationForm
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        );
      case 'identity':
        return (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Identity Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This form is coming soon. For now, identity verification is simulated.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to Overview
            </button>
          </div>
        );
      case 'accredited':
        return (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accredited Investor Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This form is coming soon. For now, accredited verification is simulated.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to Overview
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Account Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Secure your account and unlock platform features
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {currentStep ? (
            <div className="p-8">
              {renderStepForm()}
            </div>
          ) : (
            <div className="p-8">
              <VerificationProgress
                currentStep={currentStep || undefined}
                onStepClick={handleStepClick}
              />
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-800 dark:text-blue-300 text-sm mb-4">
            Verification helps us comply with securities regulations and keeps your account secure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Why is verification required?
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                SEC Regulation CF requires identity verification before investing in securities offerings.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Is my data secure?
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                All personal information is encrypted and stored securely. We never share your data without consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;