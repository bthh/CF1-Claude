import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  MapPin,
  Home,
  DollarSign,
  Clock,
  Settings,
  Layers,
  BarChart3,
  Target,
  Package,
  Globe,
  Calendar,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';

export interface GuidedAnswer {
  questionId: string;
  value: string | string[] | number;
  type: 'text' | 'multiple_choice' | 'slider' | 'range';
}

export interface GuidedSearchState {
  category: string;
  searchQuery: string;
  answers: GuidedAnswer[];
  currentQuestionIndex: number;
  isComplete: boolean;
}

interface Question {
  id: string;
  type: 'text' | 'multiple_choice' | 'slider' | 'range';
  question: string;
  description?: string;
  icon: React.ComponentType<any>;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

interface CategoryQuestions {
  [key: string]: Question[];
}

const categoryQuestions: CategoryQuestions = {
  'real estate': [
    {
      id: 'specific_location',
      type: 'text',
      question: 'Specific location (optional)?',
      description: 'Enter a city, state, or region - leave blank to search all locations',
      icon: MapPin,
      placeholder: 'e.g., Austin TX, Miami FL, or leave blank'
    },
    {
      id: 'location_type',
      type: 'multiple_choice',
      question: 'What type of location interests you?',
      description: 'Select preferred geographic areas',
      icon: Globe,
      options: ['Urban Centers', 'Suburban Areas', 'Rural/Remote', 'International Markets', 'Vacation Destinations']
    },
    {
      id: 'property_type',
      type: 'multiple_choice',
      question: 'What type of property?',
      description: 'Choose property categories',
      icon: Home,
      options: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Hospitality (Hotels/AirBnB)', 'Land Development']
    },
    {
      id: 'investment_amount',
      type: 'range',
      question: 'Investment budget range?',
      description: 'Your available investment capital',
      icon: DollarSign,
      min: 10000,
      max: 10000000,
      step: 10000,
      unit: '$'
    },
    {
      id: 'timeline',
      type: 'multiple_choice',
      question: 'Investment timeline?',
      description: 'When do you want to see returns?',
      icon: Clock,
      options: ['Short-term (1-2 years)', 'Medium-term (3-5 years)', 'Long-term (5+ years)', 'Flexible']
    },
    {
      id: 'key_features',
      type: 'multiple_choice',
      question: 'Key features important to you?',
      description: 'Select priority features',
      icon: Settings,
      options: ['High Cash Flow', 'Property Appreciation', 'Tax Benefits', 'Low Maintenance', 'Passive Income', 'Development Potential']
    }
  ],
  'technology': [
    {
      id: 'industry_focus',
      type: 'multiple_choice',
      question: 'Which tech industries interest you?',
      description: 'Select technology sectors',
      icon: Layers,
      options: ['Artificial Intelligence', 'Fintech', 'Healthcare Tech', 'Clean Tech', 'SaaS', 'Gaming', 'E-commerce', 'Blockchain/Web3']
    },
    {
      id: 'investment_stage',
      type: 'multiple_choice',
      question: 'Preferred investment stage?',
      description: 'Company development stage',
      icon: BarChart3,
      options: ['Early Stage (Seed/Series A)', 'Growth Stage (Series B+)', 'Mature/Pre-IPO', 'Public Companies', 'Mixed Portfolio']
    },
    {
      id: 'market_size',
      type: 'multiple_choice',
      question: 'Target market size?',
      description: 'Market opportunity scale',
      icon: Target,
      options: ['Niche/Specialized', 'Regional', 'National', 'Global', 'Emerging Markets']
    },
    {
      id: 'technical_focus',
      type: 'multiple_choice',
      question: 'Technical areas of interest?',
      description: 'Specific technology focus',
      icon: Settings,
      options: ['B2B Solutions', 'Consumer Apps', 'Infrastructure/Cloud', 'Data/Analytics', 'Security', 'Mobile-First', 'Enterprise Software']
    }
  ],
  'commodities': [
    {
      id: 'commodity_type',
      type: 'multiple_choice',
      question: 'Which commodities interest you?',
      description: 'Select commodity categories',
      icon: Package,
      options: ['Precious Metals (Gold/Silver)', 'Energy (Oil/Gas)', 'Agricultural (Grains/Livestock)', 'Industrial Metals', 'Rare Earth Elements']
    },
    {
      id: 'geographic_exposure',
      type: 'multiple_choice',
      question: 'Geographic exposure preference?',
      description: 'Regional market focus',
      icon: Globe,
      options: ['North America', 'Europe', 'Asia-Pacific', 'Emerging Markets', 'Global Diversified']
    },
    {
      id: 'contract_duration',
      type: 'multiple_choice',
      question: 'Investment duration?',
      description: 'Contract or holding period',
      icon: Calendar,
      options: ['Short-term (Spot/Futures)', 'Medium-term (6-18 months)', 'Long-term (2+ years)', 'Physical Storage']
    },
    {
      id: 'risk_tolerance',
      type: 'multiple_choice',
      question: 'Risk tolerance level?',
      description: 'Volatility comfort level',
      icon: Shield,
      options: ['Conservative (Stable commodities)', 'Moderate (Balanced portfolio)', 'Aggressive (High volatility)', 'Speculative (Emerging commodities)']
    }
  ],
  'collectibles': [
    {
      id: 'category',
      type: 'multiple_choice',
      question: 'Collectible categories of interest?',
      description: 'Types of collectibles',
      icon: Package,
      options: ['Art (Paintings/Sculptures)', 'Sports Memorabilia', 'Wine/Spirits', 'Classic Cars', 'Watches', 'Comics/Cards', 'Coins/Currency', 'Vintage Items']
    },
    {
      id: 'authenticity_requirements',
      type: 'multiple_choice',
      question: 'Authentication importance?',
      description: 'Verification and provenance needs',
      icon: Shield,
      options: ['Professional Authentication Required', 'Certified/Graded Items Only', 'Documented Provenance', 'Insurance Appraisals', 'Flexible on Documentation']
    },
    {
      id: 'storage_needs',
      type: 'multiple_choice',
      question: 'Storage preferences?',
      description: 'How will you store items?',
      icon: Home,
      options: ['Personal Collection/Display', 'Professional Storage', 'Climate-Controlled Facility', 'Bank Vault/Security', 'No Special Requirements']
    },
    {
      id: 'investment_approach',
      type: 'multiple_choice',
      question: 'Investment approach?',
      description: 'Your collecting strategy',
      icon: TrendingUp,
      options: ['Long-term Appreciation', 'Personal Enjoyment', 'Portfolio Diversification', 'Quick Flips/Trading', 'Passion Investment']
    }
  ],
  'energy': [
    {
      id: 'energy_type',
      type: 'multiple_choice',
      question: 'Energy sectors of interest?',
      description: 'Types of energy investments',
      icon: Zap,
      options: ['Solar Power', 'Wind Energy', 'Hydroelectric', 'Nuclear', 'Natural Gas', 'Oil/Petroleum', 'Geothermal', 'Energy Storage']
    },
    {
      id: 'location_preferences',
      type: 'multiple_choice',
      question: 'Geographic preferences?',
      description: 'Regional energy markets',
      icon: MapPin,
      options: ['Domestic Markets', 'Developed International', 'Emerging Markets', 'Offshore Projects', 'Rural/Remote Areas']
    },
    {
      id: 'capacity_scale',
      type: 'multiple_choice',
      question: 'Project scale preference?',
      description: 'Size of energy projects',
      icon: BarChart3,
      options: ['Residential Scale', 'Commercial Scale', 'Utility Scale', 'Industrial Scale', 'Mixed Portfolio']
    },
    {
      id: 'investment_structure',
      type: 'multiple_choice',
      question: 'Investment structure?',
      description: 'How you want to invest',
      icon: Layers,
      options: ['Direct Project Ownership', 'Energy REITs', 'MLPs/Partnerships', 'Public Companies', 'Private Funds']
    }
  ]
};

interface GuidedSearchQuestionsProps {
  category: string;
  searchQuery: string;
  onAnswersChange: (answers: GuidedAnswer[]) => void;
  onComplete: () => void;
  onStartOver: () => void;
  className?: string;
}

const GuidedSearchQuestions: React.FC<GuidedSearchQuestionsProps> = ({
  category,
  searchQuery,
  onAnswersChange,
  onComplete,
  onStartOver,
  className = ''
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<GuidedAnswer[]>([]);

  const questions = categoryQuestions[category.toLowerCase()] || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoNext = answers.find(a => a.questionId === currentQuestion?.id);

  // Update parent component when answers change
  useEffect(() => {
    onAnswersChange(answers);
  }, [answers, onAnswersChange]);

  const handleAnswer = useCallback((questionId: string, value: string | string[] | number, type: Question['type']) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const newAnswer: GuidedAnswer = { questionId, value, type };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  }, []);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [isLastQuestion, onComplete]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const getCurrentAnswer = useCallback((questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.value;
  }, [answers]);

  const renderQuestionInput = useCallback((question: Question) => {
    const currentAnswer = getCurrentAnswer(question.id);
    const Icon = question.icon;

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => {
                  const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
                  const isSelected = currentAnswers.includes(option);
                  
                  const newAnswers = isSelected 
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option];
                  
                  handleAnswer(question.id, newAnswers, 'multiple_choice');
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  Array.isArray(currentAnswer) && currentAnswer.includes(option)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    Array.isArray(currentAnswer) && currentAnswer.includes(option)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {Array.isArray(currentAnswer) && currentAnswer.includes(option) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'range':
        const rangeValue = typeof currentAnswer === 'number' ? currentAnswer : question.min || 0;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{question.unit}{question.min?.toLocaleString()}</span>
              <span>{question.unit}{question.max?.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step}
              value={rangeValue}
              onChange={(e) => handleAnswer(question.id, parseInt(e.target.value), 'range')}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {question.unit}{rangeValue.toLocaleString()}
              </span>
            </div>
          </div>
        );

      case 'slider':
        const sliderValue = typeof currentAnswer === 'number' ? currentAnswer : question.min || 0;
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step}
              value={sliderValue}
              onChange={(e) => handleAnswer(question.id, parseInt(e.target.value), 'slider')}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {sliderValue}{question.unit}
              </span>
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={(e) => handleAnswer(question.id, e.target.value, 'text')}
            placeholder={question.placeholder || 'Enter your answer...'}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  }, [getCurrentAnswer, handleAnswer]);

  if (!questions.length) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No guided questions available for the "{category}" category yet.
          </p>
          <CF1Button variant="outline" onClick={onStartOver}>
            Try Different Category
          </CF1Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Refine Your Search
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Help us find better matches for "{searchQuery}" in {category}
          </p>
        </div>
        <CF1Button 
          variant="ghost" 
          size="small" 
          icon={RefreshCw}
          onClick={onStartOver}
        >
          Start Over
        </CF1Button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <currentQuestion.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentQuestion.question}
              </h4>
              {currentQuestion.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentQuestion.description}
                </p>
              )}
            </div>
          </div>
          
          {renderQuestionInput(currentQuestion)}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <CF1Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          icon={ChevronLeft}
        >
          Previous
        </CF1Button>

        <div className="flex items-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-blue-500'
                  : index < currentQuestionIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <CF1Button
          variant={canGoNext ? "primary" : "outline"}
          onClick={handleNext}
          disabled={!canGoNext}
          icon={isLastQuestion ? undefined : ChevronRight}
          iconPosition="right"
        >
          {isLastQuestion ? 'Complete' : 'Next'}
        </CF1Button>
      </div>
    </Card>
  );
};

export default GuidedSearchQuestions;