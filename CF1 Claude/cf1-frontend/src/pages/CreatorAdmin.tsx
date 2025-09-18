import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Settings,
  Download,
  RefreshCw,
  MessageCircle,
  FileText,
  UserPlus,
  Send,
  Shield,
  Award,
  Filter,
  Search,
  Plus,
  Mail,
  Flag,
  RotateCcw,
  Forward,
  Archive,
  Tag,
  ExternalLink,
  Brain,
  Vote,
  Crown
} from 'lucide-react';
import { useAdminAuthContext } from '../hooks/useAdminAuth';
import { useUnifiedAuthStore } from '../store/unifiedAuthStore';
import { useCosmJS } from '../hooks/useCosmJS';
import { useNotifications } from '../hooks/useNotifications';
import { useFeatureToggleStore } from '../store/featureToggleStore';
import { formatAmount, formatPercentage, formatTimeAgo } from '../utils/format';
import { PublishUpdateModal } from '../components/Creator/PublishUpdateModal';
import { CreateCampaignModal } from '../components/Creator/CreateCampaignModal';
import { AssistantManagementModal } from '../components/Creator/AssistantManagementModal';
import AIAssistantInterface from '../components/AIAssistant/AIAssistantInterface';
import AutoCommunicationsModal from '../components/AutoCommunication/AutoCommunicationsModal';
import TierManagement from '../components/CreatorAdmin/TierManagement';
import { apiClient } from '../lib/api/client';

// Creator Toolkit API Types
interface ShareholderProfile {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalInvested: number;
  tokenBalance: number;
  joinedAt: string;
  lastActive: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface CommunicationCampaign {
  id: string;
  title: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  targetAudience: string | { type: string; [key: string]: any };
  scheduledFor?: string;
  sentAt?: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  content: {
    subject?: string;
    body: string;
    attachments?: string[];
  };
}

interface ShareholderEngagement {
  id: string;
  shareholderId: string;
  assetId: string;
  type: 'VOTE' | 'COMMENT' | 'QUESTION' | 'FEEDBACK';
  content: string;
  timestamp: string;
  resolved: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AssetUpdate {
  id: string;
  assetId: string;
  title: string;
  content: string;
  type: 'FINANCIAL' | 'OPERATIONAL' | 'REGULATORY' | 'GENERAL';
  publishedAt: string;
  visibility: 'PUBLIC' | 'SHAREHOLDERS_ONLY';
}

interface CreatorAnalytics {
  totalShareholders: number;
  activeAssets: number;
  totalCommunications: number;
  engagementRate: number;
  averageHolding: number;
  tierDistribution: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
  monthlyGrowth: number;
  recentActivity: Array<{
    type: 'new_shareholder' | 'communication_sent' | 'engagement' | 'update_published';
    description: string;
    timestamp: string;
    assetId?: string;
  }>;
}

const CreatorAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuthContext();
  const { user: unifiedUser, isAuthenticated: isUnifiedAuthenticated } = useUnifiedAuthStore();
  const { isConnected } = useCosmJS();
  const { success, error } = useNotifications();
  const { isFeatureEnabled } = useFeatureToggleStore();
  
