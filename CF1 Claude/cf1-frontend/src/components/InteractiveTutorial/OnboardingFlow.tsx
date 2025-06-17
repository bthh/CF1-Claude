import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Wallet, Shield, TrendingUp, Users, Zap, Target } from 'lucide-react';
import { AnimatedButton, AnimatedCounter } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    completed?: boolean;
  };
  optional?: boolean;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CF1',
      description: 'Your gateway to regulated Real-World Asset tokenization. Join thousands of investors already building wealth through our platform.',
      icon: <Target className="w-8 h-8 text-blue-600" />
    },
    {
      id: 'connect-wallet',
      title: 'Connect Your Wallet',
      description: 'Securely connect your crypto wallet to start investing. We support all major wallets for maximum convenience.',
      icon: <Wallet className="w-8 h-8 text-purple-600" />,
      action: {
        label: 'Connect Wallet',
        onClick: () => {
          // Simulate wallet connection
          setTimeout(() => {
            markStepComplete('connect-wallet');
          }, 2000);
        }
      }
    },
    {
      id: 'verification',
      title: 'Complete Verification',
      description: 'Quick KYC verification to comply with regulations and unlock all platform features. This usually takes 2-3 minutes.',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      action: {
        label: 'Start Verification',
        onClick: () => {
          // Navigate to verification
          setTimeout(() => {
            markStepComplete('verification');
          }, 1500);
        }
      }
    },
    {
      id: 'explore-assets',
      title: 'Explore Assets',
      description: 'Browse our curated marketplace of premium real-world assets. From real estate to renewable energy projects.',
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      action: {
        label: 'Browse Marketplace',
        onClick: () => {
          // Navigate to marketplace
          markStepComplete('explore-assets');
        }
      }
    },
    {
      id: 'join-community',
      title: 'Join the Community',
      description: 'Connect with other investors, share insights, and stay updated on platform developments.',
      icon: <Users className="w-8 h-8 text-pink-600" />,
      action: {
        label: 'Join Discord',
        onClick: () => {
          window.open('https://discord.gg/cf1', '_blank');
          markStepComplete('join-community');
        }
      },
      optional: true
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Congratulations! You\'re now ready to start investing in Real-World Assets. Your journey to building wealth starts here.',
      icon: <Zap className="w-8 h-8 text-yellow-600" />
    }
  ];

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const skipToEnd = () => {
    setCurrentStep(steps.length - 1);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isStepCompleted = completedSteps.includes(currentStepData.id);
  const canProceed = !currentStepData.action || isStepCompleted || currentStepData.optional;

  // Platform stats for motivation
  const [stats, setStats] = useState({
    totalInvestors: 2847,
    totalInvested: 12500000,
    assetsListed: 156,
    avgReturn: 12.5
  });

  useEffect(() => {
    // Animate stats on mount
    const timer = setInterval(() => {
      setStats(prev => ({
        totalInvestors: prev.totalInvestors + Math.floor(Math.random() * 3),
        totalInvested: prev.totalInvested + Math.floor(Math.random() * 10000),
        assetsListed: prev.assetsListed + (Math.random() > 0.95 ? 1 : 0),
        avgReturn: prev.avgReturn + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SwipeableModal
      isOpen={isOpen}
      onClose={onClose}
      swipeToClose={false}
      showCloseButton={false}
      className="max-w-2xl mx-auto"
    >
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700"></div>
        
        {/* Progress Bar */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Getting Started
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="relative p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: isAnimating ? 50 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center border-4 border-gray-100 dark:border-gray-600">
                  {currentStepData.icon}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {currentStepData.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto"
              >
                {currentStepData.description}
              </motion.p>

              {/* Platform Stats (on welcome step) */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8"
                >
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      <AnimatedCounter value={stats.totalInvestors} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Investors</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      $<AnimatedCounter value={stats.totalInvested} decimals={0} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Invested</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      <AnimatedCounter value={stats.assetsListed} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Assets</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                      <AnimatedCounter value={stats.avgReturn} decimals={1} suffix="%" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Return</div>
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              {currentStepData.action && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <AnimatedButton
                    onClick={currentStepData.action.onClick}
                    disabled={isStepCompleted}
                    variant="primary"
                    size="lg"
                    className="w-full max-w-xs mx-auto"
                    loading={isStepCompleted}
                  >
                    {isStepCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      currentStepData.action.label
                    )}
                  </AnimatedButton>
                  
                  {currentStepData.optional && !isStepCompleted && (
                    <button
                      onClick={nextStep}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                    >
                      Skip for now
                    </button>
                  )}
                </motion.div>
              )}

              {/* Progress Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center space-x-2 mt-8"
              >
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="relative p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  ← Back
                </button>
              )}
              
              {currentStep < steps.length - 2 && (
                <button
                  onClick={skipToEnd}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline"
                >
                  Skip tour
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep === steps.length - 1 ? (
                <AnimatedButton
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  variant="primary"
                  size="lg"
                >
                  Start Investing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={nextStep}
                  disabled={!canProceed}
                  variant="primary"
                >
                  {currentStep === 0 ? 'Get Started' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </AnimatedButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </SwipeableModal>
  );
};

// Hook for managing onboarding state
export const useOnboardingFlow = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('cf1_onboarding_completed');
    if (completed) {
      setHasCompletedOnboarding(true);
    } else {
      // Show onboarding for new users after a brief delay
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('cf1_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('cf1_onboarding_completed');
    setHasCompletedOnboarding(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    restartOnboarding,
    setShowOnboarding
  };
};