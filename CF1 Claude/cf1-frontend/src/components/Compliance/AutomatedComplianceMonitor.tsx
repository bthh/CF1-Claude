import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, 
  FileText, Users, DollarSign, Calendar, Award, Zap,
  TrendingUp, Eye, Settings, Download, Bell, Filter,
  ChevronDown, ChevronUp, ArrowRight, ExternalLink,
  AlertCircle, Info, Target, Database, Brain, Activity
} from 'lucide-react';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'sec_reg_cf' | 'kyc_aml' | 'tax_reporting' | 'data_privacy' | 'operational' | 'disclosure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  automated: boolean;
  enabled: boolean;
  lastChecked: string;
  status: 'compliant' | 'warning' | 'violation' | 'pending' | 'error';
  confidence: number;
  details?: string;
  remediation?: string[];
  deadline?: string;
  regulatoryReference?: string;
}

interface ComplianceAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'violation' | 'warning' | 'deadline_approaching' | 'new_requirement';
  title: string;
  description: string;
  affectedEntities: Array<{
    type: 'proposal' | 'user' | 'transaction' | 'report';
    id: string;
    name: string;
  }>;
  detectedAt: string;
  deadline?: string;
  priority: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolutionSteps: string[];
  estimatedResolutionTime: string;
  potentialPenalties?: string[];
}

interface ComplianceReport {
  id: string;
  type: 'periodic' | 'ad_hoc' | 'regulatory_filing' | 'audit_trail';
  title: string;
  description: string;
  period: {
    start: string;
    end: string;
  };
  status: 'generating' | 'ready' | 'filed' | 'overdue';
  fileSize?: string;
  generatedAt?: string;
  filedAt?: string;
  nextDue?: string;
  recipients: string[];
  downloadUrl?: string;
}

interface ComplianceMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  format: 'percentage' | 'number' | 'currency' | 'days';
  trend: 'improving' | 'stable' | 'declining';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
  description: string;
}

