import React from 'react';
import { Clock, CheckCircle, AlertCircle, Info, ArrowRight, Activity, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/format';

interface ActivityWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const activities = [
    {
      id: 1,
      type: 'investment',
      title: 'Invested in Green Energy Fund',
      description: 'Successfully invested $5,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'vote',
      title: 'Voted on Proposal #42',
      description: 'Increase Platform Fee to 3%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'info',
      icon: Info
    },
    {
      id: 3,
      type: 'verification',
      title: 'Identity Verification Complete',
      description: 'Your account is now fully verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: 'success',
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'proposal',
      title: 'New Proposal Available',
      description: 'Tech Innovation Fund is now open',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'info',
      icon: AlertCircle
    },
    {
      id: 5,
      type: 'dividend',
      title: 'Dividend Received',
      description: 'Real Estate Portfolio: $125.50',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      status: 'success',
      icon: CheckCircle
    }
  ];

  const handleNavigate = () => {
    navigate('/activity');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'warning': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Activity</h3>
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
        
        <div className="space-y-2 flex-1 overflow-hidden">
          {activities.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-2">
              <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                <activity.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
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
        
        <div className="flex items-center space-x-4 mb-3 text-xs">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">{activities.length} total</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Last 7 days</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`p-1.5 rounded-full ${getStatusColor(activity.status)}`}>
                <activity.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your recent platform activity</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mb-4`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Activity className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Activities</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {activities.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">Last 7 days</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <User className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Hours</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-xs text-green-600 mt-1">This week</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">30m</p>
              <p className="text-xs text-purple-600 mt-1">ago</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityWidget;