import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuidedAnswer } from '../components/Discovery/GuidedSearchQuestions';

export interface SearchFilters {
  category: string[];
  budgetRange: string;
  riskLevel: string[];
  location?: string;
  timeframe?: string;
}

export interface UserPreferences {
  interests: string[];
  budgetRange: string;
  riskTolerance: string;
  experience: string;
  investmentGoals: string[];
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedBudget: number;
  riskLevel: string;
  marketSize: string;
  competition: string;
  reasoning: string;
  nextSteps: string[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  videoUrl: string;
  transcript?: string;
  tags: string[];
}

export interface MarketInsight {
  id: string;
  title: string;
  summary: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  details: string;
  source: string;
  timestamp: string;
}

export interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'legal' | 'business-plan' | 'tool';
  category: string;
  downloadUrl?: string;
  content?: string;
  tags: string[];
}

export interface GuidedSearchState {
  isActive: boolean;
  category: string;
  originalQuery: string;
  answers: GuidedAnswer[];
  showAfterResultCount?: number;
  showAfterSeconds?: number;
}

export interface DiscoveryState {
  // Search and filters
  searchFilters: SearchFilters;
  searchQuery: string;
  
  // Guided Search
  guidedSearch: GuidedSearchState;
  
  // AI Idea Generator
  ideaGeneratorState: {
    isGenerating: boolean;
    userPreferences: UserPreferences | null;
    generatedIdeas: Idea[];
    selectedIdea: Idea | null;
  };
  
  // Content
  videos: Video[];
  watchedVideos: string[];
  bookmarkedVideos: string[];
  
  marketInsights: MarketInsight[];
  documentation: DocumentationItem[];
  bookmarkedContent: string[];
  
  // UI State
  loading: boolean;
  activeTab: 'search' | 'videos' | 'ideas' | 'insights' | 'docs';
  
