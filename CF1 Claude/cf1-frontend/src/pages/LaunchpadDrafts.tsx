import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Send, 
  Clock, 
  FileText,
  Building,
  TrendingUp,
  Landmark,
  Factory,
  Home,
  Coins,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  MoreVertical,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';
import { useSubmissionStore, type SubmittedProposal } from '../store/submissionStore';
import { useLaunchpadData } from '../services/launchpadDataService';

const DraftCard: React.FC<SubmittedProposal & { 
  onEdit: () => void; 
  onDelete: () => void; 
  onSubmit: () => void; 
  showBulkActions?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}> = ({
  id,
  assetName,
  assetType,
  category,
  location,
  description,
  targetAmount,
  tokenPrice,
  expectedAPY,
  fundingDeadline,
  submissionDate,
  onEdit,
  onDelete,
  onSubmit,
  showBulkActions = false,
  isSelected = false,
  onSelect
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'Commercial Real Estate':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'Residential Real Estate':
        return <Home className="w-5 h-5 text-green-600" />;
      case 'Industrial Real Estate':
        return <Factory className="w-5 h-5 text-gray-600" />;
      case 'Precious Metals':
        return <Coins className="w-5 h-5 text-yellow-600" />;
      case 'Agriculture':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'Infrastructure':
        return <Landmark className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'Commercial Real Estate':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'Residential Real Estate':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'Industrial Real Estate':
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
      case 'Precious Metals':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'Agriculture':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'Infrastructure':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {showBulkActions && (
              <button
                onClick={onSelect}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getCategoryColor()}`}>
                  {getCategoryIcon()}
                  <span>{category}</span>
                </span>
                <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                  Draft
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                {assetName || 'Untitled Draft'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{assetType} • {location}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Target Amount</p>
            <p className="font-medium text-gray-900 dark:text-white">
              ${targetAmount ? parseInt(targetAmount).toLocaleString() : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Token Price</p>
            <p className="font-medium text-gray-900 dark:text-white">
              ${tokenPrice || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Expected APY</p>
            <p className="font-medium text-green-600">
              {expectedAPY ? `${expectedAPY}%` : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Deadline</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {fundingDeadline ? formatDate(fundingDeadline) : 'Not set'}
            </p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Saved {formatDate(submissionDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit draft"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onSubmit}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaunchpadDrafts: React.FC = () => {
  const navigate = useNavigate();
  const { getDrafts, deleteDraft, submitDraft, submissions } = useSubmissionStore();
  const { proposals } = useLaunchpadData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount' | 'apy'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const allDrafts = getDrafts();
  
  // Filter and sort drafts
  const filteredAndSortedDrafts = useMemo(() => {
    let filtered = allDrafts.filter(draft => {
      const matchesSearch = 
        draft.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || draft.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
          break;
        case 'name':
          comparison = a.assetName.localeCompare(b.assetName);
          break;
        case 'amount':
          comparison = parseInt(a.targetAmount || '0') - parseInt(b.targetAmount || '0');
          break;
        case 'apy':
          comparison = parseFloat(a.expectedAPY || '0') - parseFloat(b.expectedAPY || '0');
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [allDrafts, searchTerm, sortBy, sortOrder, filterCategory]);
  
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allDrafts.map(draft => draft.category)));
    return cats.filter(cat => cat && cat.trim() !== '');
  }, [allDrafts]);

  const handleEditDraft = (draftId: string) => {
    navigate(`/launchpad/create?draft=${draftId}`);
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    setShowDeleteConfirm(null);
  };

  const handleSubmitDraft = (draftId: string) => {
    const result = submitDraft(draftId);
    if (result.success && result.proposalId) {
      alert('Draft submitted successfully!');
      navigate('/my-submissions');
    } else {
      alert(`Failed to submit draft: ${result.error}`);
    }
  };

  const handleSelectDraft = (draftId: string) => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDrafts.size === filteredAndSortedDrafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredAndSortedDrafts.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedDrafts.forEach(draftId => deleteDraft(draftId));
    setSelectedDrafts(new Set());
    setShowBulkActions(false);
  };

  const handleBulkSubmit = () => {
    selectedDrafts.forEach(draftId => {
      const result = submitDraft(draftId);
      // In a real app, you'd want to show individual results
    });
    setSelectedDrafts(new Set());
    setShowBulkActions(false);
    navigate('/my-submissions');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/launchpad')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Launchpad Drafts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your saved proposal drafts
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{allDrafts.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Saved Drafts</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200 dark:border-gray-600">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Proposals', route: '/launchpad' },
              { key: 'submissions', label: 'My Submissions', route: '/my-submissions' },
              { key: 'drafts', label: 'Drafts', route: '/launchpad/drafts' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(tab.route)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tab.key === 'drafts'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.key === 'submissions' ? submissions.filter(s => s.status !== 'draft').length : tab.key === 'drafts' ? allDrafts.length : proposals.length})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filter Controls */}
      {allDrafts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="apy">Sort by APY</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>

              {/* Bulk Actions Toggle */}
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  showBulkActions 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Bulk Actions
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {selectedDrafts.size === filteredAndSortedDrafts.length ? 
                      <CheckSquare className="w-4 h-4" /> : 
                      <Square className="w-4 h-4" />
                    }
                    <span>
                      {selectedDrafts.size === filteredAndSortedDrafts.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                  {selectedDrafts.size > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedDrafts.size} selected
                    </span>
                  )}
                </div>

                {selectedDrafts.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkSubmit}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Selected</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedDrafts.length} of {allDrafts.length} drafts
              {searchTerm && ` matching "${searchTerm}"`}
              {filterCategory !== 'all' && ` in ${filterCategory}`}
            </p>
          </div>
        </div>
      )}

      {/* Drafts Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {filteredAndSortedDrafts.length > 0 ? (
          <div className="p-6">
            <div className="space-y-6">
              {filteredAndSortedDrafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  {...draft}
                  onEdit={() => handleEditDraft(draft.id)}
                  onDelete={() => setShowDeleteConfirm(draft.id)}
                  onSubmit={() => handleSubmitDraft(draft.id)}
                  showBulkActions={showBulkActions}
                  isSelected={selectedDrafts.has(draft.id)}
                  onSelect={() => handleSelectDraft(draft.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No drafts saved</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start creating a launchpad proposal to save it as a draft.
            </p>
            <button
              onClick={() => navigate('/launchpad/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Proposal
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Draft</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchpadDrafts;