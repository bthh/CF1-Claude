import React from 'react';
import { 
  User, 
  Building2, 
  DollarSign,
  ArrowRight,
  X,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface UserPathEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: 'investor' | 'creator') => void;
}

export const UserPathEntryModal: React.FC<UserPathEntryModalProps> = ({
  isOpen,
  onClose,
  onSelectPath
}) => {
  if (!isOpen) return null;

  const userPaths = [
    {
      id: 'investor' as const,
      title: 'I want to Invest',
      description: 'Browse and invest in tokenized real-world assets',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      features: [
        'Discover verified assets',
        'Build a diversified portfolio',
        'Earn passive income',
        'Vote on asset governance'
      ]
    },
    {
      id: 'creator' as const,
      title: 'I want to Launch Assets',
      description: 'Tokenize your real-world assets and raise capital',
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      features: [
        'Submit asset proposals',
        'Raise capital globally',
        'Manage shareholders',
        'Distribute returns'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Choose Your Path
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
                Tell us your primary interest to get a personalized experience
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">
            {userPaths.map((path) => (
              <div
                key={path.id}
                className="group cursor-pointer"
                onClick={() => onSelectPath(path.id)}
              >
                <div className={`relative p-4 sm:p-6 rounded-2xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 ${path.bgColor} hover:shadow-lg group-hover:scale-105`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${path.iconColor} shadow-sm`}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8">
                      {path.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {path.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                    {path.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                    {path.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-current rounded-full mr-2 opacity-60"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button - Enhanced for mobile touch targets */}
                  <button
                    className={`w-full bg-gradient-to-r ${path.color} text-white px-4 py-3 sm:py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group-hover:translate-y-[-2px] min-h-[44px] touch-manipulation`}
                  >
                    <span className="text-sm sm:text-base">Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <div className={`w-8 h-8 ${path.iconColor}`}>
                      {path.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
              Don't worry - you can explore all features regardless of your choice
            </p>
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Enterprise Security</span>
                <span className="sm:hidden">Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Instant Access</span>
                <span className="sm:hidden">Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};