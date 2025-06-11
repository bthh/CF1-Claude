import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Calendar, Rocket, CheckCircle, Clock, FileText } from 'lucide-react';

interface ProjectActivity {
  id: string;
  projectName: string;
  activityType: 'Project Creation' | 'Recently Launched' | 'Proposal Created' | 'Proposal Submitted' | 'Funding Complete' | 'Governance Vote';
  creator: string;
  description: string;
  status: 'Active' | 'Completed' | 'Pending' | 'In Review';
  timestamp: Date;
}

const Activity: React.FC = () => {
  const [sortField, setSortField] = useState<keyof ProjectActivity>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const projectActivities: ProjectActivity[] = [
    {
      id: '1',
      projectName: 'Manhattan Office Complex',
      activityType: 'Recently Launched',
      creator: 'Premier Real Estate LLC',
      description: 'Commercial real estate project has successfully launched with full funding',
      status: 'Completed',
      timestamp: new Date('2024-01-28T14:30:00')
    },
    {
      id: '2',
      projectName: 'AI Data Center Complex',
      activityType: 'Proposal Created',
      creator: 'TechInvest Corp',
      description: 'New governance proposal for infrastructure expansion submitted',
      status: 'Active',
      timestamp: new Date('2024-01-27T09:15:00')
    },
    {
      id: '3',
      projectName: 'Renewable Energy Farm',
      activityType: 'Project Creation',
      creator: 'GreenPower Ventures',
      description: 'Solar and wind energy tokenization project created in launch phase',
      status: 'Pending',
      timestamp: new Date('2024-01-26T16:45:00')
    },
    {
      id: '4',
      projectName: 'Luxury Hotel Portfolio',
      activityType: 'Governance Vote',
      creator: 'Hospitality Holdings',
      description: 'Community vote on dividend distribution policy concluded',
      status: 'Completed',
      timestamp: new Date('2024-01-25T11:20:00')
    },
    {
      id: '5',
      projectName: 'Electric Vehicle Fleet',
      activityType: 'Funding Complete',
      creator: 'EV Mobility Fund',
      description: 'Transportation asset has reached funding goal and tokens minted',
      status: 'Completed',
      timestamp: new Date('2024-01-24T13:10:00')
    },
    {
      id: '6',
      projectName: 'Semiconductor Manufacturing',
      activityType: 'Proposal Submitted',
      creator: 'ChipTech Industries',
      description: 'Expansion proposal for manufacturing facility submitted for review',
      status: 'In Review',
      timestamp: new Date('2024-01-23T10:30:00')
    },
    {
      id: '7',
      projectName: 'Urban Vertical Farm',
      activityType: 'Project Creation',
      creator: 'AgriTech Solutions',
      description: 'Agricultural technology project created and entering launch phase',
      status: 'Active',
      timestamp: new Date('2024-01-22T08:45:00')
    },
    {
      id: '8',
      projectName: 'Swiss Watch Portfolio',
      activityType: 'Recently Launched',
      creator: 'Luxury Assets Co',
      description: 'Collectible luxury goods project successfully launched to investors',
      status: 'Completed',
      timestamp: new Date('2024-01-21T15:20:00')
    },
    {
      id: '9',
      projectName: 'Miami Beach Resort',
      activityType: 'Proposal Created',
      creator: 'Coastal Properties',
      description: 'New proposal for resort amenity upgrades created',
      status: 'Active',
      timestamp: new Date('2024-01-20T12:00:00')
    },
    {
      id: '10',
      projectName: 'Tech Startup Equity',
      activityType: 'Governance Vote',
      creator: 'Innovation Fund',
      description: 'Quarterly dividend distribution vote completed successfully',
      status: 'Completed',
      timestamp: new Date('2024-01-19T14:15:00')
    }
  ];

  const handleSort = (field: keyof ProjectActivity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedActivities = projectActivities
    .filter(activity => {
      const matchesSearch = activity.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || activity.activityType === filterType;
      const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * multiplier;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }
      return String(aValue).localeCompare(String(bValue)) * multiplier;
    });


  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getStatusColor = (status: ProjectActivity['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeColor = (type: ProjectActivity['activityType']) => {
    switch (type) {
      case 'Project Creation':
        return 'text-blue-600';
      case 'Recently Launched':
        return 'text-green-600';
      case 'Proposal Created':
      case 'Proposal Submitted':
        return 'text-purple-600';
      case 'Funding Complete':
        return 'text-green-600';
      case 'Governance Vote':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const activityTypes = ['Project Creation', 'Recently Launched', 'Proposal Created', 'Proposal Submitted', 'Funding Complete', 'Governance Vote'];
  const statuses = ['Active', 'Completed', 'Pending', 'In Review'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View recent project activity across the CF1 platform.</p>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{projectActivities.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">7</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {projectActivities.filter(a => a.status === 'Active' || a.status === 'Pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {projectActivities.filter(a => a.status === 'Completed').length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Project Activity Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Activity</h2>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search activities..."
                className="px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-40"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('projectName')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Project Name</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('activityType')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Activity Type</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('creator')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Creator</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-center py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white mx-auto"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white ml-auto"
                  >
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        {activity.activityType === 'Project Creation' && <Rocket className="w-5 h-5 text-white" />}
                        {activity.activityType === 'Recently Launched' && <CheckCircle className="w-5 h-5 text-white" />}
                        {(activity.activityType === 'Proposal Created' || activity.activityType === 'Proposal Submitted') && <FileText className="w-5 h-5 text-white" />}
                        {activity.activityType === 'Funding Complete' && <CheckCircle className="w-5 h-5 text-white" />}
                        {activity.activityType === 'Governance Vote' && <FileText className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{activity.projectName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${getActivityTypeColor(activity.activityType)}`}>
                      {activity.activityType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {activity.creator}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-gray-600 dark:text-gray-400">{formatDateTime(activity.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedActivities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No activities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;