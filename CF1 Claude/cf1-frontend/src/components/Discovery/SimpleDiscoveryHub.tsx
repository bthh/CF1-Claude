import React, { useEffect, useState, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { 
  Search, 
  Lightbulb, 
  Play, 
  TrendingUp, 
  BookOpen, 
  Filter,
  Grid,
  List
} from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import SearchInput from '../UI/SearchInput';
import LoadingSpinner from '../UI/LoadingSpinner';

// Lazy load tab components for better performance
const IdeaGenerator = lazy(() => import('./IdeaGenerator'));
const VideoLibrary = lazy(() => import('./VideoLibrary'));
const DocumentationHub = lazy(() => import('./DocumentationHub'));

const SimpleDiscoveryHub: React.FC = memo(() => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simple search implementation
  const searchableContent = useMemo(() => [
    ...videos.map(v => ({ ...v, type: 'video' })),
    ...marketInsights.map(m => ({ ...m, type: 'insight' })),
    ...documentation.map(d => ({ ...d, type: 'documentation' }))
  ], [videos, marketInsights, documentation]);

  // Simple search function
  const performSearch = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
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
      setIsSearching(false);
    }, 300);
  }, [searchableContent]);

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
  }, []);

  const stats = {
    totalResults: searchResults.length,
    cacheSize: 0,
    hasQuery: searchQuery.length >= 2
  };

  // Initialize data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

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
                <CF1Button variant="outline" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </CF1Button>
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <CF1Button
                    size="small"
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    onClick={() => handleViewModeChange('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </CF1Button>
                  <CF1Button
                    size="small"
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    onClick={() => handleViewModeChange('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </CF1Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
                {['All', 'Real Estate', 'Technology', 'Commodities', 'Collectibles', 'Energy'].map((category) => (
                  <CF1Button
                    key={category}
                    size="small"
                    variant={searchFilters.category.includes(category.toLowerCase()) || category === 'All' ? 'secondary' : 'outline'}
                    onClick={() => handleFilterChange(category)}
                  >
                    {category}
                  </CF1Button>
                ))}
              </div>

              {/* Search Stats */}
              {stats.hasQuery && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Found {stats.totalResults} results
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
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {result.item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {result.item.description}
                        </p>
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
                <CF1Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={clearSearch}
                >
                  Clear Search
                </CF1Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Market Insights Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Trending Market Insights
                      </h2>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Live market intelligence
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {marketInsights.map((insight) => (
                      <Card key={insight.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              insight.trend === 'up' ? 'bg-green-500' : 
                              insight.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {insight.category}
                            </span>
                          </div>
                          <div className={`flex items-center space-x-1 text-sm font-medium ${
                            insight.trend === 'up' ? 'text-green-600' : 
                            insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <TrendingUp className={`w-4 h-4 ${
                              insight.trend === 'down' ? 'transform rotate-180' : ''
                            }`} />
                            <span>{insight.changePercent.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                          {insight.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {insight.summary}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{insight.source}</span>
                          <span>{insight.timestamp}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CF1Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => handleTabChange('ideas')}
                    >
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                      <span className="font-medium">Generate Ideas</span>
                      <span className="text-xs text-gray-500">AI-powered inspiration</span>
                    </CF1Button>
                    
                    <CF1Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      onClick={() => handleTabChange('videos')}
                    >
                      <Play className="w-6 h-6 text-purple-600" />
                      <span className="font-medium">Watch Videos</span>
                      <span className="text-xs text-gray-500">Learn from experts</span>
                    </CF1Button>
                    
                    <CF1Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      onClick={() => handleTabChange('docs')}
                    >
                      <BookOpen className="w-6 h-6 text-green-600" />
                      <span className="font-medium">Browse Docs</span>
                      <span className="text-xs text-gray-500">Templates & guides</span>
                    </CF1Button>
                    
                    <CF1Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                      onClick={() => setSearchQuery('real estate')}
                    >
                      <Search className="w-6 h-6 text-orange-600" />
                      <span className="font-medium">Search Assets</span>
                      <span className="text-xs text-gray-500">Find opportunities</span>
                    </CF1Button>
                  </div>
                </div>

                {/* Popular Searches */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Popular Searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Real Estate Investment',
                      'AI Technology',
                      'Renewable Energy',
                      'Startup Funding',
                      'Market Analysis',
                      'Portfolio Diversification',
                      'Risk Assessment',
                      'Due Diligence'
                    ].map((searchTerm) => (
                      <CF1Button
                        key={searchTerm}
                        size="small"
                        variant="outline"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => setSearchQuery(searchTerm)}
                      >
                        {searchTerm}
                      </CF1Button>
                    ))}
                  </div>
                </div>
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
SimpleDiscoveryHub.displayName = 'SimpleDiscoveryHub';

export default SimpleDiscoveryHub;