import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface DiscoveryState {
  // Search and filters
  searchFilters: SearchFilters;
  searchQuery: string;
  
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
        set((state) => ({
          ideaGeneratorState: {
            ...state.ideaGeneratorState,
            isGenerating: true
          }
        }));
        
        try {
          // Simulate AI generation
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const mockIdeas: Idea[] = [
            {
              id: '1',
              title: 'Smart City Infrastructure Fund',
              description: 'Investment in IoT sensors and smart traffic management systems for mid-sized cities',
              category: 'Technology',
              estimatedBudget: 750000,
              riskLevel: 'Medium',
              marketSize: '$45B globally',
              competition: 'Moderate - established players exist',
              reasoning: 'Growing urbanization and government smart city initiatives create strong demand',
              nextSteps: [
                'Research municipal procurement processes',
                'Identify partner cities for pilot programs',
                'Develop MVP with basic sensor package',
                'Create financial projections'
              ]
            },
            {
              id: '2',
              title: 'Sustainable Fashion Marketplace',
              description: 'Platform connecting eco-conscious consumers with sustainable fashion brands',
              category: 'E-commerce',
              estimatedBudget: 350000,
              riskLevel: 'Medium-High',
              marketSize: '$8.25B by 2025',
              competition: 'High - but fragmented market',
              reasoning: 'Consumer demand for sustainable options growing 73% year-over-year',
              nextSteps: [
                'Survey target demographic preferences',
                'Partner with 10-15 sustainable brands',
                'Build marketplace MVP',
                'Develop logistics partnerships'
              ]
            },
            {
              id: '3',
              title: 'Rural Broadband Infrastructure',
              description: 'Fixed wireless internet infrastructure for underserved rural communities',
              category: 'Infrastructure',
              estimatedBudget: 1200000,
              riskLevel: 'Low-Medium',
              marketSize: '$7.1B addressable market',
              competition: 'Low - high barrier to entry',
              reasoning: 'Government funding programs and rural digital divide create opportunity',
              nextSteps: [
                'Identify target communities',
                'Research federal grant opportunities',
                'Partner with equipment vendors',
                'Develop deployment timeline'
              ]
            }
          ];
          
          set((state) => ({
            ideaGeneratorState: {
              ...state.ideaGeneratorState,
              isGenerating: false,
              generatedIdeas: mockIdeas,
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
        set({ loading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockInsights: MarketInsight[] = [
            {
              id: '1',
              title: 'Residential Real Estate Market Up 15%',
              summary: 'Prime opportunity in residential real estate with strong growth indicators',
              category: 'Real Estate',
              trend: 'up',
              changePercent: 15.2,
              details: 'Market analysis shows continued strength in residential real estate sector...',
              source: 'CF1 Market Research',
              timestamp: '2 hours ago'
            },
            {
              id: '2',
              title: 'Green Energy Investments See 200% Growth',
              summary: 'Renewable energy projects experiencing unprecedented investor interest',
              category: 'Energy',
              trend: 'up',
              changePercent: 198.7,
              details: 'Solar and wind projects dominate new investment flows...',
              source: 'Energy Investment Tracker',
              timestamp: '4 hours ago'
            },
            {
              id: '3',
              title: 'Alternative Investments Gaining Traction',
              summary: 'Wine, art, and collectibles showing strong performance',
              category: 'Collectibles',
              trend: 'up',
              changePercent: 23.4,
              details: 'Non-traditional assets outperforming traditional markets...',
              source: 'Alternative Investment Report',
              timestamp: '1 day ago'
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