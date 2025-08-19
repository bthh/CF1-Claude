import React, { useEffect, useState, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { 
  Search, 
  Lightbulb, 
  Play, 
  TrendingUp, 
  BookOpen, 
  Filter,
  Grid,
  List,
  Star
} from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Card from '../UI/Card';
import Button from '../UI/Button';
import SearchInput from '../UI/SearchInput';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useOptimizedSearch } from '../../hooks/useOptimizedSearch';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';

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
    documentation
  } = useDiscoveryStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Performance monitoring - memoize to prevent infinite re-renders
  const performanceTracker = usePerformanceMonitoring('DiscoveryHub');
  const trackCustomInteraction = useMemo(
    () => performanceTracker.trackCustomInteraction || (() => {}),
    [performanceTracker.trackCustomInteraction]
  );

  // Combine all searchable content
  const searchableContent = useMemo(() => [
    ...videos.map(v => ({ ...v, type: 'video' })),
    ...marketInsights.map(m => ({ ...m, type: 'insight' })),
    ...documentation.map(d => ({ ...d, type: 'documentation' }))
  ], [videos, marketInsights, documentation]);

  // Memoize search options to prevent infinite re-renders
  const searchOptions = useMemo(() => ({
    debounceMs: 300,
    minQueryLength: 2,
    maxResults: 50,
    searchFields: ['title', 'description', 'category', 'tags'],
    enableCache: true,
    enableFuzzySearch: true,
    enableHighlighting: true,
    cacheSize: 100
  }), []);

  // Use optimized search with caching and debouncing
  const {
    query: searchQuery,
    results: searchResults,
    isSearching,
    setQuery: setSearchQuery,
    clearSearch,
    stats,
    highlightMatches
  } = useOptimizedSearch({
    data: searchableContent,
    options: searchOptions
  });

  // Initialize data on mount
  useEffect(() => {
    const startTime = performance.now();
    initialize().then(() => {
      const duration = performance.now() - startTime;
      trackCustomInteraction?.('data_initialized', duration);
    });
  }, [initialize, trackCustomInteraction]);

  // Handle tab change with performance tracking
  const handleTabChange = useCallback((tabId: typeof activeTab) => {
    trackCustomInteraction?.('tab_changed', 0);
    setActiveTab(tabId);
  }, [setActiveTab, trackCustomInteraction]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    trackCustomInteraction?.('view_mode_changed', 0);
    setViewMode(mode);
  }, [trackCustomInteraction]);

  // Handle filter changes
  const handleFilterChange = useCallback((category: string) => {
    trackCustomInteraction?.('filter_changed', 0);
    
    if (category === 'All') {
      setSearchFilters({ category: [] });
    } else {
      setSearchFilters({
        category: searchFilters.category.includes(category.toLowerCase())
          ? searchFilters.category.filter(c => c !== category.toLowerCase())
          : [...searchFilters.category, category.toLowerCase()]
      });
    }
  }, [searchFilters.category, setSearchFilters, trackCustomInteraction]);

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
                    placeholder="Search ideas, trends, markets, guides..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => handleViewModeChange('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => handleViewModeChange('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
                {['All', 'Real Estate', 'Technology', 'Commodities', 'Collectibles', 'Energy'].map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={searchFilters.category.includes(category.toLowerCase()) || category === 'All' ? 'default' : 'outline'}
                    onClick={() => handleFilterChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Search Stats */}
              {stats.hasQuery && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Found {stats.totalResults} results • Cache: {stats.cacheSize} items
                  {isSearching && <span className="ml-2">• Searching...</span>}
                </div>
              )}
            </Card>

            {/* Search Results */}
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchResults.length > 0 ? (
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
                              {Math.round(result.score * 100)}% match
                            </span>
                          </div>
                          {result.item.duration && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.item.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search terms or filters
                </p>
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
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start your discovery journey
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Search for ideas, market insights, educational content, and more
                </p>
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
    handleFilterChange
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