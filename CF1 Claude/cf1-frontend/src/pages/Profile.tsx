import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Wallet,
  TrendingUp,
  Star,
  Award,
  CreditCard,
  Building,
  Edit
} from 'lucide-react';

const Profile: React.FC = () => {
  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2024',
    verified: true,
    walletAddress: '0x1234...5678',
    profileImage: 'JD'
  };

  const investmentStats = {
    totalInvested: '$124,523',
    activeInvestments: 5,
    totalReturns: '+$15,687',
    avgAPY: '8.3%',
    successRate: '94%'
  };

  const recentActivity = [
    {
      id: 1,
      type: 'investment',
      title: 'Invested in Downtown Seattle Office Building',
      amount: '$5,000',
      date: '2 days ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'return',
      title: 'Monthly dividend from Gold Bullion Vault',
      amount: '+$247',
      date: '1 week ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'vote',
      title: 'Voted on proposal RWA-2024-03',
      amount: '',
      date: '2 weeks ago',
      status: 'completed'
    }
  ];

  const achievements = [
    {
      title: 'Early Adopter',
      description: 'One of the first 100 users',
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      earned: true
    },
    {
      title: 'Diversified Investor',
      description: 'Invested in 5+ different asset types',
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      earned: true
    },
    {
      title: 'Community Member',
      description: 'Participated in 10+ governance votes',
      icon: <Star className="w-6 h-6 text-blue-500" />,
      earned: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600 mt-1">Manage your account and view your investment activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">{userProfile.profileImage}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">{userProfile.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {userProfile.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-600">{userProfile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-600">{userProfile.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-600">{userProfile.location}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-600">Member since {userProfile.joinDate}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-600 font-mono text-sm">{userProfile.walletAddress}</span>
                </div>
              </div>
            </div>

            {/* Investment Statistics */}
            <div className="border-t border-secondary-200 pt-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Investment Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary-900">{investmentStats.totalInvested}</p>
                  <p className="text-sm text-secondary-600">Total Invested</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary-900">{investmentStats.activeInvestments}</p>
                  <p className="text-sm text-secondary-600">Active Investments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{investmentStats.totalReturns}</p>
                  <p className="text-sm text-secondary-600">Total Returns</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{investmentStats.avgAPY}</p>
                  <p className="text-sm text-secondary-600">Avg. APY</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{investmentStats.successRate}</p>
                  <p className="text-sm text-secondary-600">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-secondary-900">Add Payment Method</p>
                    <p className="text-xs text-secondary-600">Link bank or card</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-secondary-900">KYC Verification</p>
                    <p className="text-xs text-secondary-600">Complete identity verification</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="card p-4">
            <h3 className="font-semibold text-secondary-900 mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
                  achievement.earned ? 'bg-green-50' : 'bg-secondary-50'
                }`}>
                  {achievement.icon}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      achievement.earned ? 'text-secondary-900' : 'text-secondary-600'
                    }`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-secondary-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'investment' ? 'bg-blue-100' :
                  activity.type === 'return' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'investment' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'return' && <CreditCard className="w-5 h-5 text-green-600" />}
                  {activity.type === 'vote' && <Star className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{activity.title}</p>
                  <p className="text-sm text-secondary-600">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className={`font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-600' : 'text-secondary-900'
                  }`}>
                    {activity.amount}
                  </p>
                )}
                <p className="text-sm text-secondary-600 capitalize">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;