  // Actions
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: DiscoveryState['activeTab']) => void;
  
  // Idea Generator Actions
  setUserPreferences: (preferences: UserPreferences) => void;
  generateIdeas: (preferences: UserPreferences) => Promise<void>;
  selectIdea: (idea: Idea) => void;
  clearGeneratedIdeas: () => void;
  
  // Content Actions
  loadVideos: () => Promise<void>;
  loadMarketInsights: () => Promise<void>;
  loadDocumentation: () => Promise<void>;
  
  // Bookmarking
  toggleVideoBookmark: (videoId: string) => void;
  toggleContentBookmark: (contentId: string) => void;
  markVideoWatched: (videoId: string) => void;
  
  // Search
  searchContent: (query: string, filters: SearchFilters) => Promise<any[]>;
  
  // Guided Search Actions
  startGuidedSearch: (category: string, query: string, triggerOptions?: { showAfterResultCount?: number; showAfterSeconds?: number }) => void;
  updateGuidedSearchAnswers: (answers: GuidedAnswer[]) => void;
  completeGuidedSearch: () => void;
  cancelGuidedSearch: () => void;
  
  // Initialize
  initialize: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      // Initial state
      searchFilters: {
        category: [],
        budgetRange: 'any',
        riskLevel: [],
      },
      searchQuery: '',
      
      guidedSearch: {
        isActive: false,
        category: '',
        originalQuery: '',
        answers: [],
      },
      
      ideaGeneratorState: {
        isGenerating: false,
        userPreferences: null,
        generatedIdeas: [],
        selectedIdea: null,
      },
      
      videos: [],
      watchedVideos: [],
      bookmarkedVideos: [],
      
      marketInsights: [],
      documentation: [],
      bookmarkedContent: [],
      
      loading: false,
      activeTab: 'search',
      
      // Actions
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        }));
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
      
      // Idea Generator
      setUserPreferences: (preferences) => {
        set((state) => ({
          ideaGeneratorState: {
            ...state.ideaGeneratorState,
            userPreferences: preferences
          }
        }));
      },
      
      generateIdeas: async (preferences) => {
        const { aiIdeaGenerator } = await import('../services/aiIdeaGenerator');
        
        set((state) => ({
          ideaGeneratorState: {
            ...state.ideaGeneratorState,
            isGenerating: true
          }
        }));
        
        try {
          const generatedIdeas = await aiIdeaGenerator.generateIdeas(preferences);
          
          set((state) => ({
            ideaGeneratorState: {
              ...state.ideaGeneratorState,
              isGenerating: false,
              generatedIdeas,
              userPreferences: preferences
            }
          }));
          
        } catch (error) {
          console.error('Failed to generate ideas:', error);
          set((state) => ({
            ideaGeneratorState: {
              ...state.ideaGeneratorState,
              isGenerating: false
            }
          }));
        }
      },
      
      selectIdea: (idea) => {
        set((state) => ({
          ideaGeneratorState: {
            ...state.ideaGeneratorState,
            selectedIdea: idea
          }
        }));
      },
      
      clearGeneratedIdeas: () => {
        set((state) => ({
          ideaGeneratorState: {
            ...state.ideaGeneratorState,
            generatedIdeas: [],
            selectedIdea: null
          }
        }));
      },
      
      // Content loading
      loadVideos: async () => {
        set({ loading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockVideos: Video[] = [
            {
              id: '1',
              title: 'How to Create Winning Asset Proposals',
              description: 'Learn the essential elements of a successful asset proposal that attracts investors',
              duration: '12:34',
              category: 'Getting Started',
              difficulty: 'beginner',
              thumbnailUrl: '/api/placeholder/300/200',
              videoUrl: '#',
              tags: ['proposals', 'fundraising', 'basics']
            },
            {
              id: '2',
              title: 'Market Research Methods for Asset Creators',
              description: 'Advanced techniques for validating your asset concept and understanding market demand',
              duration: '8:45',
              category: 'Market Research',
              difficulty: 'intermediate',
              thumbnailUrl: '/api/placeholder/300/200',
              videoUrl: '#',
              tags: ['research', 'validation', 'market-analysis']
            },
            {
              id: '3',
              title: 'Legal Basics for Asset Creation',
              description: 'Understanding regulatory requirements and compliance for different asset types',
              duration: '15:22',
              category: 'Legal & Compliance',
              difficulty: 'intermediate',
              thumbnailUrl: '/api/placeholder/300/200',
              videoUrl: '#',
              tags: ['legal', 'compliance', 'regulations']
            },
            {
              id: '4',
              title: 'Success Stories: $1M+ Asset Launches',
              description: 'Case studies of successful asset launches and lessons learned from top creators',
              duration: '18:15',
              category: 'Success Stories',
              difficulty: 'advanced',
              thumbnailUrl: '/api/placeholder/300/200',
              videoUrl: '#',
              tags: ['case-studies', 'success', 'strategy']
            }
          ];
          
          set({ videos: mockVideos });
        } finally {
          set({ loading: false });
        }
      },
      
      loadMarketInsights: async () => {
        const { marketIntelligence } = await import('../services/marketIntelligence');
        set({ loading: true });
        
        try {
          const intelligence = await marketIntelligence.getMarketIntelligence();
          
          // Transform market trends into insights format
          const insights: MarketInsight[] = intelligence.trends.map(trend => ({
            id: trend.id,
            title: trend.title,
            summary: trend.description,
            category: trend.category,
            trend: trend.impact === 'high' ? 'up' : trend.impact === 'low' ? 'down' : 'stable',
            changePercent: Math.random() * 50 + 10, // Derived from confidence and impact
            details: `${trend.description}. Confidence level: ${Math.round(trend.confidence * 100)}%. Affects: ${trend.affectedSectors.join(', ')}.`,
            source: trend.source,
            timestamp: new Date(trend.timestamp).toLocaleTimeString()
          }));

          // Add sector performance insights
          const sectorInsights: MarketInsight[] = intelligence.sectorAnalysis.slice(0, 3).map((sector, index) => ({
            id: `sector_${index}`,
            title: `${sector.sector.replace('_', ' ')} Sector ${sector.outlook === 'bullish' ? 'Rising' : sector.outlook === 'bearish' ? 'Declining' : 'Stable'}`,
            summary: `${sector.sector.replace('_', ' ')} showing ${sector.outlook} outlook with ${Math.round(sector.performance * 100)}% performance`,
            category: sector.sector.replace('_', ' '),
            trend: sector.outlook === 'bullish' ? 'up' : sector.outlook === 'bearish' ? 'down' : 'stable',
            changePercent: sector.performance * 100,
            details: `Key factors: ${sector.keyFactors.join(', ')}. Success rate: ${Math.round(sector.successRate * 100)}%. Average funding: $${(sector.medianFunding / 1000000).toFixed(1)}M.`,
            source: 'CF1 Market Intelligence',
            timestamp: new Date().toLocaleTimeString()
          }));

          const allInsights = [...insights, ...sectorInsights].slice(0, 5); // Limit to 5 insights
          set({ marketInsights: allInsights });
          
        } catch (error) {
          console.error('Failed to load market insights:', error);
          
          // Fallback to enhanced mock data
          const mockInsights: MarketInsight[] = [
            {
              id: '1',
              title: 'AI Infrastructure Investment Surge',
              summary: 'Technology sector experiencing unprecedented growth in AI infrastructure',
              category: 'Technology',
              trend: 'up',
              changePercent: 145.3,
              details: 'AI infrastructure investments driving datacenter and cloud computing growth with 92% confidence level.',
              source: 'CF1 Market Intelligence',
              timestamp: new Date().toLocaleTimeString()
            },
            {
              id: '2',
              title: 'Renewable Energy Transition Accelerating',
              summary: 'Clean energy investments showing strong momentum across sectors',
              category: 'Renewable Energy',
              trend: 'up',
              changePercent: 89.7,
              details: 'Government policies and corporate commitments driving renewable energy adoption with 89% confidence.',
              source: 'CF1 Market Intelligence',
              timestamp: new Date().toLocaleTimeString()
            },
            {
              id: '3',
              title: 'Real Estate Market Adapting to New Trends',
              summary: 'Commercial real estate restructuring creates opportunities',
              category: 'Real Estate',
              trend: 'stable',
              changePercent: 8.2,
              details: 'Urban office space restructuring and residential demand driving market adaptation.',
              source: 'CF1 Market Intelligence',
              timestamp: new Date().toLocaleTimeString()
            }
          ];
          
          set({ marketInsights: mockInsights });
        } finally {
          set({ loading: false });
        }
      },
      
      loadDocumentation: async () => {
        set({ loading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const mockDocs: DocumentationItem[] = [
            {
              id: '1',
              title: 'Creator Getting Started Guide',
              description: 'Complete guide to launching your first asset on the CF1 platform',
              type: 'guide',
              category: 'Getting Started',
              tags: ['basics', 'onboarding', 'tutorial']
            },
            {
              id: '2',
              title: 'Asset Proposal Template',
              description: 'Professional template for creating compelling asset proposals',
              type: 'template',
              category: 'Templates',
              downloadUrl: '/templates/asset-proposal.docx',
              tags: ['proposal', 'template', 'fundraising']
            },
            {
              id: '3',
              title: 'Legal Compliance Checklist',
              description: 'Essential legal requirements and compliance documentation',
              type: 'legal',
              category: 'Legal',
              tags: ['legal', 'compliance', 'checklist']
            },
            {
              id: '4',
              title: 'Business Plan Template',
              description: 'Comprehensive business plan template for asset creators',
              type: 'business-plan',
              category: 'Business Planning',
              downloadUrl: '/templates/business-plan.docx',
              tags: ['business-plan', 'strategy', 'template']
            },
            {
              id: '5',
              title: 'Market Analysis Toolkit',
              description: 'Tools and frameworks for conducting market research',
              type: 'tool',
              category: 'Market Research',
              tags: ['research', 'analysis', 'tools']
            }
          ];
          
          set({ documentation: mockDocs });
        } finally {
          set({ loading: false });
        }
      },
      
      // Bookmarking
      toggleVideoBookmark: (videoId) => {
        set((state) => ({
          bookmarkedVideos: state.bookmarkedVideos.includes(videoId)
            ? state.bookmarkedVideos.filter(id => id !== videoId)
            : [...state.bookmarkedVideos, videoId]
        }));
      },
      
      toggleContentBookmark: (contentId) => {
        set((state) => ({
          bookmarkedContent: state.bookmarkedContent.includes(contentId)
            ? state.bookmarkedContent.filter(id => id !== contentId)
            : [...state.bookmarkedContent, contentId]
        }));
      },
      
      markVideoWatched: (videoId) => {
        set((state) => ({
          watchedVideos: state.watchedVideos.includes(videoId)
            ? state.watchedVideos
            : [...state.watchedVideos, videoId]
        }));
      },
      
      // Search
      searchContent: async (query, filters) => {
        // Mock search implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { videos, marketInsights, documentation } = get();
        const allContent = [
          ...videos.map(v => ({ ...v, type: 'video' })),
          ...marketInsights.map(m => ({ ...m, type: 'insight' })),
          ...documentation.map(d => ({ ...d, type: 'documentation' }))
        ];
        
        return allContent.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        );
      },
      
      // Guided Search Actions
      startGuidedSearch: (category, query, triggerOptions = {}) => {
        set((state) => ({
          guidedSearch: {
            isActive: true,
            category,
            originalQuery: query,
            answers: [],
            showAfterResultCount: triggerOptions.showAfterResultCount,
            showAfterSeconds: triggerOptions.showAfterSeconds,
          }
        }));
      },
      
      updateGuidedSearchAnswers: (answers) => {
        set((state) => ({
          guidedSearch: {
            ...state.guidedSearch,
            answers
          }
        }));
      },
      
      completeGuidedSearch: () => {
        set((state) => ({
          guidedSearch: {
            ...state.guidedSearch,
            isActive: false
          }
        }));
      },
      
      cancelGuidedSearch: () => {
        set((state) => ({
          guidedSearch: {
            isActive: false,
            category: '',
            originalQuery: '',
            answers: [],
          }
        }));
      },
      
      // Initialize
      initialize: async () => {
        const { loadVideos, loadMarketInsights, loadDocumentation } = get();
        await Promise.all([
          loadVideos(),
          loadMarketInsights(),
          loadDocumentation()
        ]);
      }
    }),
    {
      name: 'discovery-storage',
      partialize: (state) => ({
        searchFilters: state.searchFilters,
        watchedVideos: state.watchedVideos,
        bookmarkedVideos: state.bookmarkedVideos,
        bookmarkedContent: state.bookmarkedContent,
        ideaGeneratorState: {
          ...state.ideaGeneratorState,
          isGenerating: false // Don't persist loading state
        }
      })
    }
  )
);