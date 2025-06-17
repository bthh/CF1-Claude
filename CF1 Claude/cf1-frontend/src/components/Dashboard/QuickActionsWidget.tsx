import React from 'react';
import { Plus, Vote, User, Search, Bell, Settings, ArrowRight, Zap, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'invest',
      title: 'New Investment',
      description: 'Browse and invest in assets',
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      action: () => navigate('/marketplace')
    },
    {
      id: 'proposal',
      title: 'Create Proposal',
      description: 'Submit governance proposal',
      icon: Plus,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      action: () => navigate('/governance/create')
    },
    {
      id: 'vote',
      title: 'Vote on Proposals',
      description: 'Participate in governance',
      icon: Vote,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      action: () => navigate('/governance')
    },
    {
      id: 'profile',
      title: 'Update Profile',
      description: 'Manage account settings',
      icon: User,
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      action: () => navigate('/profile')
    },
    {
      id: 'verification',
      title: 'Complete KYC',
      description: 'Verify your identity',
      icon: FileText,
      color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600',
      action: () => navigate('/profile/verification')
    },
    {
      id: 'notifications',
      title: 'View Notifications',
      description: 'Check latest updates',
      icon: Bell,
      color: 'bg-red-100 dark:bg-red-900/20 text-red-600',
      action: () => navigate('/notifications')
    }
  ];

  const handleNavigate = () => {
    navigate('/dashboard');
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>More</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 flex-1">
          {quickActions.slice(0, 4).map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className={`p-2 rounded-full ${action.color} group-hover:scale-105 transition-transform`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 text-center">
                {action.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Frequently used actions
          </span>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {quickActions.slice(0, 5).map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group text-left"
            >
              <div className={`p-2 rounded-full ${action.color} group-hover:scale-105 transition-transform flex-shrink-0`}>
                <action.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Common tasks and shortcuts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Fast access</span>
        </div>
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-4`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
          <Search className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Most Used</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Invest</p>
          <p className="text-xs text-blue-600 mt-1">67% of actions</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <Settings className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Quick Setup</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">2 min</p>
              <p className="text-xs text-green-600 mt-1">Average time</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <Vote className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Votes</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-xs text-purple-600 mt-1">Need attention</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <div className={`grid ${size === 'full' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group text-left"
            >
              <div className={`p-3 rounded-full ${action.color} group-hover:scale-105 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {action.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsWidget;