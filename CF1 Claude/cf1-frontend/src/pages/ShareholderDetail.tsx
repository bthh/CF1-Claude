import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Globe,
  Star,
  Eye,
  MessageSquare,
  FileText,
  Crown,
  AlertTriangle,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/format';

interface ShareholderProfile {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  avatar?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalInvested: number;
  tokenBalance: number;
  portfolioValue: number;
  joinedAt: string;
  lastActive: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationLevel: 'anonymous' | 'basic' | 'verified' | 'accredited';
  isBlocked: boolean;
  isPremierHolder: boolean;
  engagement: {
    governanceVotes: number;
    proposalsSubmitted: number;
    communicationsReceived: number;
    lastEngagement: string;
  };
  performance: {
    totalReturns: number;
    roi: number;
    avgAPY: number;
    winRate: number;
  };
  assets: Array<{
    id: string;
    name: string;
    tokenBalance: number;
    currentValue: number;
    purchasePrice: number;
    performance: number;
  }>;
  activity: Array<{
    id: string;
    type: 'investment' | 'governance' | 'communication' | 'claim';
    description: string;
    amount?: number;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
  communications: Array<{
    id: string;
    type: 'update' | 'campaign' | 'announcement';
    title: string;
    date: string;
    read: boolean;
  }>;
}

const ShareholderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [shareholder, setShareholder] = useState<ShareholderProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'activity' | 'engagement'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadShareholderData(id);
    }
  }, [id]);

  const loadShareholderData = async (shareholderId: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock shareholder data
      const mockShareholder: ShareholderProfile = {
        id: shareholderId,
        walletAddress: '0x742d35Cc6634C0532925a3b8D3Ac8d52EE0A5C52',
        email: 'investor@example.com',
        name: 'John Anderson',
        tier: 'GOLD',
        totalInvested: 125000,
        tokenBalance: 8750,
        portfolioValue: 142300,
        joinedAt: '2024-01-15T10:30:00Z',
        lastActive: '2024-06-17T14:22:00Z',
        kycStatus: 'VERIFIED',
        verificationLevel: 'accredited',
        isBlocked: false,
        isPremierHolder: true,
        engagement: {
          governanceVotes: 23,
          proposalsSubmitted: 2,
          communicationsReceived: 45,
          lastEngagement: '2024-06-15T09:15:00Z'
        },
        performance: {
          totalReturns: 17300,
          roi: 13.84,
          avgAPY: 9.2,
          winRate: 78.5
        },
        assets: [
          {
            id: '1',
            name: 'Downtown Seattle Office',
            tokenBalance: 3200,
            currentValue: 68400,
            purchasePrice: 62000,
            performance: 10.32
          },
          {
            id: '2',
            name: 'Premium Wine Collection',
            tokenBalance: 2150,
            currentValue: 34900,
            purchasePrice: 32500,
            performance: 7.38
          },
          {
            id: '3',
            name: 'Industrial Gold Mining',
            tokenBalance: 3400,
            currentValue: 39000,
            purchasePrice: 30500,
            performance: 27.87
          }
        ],
        activity: [
          {
            id: '1',
            type: 'investment',
            description: 'Invested in Premium Wine Collection',
            amount: 15000,
            timestamp: '2024-06-15T09:15:00Z',
            status: 'completed'
          },
          {
            id: '2',
            type: 'governance',
            description: 'Voted on Proposal #47: Platform Fee Adjustment',
            timestamp: '2024-06-12T16:45:00Z',
            status: 'completed'
          },
          {
            id: '3',
            type: 'claim',
            description: 'Claimed income distribution',
            amount: 2340,
            timestamp: '2024-06-10T11:20:00Z',
            status: 'completed'
          },
          {
            id: '4',
            type: 'communication',
            description: 'Received asset update notification',
            timestamp: '2024-06-08T14:30:00Z',
            status: 'completed'
          }
        ],
        communications: [
          {
            id: '1',
            type: 'update',
            title: 'Q2 Performance Report - Downtown Seattle Office',
            date: '2024-06-15T09:00:00Z',
            read: true
          },
          {
            id: '2',
            type: 'campaign',
            title: 'Exclusive Investment Opportunity - Tech Portfolio',
            date: '2024-06-10T08:30:00Z',
            read: false
          },
          {
            id: '3',
            type: 'announcement',
            title: 'Platform Enhancement: New Mobile App Features',
            date: '2024-06-05T15:45:00Z',
            read: true
          }
        ]
      };
      
      setShareholder(mockShareholder);
    } catch (err) {
      error('Failed to load shareholder data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusBadge = (status: string, type: 'verification' | 'kyc' | 'tier') => {
    const colors = {
      verification: {
        anonymous: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        accredited: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      },
      kyc: {
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      tier: {
        BRONZE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        SILVER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        GOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        PLATINUM: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      }
    } as const;
    
    const typeColors = colors[type];
    const colorClass = typeColors[status as keyof typeof typeColors] || typeColors[Object.keys(typeColors)[0] as keyof typeof typeColors];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'investment': return <DollarSign className="w-4 h-4" />;
      case 'governance': return <Shield className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'claim': return <Award className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shareholder) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Shareholder Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The shareholder you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shareholder Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive shareholder profile and investment overview
          </p>
        </div>
        
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Shareholder Profile Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {shareholder.name || 'Anonymous Investor'}
              </h2>
              {shareholder.isPremierHolder && (
                <Crown className="w-6 h-6 text-yellow-500" />
              )}
              {getStatusBadge(shareholder.tier, 'tier')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{shareholder.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <span className="font-mono">
                  {shareholder.walletAddress.slice(0, 8)}...{shareholder.walletAddress.slice(-6)}
                </span>
                <button
                  onClick={() => copyToClipboard(shareholder.walletAddress)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatTimeAgo(new Date(shareholder.joinedAt))}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getStatusBadge(shareholder.verificationLevel, 'verification')}
              {getStatusBadge(shareholder.kycStatus, 'kyc')}
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Activity className="w-4 h-4" />
                <span>Last active {formatTimeAgo(new Date(shareholder.lastActive))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(shareholder.portfolioValue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Returns</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(shareholder.performance.totalReturns)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ROI</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(shareholder.performance.roi)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {shareholder.tokenBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
            { key: 'assets', label: 'Assets', icon: <Star className="w-4 h-4" /> },
            { key: 'activity', label: 'Activity', icon: <History className="w-4 h-4" /> },
            { key: 'engagement', label: 'Engagement', icon: <MessageSquare className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average APY</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shareholder.performance.avgAPY}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shareholder.performance.winRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Invested</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(shareholder.totalInvested)}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Engagement Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Governance Votes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shareholder.engagement.governanceVotes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Proposals Submitted</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shareholder.engagement.proposalsSubmitted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Communications</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shareholder.engagement.communicationsReceived}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Asset Holdings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Token Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {shareholder.assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {asset.tokenBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(asset.currentValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 ${
                          asset.performance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {asset.performance >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {formatPercentage(asset.performance)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/marketplace/assets/${asset.id}`)}
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {shareholder.activity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(new Date(activity.timestamp))}
                        </p>
                        {activity.amount && (
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Communications & Engagement
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {shareholder.communications.map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {comm.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(new Date(comm.date))} • {comm.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!comm.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      <span className={`text-xs ${
                        comm.read ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 font-medium'
                      }`}>
                        {comm.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareholderDetail;