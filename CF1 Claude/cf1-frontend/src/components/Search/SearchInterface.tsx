import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Clock,
  Bookmark,
  Star,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ArrowRight,
  FileText,
  Building,
  Vote,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useSearchStore, SearchResult, SearchResultType } from '../../store/searchStore';
import { formatTimeAgo } from '../../utils/format';
import { sanitizeSearchQuery, searchLimiter, validateInput, ValidationPatterns } from '../../utils/securityUtils';

interface SearchInterfaceProps {
  embedded?: boolean; // For header search vs full page
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  embedded = false,
  placeholder = "Search assets, proposals, documents...",
  onResultClick
}) => {
  const navigate = useNavigate();
  const {
    currentQuery,
    results,
    suggestions,
    isSearching,
    hasSearched,
    totalResults,
    searchHistory,
    popularSearches,
    activeFilters,
    sortBy,
    sortOrder,
    preferences,
    setQuery,
    search,
    clearSearch,
    getSuggestions,
    clearSuggestions,
    setFilters,
    clearFilters,
    setSorting
  } = useSearchStore();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle input changes with debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery && preferences.showSuggestions) {
        getSuggestions(localQuery);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, preferences.showSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query?: string) => {
    const rawQuery = query || localQuery;
    if (!rawQuery.trim()) return;

    // Security: Sanitize search query
    const sanitizedQuery = sanitizeSearchQuery(rawQuery);
    if (!sanitizedQuery) {
      console.warn('🔒 Search blocked: Invalid query');
      return;
    }

    // Security: Rate limiting for search
    const userId = 'user_' + (Math.random().toString(36).substr(2, 9)); // In real app, use actual user ID
    const rateLimitCheck = searchLimiter.checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      console.warn('🔒 Search blocked: Rate limit exceeded');
      alert('Too many search requests. Please wait a moment before searching again.');
      return;
    }

    setQuery(sanitizedQuery);
    setShowSuggestions(false);
    
    await search(sanitizedQuery);

    // If embedded, navigate to full search page
    if (embedded && !onResultClick) {
      navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Security: Basic input sanitization (allow reasonable search characters)
    const sanitizedValue = rawValue
      .replace(/[<>'"]/g, '') // Remove dangerous HTML characters
      .slice(0, 100); // Limit length
    
    setLocalQuery(sanitizedValue);
    
    if (!sanitizedValue.trim()) {
      clearSearch();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setLocalQuery(suggestionText);
    handleSearch(suggestionText);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      navigate(result.url);
    }
  };

  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case 'asset_proposal': return <Building className="w-4 h-4 text-blue-600" />;
      case 'governance_proposal': return <Vote className="w-4 h-4 text-green-600" />;
      case 'user_profile': return <User className="w-4 h-4 text-purple-600" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-600" />;
      case 'transaction': return <DollarSign className="w-4 h-4 text-yellow-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'asset_proposal': return 'Asset Proposal';
      case 'governance_proposal': return 'Voting';
      case 'user_profile': return 'User';
      case 'document': return 'Document';
      case 'transaction': return 'Transaction';
      default: return 'Content';
    }
  };

  const resultTypeFilters: { type: SearchResultType; label: string; count?: number }[] = [
    { type: 'asset_proposal', label: 'Assets', count: results.filter(r => r.type === 'asset_proposal').length },
    { type: 'governance_proposal', label: 'Voting', count: results.filter(r => r.type === 'governance_proposal').length },
    { type: 'document', label: 'Documents', count: results.filter(r => r.type === 'document').length },
    { type: 'user_profile', label: 'Users', count: results.filter(r => r.type === 'user_profile').length }
  ];

  return (
    <div className={`relative ${embedded ? 'w-full max-w-md' : 'w-full'}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              embedded ? 'text-sm' : 'text-base py-3'
            }`}
          />
          
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery('');
                clearSearch();
                setShowSuggestions(false);
              }}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {preferences.enableAIEnhancement && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || popularSearches.length > 0) && (
          <div
            ref={suggestionRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Suggestions</span>
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center justify-between"
                  >
                    <span>{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.count} results
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Recent</span>
                </div>
                {searchHistory.slice(0, 3).map((historyItem) => (
                  <button
                    key={historyItem.id}
                    onClick={() => handleSuggestionClick(historyItem.query)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center justify-between"
                  >
                    <span>{historyItem.query}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {historyItem.resultCount} results
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && !localQuery && (
              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>Popular</span>
                </div>
                {popularSearches.slice(0, 3).map((popular, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(popular)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    {popular}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results (only for full interface) */}
      {!embedded && hasSearched && (
        <div className="mt-6">
          {/* Search Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isSearching ? 'Searching...' : `${totalResults} results for "${currentQuery}"`}
              </h2>
              
              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                {resultTypeFilters.map(({ type, label, count }) => (
                  count ? (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = activeFilters.types.includes(type)
                          ? activeFilters.types.filter(t => t !== type)
                          : [...activeFilters.types, type];
                        setFilters({ types: newTypes });
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        activeFilters.types.includes(type)
                          ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ) : null
                ))}
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSorting(newSortBy as any, newSortOrder as any);
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="relevance-desc">Most Relevant</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="alphabetical-asc">A to Z</option>
                <option value="alphabetical-desc">Z to A</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Searching with AI...</span>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getResultIcon(result.type)}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {getResultTypeLabel(result.type)}
                        </span>
                        {result.metadata?.status && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {result.metadata.status}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {result.highlightedContent?.title ? (
                          <span dangerouslySetInnerHTML={{ __html: result.highlightedContent.title }} />
                        ) : (
                          result.title
                        )}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {result.highlightedContent?.description ? (
                          <span dangerouslySetInnerHTML={{ __html: result.highlightedContent.description }} />
                        ) : (
                          result.description
                        )}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                        {result.timestamp && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimeAgo(result.timestamp)}</span>
                          </span>
                        )}
                        
                        {result.metadata?.amount && (
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{result.metadata.amount}</span>
                          </span>
                        )}
                        
                        {result.metadata?.createdBy && (
                          <span>by {result.metadata.createdBy}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {Math.round(result.relevanceScore * 100)}% match
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && results.length === 0 && hasSearched && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or removing filters
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;