  // State management
  const [shareholders, setShareholders] = useState<ShareholderProfile[]>([]);
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [engagements, setEngagements] = useState<ShareholderEngagement[]>([]);
  const [assetUpdates, setAssetUpdates] = useState<AssetUpdate[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'shareholders' | 'communications' | 'engagements' | 'updates' | 'tiers' | 'ai_assistant' | 'settings'>('overview');
  
  // Filters and search
  const [shareholderFilter, setShareholderFilter] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [campaignType, setCampaignType] = useState<'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'>('EMAIL');
  
  // Communications filters
  const [communicationSearchTerm, setCommunicationSearchTerm] = useState('');
  const [communicationStatusFilter, setCommunicationStatusFilter] = useState<string>('');
  const [communicationTypeFilter, setCommunicationTypeFilter] = useState<string>('');
  const [communicationSortBy, setCommunicationSortBy] = useState<'date' | 'title' | 'recipients' | 'openRate'>('date');
  const [communicationSortOrder, setCommunicationSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showAutoCommunicationsModal, setShowAutoCommunicationsModal] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<CommunicationCampaign | null>(null);
  const [selectedAssetUpdate, setSelectedAssetUpdate] = useState<AssetUpdate | null>(null);

  // Mock assets data - in real implementation, this would come from the backend
  const mockAssets = [
    { id: 'asset_solar_1', name: 'Solar Farm Project Alpha', type: 'Renewable Energy' },
    { id: 'asset_wind_1', name: 'Wind Farm Project Beta', type: 'Renewable Energy' },
    { id: 'asset_real_1', name: 'Commercial Real Estate Fund', type: 'Real Estate' }
  ];

  useEffect(() => {
    loadCreatorData().catch((err) => {
      console.error('Unhandled error in loadCreatorData useEffect:', err);
      error('Failed to initialize creator data');
    });
  }, []);

  const loadCreatorData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls to our backend
      // For now, I'll show the structure with mock data that represents the new features
      await Promise.all([
        loadShareholders(),
        loadCommunications(),
        loadEngagements(),
        loadAssetUpdates(),
        loadAnalytics()
      ]);
    } catch (err) {
      console.error('Error loading creator data:', err);
      error('Failed to load creator data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadShareholders = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data representing the new shareholder management features
    const mockShareholders: ShareholderProfile[] = [
      {
        id: 'sh_1',
        walletAddress: 'neutron1abc...def',
        email: 'investor1@example.com',
        name: 'John Smith',
        tier: 'GOLD',
        totalInvested: 50000,
        tokenBalance: 5000,
        joinedAt: '2024-01-15T10:00:00Z',
        lastActive: '2024-12-05T14:30:00Z',
        kycStatus: 'VERIFIED',
        communicationPreferences: {
          email: true,
          sms: false,
          push: true
        }
      },
      {
        id: 'sh_2',
        walletAddress: 'neutron1xyz...uvw',
        email: 'investor2@example.com',
        name: 'Sarah Johnson',
        tier: 'PLATINUM',
        totalInvested: 150000,
        tokenBalance: 15000,
        joinedAt: '2024-02-20T09:15:00Z',
        lastActive: '2024-12-06T11:45:00Z',
        kycStatus: 'VERIFIED',
        communicationPreferences: {
          email: true,
          sms: true,
          push: true
        }
      },
      {
        id: 'sh_3',
        walletAddress: 'neutron1mno...pqr',
        email: 'investor3@example.com',
        name: 'Michael Brown',
        tier: 'SILVER',
        totalInvested: 25000,
        tokenBalance: 2500,
        joinedAt: '2024-03-10T16:20:00Z',
        lastActive: '2024-12-04T09:12:00Z',
        kycStatus: 'PENDING',
        communicationPreferences: {
          email: true,
          sms: false,
          push: false
        }
      }
    ];
    
    setShareholders(mockShareholders);
  };

  const loadCommunications = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/api/creator-toolkit/communications');
      
      if (response?.success && response.data) {
        const communications = response.data.data || [];
        
        // Validate communications data
        const validCommunications = communications.filter(comm => {
          if (!comm || typeof comm !== 'object') {
            console.warn('Invalid communication object:', comm);
            return false;
          }
          return true;
        });
        
        setCampaigns(validCommunications);
      } else {
        console.warn('No communications data available, using fallback');
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading communications:', error);
      // Fallback to empty array on API error
      setCampaigns([]);
    }
  };

  const loadEngagements = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const mockEngagements: ShareholderEngagement[] = [
      {
        id: 'eng_1',
        shareholderId: 'sh_1',
        assetId: 'asset_solar_1',
        type: 'QUESTION',
        content: 'When will the next dividend distribution occur?',
        timestamp: '2024-12-05T15:30:00Z',
        resolved: false,
        priority: 'MEDIUM'
      },
      {
        id: 'eng_2',
        shareholderId: 'sh_2',
        assetId: 'asset_wind_1',
        type: 'FEEDBACK',
        content: 'The quarterly report was very comprehensive. Great job!',
        timestamp: '2024-12-04T11:20:00Z',
        resolved: true,
        priority: 'LOW'
      },
      {
        id: 'eng_3',
        shareholderId: 'sh_3',
        assetId: 'asset_solar_1',
        type: 'VOTE',
        content: 'Voted YES on increasing maintenance budget',
        timestamp: '2024-12-03T09:45:00Z',
        resolved: true,
        priority: 'LOW'
      }
    ];
    
    setEngagements(mockEngagements);
  };

  const loadAssetUpdates = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/api/creator-toolkit/asset-updates');
      
      if (response?.success && response.data) {
        const updates = response.data.data || [];
        
        // Sort by created/published date (newest first)
        const sortedUpdates = updates.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
          return dateB - dateA;
        });
        
        setAssetUpdates(sortedUpdates);
      } else {
        console.warn('No asset updates data available, using fallback');
        setAssetUpdates([]);
      }
    } catch (error) {
      console.error('Error loading asset updates:', error);
      // Fallback to empty array on API error
      setAssetUpdates([]);
    }
  };

  const loadAnalytics = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAnalytics: CreatorAnalytics = {
      totalShareholders: 156,
      activeAssets: 3,
      totalCommunications: 24,
      engagementRate: 67.8,
      averageHolding: 48500,
      tierDistribution: {
        BRONZE: 89,
        SILVER: 42,
        GOLD: 18,
        PLATINUM: 7
      },
      monthlyGrowth: 12.5,
      recentActivity: [
        {
          type: 'new_shareholder',
          description: '3 new shareholders joined this week',
          timestamp: '2024-12-05T16:00:00Z'
        },
        {
          type: 'communication_sent',
          description: 'Q4 Financial Update sent to all shareholders',
          timestamp: '2024-12-01T10:00:00Z'
        },
        {
          type: 'engagement',
          description: '12 new shareholder questions received',
          timestamp: '2024-12-04T14:30:00Z'
        }
      ]
    };
    
    setAnalytics(mockAnalytics);
  };

  // API call functions (these would connect to our backend in a real implementation)
  const createCommunicationCampaign = async (campaignData: Partial<CommunicationCampaign>) => {
    try {
      // POST /api/creator-toolkit/communications
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Communication campaign created successfully');
      await loadCommunications();
    } catch (err) {
      error('Failed to create communication campaign');
    }
  };

  const sendCommunication = async (campaignId: string) => {
    try {
      // POST /api/creator-toolkit/communications/:id/send
      await new Promise(resolve => setTimeout(resolve, 1500));
      success('Communication sent successfully');
      await loadCommunications();
    } catch (err) {
      error('Failed to send communication');
    }
  };

  const updateShareholderTier = async (shareholderId: string, newTier: string) => {
    try {
      // PUT /api/creator-toolkit/shareholders/:id/tier
      await new Promise(resolve => setTimeout(resolve, 800));
      success('Shareholder tier updated successfully');
      await loadShareholders();
    } catch (err) {
      error('Failed to update shareholder tier');
    }
  };

  const resolveEngagement = async (engagementId: string) => {
    try {
      // PUT /api/creator-toolkit/engagements/:id/resolve
      await new Promise(resolve => setTimeout(resolve, 600));
      success('Engagement marked as resolved');
      await loadEngagements();
    } catch (err) {
      error('Failed to resolve engagement');
    }
  };

  // Additional engagement action functions
  const reopenEngagement = async (engagementId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      success('Engagement reopened');
      await loadEngagements();
    } catch (err) {
      error('Failed to reopen engagement');
    }
  };

  const changePriority = async (engagementId: string, newPriority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      success(`Priority changed to ${newPriority}`);
      await loadEngagements();
    } catch (err) {
      error('Failed to change priority');
    }
  };

  const sendReply = async (engagementId: string) => {
    const message = prompt('Enter your reply:');
    if (message) {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        success('Reply sent successfully');
        await loadEngagements();
      } catch (err) {
        error('Failed to send reply');
      }
    }
  };

  const emailShareholder = async (engagementId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      success('Email sent to shareholder');
    } catch (err) {
      error('Failed to send email');
    }
  };

  const forwardEngagement = async (engagementId: string) => {
    const recipient = prompt('Forward to team member (email):');
    if (recipient) {
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        success(`Engagement forwarded to ${recipient}`);
      } catch (err) {
        error('Failed to forward engagement');
      }
    }
  };

  const archiveEngagement = async (engagementId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      success('Engagement archived');
      await loadEngagements();
    } catch (err) {
      error('Failed to archive engagement');
    }
  };

  const deleteEngagement = async (engagementId: string) => {
    if (confirm('Are you sure you want to delete this engagement? This action cannot be undone.')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        success('Engagement deleted');
        await loadEngagements();
      } catch (err) {
        error('Failed to delete engagement');
      }
    }
  };

  const viewEngagementDetails = (engagement: ShareholderEngagement) => {
    // In a real implementation, this would open a modal or navigate to detail page
    alert(`Engagement Details:\n\nType: ${engagement.type}\nPriority: ${engagement.priority}\nContent: ${engagement.content}\nTimestamp: ${engagement.timestamp}\nAsset: ${engagement.assetId}`);
  };

  const escalateEngagement = async (engagementId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      success('Engagement escalated to high priority');
      await loadEngagements();
    } catch (err) {
      error('Failed to escalate engagement');
    }
  };

  const publishAssetUpdate = async (updateData: Partial<AssetUpdate>) => {
    try {
      // POST /api/creator-toolkit/asset-updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Asset update published successfully');
      await loadAssetUpdates();
    } catch (err) {
      error('Failed to publish asset update');
    }
  };

  // Enhanced API functions for modal integration
  const handlePublishUpdate = async (updateData: any) => {
    try {
      const response = await apiClient.post('/api/creator-toolkit/asset-updates', {
        ...updateData,
        creatorId: currentAdmin?.id
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to publish update');
      }

      success('Asset update published successfully');
      await loadAssetUpdates();
    } catch (err) {
      console.error('Error publishing update:', err);
      error('Failed to publish asset update');
      throw err;
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      const response = await apiClient.post('/api/creator-toolkit/communications', {
        ...campaignData,
        creatorId: currentAdmin?.id
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create campaign');
      }

      success('Communication campaign created successfully');
      await loadCommunications();
    } catch (err) {
      console.error('Error creating campaign:', err);
      error('Failed to create communication campaign');
      throw err;
    }
  };

  // Helper functions
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'GOLD': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'SILVER': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'BRONZE': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'DRAFT': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'FAILED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'VERIFIED': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'PENDING': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'MEDIUM': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      case 'LOW': return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredShareholders = shareholders.filter(shareholder => {
    const matchesSearch = shareholderFilter === '' || 
      shareholder.name?.toLowerCase().includes(shareholderFilter.toLowerCase()) ||
      shareholder.email?.toLowerCase().includes(shareholderFilter.toLowerCase());
    const matchesTier = tierFilter === '' || shareholder.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Communications filtering and sorting logic
  const filteredAndSortedCommunications = campaigns
    .filter(campaign => {
      const matchesSearch = communicationSearchTerm === '' || 
        campaign.title?.toLowerCase().includes(communicationSearchTerm.toLowerCase()) ||
        (typeof campaign.content === 'object' && campaign.content?.subject?.toLowerCase().includes(communicationSearchTerm.toLowerCase()));
      const matchesStatus = communicationStatusFilter === '' || campaign.status === communicationStatusFilter;
      const matchesType = communicationTypeFilter === '' || campaign.type === communicationTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (communicationSortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'recipients':
          aValue = a.recipientCount || 0;
          bValue = b.recipientCount || 0;
          break;
        case 'openRate':
          aValue = a.openRate || 0;
          bValue = b.openRate || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.scheduledAt || a.createdAt).getTime();
          bValue = new Date(b.scheduledAt || b.createdAt).getTime();
          break;
      }
      
      if (communicationSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Clear communications filters helper
  const clearCommunicationFilters = () => {
    setCommunicationSearchTerm('');
    setCommunicationStatusFilter('');
    setCommunicationTypeFilter('');
  };

  // Get active filter count for communications
  const activeCommunicationFilters = [
    communicationSearchTerm,
    communicationStatusFilter,
    communicationTypeFilter
  ].filter(Boolean).length;

  // Combined access check for both old admin system and unified auth system
  const hasOldAdminAccess = currentAdmin && checkPermission('access_creator_admin');
  const hasUnifiedAdminAccess = unifiedUser && isUnifiedAuthenticated && 
    (unifiedUser.role === 'creator_admin' || unifiedUser.role === 'super_admin' || unifiedUser.role === 'owner');
  
  if (!hasOldAdminAccess && !hasUnifiedAdminAccess) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Creator Admin Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the Creator Admin panel.
            {currentAdmin?.role === 'investor' && (
              <><br />Consider switching to a Creator, Platform Admin, or Super Admin role.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Creator Toolkit & Shareholder Relations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage shareholders, communications, and asset updates
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAssistantModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Manage Team</span>
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              <span>Publish Update</span>
            </button>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
            <button
              onClick={loadCreatorData}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'shareholders', label: 'Shareholders', icon: <Users className="w-4 h-4" /> },
              { id: 'communications', label: 'Communications', icon: <MessageCircle className="w-4 h-4" /> },
              { id: 'engagements', label: 'Engagements', icon: <UserPlus className="w-4 h-4" /> },
              { id: 'updates', label: 'Asset Updates', icon: <FileText className="w-4 h-4" /> },
              { id: 'tiers', label: 'Tiers', icon: <Crown className="w-4 h-4" /> },
              ...(isFeatureEnabled('creator_ai_assistant') ? [{ id: 'ai_assistant', label: 'AI Assistant', icon: <Brain className="w-4 h-4" /> }] : []),
              { id: 'settings', label: 'Asset Settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading creator toolkit...</span>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && analytics && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Shareholders</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalShareholders}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{analytics.monthlyGrowth}% this month
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Assets</p>
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.activeAssets}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Managed assets
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</p>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(analytics.engagementRate)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Active participation
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Holding</p>
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatAmount(analytics.averageHolding)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Per shareholder
                  </p>
                </div>
              </div>

              {/* Tier Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Shareholder Tier Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.tierDistribution).map(([tier, count]) => (
                    <div key={tier} className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${getTierColor(tier)}`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{tier}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'new_shareholder' ? 'bg-green-100 dark:bg-green-900/20' :
                        activity.type === 'communication_sent' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        activity.type === 'engagement' ? 'bg-purple-100 dark:bg-purple-900/20' :
                        'bg-gray-100 dark:bg-gray-900/20'
                      }`}>
                        {activity.type === 'new_shareholder' && <UserPlus className="w-4 h-4 text-green-600" />}
                        {activity.type === 'communication_sent' && <Send className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'engagement' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'update_published' && <FileText className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shareholders Tab */}
          {selectedTab === 'shareholders' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search shareholders..."
                        value={shareholderFilter}
                        onChange={(e) => setShareholderFilter(e.target.value)}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Tiers</option>
                      <option value="PLATINUM">Platinum</option>
                      <option value="GOLD">Gold</option>
                      <option value="SILVER">Silver</option>
                      <option value="BRONZE">Bronze</option>
                    </select>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Shareholders List */}
              {filteredShareholders.map((shareholder) => (
                <div key={shareholder.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {shareholder.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 
                            className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => navigate(`/shareholder/${shareholder.id}`)}
                            title="View shareholder details"
                          >
                            {shareholder.name || 'Anonymous'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {shareholder.email}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTierColor(shareholder.tier)}`}>
                          {shareholder.tier}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(shareholder.kycStatus)}`}>
                          {shareholder.kycStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${formatAmount(shareholder.totalInvested)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Token Balance</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatAmount(shareholder.tokenBalance)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(shareholder.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatTimeAgo(shareholder.lastActive)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Communication Preferences:</span>
                        {shareholder.communicationPreferences.email && (
                          <span className="text-green-600">Email</span>
                        )}
                        {shareholder.communicationPreferences.sms && (
                          <span className="text-green-600">SMS</span>
                        )}
                        {shareholder.communicationPreferences.push && (
                          <span className="text-green-600">Push</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => updateShareholderTier(shareholder.id, 'GOLD')}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Update Tier"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/shareholder/${shareholder.id}`)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="View Shareholder Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Communications Tab */}
          {selectedTab === 'communications' && (
            <div className="space-y-6">
              {/* Create New Campaign */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Communication
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAutoCommunicationsModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Auto Communications</span>
                    </button>
                    <button
                      onClick={() => setShowCampaignModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Campaign</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <select
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="PUSH">Push Notification</option>
                      <option value="IN_APP">In-App Message</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Communications Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filter Communications
                  </h3>
                  {activeCommunicationFilters > 0 && (
                    <button
                      onClick={clearCommunicationFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={communicationSearchTerm}
                        onChange={(e) => setCommunicationSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <select
                      value={communicationStatusFilter}
                      onChange={(e) => setCommunicationStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="SENT">Sent</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <select
                      value={communicationTypeFilter}
                      onChange={(e) => setCommunicationTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="PUSH">Push Notification</option>
                      <option value="IN_APP">In-App Message</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
                    <div className="flex space-x-2">
                      <select
                        value={communicationSortBy}
                        onChange={(e) => setCommunicationSortBy(e.target.value as any)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                        <option value="recipients">Recipients</option>
                        <option value="openRate">Open Rate</option>
                      </select>
                      <button
                        onClick={() => setCommunicationSortOrder(communicationSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        title={`Sort ${communicationSortOrder === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        {communicationSortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeCommunicationFilters > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {communicationSearchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        Search: {communicationSearchTerm}
                        <button
                          onClick={() => setCommunicationSearchTerm('')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {communicationStatusFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
                        Status: {communicationStatusFilter}
                        <button
                          onClick={() => setCommunicationStatusFilter('')}
                          className="text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {communicationTypeFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        Type: {communicationTypeFilter}
                        <button
                          onClick={() => setCommunicationTypeFilter('')}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Campaign Results Summary */}
              {campaigns && campaigns.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {filteredAndSortedCommunications.length} of {campaigns.length} campaigns
                  </span>
                  <span>
                    Sorted by {communicationSortBy} ({communicationSortOrder === 'asc' ? 'ascending' : 'descending'})
                  </span>
                </div>
              )}

              {/* Campaigns List */}
              {filteredAndSortedCommunications && filteredAndSortedCommunications.length > 0 ? (
                filteredAndSortedCommunications.map((campaign) => {
                  try {
                    return (
                      <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 
                                className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => setSelectedCommunication(campaign)}
                              >
                                {campaign.title || 'Untitled Campaign'}
                              </h3>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {campaign.type}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Recipients</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {campaign.recipientCount || 0}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Target Audience</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {typeof campaign.targetAudience === 'string' 
                                    ? campaign.targetAudience 
                                    : campaign.targetAudience?.type || 'All Shareholders'
                                  }
                                </p>
                              </div>
                              
                              {campaign.openRate && (
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Open Rate</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatPercentage(campaign.openRate)}
                                  </p>
                                </div>
                              )}
                              
                              {campaign.clickRate && (
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Click Rate</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatPercentage(campaign.clickRate)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {campaign.content && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                {campaign.content.subject && (
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    Subject: {campaign.content.subject}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {campaign.content.body ? campaign.content.body.substring(0, 150) + '...' : 'No content'}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {campaign.status === 'DRAFT' && (
                              <button
                                onClick={() => sendCommunication(campaign.id)}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Send Campaign"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Campaign"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering campaign:', campaign, error);
                    return (
                      <div key={campaign.id || Math.random()} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">Error rendering campaign: {campaign.title || 'Unknown'}</p>
                      </div>
                    );
                  }
                })
              ) : (
                <div className="text-center py-8">
                  {campaigns && campaigns.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-gray-500 dark:text-gray-400">No campaigns match your current filters.</p>
                      <button
                        onClick={clearCommunicationFilters}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Clear filters to see all campaigns
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No communication campaigns found.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Engagements Tab */}
          {selectedTab === 'engagements' && (
            <div className="space-y-6">
              {engagements.map((engagement) => (
                <div key={engagement.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(engagement.type)}`}>
                          {engagement.type}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(engagement.priority)}`}>
                          {engagement.priority}
                        </span>
                        {engagement.resolved && (
                          <span className="px-2 py-1 rounded-lg text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/20">
                            RESOLVED
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-white">
                          {engagement.content}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          From shareholder • {formatTimeAgo(engagement.timestamp)} • Asset: {engagement.assetId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      {/* Primary Actions */}
                      <div className="flex items-center space-x-1">
                        {!engagement.resolved ? (
                          <button
                            onClick={() => resolveEngagement(engagement.id)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => reopenEngagement(engagement.id)}
                            className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            title="Reopen Engagement"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => sendReply(engagement.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Send Reply"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => viewEngagementDetails(engagement)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <div className="relative group">
                          <button
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Change Priority"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          {/* Priority dropdown */}
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => changePriority(engagement.id, 'HIGH')}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-t-lg"
                            >
                              High Priority
                            </button>
                            <button
                              onClick={() => changePriority(engagement.id, 'MEDIUM')}
                              className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            >
                              Medium Priority
                            </button>
                            <button
                              onClick={() => changePriority(engagement.id, 'LOW')}
                              className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-b-lg"
                            >
                              Low Priority
                            </button>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => emailShareholder(engagement.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Email Shareholder"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Management Actions */}
                      <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-gray-600">
                        {engagement.priority !== 'HIGH' && (
                          <button
                            onClick={() => escalateEngagement(engagement.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Escalate to High Priority"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => forwardEngagement(engagement.id)}
                          className="p-2 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                          title="Forward to Team Member"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => archiveEngagement(engagement.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Archive Engagement"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteEngagement(engagement.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Engagement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Asset Updates Tab */}
          {selectedTab === 'updates' && (
            <div className="space-y-6">
              {/* Create New Update */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Publish Asset Update
                  </h3>
                  <button
                    onClick={() => setShowPublishModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Update</span>
                  </button>
                </div>
              </div>

              {/* Updates List */}
              {assetUpdates.map((update) => (
                <div key={update.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 
                          className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setSelectedAssetUpdate(update)}
                        >
                          {update.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(update.type)}`}>
                          {update.type}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          update.visibility === 'PUBLIC' 
                            ? 'text-green-700 bg-green-100 dark:bg-green-900/20' 
                            : 'text-blue-700 bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          {update.visibility}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-white">
                          {update.content}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Asset: {update.assetId} • Published {formatTimeAgo(update.publishedAt || update.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Update"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tiers Tab */}
          {selectedTab === 'tiers' && (
            <div className="space-y-6">
              <TierManagement creatorId={currentAdmin?.id || ''} />
            </div>
          )}

          {/* AI Assistant Tab */}
          {selectedTab === 'ai_assistant' && isFeatureEnabled('creator_ai_assistant') && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg h-[800px]">
                <AIAssistantInterface 
                  selectedAssetId={mockAssets[0]?.id}
                  embedded={false}
                />
              </div>
            </div>
          )}

          {/* Asset Settings Tab */}
          {selectedTab === 'settings' && (
            <div className="space-y-6">
              {/* Governance Visibility Setting */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Vote className="w-5 h-5 mr-2 text-blue-600" />
                    Governance Visibility Policy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Control who can see governance proposals for your asset
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="always_private"
                        name="governance_visibility"
                        value="always_private"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        defaultChecked
                      />
                      <div className="flex-1">
                        <label htmlFor="always_private" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Always Private
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          All governance proposals will only be visible to token holders of this asset
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="always_public"
                        name="governance_visibility"
                        value="always_public"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <label htmlFor="always_public" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Always Public
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          All governance proposals will be visible to everyone on the platform
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="creator_decides"
                        name="governance_visibility"
                        value="creator_decides"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <label htmlFor="creator_decides" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Creator Decides
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Proposal creators can choose whether each proposal is public or private
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Asset Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-600" />
                    Additional Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    More asset configuration options coming soon
                  </p>
                </div>
                <div className="p-6">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Additional asset settings will be available in future updates</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PublishUpdateModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishUpdate}
        assets={mockAssets}
      />

      <CreateCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreate={handleCreateCampaign}
        shareholders={shareholders}
      />

      <AssistantManagementModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        creatorId={currentAdmin?.id || ''}
        assets={mockAssets}
      />

      <AutoCommunicationsModal
        isOpen={showAutoCommunicationsModal}
        onClose={() => setShowAutoCommunicationsModal(false)}
        creatorId={currentAdmin?.id || ''}
        isCreatorView={true}
      />

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Communication Details
                </h2>
                <button
                  onClick={() => setSelectedCommunication(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCommunication.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {selectedCommunication.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedCommunication.status)}`}>
                      {selectedCommunication.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Recipients</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCommunication.recipientCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Audience</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof selectedCommunication.targetAudience === 'string' 
                        ? selectedCommunication.targetAudience 
                        : selectedCommunication.targetAudience?.type || 'All Shareholders'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sent Date</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedCommunication.sentAt ? formatTimeAgo(selectedCommunication.sentAt) : 'Not sent'}
                    </p>
                  </div>
                </div>
                
                {(selectedCommunication.openRate || selectedCommunication.clickRate) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCommunication.openRate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Open Rate</label>
                        <p className="text-lg font-semibold text-green-600">{formatPercentage(selectedCommunication.openRate)}</p>
                      </div>
                    )}
                    {selectedCommunication.clickRate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Click Rate</label>
                        <p className="text-lg font-semibold text-blue-600">{formatPercentage(selectedCommunication.clickRate)}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Content</label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    {selectedCommunication.content?.subject && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</p>
                        <p className="text-gray-900 dark:text-white">{selectedCommunication.content.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message:</p>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedCommunication.content?.body || 'No content'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Update Detail Modal */}
      {selectedAssetUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Asset Update Details
                </h2>
                <button
                  onClick={() => setSelectedAssetUpdate(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAssetUpdate.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedAssetUpdate.type)}`}>
                      {selectedAssetUpdate.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Visibility</label>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      selectedAssetUpdate.visibility === 'PUBLIC' 
                        ? 'text-green-700 bg-green-100 dark:bg-green-900/20' 
                        : 'text-blue-700 bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      {selectedAssetUpdate.visibility}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Asset ID</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAssetUpdate.assetId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Published</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTimeAgo(selectedAssetUpdate.publishedAt || selectedAssetUpdate.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Content</label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedAssetUpdate.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorAdmin;