import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Clock, Bookmark, Settings } from 'lucide-react';
import SearchInterface from '../components/Search/SearchInterface';
import { useSearchStore } from '../store/searchStore';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    searchHistory,
    savedSearches,
    popularSearches,
    preferences,
    getSearchAnalytics,
    search,
    setQuery
  } = useSearchStore();

  const initialQuery = searchParams.get('q') || '';

  // Perform search if query parameter is present
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      search(initialQuery);
    }
  }, [initialQuery, search, setQuery]);

  const analytics = getSearchAnalytics();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SearchIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Search CF1 Platform
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Find assets, governance proposals, documents, and more with AI-powered search
        </p>
      </div>

      {/* Main Search Interface */}
      <div className="mb-8">
        <SearchInterface />
      </div>

      {/* Search Insights and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Searches
              </h2>
            </div>

            {searchHistory.length > 0 ? (
              <div className="space-y-3">
                {searchHistory.slice(0, 10).map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <button
                        onClick={() => search(historyItem.query)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {historyItem.query}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {historyItem.resultCount} results • {new Date(historyItem.timestamp).toLocaleDateString()}
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={() => search(historyItem.query)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <SearchIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No search history yet</p>
                <p className="text-sm">Your searches will appear here</p>
              </div>
            )}
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Searches
                </h2>
              </div>

              <div className="space-y-3">
                {savedSearches.map((savedSearch) => (
                  <div
                    key={savedSearch.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <button
                        onClick={() => search(savedSearch.query)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {savedSearch.query}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Saved on {new Date(savedSearch.timestamp).toLocaleDateString()}
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={() => search(savedSearch.query)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <SearchIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Searches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Popular Searches
              </h3>
            </div>

            <div className="space-y-2">
              {popularSearches.map((popular, index) => (
                <button
                  key={index}
                  onClick={() => search(popular)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                >
                  {popular}
                </button>
              ))}
            </div>
          </div>

          {/* Search Analytics */}
          {analytics.totalSearches > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Your Search Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Searches</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.totalSearches}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Results</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(analytics.averageResultsPerSearch)}
                  </span>
                </div>

                {analytics.popularQueries.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                      Your Top Searches
                    </span>
                    <div className="space-y-1">
                      {analytics.popularQueries.slice(0, 3).map((query, index) => (
                        <div key={index} className="text-xs text-gray-700 dark:text-gray-300">
                          {index + 1}. {query}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              Search Tips
            </h3>
            
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <div>• Use quotes for exact phrases: "Manhattan office"</div>
              <div>• Try different keywords: "real estate" vs "property"</div>
              <div>• Filter by type to narrow results</div>
              <div>• Check recent and popular searches for ideas</div>
            </div>
          </div>

          {/* AI Enhancement Status */}
          {preferences.enableAIEnhancement && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                  AI Search Active
                </span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Enhanced search understanding and smart suggestions enabled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;