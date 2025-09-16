import React, { useEffect, useState, lazy, Suspense, memo, useCallback, useMemo, useRef } from 'react';
import { 
  Search, 
  Lightbulb, 
  Play, 
  TrendingUp, 
  BookOpen, 
  Filter,
  Grid,
  List,
  Star,
  Home,
  Target,
  Package,
  Zap,
  MapPin
} from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import { externalSearchService, ExternalSearchResult } from '../../services/externalSearch';
import Card from '../UI/Card';
import Button from '../UI/Button';
import SearchInput from '../UI/SearchInput';
import LoadingSpinner from '../UI/LoadingSpinner';
import GuidedSearchQuestions, { GuidedAnswer } from './GuidedSearchQuestions';
import { GuidedSearchEnhancer } from '../../utils/guidedSearchEnhancer';
// Temporarily remove problematic hooks
// import { useOptimizedSearch } from '../../hooks/useOptimizedSearch';
// import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';

// Lazy load tab components for better performance
const IdeaGenerator = lazy(() => import('./IdeaGenerator'));
const VideoLibrary = lazy(() => import('./VideoLibrary'));
const MarketInsights = lazy(() => import('./MarketInsights'));
const DocumentationHub = lazy(() => import('./DocumentationHub'));

const DiscoveryHub: React.FC = memo(() => {
  const {
    activeTab,
    setActiveTab,
    searchFilters,
    setSearchFilters,
    loading,
    initialize,
    videos,
    marketInsights,
    documentation,
    guidedSearch,
    startGuidedSearch,
    updateGuidedSearchAnswers,
    completeGuidedSearch,
    cancelGuidedSearch
  } = useDiscoveryStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [externalResults, setExternalResults] = useState<ExternalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'internal' | 'external'>('external'); // Default to external
  const [includeExternalSources, setIncludeExternalSources] = useState(true);
  const [showGuidedSearchSuggestion, setShowGuidedSearchSuggestion] = useState(false);
  
  // Refs for guided search timing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lowResultsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple search implementation
  const searchableContent = useMemo(() => [
    ...videos.map(v => ({ ...v, type: 'video' })),
    ...marketInsights.map(m => ({ ...m, type: 'insight' })),
    ...documentation.map(d => ({ ...d, type: 'documentation' }))
  ], [videos, marketInsights, documentation]);

  // Enhanced search function with external API integration
  const performSearch = useCallback(async (query: string) => {
    // Clear any existing timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (lowResultsTimeoutRef.current) {
      clearTimeout(lowResultsTimeoutRef.current);
    }

    if (!query || query.length < 2) {
      setSearchResults([]);
      setExternalResults([]);
      setIsSearching(false);
      setShowGuidedSearchSuggestion(false);
      return;
    }

    setIsSearching(true);
    setShowGuidedSearchSuggestion(false);
    
    try {
      if (searchMode === 'external' && includeExternalSources) {
        // External search using API - this searches real market opportunities
        const selectedCategory = searchFilters.category.length > 0 ? searchFilters.category[0] : 'general';
        
        const externalSearchResults = await externalSearchService.search({
          category: selectedCategory,
          query: query,
          additionalFilters: {
            searchMode: 'discovery'
          }
        });

        setExternalResults(externalSearchResults);
        setSearchResults([]); // Clear internal results
        setIsSearching(false);

        // Show guided search suggestion for low results
        const hasLowResults = externalSearchResults.length < 3;
        if (externalSearchResults.length === 0) {
          setShowGuidedSearchSuggestion(true);
        } else if (hasLowResults && searchFilters.category.length > 0) {
          lowResultsTimeoutRef.current = setTimeout(() => {
            setShowGuidedSearchSuggestion(true);
          }, 3000);
        }
      } else {
        // Internal search (original functionality - educational content)
        const queryLower = query.toLowerCase();
        
        const results = searchableContent
          .map(item => {
            const titleMatch = item.title?.toLowerCase().includes(queryLower);
            const descMatch = item.description?.toLowerCase().includes(queryLower);
            const categoryMatch = item.category?.toLowerCase().includes(queryLower);
            
            if (titleMatch || descMatch || categoryMatch) {
              return {
                item,
                score: titleMatch ? 0.9 : descMatch ? 0.7 : 0.5,
                matches: []
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => b!.score - a!.score)
          .slice(0, 20);

        setTimeout(() => {
          setSearchResults(results as any);
          setExternalResults([]); // Clear external results
          setIsSearching(false);

          // Show guided search suggestion for low results
          const hasSelectedCategory = searchFilters.category.length > 0;
          const hasLowResults = results.length < 3;
          
          if (hasSelectedCategory && (hasLowResults || results.length === 0)) {
            if (results.length === 0) {
              setShowGuidedSearchSuggestion(true);
            } else {
              lowResultsTimeoutRef.current = setTimeout(() => {
                setShowGuidedSearchSuggestion(true);
              }, 3000);
            }
          }
        }, 300);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
      setShowGuidedSearchSuggestion(true);
    }
  }, [searchableContent, searchFilters.category, searchMode, includeExternalSources]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setExternalResults([]);
    setShowGuidedSearchSuggestion(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (lowResultsTimeoutRef.current) {
      clearTimeout(lowResultsTimeoutRef.current);
    }
  }, []);

  // Guided search handlers
  const handleStartGuidedSearch = useCallback(() => {
    const selectedCategory = searchFilters.category[0] || 'general';
    startGuidedSearch(selectedCategory, searchQuery);
    setShowGuidedSearchSuggestion(false);
  }, [searchFilters.category, searchQuery, startGuidedSearch]);

  const handleGuidedSearchAnswersChange = useCallback((answers: GuidedAnswer[]) => {
    updateGuidedSearchAnswers(answers);
    
    // Apply real-time search result enhancements based on guided answers
    if (answers.length > 0) {
      const enhancedResults = GuidedSearchEnhancer.generateMockEnhancedResults(
        searchResults,
        answers,
        guidedSearch.category
      );
      setSearchResults(enhancedResults);
    }
  }, [updateGuidedSearchAnswers, searchResults, guidedSearch.category]);

  const handleGuidedSearchComplete = useCallback(async () => {
    // Get guided answers for external search
    const guidedAnswers = guidedSearch.answers || [];

    if (searchMode === 'external' && includeExternalSources && guidedAnswers.length > 0) {
      setIsSearching(true);
      
      // Extract location from guided answers
      const locationAnswer = guidedAnswers.find(a => a.questionId === 'specific_location');
      const location = locationAnswer && typeof locationAnswer.value === 'string' && locationAnswer.value.trim() 
        ? locationAnswer.value.trim() 
        : undefined;
      
      // Extract budget from guided answers
      const budgetAnswer = guidedAnswers.find(a => a.questionId === 'investment_amount');
      const budgetRange = budgetAnswer && typeof budgetAnswer.value === 'number'
        ? { min: Math.max(budgetAnswer.value * 0.8, 10000), max: budgetAnswer.value * 1.2 }
        : undefined;
      
      try {
        const externalSearchResults = await externalSearchService.search({
          category: guidedSearch.category,
          query: guidedSearch.originalQuery,
          location: location,
          budgetRange: budgetRange,
          guidedAnswers: guidedAnswers,
          additionalFilters: {
            searchMode: 'guided_discovery'
          }
        });

        setExternalResults(externalSearchResults);
        setSearchResults([]);
        setIsSearching(false);
        
      } catch (error) {
        console.error('Guided external search failed:', error);
        setIsSearching(false);
      }
    }
    
    completeGuidedSearch();
  }, [completeGuidedSearch, guidedSearch, searchMode, includeExternalSources]);

  const handleGuidedSearchCancel = useCallback(() => {
    cancelGuidedSearch();
    setShowGuidedSearchSuggestion(false);
  }, [cancelGuidedSearch]);

  const highlightMatches = useCallback((text: string, matches: any[] = []): string => {
    return text; // Simple implementation without highlighting for now
  }, []);

  const stats = {
    totalResults: searchMode === 'external' ? externalResults.length : searchResults.length,
    cacheSize: 0,
    hasQuery: searchQuery.length >= 2,
    searchMode: searchMode
  };

  // Initialize data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (lowResultsTimeoutRef.current) {
        clearTimeout(lowResultsTimeoutRef.current);
      }
    };
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tabId: typeof activeTab) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((category: string) => {
    if (category === 'All') {
      setSearchFilters({ category: [] });
    } else {
      setSearchFilters({
        category: searchFilters.category.includes(category.toLowerCase())
          ? searchFilters.category.filter(c => c !== category.toLowerCase())
          : [...searchFilters.category, category.toLowerCase()]
      });
    }
  }, [searchFilters.category, setSearchFilters]);

  // Memoize tabs to prevent re-renders
  const tabs = useMemo(() => [
    { id: 'search' as const, label: 'Smart Search', icon: Search },
    { id: 'videos' as const, label: 'Creator Videos', icon: Play },
    { id: 'ideas' as const, label: 'Idea Generator', icon: Lightbulb },
    { id: 'insights' as const, label: 'Market Insights', icon: TrendingUp },
    { id: 'docs' as const, label: 'Documentation', icon: BookOpen }
  ], []);

  const renderTabContent = useCallback(() => {
    const TabLoadingSpinner = () => (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );

    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-6">
            {/* Search Interface */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <SearchInput
                    placeholder={searchMode === 'external' ? 
                      'Search investments: "VRBO properties", "Solar projects", "Business acquisitions"...' :
                      'Search ideas, trends, markets, guides...'
                    }
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Button
                    size="small"
                    variant={searchMode === 'external' ? 'secondary' : 'ghost'}
                    onClick={() => setSearchMode('external')}
                    className="rounded-r-none"
                    title="Search real market opportunities"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="ml-1 text-xs">Market</span>
                  </Button>
                  <Button
                    size="small"
                    variant={searchMode === 'internal' ? 'secondary' : 'ghost'}
                    onClick={() => setSearchMode('internal')}
                    className="rounded-l-none"
                    title="Search educational content"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="ml-1 text-xs">Education</span>
                  </Button>
                </div>
                <Button variant="outline" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Button
                    size="small"
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    onClick={() => handleViewModeChange('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="small"
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    onClick={() => handleViewModeChange('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* External Sources Toggle */}
              <div className="flex items-center space-x-3 mb-4">
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeExternalSources}
                    onChange={(e) => {
                      setIncludeExternalSources(e.target.checked);
                      setSearchMode(e.target.checked ? 'external' : 'internal');
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include external sources (Serper, RealtyMole, Zillow)</span>
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Search real market opportunities vs educational content only
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
                {['All', 'Real Estate', 'Technology', 'Commodities', 'Collectibles', 'Energy'].map((category) => (
                  <Button
                    key={category}
                    size="small"
                    variant={searchFilters.category.includes(category.toLowerCase()) || category === 'All' ? 'secondary' : 'outline'}
                    onClick={() => handleFilterChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Search Stats */}
              {stats.hasQuery && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Found {stats.totalResults} {searchMode === 'external' ? 'investment opportunities' : 'educational resources'}
                  {searchMode === 'external' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      Real Market Data
                    </span>
                  )}
                  {isSearching && <span className="ml-2">• Searching...</span>}
                </div>
              )}
            </Card>

            {/* Guided Search Questions */}
            {guidedSearch.isActive && (
              <GuidedSearchQuestions
                category={guidedSearch.category}
                searchQuery={guidedSearch.originalQuery}
                onAnswersChange={handleGuidedSearchAnswersChange}
                onComplete={handleGuidedSearchComplete}
                onStartOver={handleGuidedSearchCancel}
                className="mb-6"
              />
            )}

            {/* Guided Search Suggestion */}
            {showGuidedSearchSuggestion && !guidedSearch.isActive && searchFilters.category.length > 0 && (
              <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Need help refining your search?
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Answer a few questions to find more relevant {searchFilters.category[0]} opportunities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => setShowGuidedSearchSuggestion(false)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      onClick={handleStartGuidedSearch}
                    >
                      Help Me Search
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Search Results */}
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchMode === 'external' && externalResults.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {externalResults.map((result, index) => (
                  <Card key={`external-${result.id}-${index}`} className="p-6 hover:shadow-lg transition-shadow">
                    {/* External Result Card */}
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        {result.type === 'real_estate' && <Home className="w-6 h-6 text-white" />}
                        {result.type === 'stock' && <TrendingUp className="w-6 h-6 text-white" />}
                        {result.type === 'business' && <Target className="w-6 h-6 text-white" />}
                        {result.type === 'commodity' && <Package className="w-6 h-6 text-white" />}
                        {result.type === 'energy' && <Zap className="w-6 h-6 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {result.title}
                          </h3>
                          {result.proposalReady && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              Proposal Ready
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {result.investmentType}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.riskLevel === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            result.riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {result.riskLevel} risk
                          </span>
                        </div>
                        {result.location && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {result.location.city}, {result.location.state}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {result.description}
                    </p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {result.keyMetrics.slice(0, 4).map((metric, metricIndex) => (
                        <div key={metricIndex} className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{metric.label}:</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {typeof metric.value === 'number' && metric.unit === '%' 
                              ? `${metric.value}%`
                              : `${metric.value}${metric.unit || ''}`
                            }
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Info */}
                    {result.price && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Investment Required</span>
                          <div className="font-bold text-lg text-gray-900 dark:text-white">
                            ${result.estimatedFundingRequired?.toLocaleString() || 'TBD'}
                          </div>
                        </div>
                        {result.estimatedROI && (
                          <div className="text-right">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Est. ROI</span>
                            <div className="font-bold text-lg text-green-600">
                              {result.estimatedROI}%
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="small">
                        View Details
                      </Button>
                      {result.proposalReady && (
                        <Button variant="outline" size="small">
                          Start Proposal
                        </Button>
                      )}
                    </div>

                    {/* Source & Freshness */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Source: {result.source}</span>
                      <span>{result.dataFreshness}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchMode === 'internal' && searchResults.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {searchResults.map((result, index) => (
                  <Card key={`${result.item.id}-${index}`} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        {result.item.type === 'video' && <Play className="w-5 h-5 text-blue-600" />}
                        {result.item.type === 'insight' && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {result.item.type === 'documentation' && <BookOpen className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-gray-900 dark:text-white mb-1"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatches(result.item.title, result.matches) 
                          }}
                        />
                        <p 
                          className="text-sm text-gray-600 dark:text-gray-300 mb-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatches(result.item.description, result.matches) 
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                              {result.item.type}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {Math.round((result.enhancedScore || result.score) * 100)}% match
                            </span>
                            {result.enhancedScore && result.enhancedScore > result.score && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                Enhanced
                              </span>
                            )}
                          </div>
                          {result.item.duration && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.item.duration}
                            </span>
                          )}
                        </div>
                        {result.relevanceReason && result.relevanceReason.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.relevanceReason.slice(0, 2).map((reason, idx) => (
                              <span 
                                key={idx}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                            {result.relevanceReason.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{result.relevanceReason.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchMode === 'external' ? 'No investment opportunities found' : 'No results found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchMode === 'external' ? 
                    'Try different search terms, select a category, or use guided search for better results' :
                    'Try adjusting your search terms or filters'
                  }
                </p>
                {searchMode === 'external' && searchFilters.category.length > 0 && (
                  <div className="mb-4">
                    <Button 
                      size="small"
                      variant="primary"
                      onClick={handleStartGuidedSearch}
                      className="mr-2"
                    >
                      Get Guided Search Help
                    </Button>
                    <Button 
                      size="small"
                      variant="outline"
                      onClick={() => setSearchMode('internal')}
                    >
                      Search Educational Content
                    </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={clearSearch}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                {searchMode === 'external' ? (
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                ) : (
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchMode === 'external' ? 
                    'Discover Real Investment Opportunities' : 
                    'Start your discovery journey'
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchMode === 'external' ? 
                    'Search for real estate, businesses, stocks, commodities, and energy investments from live market data' :
                    'Search for educational content, market insights, and learning resources'
                  }
                </p>
                {searchMode === 'external' && (
                  <div className="max-w-md mx-auto">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <strong>Try searching:</strong> "VRBO Austin", "Solar projects", "Tech stocks", "Business acquisition"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'videos':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <VideoLibrary />
          </Suspense>
        );
      
      case 'ideas':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <IdeaGenerator />
          </Suspense>
        );
      
      case 'insights':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <MarketInsights />
          </Suspense>
        );
      
      case 'docs':
        return (
          <Suspense fallback={<TabLoadingSpinner />}>
            <DocumentationHub />
          </Suspense>
        );
      
      default:
        return null;
    }
  }, [
    activeTab,
    searchQuery,
    searchResults,
    isSearching,
    viewMode,
    searchFilters,
    stats,
    highlightMatches,
    clearSearch,
    handleViewModeChange,
    handleFilterChange,
    guidedSearch,
    showGuidedSearchSuggestion,
    handleStartGuidedSearch,
    handleGuidedSearchAnswersChange,
    handleGuidedSearchComplete,
    handleGuidedSearchCancel
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Discovery Hub
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Your gateway to inspiration, education, and market intelligence. 
          Discover opportunities, learn from experts, and turn ideas into successful assets.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
});

// Add display name for debugging
DiscoveryHub.displayName = 'DiscoveryHub';

export default DiscoveryHub;