export const AutomatedComplianceMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'alerts' | 'reports' | 'analytics'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ComplianceRule['category']>('all');
  const [alertFilter, setAlertFilter] = useState<'all' | 'active' | 'critical' | 'pending'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data - in production this would come from API/store
  const complianceRules: ComplianceRule[] = useMemo(() => [
    {
      id: 'rule_sec_cf_001',
      name: 'SEC Reg CF Investment Limits',
      description: 'Monitor individual investor annual investment limits ($12K for non-accredited, $123K for accredited)',
      category: 'sec_reg_cf',
      severity: 'critical',
      frequency: 'real_time',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'compliant',
      confidence: 98,
      regulatoryReference: '17 CFR 227.100'
    },
    {
      id: 'rule_sec_cf_002',
      name: 'Funding Portal Registration',
      description: 'Ensure platform maintains valid SEC funding portal registration and FINRA membership',
      category: 'sec_reg_cf',
      severity: 'critical',
      frequency: 'monthly',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'compliant',
      confidence: 100,
      regulatoryReference: '15 USC 78c(a)(80)'
    },
    {
      id: 'rule_kyc_001',
      name: 'Customer Identity Verification',
      description: 'All investors must complete identity verification within 30 days of registration',
      category: 'kyc_aml',
      severity: 'high',
      frequency: 'daily',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      confidence: 87,
      details: '23 users pending verification beyond 25-day threshold',
      remediation: ['Send automated reminder emails', 'Flag accounts for manual review', 'Consider account suspension'],
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rule_disclosure_001',
      name: 'Material Risk Disclosure',
      description: 'All investment offerings must include comprehensive risk disclosures in plain English',
      category: 'disclosure',
      severity: 'high',
      frequency: 'real_time',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'compliant',
      confidence: 94
    },
    {
      id: 'rule_tax_001',
      name: 'Form 1099 Generation',
      description: 'Generate and distribute 1099 forms for all investors with $600+ in annual distributions',
      category: 'tax_reporting',
      severity: 'medium',
      frequency: 'annual',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      confidence: 100,
      deadline: '2025-01-31T23:59:59Z'
    },
    {
      id: 'rule_privacy_001',
      name: 'GDPR Data Processing Consent',
      description: 'Obtain explicit consent for data processing from EU users and maintain audit trail',
      category: 'data_privacy',
      severity: 'medium',
      frequency: 'weekly',
      automated: true,
      enabled: true,
      lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'compliant',
      confidence: 92
    }
  ], []);

  const complianceAlerts: ComplianceAlert[] = useMemo(() => [
    {
      id: 'alert_001',
      ruleId: 'rule_kyc_001',
      ruleName: 'Customer Identity Verification',
      severity: 'high',
      type: 'warning',
      title: 'KYC Verification Backlog',
      description: '23 investor accounts have pending identity verification beyond 25-day threshold',
      affectedEntities: [
        { type: 'user', id: 'user_123', name: 'John Doe' },
        { type: 'user', id: 'user_456', name: 'Jane Smith' }
      ],
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 1,
      status: 'active',
      resolutionSteps: [
        'Send automated reminder emails to affected users',
        'Escalate to manual review team',
        'Consider temporary account restrictions if not resolved within 48 hours'
      ],
      estimatedResolutionTime: '2-3 business days',
      potentialPenalties: ['Account suspension', 'Regulatory inquiry', 'Potential fines up to $10,000']
    },
    {
      id: 'alert_002',
      ruleId: 'rule_tax_001',
      ruleName: 'Form 1099 Generation',
      severity: 'medium',
      type: 'deadline_approaching',
      title: '1099 Filing Deadline Approaching',
      description: 'Annual 1099 forms must be generated and distributed by January 31, 2025',
      affectedEntities: [
        { type: 'report', id: 'tax_2024', name: '2024 Tax Year 1099s' }
      ],
      detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: '2025-01-31T23:59:59Z',
      priority: 2,
      status: 'active',
      resolutionSteps: [
        'Review investor distribution records',
        'Generate 1099 forms for qualifying investors',
        'Mail physical copies and upload to investor portals',
        'File copies with IRS'
      ],
      estimatedResolutionTime: '1-2 weeks'
    }
  ], []);

  const complianceReports: ComplianceReport[] = useMemo(() => [
    {
      id: 'report_001',
      type: 'periodic',
      title: 'Monthly Compliance Summary',
      description: 'Comprehensive overview of platform compliance status and metrics',
      period: {
        start: '2024-12-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      },
      status: 'ready',
      fileSize: '2.3 MB',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextDue: '2025-01-31T23:59:59Z',
      recipients: ['compliance@cf1.com', 'legal@cf1.com', 'ceo@cf1.com'],
      downloadUrl: '#'
    },
    {
      id: 'report_002',
      type: 'regulatory_filing',
      title: 'SEC Annual Filing - Form CF Portal',
      description: 'Annual regulatory filing for funding portal operations',
      period: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      },
      status: 'generating',
      nextDue: '2025-03-31T23:59:59Z',
      recipients: ['sec-filings@cf1.com', 'compliance@cf1.com']
    },
    {
      id: 'report_003',
      type: 'audit_trail',
      title: 'GDPR Data Processing Audit',
      description: 'Detailed audit trail of all EU user data processing activities',
      period: {
        start: '2024-10-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      },
      status: 'ready',
      fileSize: '890 KB',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      recipients: ['privacy@cf1.com', 'legal@cf1.com'],
      downloadUrl: '#'
    }
  ], []);

  const complianceMetrics: ComplianceMetric[] = useMemo(() => [
    {
      id: 'metric_overall_score',
      label: 'Overall Compliance Score',
      value: 94,
      target: 95,
      format: 'percentage',
      trend: 'improving',
      status: 'good',
      lastUpdated: new Date().toISOString(),
      description: 'Weighted average of all compliance rule adherence'
    },
    {
      id: 'metric_kyc_completion',
      label: 'KYC Completion Rate',
      value: 87,
      target: 95,
      format: 'percentage',
      trend: 'stable',
      status: 'warning',
      lastUpdated: new Date().toISOString(),
      description: 'Percentage of users with completed identity verification'
    },
    {
      id: 'metric_avg_resolution_time',
      label: 'Avg Alert Resolution Time',
      value: 2.3,
      target: 2.0,
      format: 'days',
      trend: 'declining',
      status: 'warning',
      lastUpdated: new Date().toISOString(),
      description: 'Average time to resolve compliance alerts'
    },
    {
      id: 'metric_automated_coverage',
      label: 'Automated Rule Coverage',
      value: 78,
      target: 85,
      format: 'percentage',
      trend: 'improving',
      status: 'good',
      lastUpdated: new Date().toISOString(),
      description: 'Percentage of compliance rules with automated monitoring'
    }
  ], []);

  const filteredRules = selectedCategory === 'all' 
    ? complianceRules 
    : complianceRules.filter(rule => rule.category === selectedCategory);

  const filteredAlerts = alertFilter === 'all'
    ? complianceAlerts
    : alertFilter === 'active'
    ? complianceAlerts.filter(alert => alert.status === 'active')
    : alertFilter === 'critical'
    ? complianceAlerts.filter(alert => alert.severity === 'critical')
    : complianceAlerts.filter(alert => alert.status === 'acknowledged');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'excellent':
      case 'ready':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
      case 'good':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'violation':
      case 'critical':
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'generating':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatValue = (value: number, format: ComplianceMetric['format']) => {
    switch (format) {
      case 'percentage': return `${value}%`;
      case 'currency': return `$${value.toLocaleString()}`;
      case 'days': return `${value} days`;
      default: return value.toString();
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, this would refresh data from API
      console.log('Refreshing compliance data...');
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Automated Compliance Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time regulatory compliance monitoring and alerting system
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            
            <button
              onClick={() => setIsLoading(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(metric.value, metric.format)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Target: {formatValue(metric.target, metric.format)}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metric.value >= metric.target ? 'bg-green-600' : 
                  metric.value >= metric.target * 0.8 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'rules', label: 'Rules', icon: FileText },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'reports', label: 'Reports', icon: Download },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
            {tab.id === 'alerts' && filteredAlerts.filter(a => a.status === 'active').length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filteredAlerts.filter(a => a.status === 'active').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Alerts
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {complianceAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-6">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.severity)}`}>
                          {alert.severity} priority
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.detectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rule Status Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Rule Status Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(
                  complianceRules.reduce((acc, rule) => {
                    acc[rule.status] = (acc[rule.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'compliant' ? 'bg-green-500' :
                        status === 'warning' ? 'bg-yellow-500' :
                        status === 'violation' ? 'bg-red-500' :
                        status === 'pending' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} rule{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Rule Filters */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="sec_reg_cf">SEC Reg CF</option>
              <option value="kyc_aml">KYC/AML</option>
              <option value="tax_reporting">Tax Reporting</option>
              <option value="data_privacy">Data Privacy</option>
              <option value="operational">Operational</option>
              <option value="disclosure">Disclosure</option>
            </select>
          </div>

          {/* Rules List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRules.map((rule) => (
                <div key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {rule.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rule.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          rule.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                          rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {rule.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>Category: {rule.category.replace('_', ' ').toUpperCase()}</span>
                        <span>Frequency: {rule.frequency.replace('_', ' ')}</span>
                        <span>Confidence: {rule.confidence}%</span>
                        {rule.automated && (
                          <span className="flex items-center">
                            <Zap className="w-4 h-4 mr-1 text-blue-500" />
                            Automated
                          </span>
                        )}
                      </div>

                      {rule.details && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            {rule.details}
                          </p>
                        </div>
                      )}

                      {rule.remediation && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Recommended Actions:
                          </h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {rule.remediation.map((action, index) => (
                              <li key={index} className="flex items-start">
                                <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Alert Filters */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Alerts</option>
              <option value="active">Active Only</option>
              <option value="critical">Critical Only</option>
              <option value="pending">Pending Resolution</option>
            </select>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start space-x-4">
                  {getSeverityIcon(alert.severity)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.type === 'violation' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          alert.type === 'deadline_approaching' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.detectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {alert.description}
                    </p>

                    {alert.deadline && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          Deadline: {new Date(alert.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Resolution Steps:
                        </h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {alert.resolutionSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Est. resolution: {alert.estimatedResolutionTime}
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <>
                              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                Acknowledge
                              </button>
                              <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                Resolve
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Reports List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Compliance Reports
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {complianceReports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {report.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {report.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>Type: {report.type.replace('_', ' ')}</span>
                        <span>
                          Period: {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                        </span>
                        {report.fileSize && <span>Size: {report.fileSize}</span>}
                        {report.nextDue && (
                          <span>Next due: {new Date(report.nextDue).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {report.downloadUrl && (
                        <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};