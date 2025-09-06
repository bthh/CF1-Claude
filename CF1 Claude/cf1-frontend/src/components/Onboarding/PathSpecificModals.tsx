import React from 'react';
import { 
  Play,
  X,
  DollarSign,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface PathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

// Investor Path Modal
export const InvestorPathModal: React.FC<PathModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Investor Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn how to build wealth with tokenized real-world assets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Section */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for video - would integrate with actual video service */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                <div className="text-center z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-medium">Watch: "Your First Investment"</p>
                  <p className="text-white/80 text-sm">3 min overview</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Introduction to Real-World Assets</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>3:24</span>
                </span>
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your investment journey</h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Browse Assets',
                    description: 'Explore verified real estate, commodities, and business assets',
                    completed: false
                  },
                  {
                    step: 2,
                    title: 'Due Diligence',
                    description: 'Review financial documents, market analysis, and risk factors',
                    completed: false
                  },
                  {
                    step: 3,
                    title: 'Invest Securely',
                    description: 'Make your investment with enterprise-grade security',
                    completed: false
                  },
                  {
                    step: 4,
                    title: 'Track & Earn',
                    description: 'Monitor performance and receive distributions',
                    completed: false
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-500 text-white' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{item.step}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Why Tokenized Assets?</span>
                </div>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Lower minimum investments (starting at $100)</li>
                  <li>• Global diversification opportunities</li>
                  <li>• Increased liquidity through secondary markets</li>
                  <li>• Transparent, blockchain-verified ownership</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Exploring Assets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Creator Path Modal
export const CreatorPathModal: React.FC<PathModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Creator Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Transform your assets into accessible investment opportunities
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20"></div>
                <div className="text-center z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-medium">Watch: "Asset Tokenization Process"</p>
                  <p className="text-white/80 text-sm">5 min deep dive</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Launch your asset</h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Prepare Documentation',
                    description: 'Gather business plan, financials, and legal documents'
                  },
                  {
                    step: 2,
                    title: 'Submit Proposal',
                    description: 'Complete our comprehensive proposal form'
                  },
                  {
                    step: 3,
                    title: 'Compliance Review',
                    description: 'Our team reviews for regulatory compliance'
                  },
                  {
                    step: 4,
                    title: 'Go Live & Raise',
                    description: 'Launch fundraising and manage investors'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                      <span className="text-sm font-semibold">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Create Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trader Path Modal
export const TraderPathModal: React.FC<PathModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trader Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Master the art of tokenized asset trading
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                <div className="text-center z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-medium">Watch: "Trading Strategies"</p>
                  <p className="text-white/80 text-sm">7 min masterclass</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start trading</h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Market Analysis',
                    description: 'Study price trends and market sentiment'
                  },
                  {
                    step: 2,
                    title: 'Strategy Development',
                    description: 'Build your trading approach and risk management'
                  },
                  {
                    step: 3,
                    title: 'Execute Trades',
                    description: 'Place orders with advanced trading tools'
                  },
                  {
                    step: 4,
                    title: 'Portfolio Management',
                    description: 'Track performance and optimize positions'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <span className="text-sm font-semibold">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Explore Markets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};