import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchResultType = 
  | 'asset_proposal' 
  | 'governance_proposal' 
  | 'user_profile' 
  | 'document' 
  | 'transaction'
  | 'article'
  | 'help_content';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  relevanceScore: number;
  timestamp?: string;
  metadata?: {
    assetType?: string;
    category?: string;
    status?: string;
    amount?: string;
    createdBy?: string;
    tags?: string[];
    [key: string]: any;
  };
  highlightedContent?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  filters?: {
    types?: SearchResultType[];
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
    status?: string[];
    category?: string[];
  };
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'filter' | 'entity';
  category?: string;
  count?: number;
}

interface SearchState {
  // Current search state
  currentQuery: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  hasSearched: boolean;
  totalResults: number;
  
  // Search history and preferences
  searchHistory: SearchQuery[];
  savedSearches: SearchQuery[];
  popularSearches: string[];
  
  // Filters and sorting
  activeFilters: {
    types: SearchResultType[];
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
    status: string[];
    category: string[];
  };
  sortBy: 'relevance' | 'date' | 'amount' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
  
  // Search preferences
  preferences: {
    enableAIEnhancement: boolean;
    saveSearchHistory: boolean;
    showSuggestions: boolean;
    maxHistoryItems: number;
    autoComplete: boolean;
  };
  
  // Actions
  setQuery: (query: string) => void;
  search: (query: string, filters?: Partial<SearchQuery['filters']>) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: SearchQuery) => void;
  clearHistory: () => void;
  saveSearch: (query: SearchQuery) => void;
  removeSavedSearch: (queryId: string) => void;
  
  // Filter actions
  setFilters: (filters: Partial<SearchState['activeFilters']>) => void;
  addFilter: (key: keyof SearchState['activeFilters'], value: any) => void;
  removeFilter: (key: keyof SearchState['activeFilters'], value?: any) => void;
  clearFilters: () => void;
  
  // Suggestions
  getSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
  
  // Sorting
  setSorting: (sortBy: SearchState['sortBy'], sortOrder: SearchState['sortOrder']) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<SearchState['preferences']>) => void;
  
  // Analytics
  getSearchAnalytics: () => {
    totalSearches: number;
    popularQueries: string[];
    mostSearchedTypes: SearchResultType[];
    averageResultsPerSearch: number;
  };
}

// Default filters
const defaultFilters = {
  types: [] as SearchResultType[],
  status: [],
  category: []
};

// Default preferences
const defaultPreferences = {
  enableAIEnhancement: true,
  saveSearchHistory: true,
  showSuggestions: true,
  maxHistoryItems: 50,
  autoComplete: true
};

// Mock search data for development
const mockResults: SearchResult[] = [
  {
    id: 'result_1',
    type: 'asset_proposal',
    title: 'Manhattan Office Complex',
    description: 'Prime commercial real estate in Manhattan with stable tenant base and strong rental income.',
    url: '/launchpad/manhattan-office',
    relevanceScore: 0.95,
    timestamp: '2024-12-05T10:00:00Z',
    metadata: {
      assetType: 'Commercial Real Estate',
      category: 'Real Estate',
      status: 'funding',
      amount: '$2,500,000',
      createdBy: 'Real Estate Partners LLC',
      tags: ['commercial', 'manhattan', 'office', 'stable-income']
    },
    highlightedContent: {
      title: '<mark>Manhattan</mark> <mark>Office</mark> Complex',
      description: 'Prime commercial real estate in <mark>Manhattan</mark> with stable tenant base and strong rental income.'
    }
  },
  {
    id: 'result_2',
    type: 'governance_proposal',
    title: 'Q4 Dividend Distribution',
    description: 'Proposal to distribute quarterly dividends of $2.50 per token based on rental income.',
    url: '/governance/gov_proposal_1',
    relevanceScore: 0.87,
    timestamp: '2024-12-03T14:30:00Z',
    metadata: {
      assetType: 'Commercial Real Estate',
      status: 'active',
      amount: '$625,000',
      createdBy: 'Asset Manager',
      tags: ['dividend', 'distribution', 'rental-income', 'quarterly']
    }
  },
  {
    id: 'result_3',
    type: 'asset_proposal',
    title: 'Gold Bullion Vault',
    description: 'Secure precious metals storage facility with institutional-grade security and insurance.',
    url: '/launchpad/gold-vault',
    relevanceScore: 0.82,
    timestamp: '2024-11-28T09:15:00Z',
    metadata: {
      assetType: 'Precious Metals',
      category: 'Commodities',
      status: 'funded',
      amount: '$5,000,000',
      createdBy: 'Precious Metals Holdings',
      tags: ['gold', 'bullion', 'vault', 'security', 'precious-metals']
    }
  },
  {
    id: 'result_4',
    type: 'document',
    title: 'Real Estate Investment Guide',
    description: 'Comprehensive guide covering real estate tokenization, due diligence, and risk assessment.',
    url: '/resources/real-estate-guide',
    relevanceScore: 0.75,
    timestamp: '2024-11-20T16:45:00Z',
    metadata: {
      category: 'Education',
      tags: ['real-estate', 'guide', 'tokenization', 'due-diligence']
    }
  }
];

const mockSuggestions: SearchSuggestion[] = [
  { id: 'sug_1', text: 'Manhattan real estate', type: 'query', category: 'Real Estate', count: 12 },
  { id: 'sug_2', text: 'Gold investments', type: 'query', category: 'Commodities', count: 8 },
  { id: 'sug_3', text: 'Dividend proposals', type: 'query', category: 'Governance', count: 15 },
  { id: 'sug_4', text: 'Commercial properties', type: 'query', category: 'Real Estate', count: 20 },
  { id: 'sug_5', text: 'Status: Funding', type: 'filter', category: 'Status' },
  { id: 'sug_6', text: 'Type: Asset Proposal', type: 'filter', category: 'Type' }
];

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      currentQuery: '',
      results: [],
      suggestions: [],
      isSearching: false,
      hasSearched: false,
      totalResults: 0,
      searchHistory: [],
      savedSearches: [],
      popularSearches: ['real estate', 'gold', 'dividend', 'governance', 'commercial'],
      activeFilters: defaultFilters,
      sortBy: 'relevance',
      sortOrder: 'desc',
      preferences: defaultPreferences,

      setQuery: (query) => {
        set({ currentQuery: query });
      },

      search: async (query, filters = {}) => {
        set({ isSearching: true, currentQuery: query });

        try {
          // Simulate AI-powered search delay
          await new Promise(resolve => setTimeout(resolve, 800));

          // In a real implementation, this would call the AI search service
          // For now, we'll filter mock data based on the query
          const searchTerms = query.toLowerCase().split(' ');
          const filteredResults = mockResults.filter(result => {
            const searchableText = `${result.title} ${result.description} ${result.metadata?.tags?.join(' ') || ''}`.toLowerCase();
            return searchTerms.some(term => searchableText.includes(term));
          });

          // Apply filters
          let finalResults = filteredResults;
          const currentFilters = get().activeFilters;
          
          if (currentFilters.types.length > 0) {
            finalResults = finalResults.filter(result => currentFilters.types.includes(result.type));
          }
          
          if (currentFilters.status.length > 0) {
            finalResults = finalResults.filter(result => 
              result.metadata?.status && currentFilters.status.includes(result.metadata.status)
            );
          }

          // Sort results
          const sortBy = get().sortBy;
          const sortOrder = get().sortOrder;
          
          finalResults.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
              case 'relevance':
                comparison = b.relevanceScore - a.relevanceScore;
                break;
              case 'date':
                comparison = new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
                break;
              case 'alphabetical':
                comparison = a.title.localeCompare(b.title);
                break;
              default:
                comparison = b.relevanceScore - a.relevanceScore;
            }
            
            return sortOrder === 'desc' ? comparison : -comparison;
          });

          // Add to search history
          const searchQuery: SearchQuery = {
            id: `search_${Date.now()}`,
            query,
            timestamp: new Date().toISOString(),
            resultCount: finalResults.length,
            filters
          };

          if (get().preferences.saveSearchHistory) {
            get().addToHistory(searchQuery);
          }

          set({
            results: finalResults,
            totalResults: finalResults.length,
            hasSearched: true,
            isSearching: false
          });

        } catch (error) {
          console.error('Search error:', error);
          set({
            results: [],
            totalResults: 0,
            hasSearched: true,
            isSearching: false
          });
        }
      },

      clearSearch: () => {
        set({
          currentQuery: '',
          results: [],
          hasSearched: false,
          totalResults: 0
        });
      },

      addToHistory: (query) => {
        set((state) => {
          const newHistory = [query, ...state.searchHistory.filter(h => h.query !== query.query)]
            .slice(0, state.preferences.maxHistoryItems);
          
          return { searchHistory: newHistory };
        });
      },

      clearHistory: () => {
        set({ searchHistory: [] });
      },

      saveSearch: (query) => {
        set((state) => ({
          savedSearches: [query, ...state.savedSearches.filter(s => s.id !== query.id)]
        }));
      },

      removeSavedSearch: (queryId) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter(s => s.id !== queryId)
        }));
      },

      setFilters: (filters) => {
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters }
        }));
      },

      addFilter: (key, value) => {
        set((state) => {
          const currentFilters = { ...state.activeFilters };
          
          if (Array.isArray(currentFilters[key])) {
            if (!currentFilters[key].includes(value)) {
              (currentFilters[key] as any[]).push(value);
            }
          } else {
            (currentFilters as any)[key] = value;
          }
          
          return { activeFilters: currentFilters };
        });
      },

      removeFilter: (key, value) => {
        set((state) => {
          const currentFilters = { ...state.activeFilters };
          
          if (Array.isArray(currentFilters[key]) && value !== undefined) {
            (currentFilters[key] as any[]) = (currentFilters[key] as any[]).filter(v => v !== value);
          } else {
            delete (currentFilters as any)[key];
          }
          
          return { activeFilters: currentFilters };
        });
      },

      clearFilters: () => {
        set({ activeFilters: defaultFilters });
      },

      getSuggestions: async (query) => {
        if (!query.trim()) {
          set({ suggestions: [] });
          return;
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Filter suggestions based on query
        const filteredSuggestions = mockSuggestions.filter(suggestion =>
          suggestion.text.toLowerCase().includes(query.toLowerCase())
        );

        set({ suggestions: filteredSuggestions });
      },

      clearSuggestions: () => {
        set({ suggestions: [] });
      },

      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
        
        // Re-sort current results if any
        const currentResults = get().results;
        if (currentResults.length > 0) {
          const sortedResults = [...currentResults].sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
              case 'relevance':
                comparison = b.relevanceScore - a.relevanceScore;
                break;
              case 'date':
                comparison = new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
                break;
              case 'alphabetical':
                comparison = a.title.localeCompare(b.title);
                break;
              default:
                comparison = b.relevanceScore - a.relevanceScore;
            }
            
            return sortOrder === 'desc' ? comparison : -comparison;
          });
          
          set({ results: sortedResults });
        }
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },

      getSearchAnalytics: () => {
        const state = get();
        const totalSearches = state.searchHistory.length;
        const queryFrequency: { [key: string]: number } = {};
        const typeFrequency: { [key: string]: number } = {};

        state.searchHistory.forEach(search => {
          queryFrequency[search.query] = (queryFrequency[search.query] || 0) + 1;
        });

        state.results.forEach(result => {
          typeFrequency[result.type] = (typeFrequency[result.type] || 0) + 1;
        });

        const popularQueries = Object.entries(queryFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([query]) => query);

        const mostSearchedTypes = Object.entries(typeFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type as SearchResultType);

        const averageResultsPerSearch = totalSearches > 0 
          ? state.searchHistory.reduce((sum, search) => sum + search.resultCount, 0) / totalSearches 
          : 0;

        return {
          totalSearches,
          popularQueries,
          mostSearchedTypes,
          averageResultsPerSearch
        };
      }
    }),
    {
      name: 'cf1-search',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        savedSearches: state.savedSearches,
        preferences: state.preferences,
        activeFilters: state.activeFilters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      })
    }
  )
);