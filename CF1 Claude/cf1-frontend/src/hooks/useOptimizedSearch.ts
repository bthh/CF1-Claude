/**
 * Optimized Search Hook with Debouncing, Caching, and Performance Monitoring
 * Provides high-performance search functionality for large datasets
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePerformanceMonitoring } from './usePerformanceTracker';

export interface SearchResult<T = any> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
}

export interface SearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  caseSensitive?: boolean;
  fuzzyThreshold?: number;
  searchFields?: string[];
  cacheSize?: number;
  enableCache?: boolean;
  enableFuzzySearch?: boolean;
  enableHighlighting?: boolean;
}

export interface UseOptimizedSearchProps<T> {
  data: T[];
  searchFn?: (query: string, data: T[], options: SearchOptions) => SearchResult<T>[];
  options?: SearchOptions;
}

const DEFAULT_OPTIONS: SearchOptions = {
  debounceMs: 300,
  minQueryLength: 1,
  maxResults: 100,
  caseSensitive: false,
  fuzzyThreshold: 0.6,
  searchFields: [],
  cacheSize: 50,
  enableCache: true,
  enableFuzzySearch: true,
  enableHighlighting: true
};

// Simple fuzzy search implementation
const fuzzyScore = (needle: string, haystack: string, threshold: number = 0.6): number => {
  if (needle === haystack) return 1;
  if (needle.length === 0) return 0;
  if (haystack.length === 0) return 0;

  const needleLower = needle.toLowerCase();
  const haystackLower = haystack.toLowerCase();

  // Exact match bonus
  if (haystackLower.includes(needleLower)) {
    return 0.9;
  }

  // Character matching score
  let matches = 0;
  let needleIndex = 0;
  
  for (let i = 0; i < haystackLower.length && needleIndex < needleLower.length; i++) {
    if (haystackLower[i] === needleLower[needleIndex]) {
      matches++;
      needleIndex++;
    }
  }

  const score = matches / needle.length;
  return score >= threshold ? score : 0;
};

// Default search function with fuzzy matching
const defaultSearchFn = <T>(
  query: string, 
  data: T[], 
  options: SearchOptions
): SearchResult<T>[] => {
  const {
    caseSensitive = false,
    fuzzyThreshold = 0.6,
    searchFields = [],
    maxResults = 100,
    enableFuzzySearch = true,
    enableHighlighting = true
  } = options;

  const processedQuery = caseSensitive ? query : query.toLowerCase();
  const results: SearchResult<T>[] = [];

  for (const item of data) {
    let bestScore = 0;
    const matches: SearchMatch[] = [];

    // Get searchable fields
    const fieldsToSearch = searchFields.length > 0 
      ? searchFields 
      : Object.keys(item as any).filter(key => 
          typeof (item as any)[key] === 'string'
        );

    // Search each field
    for (const field of fieldsToSearch) {
      const fieldValue = (item as any)[field];
      if (typeof fieldValue !== 'string') continue;

      const processedValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
      let score = 0;

      // Exact match check
      if (processedValue.includes(processedQuery)) {
        score = 0.9;
        
        if (enableHighlighting) {
          const startIndex = processedValue.indexOf(processedQuery);
          matches.push({
            field,
            value: fieldValue,
            indices: [[startIndex, startIndex + query.length]]
          });
        }
      } 
      // Fuzzy match check
      else if (enableFuzzySearch) {
        score = fuzzyScore(processedQuery, processedValue, fuzzyThreshold);
        
        if (score > 0 && enableHighlighting) {
          // Simple highlighting for fuzzy matches
          matches.push({
            field,
            value: fieldValue,
            indices: [[0, fieldValue.length]]
          });
        }
      }

      bestScore = Math.max(bestScore, score);
    }

    if (bestScore > 0) {
      results.push({
        item,
        score: bestScore,
        matches
      });
    }

    // Early termination for performance
    if (results.length >= maxResults * 2) {
      break;
    }
  }

  // Sort by score and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

// LRU Cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const useOptimizedSearch = <T>({
  data,
  searchFn = defaultSearchFn,
  options = {}
}: UseOptimizedSearchProps<T>) => {
  // Memoize merged options to prevent unnecessary re-renders
  const mergedOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const {
    debounceMs,
    minQueryLength,
    enableCache,
    cacheSize
  } = mergedOptions;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Performance monitoring - use refs to avoid dependency issues
  const performanceTracker = usePerformanceMonitoring('OptimizedSearch');
  const trackCustomInteractionRef = useRef(performanceTracker.trackCustomInteraction);
  
  // Update ref when tracker changes but don't trigger re-renders
  useEffect(() => {
    trackCustomInteractionRef.current = performanceTracker.trackCustomInteraction;
  }, [performanceTracker.trackCustomInteraction]);

  // Cache and refs
  const cache = useRef(new LRUCache<string, SearchResult<T>[]>(cacheSize || 50));
  const debounceTimer = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Memoize search function to prevent unnecessary re-creation
  const memoizedSearchFn = useMemo(() => searchFn, [searchFn]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    console.log('useOptimizedSearch: performSearch function created/called', { searchQuery });
    if (!searchQuery || searchQuery.length < (minQueryLength || 1)) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Check cache first
    if (enableCache) {
      const cachedResults = cache.current.get(searchQuery);
      if (cachedResults) {
        setResults(cachedResults);
        setIsSearching(false);
        trackCustomInteractionRef.current?.('search_cache_hit', 0);
        return;
      }
    }

    // Abort previous search
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Perform search in chunks for large datasets
      const chunkSize = 1000;
      let allResults: SearchResult<T>[] = [];

      if (data.length > chunkSize) {
        // Process in chunks to avoid blocking UI
        for (let i = 0; i < data.length; i += chunkSize) {
          if (abortController.current.signal.aborted) {
            throw new Error('Search aborted');
          }

          const chunk = data.slice(i, i + chunkSize);
          const chunkResults = memoizedSearchFn(searchQuery, chunk, mergedOptions);
          allResults = [...allResults, ...chunkResults];

          // Yield control back to the browser
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Sort and limit final results
        allResults = allResults
          .sort((a, b) => b.score - a.score)
          .slice(0, mergedOptions.maxResults || 100);
      } else {
        allResults = memoizedSearchFn(searchQuery, data, mergedOptions);
      }

      if (!abortController.current.signal.aborted) {
        setResults(allResults);
        
        // Cache results
        if (enableCache) {
          cache.current.set(searchQuery, allResults);
        }

        const duration = performance.now() - startTime;
        trackCustomInteractionRef.current?.('search_completed', duration);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Search aborted') {
        setError(err.message);
        console.error('Search error:', err);
      }
    } finally {
      setIsSearching(false);
    }
  }, [
    data, 
    memoizedSearchFn, 
    mergedOptions, 
    minQueryLength, 
    enableCache
  ]); // Removed trackCustomInteraction to prevent infinite re-renders

  // Debounced search effect
  useEffect(() => {
    console.log('useOptimizedSearch: debounce effect triggered', { query, debounceMs });
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        performSearch(query.trim());
      }, debounceMs);
    } else {
      setResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, performSearch, debounceMs]);

  // Clear cache when data changes
  useEffect(() => {
    cache.current.clear();
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Search statistics
  const stats = useMemo(() => ({
    totalResults: results.length,
    cacheSize: cache.current.size(),
    isSearching,
    hasError: !!error,
    hasQuery: query.length >= (minQueryLength || 1)
  }), [results.length, isSearching, error, query.length, minQueryLength]);

  // Highlight matches in text
  const highlightMatches = useCallback((text: string, matches: SearchMatch[] = []): string => {
    if (!mergedOptions.enableHighlighting || matches.length === 0) {
      return text;
    }

    let highlightedText = text;
    const highlights: Array<{ start: number; end: number }> = [];

    // Collect all highlight ranges
    matches.forEach(match => {
      match.indices.forEach(([start, end]) => {
        highlights.push({ start, end });
      });
    });

    // Sort by start position (descending to avoid index shifts)
    highlights.sort((a, b) => b.start - a.start);

    // Apply highlights
    highlights.forEach(({ start, end }) => {
      const before = highlightedText.substring(0, start);
      const highlighted = highlightedText.substring(start, end);
      const after = highlightedText.substring(end);
      highlightedText = `${before}<mark class="bg-yellow-200 dark:bg-yellow-700">${highlighted}</mark>${after}`;
    });

    return highlightedText;
  }, [mergedOptions.enableHighlighting]);

  return {
    // State
    query,
    results,
    isSearching,
    error,
    stats,

    // Actions
    setQuery,
    clearSearch,
    performSearch: (q: string) => performSearch(q),
    
    // Utilities
    highlightMatches,
    
    // Cache management
    clearCache: () => cache.current.clear(),
    getCacheStats: () => ({
      size: cache.current.size(),
      maxSize: cacheSize || 50
    })
  };
};

export default useOptimizedSearch;