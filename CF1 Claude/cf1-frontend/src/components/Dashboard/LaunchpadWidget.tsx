import React from 'react';
import { Rocket, Clock, Target, Users, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatTimeAgo } from '../../utils/format';

interface LaunchpadWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const LaunchpadWidget: React.FC<LaunchpadWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const launchpadStats = {
    activeProposals: 12,
    totalFunding: 8750000,
    pendingApproval: 5,
    successRate: 78.5,
    recentProposals: [
      { 
        name: 'Solar Farm Initiative', 
        progress: 67, 
        target: 500000, 
        raised: 335000, 
        timeLeft: '12 days',
        backers: 234
      },
      { 
        name: 'Quantum Computing Research', 
        progress: 89, 
        target: 1200000, 
        raised: 1068000, 
        timeLeft: '5 days',
        backers: 456
      },
      { 
        name: 'Urban Farming Network', 
        progress: 34, 
        target: 300000, 
        raised: 102000, 
        timeLeft: '28 days',
        backers: 89
      },
    ]
  };

  const handleNavigate = () => {
    navigate('/launchpad');
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Launchpad</h3>
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
        
        <div className="space-y-3 flex-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {launchpadStats.activeProposals}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Proposals</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Rocket className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(launchpadStats.totalFunding)} Raised
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Launchpad Activity</h3>
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
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {launchpadStats.activeProposals}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
            <p className="text-xl font-bold text-green-600">
              {launchpadStats.successRate}%
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Activity</p>
          <div className="space-y-2">
            {launchpadStats.recentProposals.slice(0, 2).map((proposal, index) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 pr-2">
                    {proposal.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {proposal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
                    style={{ width: `${proposal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Launchpad Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track proposal progress and funding activity</p>
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
      
      <div className={`grid ${size === 'full' ? 'grid-cols-4' : 'grid-cols-2'} gap-4 mb-6`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Rocket className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Proposals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {launchpadStats.activeProposals}
          </p>
          <p className="text-xs text-blue-600 mt-1">3 new this week</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Target className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Funding</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(launchpadStats.totalFunding)}
          </p>
          <p className="text-xs text-green-600 mt-1">+24% this month</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Clock className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {launchpadStats.pendingApproval}
              </p>
              <p className="text-xs text-orange-600 mt-1">Avg 3 days review</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {launchpadStats.successRate}%
              </p>
              <p className="text-xs text-purple-600 mt-1">Above industry avg</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Active Proposals</h4>
        <div className="space-y-3">
          {launchpadStats.recentProposals.map((proposal, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">{proposal.name}</h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">{proposal.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${proposal.progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(proposal.raised)} / {formatCurrency(proposal.target)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{proposal.backers}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span>{proposal.timeLeft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaunchpadWidget;