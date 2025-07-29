import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, ArrowRight, ArrowLeft, Target, CheckCircle, Book } from 'lucide-react';
import { AnimatedButton } from '../LoadingStates/TransitionWrapper';
import { SwipeableModal } from '../GestureComponents/SwipeableModal';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'input' | 'scroll' | 'wait';
  content: React.ReactNode;
  skippable?: boolean;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'feature' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  prerequisites?: string[];
}

interface TutorialSystemProps {
  className?: string;
}

// Tutorial definitions
const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with CF1',
    description: 'Learn the basics of navigating the CF1 platform',
    category: 'onboarding',
    difficulty: 'beginner',
    estimatedTime: 5,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to CF1',
        description: 'Your gateway to Real-World Asset tokenization',
        content: (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Book className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold">Welcome to CF1!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              CF1 is a regulated platform for investing in Real-World Assets through blockchain technology. 
              Let's take a quick tour to get you familiar with the key features.
            </p>
          </div>
        )
      },
      {
        id: 'navigation',
        title: 'Platform Navigation',
        description: 'Understanding the main navigation areas',
        target: '[data-tutorial="sidebar"]',
        position: 'right',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Navigation Sidebar</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The sidebar contains all the main sections of the platform:
            </p>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Dashboard:</strong> Your portfolio overview</li>
              <li>• <strong>Marketplace:</strong> Browse available assets</li>
              <li>• <strong>Portfolio:</strong> Manage your investments</li>
              <li>• <strong>Launchpad:</strong> Discover new opportunities</li>
            </ul>
          </div>
        )
      },
      {
        id: 'marketplace',
        title: 'Exploring the Marketplace',
        description: 'Discover investment opportunities',
        target: '[data-tutorial="marketplace-link"]',
        action: 'click',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Asset Marketplace</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The marketplace is where you can browse and invest in tokenized real-world assets. 
              Click the Marketplace link to explore available investment opportunities.
            </p>
          </div>
        )
      },
      {
        id: 'profile',
        title: 'Your Profile & Verification',
        description: 'Complete your profile for full access',
        target: '[data-tutorial="profile-menu"]',
        position: 'bottom',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Profile & Verification</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete your profile verification to unlock all platform features:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Basic verification for browsing</li>
              <li>• Identity verification for investing</li>
              <li>• Accredited investor status for premium assets</li>
            </ul>
          </div>
        )
      },
      {
        id: 'complete',
        title: 'Ready to Start!',
        description: 'You\'re all set to begin investing',
        content: (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">You're Ready!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You've completed the basic tutorial. Feel free to explore the platform and remember 
              you can access help tutorials anytime from the Quick Actions menu.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'making-investment',
    title: 'Making Your First Investment',
    description: 'Step-by-step guide to investing in assets',
    category: 'feature',
    difficulty: 'beginner',
    estimatedTime: 8,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'asset-selection',
        title: 'Selecting an Asset',
        description: 'How to evaluate and choose investments',
        target: '[data-tutorial="asset-card"]',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Choosing Your Investment</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              When selecting an asset, consider:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Asset type and location</li>
              <li>• Expected returns and risk level</li>
              <li>• Funding progress and timeline</li>
              <li>• Minimum investment amount</li>
            </ul>
          </div>
        )
      },
      {
        id: 'investment-modal',
        title: 'Investment Process',
        description: 'Understanding the investment workflow',
        target: '[data-tutorial="invest-button"]',
        action: 'click',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Investment Modal</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The investment modal guides you through:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Choosing investment amount</li>
              <li>• Reviewing terms and conditions</li>
              <li>• Confirming transaction details</li>
              <li>• Processing blockchain transaction</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Platform Features',
    description: 'Explore advanced tools and capabilities',
    category: 'advanced',
    difficulty: 'advanced',
    estimatedTime: 15,
    prerequisites: ['getting-started', 'making-investment'],
    steps: [
      {
        id: 'analytics',
        title: 'Analytics Dashboard',
        description: 'Understanding your investment performance',
        target: '[data-tutorial="analytics"]',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Advanced Analytics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The analytics dashboard provides deep insights into:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Portfolio performance over time</li>
              <li>• Asset allocation breakdown</li>
              <li>• Risk assessment metrics</li>
              <li>• Market trend analysis</li>
            </ul>
          </div>
        )
      },
      {
        id: 'defi-features',
        title: 'DeFi Integration',
        description: 'Lending and borrowing capabilities',
        target: '[data-tutorial="defi-section"]',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">DeFi Features</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access decentralized finance features:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Lend assets to earn yield</li>
              <li>• Borrow against your holdings</li>
              <li>• Participate in liquidity pools</li>
              <li>• Stake tokens for rewards</li>
            </ul>
          </div>
        )
      }
    ]
  }
];

export const TutorialSystem: React.FC<TutorialSystemProps> = ({ className = '' }) => {
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Load completed tutorials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cf1_completed_tutorials');
    if (saved) {
      setCompletedTutorials(JSON.parse(saved));
    }
  }, []);

  // Save completed tutorials
  const markTutorialComplete = (tutorialId: string) => {
    const updated = [...completedTutorials, tutorialId];
    setCompletedTutorials(updated);
    localStorage.setItem('cf1_completed_tutorials', JSON.stringify(updated));
  };

  // Start tutorial
  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setShowTutorialMenu(false);
  };

  // End tutorial
  const endTutorial = () => {
    if (activeTutorial && currentStepIndex >= activeTutorial.steps.length - 1) {
      markTutorialComplete(activeTutorial.id);
    }
    setActiveTutorial(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setHighlightedElement(null);
    removeHighlight();
  };

  // Navigation
  const nextStep = () => {
    if (activeTutorial && currentStepIndex < activeTutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      endTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Highlight target element
  const highlightElement = (selector: string) => {
    removeHighlight();
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const removeHighlight = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tutorial-highlight');
    }
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };

  // Current step effect
  useEffect(() => {
    if (activeTutorial && isPlaying) {
      const currentStep = activeTutorial.steps[currentStepIndex];
      if (currentStep.target) {
        highlightElement(currentStep.target);
      } else {
        removeHighlight();
      }
    } else {
      removeHighlight();
    }

    return () => removeHighlight();
  }, [activeTutorial, currentStepIndex, isPlaying]);

  // Auto-advance for certain actions
  useEffect(() => {
    if (activeTutorial && isPlaying) {
      const currentStep = activeTutorial.steps[currentStepIndex];
      if (currentStep.action === 'wait') {
        const timer = setTimeout(nextStep, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTutorial, currentStepIndex, isPlaying]);

  const currentStep = activeTutorial?.steps[currentStepIndex];
  const progress = activeTutorial ? ((currentStepIndex + 1) / activeTutorial.steps.length) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Play className="w-4 h-4" />;
      case 'feature': return <Target className="w-4 h-4" />;
      case 'advanced': return <Book className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const isPrerequisiteMet = (tutorial: Tutorial) => {
    if (!tutorial.prerequisites) return true;
    return tutorial.prerequisites.every(prereq => completedTutorials.includes(prereq));
  };

  return (
    <div className={className}>
      {/* Tutorial Menu Button */}
      <AnimatedButton
        onClick={() => setShowTutorialMenu(true)}
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <Book className="w-4 h-4" />
        <span>Tutorials</span>
      </AnimatedButton>

      {/* Tutorial Menu Modal */}
      <SwipeableModal
        isOpen={showTutorialMenu}
        onClose={() => setShowTutorialMenu(false)}
        title="Interactive Tutorials"
        className="max-w-4xl mx-auto"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TUTORIALS.map((tutorial) => {
              const isCompleted = completedTutorials.includes(tutorial.id);
              const canStart = isPrerequisiteMet(tutorial);
              
              return (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    canStart
                      ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                  } ${
                    isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''
                  }`}
                  onClick={() => canStart && startTutorial(tutorial)}
                  whileHover={canStart ? { scale: 1.02 } : {}}
                  whileTap={canStart ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(tutorial.category)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                    </div>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {tutorial.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{tutorial.estimatedTime} min</span>
                    <span>{tutorial.steps.length} steps</span>
                  </div>
                  
                  {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Requires: {tutorial.prerequisites.join(', ')}
                    </div>
                  )}
                  
                  {!canStart && (
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      Complete prerequisites first
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </SwipeableModal>

      {/* Active Tutorial Overlay */}
      <AnimatePresence>
        {activeTutorial && isPlaying && (
          <>
            {/* Backdrop */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-none"
              style={{
                clipPath: highlightedElement 
                  ? `polygon(0% 0%, 0% 100%, ${highlightedElement.offsetLeft}px 100%, ${highlightedElement.offsetLeft}px ${highlightedElement.offsetTop}px, ${highlightedElement.offsetLeft + highlightedElement.offsetWidth}px ${highlightedElement.offsetTop}px, ${highlightedElement.offsetLeft + highlightedElement.offsetWidth}px ${highlightedElement.offsetTop + highlightedElement.offsetHeight}px, ${highlightedElement.offsetLeft}px ${highlightedElement.offsetTop + highlightedElement.offsetHeight}px, ${highlightedElement.offsetLeft}px 100%, 100% 100%, 100% 0%)`
                  : undefined
              }}
            />

            {/* Tutorial Tooltip */}
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 pointer-events-auto"
              style={{
                top: highlightedElement 
                  ? `${highlightedElement.offsetTop + highlightedElement.offsetHeight + 20}px`
                  : '50%',
                left: highlightedElement
                  ? `${highlightedElement.offsetLeft}px`
                  : '50%',
                transform: highlightedElement ? 'none' : 'translate(-50%, -50%)'
              }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {currentStep?.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Step {currentStepIndex + 1} of {activeTutorial.steps.length}
                      </p>
                    </div>
                    <button
                      onClick={endTutorial}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-2 bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {currentStep?.content}
                </div>

                {/* Controls */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      {currentStep?.skippable && (
                        <button
                          onClick={nextStep}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Back
                      </button>
                      
                      <AnimatedButton
                        onClick={nextStep}
                        size="sm"
                        variant="primary"
                      >
                        {currentStepIndex === activeTutorial.steps.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="w-4 h-4 inline ml-1" />
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tutorial Highlight Styles */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          animation: tutorial-pulse 2s infinite;
        }
        
        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </div>
  );
};