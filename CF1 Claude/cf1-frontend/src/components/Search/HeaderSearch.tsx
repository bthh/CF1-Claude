import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearchStore, SearchResult } from '../../store/searchStore';

interface HeaderSearchProps {
  className?: string;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    currentQuery,
    suggestions,
    isSearching,
    popularSearches,
    setQuery,
    search,
    getSuggestions,
    clearSuggestions
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle input changes with debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery && isFocused) {
        getSuggestions(localQuery);
        setShowSuggestions(true);
      } else if (!localQuery && isFocused) {
        setShowSuggestions(true); // Show popular searches when focused with empty query
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [localQuery, isFocused]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query?: string) => {
    const searchQuery = query || localQuery;
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setShowSuggestions(false);
    setIsFocused(false);
    
    // Navigate to search page with query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setLocalQuery(suggestionText);
    handleSearch(suggestionText);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!localQuery && popularSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            } else if (e.key === 'Escape') {
              setShowSuggestions(false);
              setIsFocused(false);
              searchInputRef.current?.blur();
            }
          }}
          placeholder="Search assets, proposals..."
          className="w-full pl-10 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
        />
        
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* AI Suggestions */}
          {suggestions.length > 0 && localQuery && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                Suggestions
              </div>
              {suggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center justify-between group"
                >
                  <span>{suggestion.text}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {suggestion.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.count}
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!localQuery && popularSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                Popular Searches
              </div>
              {popularSearches.slice(0, 4).map((popular, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(popular)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center justify-between group"
                >
                  <span>{popular}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* View All Results Option */}
          {localQuery && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleSearch()}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center justify-between group"
              >
                <span>Search for "{localQuery}"</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && localQuery && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
              <button
                onClick={() => handleSearch()}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;