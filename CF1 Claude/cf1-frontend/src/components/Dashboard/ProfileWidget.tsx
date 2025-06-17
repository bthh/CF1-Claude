import React from 'react';
import { User, Shield, CheckCircle, AlertCircle, Settings, ArrowRight, Badge, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

interface ProfileWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    verificationLevel: 'verified', // anonymous, basic, verified, accredited
    memberSince: '2024-01-15',
    totalInvested: 45650,
    portfolioValue: 52430,
    completionStats: {
      profile: 85,
      kyc: 100,
      preferences: 60,
      security: 90
    },
    badges: [
      { id: 'early-investor', name: 'Early Investor', icon: Star, color: 'text-yellow-600' },
      { id: 'verified', name: 'Verified', icon: CheckCircle, color: 'text-green-600' },
      { id: 'active-voter', name: 'Active Voter', icon: Badge, color: 'text-purple-600' }
    ],
    recentActivity: {
      lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      lastInvestment: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      lastVote: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
    }
  };

  const handleNavigate = () => {
    navigate('/profile');
  };

  const getVerificationStatus = (level: string) => {
    switch (level) {
      case 'verified': return { color: 'text-green-600 bg-green-100 dark:bg-green-900/20', icon: CheckCircle, text: 'Verified' };
      case 'basic': return { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20', icon: Shield, text: 'Basic' };
      case 'accredited': return { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20', icon: Badge, text: 'Accredited' };
      default: return { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', icon: AlertCircle, text: 'Incomplete' };
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const verification = getVerificationStatus(userProfile.verificationLevel);

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center space-y-2 flex-1">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(userProfile.name)}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {userProfile.name}
            </p>
            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${verification.color}`}>
              <verification.icon className="w-3 h-3" />
              <span>{verification.text}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile Summary</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {getInitials(userProfile.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {userProfile.name}
            </p>
            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${verification.color}`}>
              <verification.icon className="w-3 h-3" />
              <span>{verification.text}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Portfolio Value</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(userProfile.portfolioValue)}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Profile Complete</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userProfile.completionStats.profile}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${userProfile.completionStats.profile}%` }}
            ></div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {userProfile.badges.slice(0, 3).map((badge) => (
              <div key={badge.id} className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs ${badge.color.replace('text-', 'bg-').replace('-600', '-100')} ${badge.color}`}>
                <badge.icon className="w-2 h-2" />
                <span className="truncate">{badge.name.split(' ')[0]}</span>
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Account status and achievements</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Manage Profile</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {getInitials(userProfile.name)}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {userProfile.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userProfile.email}
          </p>
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${verification.color} mt-2`}>
            <verification.icon className="w-4 h-4" />
            <span>{verification.text} Member</span>
          </div>
        </div>
      </div>

      <div className={`grid ${size === 'full' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-6`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <User className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(userProfile.memberSince).getFullYear()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {Math.floor((Date.now() - new Date(userProfile.memberSince).getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Calendar className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(userProfile.portfolioValue)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            +{formatCurrency(userProfile.portfolioValue - userProfile.totalInvested)} gain
          </p>
        </div>
        
        {size === 'full' && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <Badge className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {userProfile.badges.length}
            </p>
            <p className="text-xs text-purple-600 mt-1">Badges earned</p>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Completion</h5>
            <div className="space-y-3">
              {Object.entries(userProfile.completionStats).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{key}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Achievements</h5>
            <div className="space-y-2">
              {userProfile.badges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWidget;