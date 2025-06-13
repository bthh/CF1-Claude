import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Download,
  RefreshCw,
  Eye,
  FileText,
  MessageSquare,
  Star
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useNotifications } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/format';

interface PlatformUser {
  id: string;
  address: string;
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  verificationLevel: 'anonymous' | 'basic' | 'verified' | 'accredited';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  joinedAt: string;
  lastActive: string;
  totalInvestments: number;
  proposalsCreated: number;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  supportTickets: number;
}

interface ComplianceCase {
  id: string;
  userId: string;
  userName: string;
  type: 'kyc_review' | 'aml_flag' | 'fraud_alert' | 'manual_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  description: string;
  createdAt: string;
  assignedTo?: string;
  evidence?: string[];
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'technical' | 'financial' | 'compliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  lastUpdated: string;
  responses: number;
}

const PlatformAdmin: React.FC = () => {
  const { currentAdmin, checkPermission } = useAdminAuth();
  const { success, error } = useNotifications();
  
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [complianceCases, setComplianceCases] = useState<ComplianceCase[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'compliance' | 'support' | 'analytics'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadComplianceCases(),
        loadSupportTickets()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: PlatformUser[] = [
      {
        id: 'user_1',
        address: 'neutron1abc123...',
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
        phone: '+1-555-0123',
        country: 'United States',
        verificationLevel: 'verified',
        status: 'active',
        kycStatus: 'approved',
        joinedAt: '2024-10-15T10:00:00Z',
        lastActive: '2024-12-05T14:30:00Z',
        totalInvestments: 125000,
        proposalsCreated: 2,
        complianceScore: 95,
        riskLevel: 'low',
        supportTickets: 1
      },
      {
        id: 'user_2',
        address: 'neutron1def456...',
        email: 'bob.smith@email.com',
        name: 'Bob Smith',
        country: 'Canada',
        verificationLevel: 'basic',
        status: 'active',
        kycStatus: 'pending',
        joinedAt: '2024-11-20T15:30:00Z',
        lastActive: '2024-12-05T16:45:00Z',
        totalInvestments: 50000,
        proposalsCreated: 0,
        complianceScore: 78,
        riskLevel: 'medium',
        supportTickets: 0
      },
      {
        id: 'user_3',
        address: 'neutron1ghi789...',
        email: 'suspicious@tempmail.com',
        name: 'John Doe',
        verificationLevel: 'anonymous',
        status: 'suspended',
        kycStatus: 'rejected',
        joinedAt: '2024-12-01T08:00:00Z',
        lastActive: '2024-12-02T12:00:00Z',
        totalInvestments: 0,
        proposalsCreated: 0,
        complianceScore: 35,
        riskLevel: 'high',
        supportTickets: 3
      }
    ];
    
    setUsers(mockUsers);
  };

  const loadComplianceCases = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockCases: ComplianceCase[] = [
      {
        id: 'case_1',
        userId: 'user_2',
        userName: 'Bob Smith',
        type: 'kyc_review',
        severity: 'medium',
        status: 'in_review',
        description: 'KYC documents require manual verification due to document quality issues',
        createdAt: '2024-12-04T10:00:00Z',
        assignedTo: 'Compliance Officer A',
        evidence: ['id_document.pdf', 'proof_of_address.pdf']
      },
      {
        id: 'case_2',
        userId: 'user_3',
        userName: 'John Doe',
        type: 'fraud_alert',
        severity: 'high',
        status: 'escalated',
        description: 'Multiple failed attempts to submit fraudulent documents',
        createdAt: '2024-12-01T09:30:00Z',
        assignedTo: 'Senior Compliance Officer',
        evidence: ['failed_attempts.log', 'document_analysis.pdf']
      }
    ];
    
    setComplianceCases(mockCases);
  };

  const loadSupportTickets = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket_1',
        userId: 'user_1',
        userName: 'Alice Johnson',
        subject: 'Unable to withdraw tokens after lockup period',
        category: 'technical',
        priority: 'high',
        status: 'in_progress',
        description: 'User reports that tokens are still locked despite lockup period ending',
        createdAt: '2024-12-05T09:00:00Z',
        lastUpdated: '2024-12-05T11:30:00Z',
        responses: 3
      },
      {
        id: 'ticket_2',
        userId: 'user_3',
        userName: 'John Doe',
        subject: 'Account suspension appeal',
        category: 'compliance',
        priority: 'medium',
        status: 'open',
        description: 'User requesting review of account suspension',
        createdAt: '2024-12-02T14:00:00Z',
        lastUpdated: '2024-12-02T14:00:00Z',
        responses: 0
      }
    ];
    
    setSupportTickets(mockTickets);
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend' | 'ban' | 'verify') => {
    if (!checkPermission('manage_users')) {
      error('Insufficient permissions to manage users');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : user.status,
              kycStatus: action === 'verify' ? 'approved' : user.kycStatus
            }
          : user
      ));
      
      success(`User ${action}${action.endsWith('e') ? 'd' : action.endsWith('y') ? 'ied' : 'ned'} successfully`);
    } catch (err) {
      error(`Failed to ${action} user`);
    }
  };

  const handleComplianceAction = async (caseId: string, action: 'approve' | 'reject' | 'escalate') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setComplianceCases(prev => prev.map(case_ => 
        case_.id === caseId 
          ? { 
              ...case_, 
              status: action === 'approve' ? 'resolved' : action === 'reject' ? 'resolved' : 'escalated'
            }
          : case_
      ));
      
      success(`Compliance case ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully`);
    } catch (err) {
      error(`Failed to ${action} compliance case`);
    }
  };

  const handleTicketAction = async (ticketId: string, action: 'assign' | 'resolve' | 'close') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSupportTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: action === 'assign' ? 'in_progress' : action === 'resolve' ? 'resolved' : 'closed',
              lastUpdated: new Date().toISOString()
            }
          : ticket
      ));
      
      success(`Support ticket ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully`);
    } catch (err) {
      error(`Failed to ${action} support ticket`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'suspended': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'banned': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'open': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'in_progress': case 'in_review': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'resolved': case 'closed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'escalated': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!currentAdmin || !checkPermission('manage_users')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Admin Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have sufficient permissions to access the Platform Admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Platform Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              User management, compliance monitoring, and support operations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadPlatformData}
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
              { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, count: users.length },
              { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" />, count: complianceCases.filter(c => c.status !== 'resolved').length },
              { id: 'support', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" />, count: supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length },
              { id: 'analytics', label: 'Analytics', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading platform data...</span>
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {selectedTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="pending">Pending</option>
                    </select>
                    
                    <button className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.name || 'Anonymous User'}
                              </h3>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.kycStatus)}`}>
                                KYC: {user.kycStatus.replace('_', ' ').charAt(0).toUpperCase() + user.kycStatus.replace('_', ' ').slice(1)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{user.address.slice(0, 12)}...{user.address.slice(-6)}</span>
                              {user.email && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{user.email}</span>
                                  </span>
                                </>
                              )}
                              {user.country && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center space-x-1">
                                    <Globe className="w-3 h-3" />
                                    <span>{user.country}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verification</p>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                              {user.verificationLevel.replace('_', ' ')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Investments</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${user.totalInvestments.toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Compliance Score</p>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.complianceScore}
                              </p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < Math.floor(user.complianceScore / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
                            <p className={`font-semibold ${getRiskColor(user.riskLevel)}`}>
                              {user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatTimeAgo(user.lastActive)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {user.status === 'active' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.kycStatus === 'pending' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'verify')}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approve KYC"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* User Details Expansion */}
                    {showUserDetails === user.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              {user.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span>{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              {user.country && (
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4 text-gray-400" />
                                  <span>{user.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div>Proposals Created: {user.proposalsCreated}</div>
                              <div>Support Tickets: {user.supportTickets}</div>
                              <div>Member Since: {new Date(user.joinedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Compliance</h4>
                            <div className="space-y-2 text-sm">
                              <div>Verification Level: {user.verificationLevel}</div>
                              <div>KYC Status: {user.kycStatus}</div>
                              <div>Risk Assessment: {user.riskLevel}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {selectedTab === 'compliance' && (
            <div className="space-y-6">
              {complianceCases.map((case_) => (
                <div key={case_.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {case_.userName}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status.replace('_', ' ').charAt(0).toUpperCase() + case_.status.replace('_', ' ').slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          case_.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          case_.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          case_.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {case_.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {case_.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Type: {case_.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(case_.createdAt)}</span>
                        {case_.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to: {case_.assignedTo}</span>
                          </>
                        )}
                      </div>
                      
                      {case_.evidence && case_.evidence.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Evidence Files:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {case_.evidence.map((file, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded-lg">
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {case_.status === 'open' || case_.status === 'in_review' ? (
                        <>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleComplianceAction(case_.id, 'escalate')}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Escalate
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Case {case_.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Support Tab */}
          {selectedTab === 'support' && (
            <div className="space-y-6">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        From: {ticket.userName}
                      </p>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>Category: {ticket.category}</span>
                        <span>•</span>
                        <span>Created: {formatTimeAgo(ticket.createdAt)}</span>
                        <span>•</span>
                        <span>Updated: {formatTimeAgo(ticket.lastUpdated)}</span>
                        <span>•</span>
                        <span>{ticket.responses} responses</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleTicketAction(ticket.id, 'assign')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Assign
                        </button>
                      )}
                      
                      {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                        <button
                          onClick={() => handleTicketAction(ticket.id, 'resolve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleTicketAction(ticket.id, 'close')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {users.filter(u => u.status === 'active').length} active
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">KYC Pending</p>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.kycStatus === 'pending').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open Cases</p>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {complianceCases.filter(c => c.status !== 'resolved').length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open Tickets</p>
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  User Status Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['active', 'suspended', 'banned', 'pending'].map((status) => {
                    const count = users.filter(u => u.status === status).length;
                    const percentage = (count / users.length) * 100;
                    
                    return (
                      <div key={status} className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto ${getStatusColor(status)}`}>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {status}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlatformAdmin;