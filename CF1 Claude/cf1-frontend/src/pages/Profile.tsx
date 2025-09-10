import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  Edit,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  User
} from 'lucide-react';
import { useUnifiedAuthStore } from '../store/unifiedAuthStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { usePaymentMethodsStore } from '../store/paymentMethodsStore';
import { useVerificationStore } from '../store/verificationStore';
import { useNotifications } from '../hooks/useNotifications';
import AddPaymentMethodModal from '../components/PaymentMethods/AddPaymentMethodModal';
import KYCVerificationForm from '../components/Verification/KYCVerificationForm';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotifications();
  
  // Store hooks
  const { user } = useUnifiedAuthStore();
  const { 
    profile, 
    loading: profileLoading, 
    loadProfile 
  } = useUserProfileStore();
  const { 
    creditCards, 
    bankAccounts, 
    cryptoWallets,
    loading: paymentLoading,
    loadPaymentMethods,
    showAddCardModal,
    setShowAddCardModal 
  } = usePaymentMethodsStore();
  const { 
    currentLevel, 
    isVerificationComplete,
    getVerificationProgress 
  } = useVerificationStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'kyc'>('overview');
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    } else {
      // Load demo profile for non-authenticated users
      loadProfile('demo_user');
    }
    loadPaymentMethods();
  }, [user, loadProfile, loadPaymentMethods]);

  // Loading state - only show if actually loading
  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Get user data with fallback for demo
  const displayUser = user ? {
    id: user.id,
    email: user.email,
    displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User',
    walletAddress: user.walletAddress,
    kycStatus: user.kycStatus,
    createdAt: user.createdAt
  } : {
    id: 'demo_user',
    email: 'demo@cf1platform.com',
    displayName: 'Demo User',
    walletAddress: undefined,
    kycStatus: 'not_started' as const,
    createdAt: new Date().toISOString()
  };

  const verificationProgress = getVerificationProgress();
  const totalPaymentMethods = creditCards.length + bankAccounts.length + cryptoWallets.length;
  
  // Mock data for demonstration
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
      earned: profile?.profileCompletionScore && profile.profileCompletionScore >= 80
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and view your investment activity</p>
          </div>
          <button 
            onClick={() => navigate('/profile/edit')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="flex gap-2" role="tablist">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'payment', label: 'Payment Methods', icon: CreditCard, count: totalPaymentMethods },
              { id: 'kyc', label: 'Verification', icon: Shield, progress: Math.round(verificationProgress.percentage) }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-white/20'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <tab.icon className="w-4 h-4" />
                </div>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.progress !== undefined && (
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  }`}>
                    {tab.progress}%
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Card */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.profileImage ? (
                        <img 
                          src={profile.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-bold text-2xl">
                          {profile?.personalInfo.firstName?.[0]}{profile?.personalInfo.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile?.personalInfo.firstName} {profile?.personalInfo.lastName}
                      </h2>
                      <div className="flex items-center space-x-2 mt-1">
                        {isVerificationComplete && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{profile?.personalInfo.email}</span>
                    </div>
                    {profile?.personalInfo.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{profile.personalInfo.phone}</span>
                      </div>
                    )}
                    {profile?.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {profile.address.city}, {profile.address.state}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Member since {new Date(displayUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {displayUser.walletAddress ? 
                          `${displayUser.walletAddress.slice(0, 8)}...${displayUser.walletAddress.slice(-6)}` : 
                          'Not connected'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Statistics */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investment Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{investmentStats.totalInvested}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{investmentStats.activeInvestments}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Investments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{investmentStats.totalReturns}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Returns</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{investmentStats.avgAPY}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg. APY</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{investmentStats.successRate}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowAddCardModal(true)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Add Payment Method</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Link bank or card</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('kyc')}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">KYC Verification</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Complete identity verification</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
                        achievement.earned ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        {achievement.icon}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {achievement.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>

            {paymentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Credit Cards */}
                {creditCards.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit Cards ({creditCards.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {creditCards.map((card) => (
                        <div key={card.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                •••• {card.last4}
                              </span>
                              {card.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {card.brand.toUpperCase()} • {card.type}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                          </p>
                          {card.nickname && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{card.nickname}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Accounts */}
                {bankAccounts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Bank Accounts ({bankAccounts.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bankAccounts.map((account) => (
                        <div key={account.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {account.bankName}
                              </span>
                              {account.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            {account.isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {account.accountType} • {account.accountNumber}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Status: {account.verificationStatus}
                          </p>
                          {account.nickname && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{account.nickname}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crypto Wallets */}
                {cryptoWallets.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Wallet className="w-5 h-5 mr-2" />
                      Crypto Wallets ({cryptoWallets.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cryptoWallets.map((wallet) => (
                        <div key={wallet.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Wallet className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {wallet.walletType}
                              </span>
                              {wallet.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-mono">
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {wallet.network} • {wallet.balance}
                          </p>
                          {wallet.nickname && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"{wallet.nickname}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalPaymentMethods === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payment Methods</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Add a payment method to start investing</p>
                    <button
                      onClick={() => setShowAddCardModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* KYC/Verification Tab */}
        {activeTab === 'kyc' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Identity Verification</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Level {currentLevel}</span>
                <div className={`w-2 h-2 rounded-full ${isVerificationComplete ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Verification Progress</h4>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${verificationProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {Math.round(verificationProgress.percentage)}% complete • {verificationProgress.completedSteps} of {verificationProgress.totalSteps} steps
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Basic Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Personal details and contact information</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Identity Verification</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Government-issued ID verification</p>
                    </div>
                    {verificationProgress.percentage >= 50 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Accredited Investor Status</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Financial qualification verification</p>
                    </div>
                    {isVerificationComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowKYCModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      
      {/* Recent Activity - Always shown below tab content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'investment' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  activity.type === 'return' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-purple-100 dark:bg-purple-900/20'
                }`}>
                  {activity.type === 'investment' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'return' && <CreditCard className="w-5 h-5 text-green-600" />}
                  {activity.type === 'vote' && <Star className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className={`font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {activity.amount}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
      />

      {/* KYC Verification Modal */}
      <KYCVerificationForm
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
      />
    </div>
  );
};

export default Profile;