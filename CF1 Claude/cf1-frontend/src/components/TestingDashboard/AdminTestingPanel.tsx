import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Settings, Activity, Database, AlertTriangle,
  CheckCircle, XCircle, Clock, FileText, DollarSign, TrendingUp,
  Bell, Zap, RefreshCw, Eye, PlayCircle, PauseCircle
} from 'lucide-react';
import { useRoleBasedData, roleBasedDemoData } from '../../services/roleBasedDemoData';
import { useDemoModeStore } from '../../store/demoModeStore';
import { useSessionStore } from '../../store/sessionStore';

interface AdminTestingPanelProps {
  className?: string;
}

export const AdminTestingPanel: React.FC<AdminTestingPanelProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'approvals' | 'compliance' | 'users'>('overview');
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  
  const { selectedRole } = useSessionStore();
  const { isDemoMode, scenario } = useDemoModeStore();
  const roleData = useRoleBasedData(selectedRole);

  // Only show for admin roles
  if (!selectedRole || (selectedRole !== 'super_admin' && selectedRole !== 'owner')) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Admin Testing Panel requires Super Admin or Owner role
          </span>
        </div>
      </div>
    );
  }

  const adminData = roleData?.adminData;
  if (!adminData && isDemoMode()) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
        <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">No admin data available</p>
        <button
          onClick={() => roleBasedDemoData.seedDataForRole(selectedRole)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Admin Test Data
        </button>
      </div>
    );
  }

  const processAdminAction = async (action: string, targetId?: string) => {
    setIsProcessingAction(action);
    
    // Simulate realistic admin action processing time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log(`🔧 [ADMIN ACTION] Processed: ${action}`, { targetId, role: selectedRole });
    
    setIsProcessingAction(null);
  };

  const platformStats = adminData?.platformStats || {
    totalUsers: 0,
    totalProposals: 0,
    totalValueLocked: '$0',
    activeInvestments: 0,
    completedFundings: 0,
    complianceScore: 0
  };

  const recentActivity = adminData?.recentActivity || [];
  const pendingApprovals = adminData?.pendingApprovals || [];
  const complianceReports = adminData?.complianceReports || [];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Admin Testing Panel
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Platform administration and approval workflows
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
              {selectedRole === 'owner' ? '👑 Owner' : '🛡️ Super Admin'}
            </div>
            {isDemoMode() && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                🎭 Test Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Platform Overview', icon: Activity },
            { id: 'approvals', name: 'Pending Approvals', icon: CheckCircle },
            { id: 'compliance', name: 'Compliance', icon: FileText },
            { id: 'users', name: 'User Management', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Platform Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {platformStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {platformStats.totalValueLocked}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">Total Value Locked</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {platformStats.totalProposals}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Active Proposals</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {platformStats.activeInvestments}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Active Investments</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {platformStats.completedFundings}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Completed Fundings</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {platformStats.complianceScore}%
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">Compliance Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Platform Activity
                </h4>
                <button
                  onClick={() => processAdminAction('refresh_activity')}
                  disabled={isProcessingAction === 'refresh_activity'}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center space-x-1"
                >
                  {isProcessingAction === 'refresh_activity' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.severity === 'high' ? 'bg-red-500' :
                      activity.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.actionRequired && (
                      <button
                        onClick={() => processAdminAction('handle_activity', activity.id)}
                        disabled={isProcessingAction === `handle_activity_${activity.id}`}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isProcessingAction === `handle_activity_${activity.id}` ? '...' : 'Review'}
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {activeSection === 'approvals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Approvals
              </h4>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium">
                {pendingApprovals.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {pendingApprovals.length > 0 ? pendingApprovals.map((approval) => (
                <div key={approval.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          approval.type === 'proposal' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          approval.type === 'user_verification' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {approval.type === 'proposal' ? <FileText className="w-4 h-4" /> :
                           approval.type === 'user_verification' ? <Users className="w-4 h-4" /> :
                           <DollarSign className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {approval.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted by {approval.submittedBy} • {new Date(approval.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full ${
                          approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          approval.status === 'under_review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {approval.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          approval.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {approval.priority} priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => processAdminAction('approve', approval.id)}
                        disabled={isProcessingAction === `approve_${approval.id}`}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center space-x-1"
                      >
                        {isProcessingAction === `approve_${approval.id}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => processAdminAction('reject', approval.id)}
                        disabled={isProcessingAction === `reject_${approval.id}`}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center space-x-1"
                      >
                        {isProcessingAction === `reject_${approval.id}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                      
                      <button
                        onClick={() => processAdminAction('review', approval.id)}
                        disabled={isProcessingAction === `review_${approval.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center space-x-1"
                      >
                        {isProcessingAction === `review_${approval.id}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">All caught up!</p>
                  <p className="text-sm">No pending approvals at this time</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance */}
        {activeSection === 'compliance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compliance Reports
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  platformStats.complianceScore >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  platformStats.complianceScore >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {platformStats.complianceScore}% Compliance Score
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceReports.length > 0 ? complianceReports.map((report) => (
                <div key={report.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        report.type === 'kyc' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        report.type === 'aml' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                        report.type === 'reg_cf' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {report.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.type.toUpperCase()} • {new Date(report.generated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      report.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => processAdminAction('view_report', report.id)}
                      disabled={isProcessingAction === `view_report_${report.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
                    >
                      {isProcessingAction === `view_report_${report.id}` ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span>View Report</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No compliance reports</p>
                  <p className="text-sm">Reports will appear here once generated</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Management */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Management
              </h4>
              <button
                onClick={() => processAdminAction('export_users')}
                disabled={isProcessingAction === 'export_users'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessingAction === 'export_users' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Users className="w-4 h-4" />
                )}
                <span>Export User Data</span>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  User Management Testing
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Test user verification, role management, and compliance workflows
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => processAdminAction('test_user_verification')}
                    disabled={isProcessingAction === 'test_user_verification'}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {isProcessingAction === 'test_user_verification' ? '...' : 'Test KYC Verification'}
                  </button>
                  
                  <button
                    onClick={() => processAdminAction('test_role_assignment')}
                    disabled={isProcessingAction === 'test_role_assignment'}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {isProcessingAction === 'test_role_assignment' ? '...' : 'Test Role Assignment'}
                  </button>
                  
                  <button
                    onClick={() => processAdminAction('test_compliance_check')}
                    disabled={isProcessingAction === 'test_compliance_check'}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                  >
                    {isProcessingAction === 'test_compliance_check' ? '...' : 'Test Compliance Check'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestingPanel;