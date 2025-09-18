import React, { useState, useCallback } from 'react';
import { 
  Lightbulb, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Sparkles,
  FileText,
  BarChart3,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useDiscoveryStore, UserPreferences, Idea } from '../../store/discoveryStore';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const IdeaGenerator: React.FC = () => {
  const {
    ideaGeneratorState,
    setUserPreferences,
    generateIdeas,
    selectIdea,
    clearGeneratedIdeas
  } = useDiscoveryStore();

  const [currentStep, setCurrentStep] = useState<'preferences' | 'results' | 'details'>('preferences');
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    interests: [],
    budgetRange: '',
    riskTolerance: '',
    experience: '',
    investmentGoals: []
  });

  const handlePreferenceChange = useCallback((key: keyof UserPreferences, value: any) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [key]: value
      };
      console.log(`Setting ${key} to ${value}`, newPreferences);
      return newPreferences;
    });
  }, []);

  const handleArrayToggle = useCallback((key: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const currentArray = (prev[key] as string[]) || [];
      const newPreferences = {
        ...prev,
        [key]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
      console.log(`Toggling ${key} with ${value}`, newPreferences);
      return newPreferences;
    });
  }, []);

  const handleGenerateIdeas = async () => {
    const completePreferences: UserPreferences = {
      interests: preferences.interests || [],
      budgetRange: preferences.budgetRange || 'medium',
      riskTolerance: preferences.riskTolerance || 'medium',
      experience: preferences.experience || 'beginner',
      investmentGoals: preferences.investmentGoals || []
    };

    setUserPreferences(completePreferences);
    await generateIdeas(completePreferences);
    setCurrentStep('results');
  };

  const handleSelectIdea = (idea: Idea) => {
    selectIdea(idea);
    setCurrentStep('details');
  };

  const handleStartOver = () => {
    clearGeneratedIdeas();
    setCurrentStep('preferences');
    setPreferences({
      interests: [],
      budgetRange: '',
      riskTolerance: '',
      experience: '',
      investmentGoals: []
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (currentStep === 'details' && ideaGeneratorState.selectedIdea) {
    const idea = ideaGeneratorState.selectedIdea;
    
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Idea Deep Dive
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Detailed analysis and next steps for your selected opportunity
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <CF1Button variant="outline" onClick={() => setCurrentStep('results')}>
              Back to Results
            </CF1Button>
            <CF1Button variant="outline" onClick={handleStartOver}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Over
            </CF1Button>
          </div>
        </div>

        {/* Idea Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {idea.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {idea.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-green-700 dark:text-green-300">Est. Budget</div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(idea.estimatedBudget)}
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Target className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Risk Level</div>
                  <div className="font-bold text-yellow-600">
                    {idea.riskLevel}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">Market Size</div>
                  <div className="font-bold text-blue-600">
                    {idea.marketSize}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Why This Opportunity?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {idea.reasoning}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Competition Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {idea.competition}
                  </p>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Recommended Next Steps
              </h3>
              <div className="space-y-3">
                {idea.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <CF1Button className="w-full justify-start" size="small">
                  <FileText className="w-4 h-4 mr-2" />
                  Start Proposal Draft
                </CF1Button>
                <CF1Button variant="outline" className="w-full justify-start" size="small">
                  <Users className="w-4 h-4 mr-2" />
                  Find Mentors
                </CF1Button>
                <CF1Button variant="outline" className="w-full justify-start" size="small">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Market Research Tools
                </CF1Button>
                <CF1Button variant="outline" className="w-full justify-start" size="small">
                  <Target className="w-4 h-4 mr-2" />
                  Similar Opportunities
                </CF1Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Connect with our Creator Success team for personalized guidance on turning this idea into reality.
              </p>
              <CF1Button size="small" className="w-full">
                Get Expert Help
              </CF1Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Personalized Ideas
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              AI-generated opportunities based on your preferences
            </p>
          </div>
          <CF1Button variant="outline" onClick={handleStartOver}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Ideas
          </CF1Button>
        </div>

        {ideaGeneratorState.isGenerating ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generating Ideas...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI is analyzing market trends and your preferences
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ideaGeneratorState.generatedIdeas.map((idea) => (
              <Card key={idea.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {idea.title}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      {idea.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {idea.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(idea.estimatedBudget)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Risk:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {idea.riskLevel}
                    </div>
                  </div>
                </div>

                <CF1Button 
                  onClick={() => handleSelectIdea(idea)}
                  className="w-full"
                  size="small"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </CF1Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Preferences Step
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AI Idea Generator
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Answer a few quick questions and let our AI suggest personalized investment opportunities tailored to your interests and goals.
        </p>
      </div>

      {/* Preferences Form */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-8">
            {/* Interests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What interests you? (Select all that apply)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Technology', 'Real Estate', 'Art/Collectibles', 'Startups', 
                  'Energy', 'Healthcare', 'Finance', 'Agriculture',
                  'Entertainment', 'Education', 'Sustainability', 'Manufacturing'
                ].map((interest) => (
                  <CF1Button
                    key={interest}
                    variant={preferences.interests?.includes(interest) ? 'secondary' : 'outline'}
                    size="small"
                    onClick={() => handleArrayToggle('interests', interest)}
                    className="justify-start"
                  >
                    {interest}
                  </CF1Button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your investment budget range?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: '$10K-$100K', description: 'Starting out' },
                  { value: 'medium', label: '$100K-$1M', description: 'Building wealth' },
                  { value: 'large', label: '$1M+', description: 'Serious capital' },
                  { value: 'flexible', label: 'Flexible', description: 'Show me options' }
                ].map((option) => (
                  <CF1Button
                    key={option.value}
                    variant={preferences.budgetRange === option.value ? 'secondary' : 'outline'}
                    onClick={() => {
                      console.log(`Budget button clicked: ${option.value}`);
                      handlePreferenceChange('budgetRange', option.value);
                    }}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </CF1Button>
                ))}
              </div>
            </div>

            {/* Risk Tolerance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your risk tolerance?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Conservative', description: 'Stable returns, lower risk' },
                  { value: 'medium', label: 'Balanced', description: 'Moderate risk for growth' },
                  { value: 'high', label: 'Aggressive', description: 'High risk, high reward' }
                ].map((option) => (
                  <CF1Button
                    key={option.value}
                    variant={preferences.riskTolerance === option.value ? 'secondary' : 'outline'}
                    onClick={() => {
                      console.log(`Risk button clicked: ${option.value}`);
                      handlePreferenceChange('riskTolerance', option.value);
                    }}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </CF1Button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your investment experience?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: 'Beginner', description: 'New to investing' },
                  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
                  { value: 'advanced', label: 'Advanced', description: 'Experienced investor' }
                ].map((option) => (
                  <CF1Button
                    key={option.value}
                    variant={preferences.experience === option.value ? 'secondary' : 'outline'}
                    onClick={() => {
                      console.log(`Experience button clicked: ${option.value}`);
                      handlePreferenceChange('experience', option.value);
                    }}
                    className="h-auto p-4 flex-col items-start"
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </CF1Button>
                ))}
              </div>
            </div>

            {/* Investment Goals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your primary investment goals? (Select all that apply)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Passive Income', 'Long-term Growth', 'Portfolio Diversification',
                  'Social Impact', 'Learning Experience', 'Quick Returns'
                ].map((goal) => (
                  <CF1Button
                    key={goal}
                    variant={preferences.investmentGoals?.includes(goal) ? 'secondary' : 'outline'}
                    size="small"
                    onClick={() => handleArrayToggle('investmentGoals', goal)}
                    className="justify-start"
                  >
                    {goal}
                  </CF1Button>
                ))}
              </div>
            </div>

            {/* Debug State Display */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">Current Selections (Debug):</h4>
              <div className="space-y-1 text-gray-600 dark:text-gray-300">
                <div>Interests: {preferences.interests?.join(', ') || 'None'}</div>
                <div>Budget: {preferences.budgetRange || 'None'}</div>
                <div>Risk: {preferences.riskTolerance || 'None'}</div>
                <div>Experience: {preferences.experience || 'None'}</div>
                <div>Goals: {preferences.investmentGoals?.join(', ') || 'None'}</div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center pt-6">
              <CF1Button
                size="large"
                onClick={handleGenerateIdeas}
                disabled={!preferences.interests?.length || !preferences.budgetRange}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Personalized Ideas
              </CF1Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                This will take a few seconds while our AI analyzes market trends
              </p>
            </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default IdeaGenerator;