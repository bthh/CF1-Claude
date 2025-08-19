# CF1 Platform Component Architecture Guide

## Overview
This guide provides detailed component architecture, props interfaces, and implementation patterns for the CF1 platform enhancements. It builds upon the existing codebase structure and follows established patterns.

## 1. Admin Toggle System Architecture

### 1.1 Core Components

#### AdminViewToggle Component
```typescript
// /src/components/Admin/AdminViewToggle.tsx
interface AdminViewToggleProps {
  currentView: 'main' | 'admin';
  adminRole: AdminRole | null;
  hasPermission: boolean;
  onToggle: (view: 'main' | 'admin') => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

interface AdminViewToggleState {
  isTransitioning: boolean;
  showPermissionError: boolean;
  lastError?: string;
}

export const AdminViewToggle: React.FC<AdminViewToggleProps> = ({
  currentView,
  adminRole,
  hasPermission,
  onToggle,
  loading = false,
  disabled = false,
  className = ''
}) => {
  const [state, setState] = useState<AdminViewToggleState>({
    isTransitioning: false,
    showPermissionError: false
  });

  const handleToggle = useCallback(async () => {
    if (!hasPermission) {
      setState(prev => ({ ...prev, showPermissionError: true }));
      return;
    }

    setState(prev => ({ ...prev, isTransitioning: true }));
    
    try {
      await onToggle(currentView === 'main' ? 'admin' : 'main');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        lastError: error.message,
        showPermissionError: true 
      }));
    } finally {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, [currentView, hasPermission, onToggle]);

  return (
    <div className={`admin-view-toggle ${className}`}>
      <button
        onClick={handleToggle}
        disabled={disabled || loading || state.isTransitioning}
        className={`toggle-button ${currentView === 'admin' ? 'active' : 'inactive'}`}
        aria-pressed={currentView === 'admin'}
        aria-label={`Switch to ${currentView === 'admin' ? 'main' : 'admin'} view`}
      >
        <div className="toggle-content">
          <div className="icon">
            {currentView === 'admin' ? '🎛️' : '👤'}
          </div>
          <div className="text">
            <span className="view-type">
              {currentView === 'admin' ? 'ADMIN VIEW' : 'USER VIEW'}
            </span>
            <span className="description">
              {currentView === 'admin' 
                ? `${adminRole?.replace('_', ' ')} Dashboard`
                : 'Main Dashboard'
              }
            </span>
          </div>
        </div>
        
        {(loading || state.isTransitioning) && (
          <div className="loading-indicator">
            <Spinner size="sm" />
          </div>
        )}
      </button>

      {state.showPermissionError && (
        <PermissionErrorModal
          isOpen={state.showPermissionError}
          onClose={() => setState(prev => ({ ...prev, showPermissionError: false }))}
          error={state.lastError}
        />
      )}
    </div>
  );
};
```

#### Enhanced Header Integration
```typescript
// /src/components/Layout/Header.tsx - Additional integration
const Header: React.FC = () => {
  const { adminRole, isAdmin, hasPermission } = useAdminAuth();
  const { currentView, toggleView } = useAdminViewStore();

  return (
    <header className={`header ${currentView === 'admin' ? 'admin-mode' : 'user-mode'}`}>
      {/* Existing header content */}
      
      {/* Admin Toggle Integration */}
      {isAdmin && (
        <AdminViewToggle
          currentView={currentView}
          adminRole={adminRole}
          hasPermission={hasPermission}
          onToggle={toggleView}
          className="header-admin-toggle"
        />
      )}
      
      {/* Rest of header */}
    </header>
  );
};
```

### 1.2 State Management

#### AdminViewStore
```typescript
// /src/store/adminViewStore.ts
interface AdminViewState {
  currentView: 'main' | 'admin';
  adminRole: AdminRole | null;
  permissionCache: Record<string, boolean>;
  viewHistory: Array<{
    view: 'main' | 'admin';
    timestamp: number;
    role?: AdminRole;
  }>;
}

interface AdminViewActions {
  toggleView: () => Promise<void>;
  setAdminView: (role: AdminRole) => Promise<void>;
  exitAdminView: () => void;
  checkPermissions: (role: AdminRole) => Promise<boolean>;
  clearViewHistory: () => void;
}

export const useAdminViewStore = create<AdminViewState & AdminViewActions>()(
  persist(
    (set, get) => ({
      currentView: 'main',
      adminRole: null,
      permissionCache: {},
      viewHistory: [],

      toggleView: async () => {
        const { currentView, adminRole } = get();
        const newView = currentView === 'main' ? 'admin' : 'main';
        
        if (newView === 'admin' && !adminRole) {
          throw new Error('No admin role available');
        }

        // Add to history
        const historyEntry = {
          view: newView,
          timestamp: Date.now(),
          role: newView === 'admin' ? adminRole : undefined
        };

        set(state => ({
          currentView: newView,
          viewHistory: [...state.viewHistory, historyEntry].slice(-10) // Keep last 10
        }));

        // Announce to screen readers
        announceToScreenReader(
          `Switched to ${newView} view${newView === 'admin' ? ` as ${adminRole}` : ''}`
        );
      },

      setAdminView: async (role: AdminRole) => {
        const hasPermission = await get().checkPermissions(role);
        if (!hasPermission) {
          throw new Error(`Insufficient permissions for ${role} role`);
        }

        set({
          currentView: 'admin',
          adminRole: role
        });
      },

      exitAdminView: () => {
        set({
          currentView: 'main',
          adminRole: null
        });
      },

      checkPermissions: async (role: AdminRole) => {
        const { permissionCache } = get();
        
        // Check cache first
        if (permissionCache[role] !== undefined) {
          return permissionCache[role];
        }

        // Make API call to verify permissions
        try {
          const hasPermission = await verifyAdminPermissions(role);
          
          // Cache result
          set(state => ({
            permissionCache: {
              ...state.permissionCache,
              [role]: hasPermission
            }
          }));

          return hasPermission;
        } catch (error) {
          console.error('Permission check failed:', error);
          return false;
        }
      },

      clearViewHistory: () => {
        set({ viewHistory: [] });
      }
    }),
    {
      name: 'cf1-admin-view-storage',
      partialize: (state) => ({
        viewHistory: state.viewHistory.slice(-5) // Only persist last 5 entries
      })
    }
  )
);
```

## 2. Dashboard V2 Architecture

### 2.1 Main Dashboard Component

```typescript
// /src/components/Dashboard/DashboardV2.tsx
interface DashboardV2Props {
  forceVariant?: 'A' | 'B' | 'C';
  className?: string;
}

interface DashboardVariantConfig {
  variant: 'A' | 'B' | 'C';
  title: string;
  description: string;
  components: React.ComponentType[];
  layout: 'grid' | 'stack' | 'hybrid';
  refreshInterval?: number;
}

export const DashboardV2: React.FC<DashboardV2Props> = ({
  forceVariant,
  className = ''
}) => {
  const { selectedRole, isRoleSelected } = useSessionStore();
  const { user, isAuthenticated } = useAuthStore();
  const { assets, portfolioValue } = usePortfolioStore();
  const { announcements } = useNotificationStore();

  // Determine which variant to show
  const variant = useMemo(() => {
    if (forceVariant) return forceVariant;
    return determineVariant({
      isAuthenticated,
      selectedRole,
      assets,
      portfolioValue,
      user
    });
  }, [forceVariant, isAuthenticated, selectedRole, assets, portfolioValue, user]);

  const config = useMemo(() => 
    DASHBOARD_VARIANTS[variant], [variant]
  );

  return (
    <div className={`dashboard-v2 variant-${variant} ${className}`}>
      <DashboardHeader
        variant={variant}
        title={config.title}
        description={config.description}
        user={user}
      />
      
      <DashboardContent
        variant={variant}
        layout={config.layout}
        components={config.components}
      />
      
      {config.refreshInterval && (
        <AutoRefresh
          interval={config.refreshInterval}
          onRefresh={() => refreshDashboardData(variant)}
        />
      )}
    </div>
  );
};

// Variant determination logic
const determineVariant = ({
  isAuthenticated,
  selectedRole,
  assets,
  portfolioValue,
  user
}: DeterminationParams): 'A' | 'B' | 'C' => {
  // Variant A: Not logged in or no assets
  if (!isAuthenticated || !user) {
    return 'A';
  }

  // Variant C: Creator role
  if (selectedRole === 'creator' || user.roles?.includes('creator')) {
    return 'C';
  }

  // Variant B: Has investments or assets
  if (assets?.length > 0 || portfolioValue > 0) {
    return 'B';
  }

  // Default to A
  return 'A';
};
```

### 2.2 Individual Variant Components

#### Variant A - Welcome/Onboarding
```typescript
// /src/components/Dashboard/DashboardVariantA.tsx
interface VariantAProps {
  className?: string;
}

export const DashboardVariantA: React.FC<VariantAProps> = ({ className = '' }) => {
  const { featuredProposals, platformStats } = useLaunchpadStore();
  const { announcements } = useNotificationStore();
  const { startTour } = useOnboardingContext();

  return (
    <div className={`dashboard-variant-a ${className}`}>
      <WelcomeHero
        onConnect={() => {/* Handle wallet connection */}}
        onLearnMore={() => startTour('platform-overview')}
      />
      
      <FeaturedOpportunities
        proposals={featuredProposals}
        maxItems={4}
        showInvestButton={false}
      />
      
      <PlatformHighlights
        stats={platformStats}
        layout="horizontal"
      />
      
      <GetStartedSection
        actions={[
          { label: 'Connect Wallet', action: 'connect', primary: true },
          { label: 'Browse Assets', action: 'browse' },
          { label: 'Learn More', action: 'learn' }
        ]}
      />
      
      <LatestUpdates
        announcements={announcements}
        maxItems={3}
        showReadMore={true}
      />
    </div>
  );
};
```

#### Variant B - Active Investor
```typescript
// /src/components/Dashboard/DashboardVariantB.tsx
interface VariantBProps {
  className?: string;
}

export const DashboardVariantB: React.FC<VariantBProps> = ({ className = '' }) => {
  const { portfolioData, performance } = usePortfolioStore();
  const { activeProposals } = useGovernanceStore();
  const { pendingRewards } = useRewardsStore();
  const { newOpportunities } = useLaunchpadStore();

  return (
    <div className={`dashboard-variant-b ${className}`}>
      <div className="dashboard-grid">
        <PortfolioOverview
          data={portfolioData}
          performance={performance}
          size="large"
          showChart={true}
        />
        
        <QuickStatsWidget
          stats={[
            { label: 'Assets', value: portfolioData.assetsCount },
            { label: 'Votes', value: portfolioData.votesCount },
            { label: 'Rewards', value: pendingRewards.total },
            { label: 'ROI', value: performance.roi }
          ]}
        />
        
        <ActiveVotingWidget
          proposals={activeProposals}
          maxItems={3}
          showVoteButtons={true}
        />
        
        <NewOpportunitiesWidget
          opportunities={newOpportunities}
          maxItems={2}
          personalized={true}
        />
        
        <RewardsWidget
          rewards={pendingRewards.items}
          totalAmount={pendingRewards.total}
          showClaimAll={true}
        />
      </div>
    </div>
  );
};
```

#### Variant C - Creator Dashboard  
```typescript
// /src/components/Dashboard/DashboardVariantC.tsx
interface VariantCProps {
  className?: string;
}

export const DashboardVariantC: React.FC<VariantCProps> = ({ className = '' }) => {
  const { creatorAssets, creatorStats } = useCreatorStore();
  const { proposalPipeline } = useProposalStore();
  const { shareholderUpdates } = useShareholderStore();
  const { activeProposals } = useGovernanceStore(); // Platform governance as investor
  const { marketTrends } = useDiscoveryStore();

  return (
    <div className={`dashboard-variant-c ${className}`}>
      <div className="creator-dashboard-grid">
        <CreatorOverviewWidget
          stats={creatorStats}
          monthlyRevenue={creatorStats.monthlyRevenue}
          platformFees={creatorStats.platformFees}
        />
        
        <CreatorQuickActions
          actions={[
            'new-proposal',
            'analytics-suite',
            'bulk-communication',
            'shareholder-tools',
            'asset-management'
          ]}
        />
        
        <ActiveAssetsWidget
          assets={creatorAssets}
          showManagementButtons={true}
          showShareholderCounts={true}
        />
        
        <PendingTasksWidget
          tasks={[
            { type: 'report', dueDate: '3 days', title: 'Q3 Performance Report' },
            { type: 'messages', count: 12, title: 'Investor Messages' },
            { type: 'document', title: 'Document Update Needed' }
          ]}
        />
        
        <ProposalPipelineWidget
          pipeline={proposalPipeline}
          showProgressBars={true}
          showContinueButtons={true}
        />
        
        <ShareholderUpdatesWidget
          updates={shareholderUpdates}
          showBulkActions={true}
        />
        
        {/* Platform governance as investor */}
        <PlatformGovernanceWidget
          proposals={activeProposals}
          title="Platform Governance (As Stakeholder)"
          maxItems={2}
        />
        
        <MarketOpportunitiesWidget
          trends={marketTrends}
          discoveryLink="/discovery"
        />
        
        <CreatorAnalyticsWidget
          monthlyStats={creatorStats.monthlyMetrics}
          showDetailedAnalytics={true}
        />
      </div>
    </div>
  );
};
```

## 3. Discovery Tab Architecture

### 3.1 Main Discovery Component

```typescript
// /src/pages/Discovery.tsx
interface DiscoveryPageProps {
  initialFilters?: SearchFilters;
  focusMode?: 'inspiration' | 'education' | 'tools';
}

export const Discovery: React.FC<DiscoveryPageProps> = ({
  initialFilters,
  focusMode = 'inspiration'
}) => {
  const {
    searchFilters,
    updateFilters,
    searchResults,
    isLoading
  } = useDiscoveryStore();

  const {
    videoLibrary,
    learningPaths,
    userProgress
  } = useEducationStore();

  const {
    marketInsights,
    trendingOpportunities
  } = useMarketIntelligenceStore();

  return (
    <div className="discovery-page">
      <DiscoveryHeader
        title="Discovery Hub"
        subtitle="Find Inspiration for Your Next Asset"
        focusMode={focusMode}
      />
      
      <SmartSearchSection
        filters={searchFilters}
        onFiltersChange={updateFilters}
        results={searchResults}
        loading={isLoading}
      />
      
      <div className="discovery-content-grid">
        <CreatorAcademySection
          videoLibrary={videoLibrary}
          learningPaths={learningPaths}
          userProgress={userProgress}
        />
        
        <IdeaGeneratorWidget
          onGenerateIdeas={handleIdeaGeneration}
          userPreferences={getUserPreferences()}
        />
        
        <MarketIntelligenceSection
          insights={marketInsights}
          trending={trendingOpportunities}
        />
        
        <ResourceLibrarySection
          quickAccess={true}
          categories={[
            'templates',
            'legal-docs',
            'business-tools',
            'financial-models',
            'market-research',
            'expert-network'
          ]}
        />
      </div>
      
      <RecommendedNextSteps
        userProfile={getUserProfile()}
        marketTrends={marketInsights}
      />
    </div>
  );
};
```

### 3.2 Idea Generator Component

```typescript
// /src/components/Discovery/IdeaGenerator.tsx
interface IdeaGeneratorProps {
  onGenerateIdeas: (preferences: UserPreferences) => Promise<GeneratedIdea[]>;
  userPreferences?: Partial<UserPreferences>;
  className?: string;
}

interface UserPreferences {
  interests: string[];
  budgetRange: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  geography: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  timeHorizon: string;
}

interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedInvestment: number;
  riskLevel: string;
  marketSize: string;
  reasoning: string;
  nextSteps: string[];
  similarSuccessfulAssets: string[];
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
  onGenerateIdeas,
  userPreferences,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    budgetRange: '',
    riskTolerance: 'moderate',
    geography: [],
    experience: 'beginner',
    timeHorizon: '1-3years',
    ...userPreferences
  });

  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ideas = await onGenerateIdeas(preferences);
      setGeneratedIdeas(ideas);
    } catch (error) {
      console.error('Idea generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`idea-generator ${className}`}>
      <div className="generator-header">
        <h3>AI Idea Generator</h3>
        <p>Get personalized asset ideas based on your interests and market trends</p>
      </div>
      
      <PreferencesForm
        preferences={preferences}
        onChange={setPreferences}
        disabled={isGenerating}
      />
      
      <GenerateButton
        onClick={handleGenerate}
        loading={isGenerating}
        disabled={preferences.interests.length === 0}
      />
      
      {generatedIdeas.length > 0 && (
        <GeneratedIdeasDisplay
          ideas={generatedIdeas}
          onStartProposal={(idea) => {
            // Navigate to proposal creation with pre-filled data
            navigateToProposalCreation(idea);
          }}
          onSaveIdea={(idea) => {
            // Save idea for later
            saveIdeaForLater(idea);
          }}
        />
      )}
    </div>
  );
};
```

### 3.3 Video Library Component

```typescript
// /src/components/Discovery/VideoLibrary.tsx
interface VideoLibraryProps {
  learningPaths: LearningPath[];
  userProgress: UserProgress;
  onVideoComplete: (videoId: string) => void;
  className?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionReward?: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  transcript?: string;
  captions?: string;
  resources?: Resource[];
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  learningPaths,
  userProgress,
  onVideoComplete,
  className = ''
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  return (
    <div className={`video-library ${className}`}>
      <div className="library-header">
        <h3>Creator Academy</h3>
        <p>Master the art of asset creation with our comprehensive video courses</p>
      </div>
      
      <LearningPathsGrid
        paths={learningPaths}
        userProgress={userProgress}
        onPathSelect={setSelectedPath}
        selectedPath={selectedPath}
      />
      
      {selectedPath && (
        <PathDetails
          path={learningPaths.find(p => p.id === selectedPath)!}
          userProgress={userProgress}
          onVideoSelect={setCurrentVideo}
        />
      )}
      
      {currentVideo && (
        <VideoPlayer
          video={currentVideo}
          onComplete={() => onVideoComplete(currentVideo.id)}
          onClose={() => setCurrentVideo(null)}
          showTranscript={true}
          showResources={true}
        />
      )}
    </div>
  );
};
```

## 4. Enhanced Shareholder Management Architecture

### 4.1 Creator-Filtered Shareholder View

```typescript
// /src/components/Shareholders/CreatorShareholderView.tsx
interface CreatorShareholderViewProps {
  creatorId: string;
  initialAssetFilter?: string;
  className?: string;
}

interface ShareholderFilter {
  assetId?: string;
  searchTerm?: string;
  sortBy: 'investment' | 'joinDate' | 'lastContact' | 'engagement';
  sortOrder: 'asc' | 'desc';
  tags?: string[];
  investmentRange?: [number, number];
}

export const CreatorShareholderView: React.FC<CreatorShareholderViewProps> = ({
  creatorId,
  initialAssetFilter,
  className = ''
}) => {
  const { creatorAssets } = useCreatorStore();
  const {
    shareholders,
    isLoading,
    filters,
    updateFilters,
    exportShareholderData,
    sendBulkCommunication
  } = useShareholderStore();

  const [selectedShareholders, setSelectedShareholders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter shareholders to only show those invested in creator's assets
  const filteredShareholders = useMemo(() => {
    return shareholders.filter(shareholder => 
      shareholder.assets.some(asset => 
        creatorAssets.some(creatorAsset => creatorAsset.id === asset.id)
      )
    );
  }, [shareholders, creatorAssets]);

  const handleAssetFilter = (assetId: string) => {
    updateFilters({ ...filters, assetId });
  };

  const handleBulkAction = async (action: BulkAction, data: any) => {
    const selectedShareholderData = filteredShareholders.filter(s => 
      selectedShareholders.includes(s.id)
    );

    switch (action) {
      case 'send-update':
        await sendBulkCommunication(selectedShareholderData, data);
        break;
      case 'export-data':
        await exportShareholderData(selectedShareholderData);
        break;
      case 'create-segment':
        await createShareholderSegment(selectedShareholderData, data);
        break;
    }

    setSelectedShareholders([]);
    setShowBulkActions(false);
  };

  return (
    <div className={`creator-shareholder-view ${className}`}>
      <ShareholderViewHeader
        title="My Asset Shareholders"
        subtitle="Manage shareholders across your assets"
        creatorId={creatorId}
      />
      
      <AssetFilterControls
        assets={creatorAssets}
        selectedAsset={filters.assetId}
        onAssetSelect={handleAssetFilter}
        searchTerm={filters.searchTerm}
        onSearchChange={(term) => updateFilters({ ...filters, searchTerm: term })}
        sortBy={filters.sortBy}
        onSortChange={(sortBy) => updateFilters({ ...filters, sortBy })}
      />
      
      <ShareholderTable
        shareholders={filteredShareholders}
        loading={isLoading}
        selectedIds={selectedShareholders}
        onSelectionChange={setSelectedShareholders}
        showAssetColumn={!filters.assetId} // Only show if not filtered by specific asset
        onShareholderClick={(id) => navigateToShareholderDetail(id, creatorId)}
      />
      
      {selectedShareholders.length > 0 && (
        <BulkActionPanel
          selectedCount={selectedShareholders.length}
          onAction={handleBulkAction}
          availableActions={[
            'send-update',
            'export-data',
            'create-segment',
            'schedule-communication'
          ]}
        />
      )}
      
      <ShareholderInsights
        shareholders={filteredShareholders}
        assets={creatorAssets}
        timeframe="monthly"
      />
    </div>
  );
};
```

### 4.2 Enhanced Shareholder Detail Component

```typescript
// /src/components/Shareholders/ShareholderDetailV2.tsx
interface ShareholderDetailV2Props {
  shareholderId: string;
  creatorContext?: {
    creatorId: string;
    filterByCreatorAssets: boolean;
  };
  className?: string;
}

export const ShareholderDetailV2: React.FC<ShareholderDetailV2Props> = ({
  shareholderId,
  creatorContext,
  className = ''
}) => {
  const { shareholder, isLoading } = useShareholderDetail(shareholderId);
  const { sendMessage, messageHistory } = useShareholderCommunication(shareholderId);

  // Filter assets if creator context is provided
  const relevantAssets = useMemo(() => {
    if (!shareholder || !creatorContext?.filterByCreatorAssets) {
      return shareholder?.assets || [];
    }

    return shareholder.assets.filter(asset => 
      asset.creatorId === creatorContext.creatorId
    );
  }, [shareholder, creatorContext]);

  const contextTitle = creatorContext?.filterByCreatorAssets 
    ? `${shareholder?.name} - Holdings in Your Assets`
    : `${shareholder?.name} - Complete Portfolio`;

  return (
    <div className={`shareholder-detail-v2 ${className}`}>
      <ShareholderHeader
        shareholder={shareholder}
        title={contextTitle}
        showBackButton={true}
        contextInfo={creatorContext && {
          creatorName: 'Your Assets Only',
          totalAssets: relevantAssets.length
        }}
      />
      
      <ShareholderKeyMetrics
        shareholder={shareholder}
        assets={relevantAssets}
        showComparison={!creatorContext?.filterByCreatorAssets}
      />
      
      <AssetHoldings
        assets={relevantAssets}
        showPerformance={true}
        showManagementActions={creatorContext?.filterByCreatorAssets}
      />
      
      <CommunicationHistory
        messages={messageHistory}
        onSendMessage={sendMessage}
        contextFilter={creatorContext?.filterByCreatorAssets ? 'creator-assets' : 'all'}
      />
      
      <ShareholderQuickActions
        shareholderId={shareholderId}
        creatorContext={creatorContext}
        availableActions={[
          'send-message',
          'request-feedback',
          'performance-report',
          'mark-key-investor',
          'communication-preferences'
        ]}
      />
    </div>
  );
};
```

## 5. Shared Utilities and Hooks

### 5.1 Custom Hooks

```typescript
// /src/hooks/useAdminView.ts
export const useAdminView = () => {
  const {
    currentView,
    adminRole,
    toggleView,
    setAdminView,
    exitAdminView
  } = useAdminViewStore();
  
  const { isAdmin, hasPermission } = useAdminAuth();

  const canToggleToAdmin = useMemo(() => {
    return isAdmin && hasPermission;
  }, [isAdmin, hasPermission]);

  const toggleAdminView = useCallback(async () => {
    if (!canToggleToAdmin) {
      throw new Error('Insufficient permissions');
    }
    await toggleView();
  }, [canToggleToAdmin, toggleView]);

  return {
    currentView,
    adminRole,
    canToggleToAdmin,
    toggleAdminView,
    setAdminView,
    exitAdminView
  };
};

// /src/hooks/useDashboardVariant.ts
export const useDashboardVariant = (forceVariant?: 'A' | 'B' | 'C') => {
  const { selectedRole, isRoleSelected } = useSessionStore();
  const { user, isAuthenticated } = useAuthStore();
  const { assets, portfolioValue } = usePortfolioStore();

  const variant = useMemo(() => {
    if (forceVariant) return forceVariant;
    
    return determineVariant({
      isAuthenticated,
      selectedRole,
      assets,
      portfolioValue,
      user
    });
  }, [forceVariant, isAuthenticated, selectedRole, assets, portfolioValue, user]);

  const config = DASHBOARD_VARIANTS[variant];

  return {
    variant,
    config,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B',
    isVariantC: variant === 'C'
  };
};

// /src/hooks/useDiscovery.ts
export const useDiscovery = () => {
  const {
    searchFilters,
    updateFilters,
    searchResults,
    ideaGeneratorState,
    generateIdeas
  } = useDiscoveryStore();

  const {
    videoLibrary,
    learningPaths,
    userProgress,
    markVideoComplete
  } = useEducationStore();

  const {
    marketInsights,
    trendingOpportunities,
    refreshInsights
  } = useMarketIntelligenceStore();

  return {
    // Search functionality
    searchFilters,
    updateFilters,
    searchResults,
    
    // Idea generation
    ideaGeneratorState,
    generateIdeas,
    
    // Education content
    videoLibrary,
    learningPaths,
    userProgress,
    markVideoComplete,
    
    // Market intelligence
    marketInsights,
    trendingOpportunities,
    refreshInsights
  };
};
```

### 5.2 Utility Functions

```typescript
// /src/utils/dashboardVariants.ts
export const DASHBOARD_VARIANTS: Record<'A' | 'B' | 'C', DashboardVariantConfig> = {
  A: {
    variant: 'A',
    title: 'Welcome to CF1 Platform',
    description: 'Discover investment opportunities in real-world assets',
    components: [
      WelcomeHero,
      FeaturedOpportunities,
      PlatformHighlights,
      GetStartedSection,
      LatestUpdates
    ],
    layout: 'stack',
    refreshInterval: 300000 // 5 minutes
  },
  
  B: {
    variant: 'B',
    title: 'Investment Dashboard',
    description: 'Manage your portfolio and discover new opportunities',
    components: [
      PortfolioOverview,
      QuickStatsWidget,
      ActiveVotingWidget,
      NewOpportunitiesWidget,
      RewardsWidget
    ],
    layout: 'grid',
    refreshInterval: 60000 // 1 minute
  },
  
  C: {
    variant: 'C',
    title: 'Creator Dashboard',
    description: 'Manage your assets and engage with shareholders',
    components: [
      CreatorOverviewWidget,
      CreatorQuickActions,
      ActiveAssetsWidget,
      PendingTasksWidget,
      ProposalPipelineWidget,
      ShareholderUpdatesWidget,
      PlatformGovernanceWidget,
      MarketOpportunitiesWidget,
      CreatorAnalyticsWidget
    ],
    layout: 'hybrid',
    refreshInterval: 120000 // 2 minutes
  }
};

// /src/utils/accessibility.ts
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const generateAriaLabel = (
  baseLabel: string,
  context?: Record<string, any>
) => {
  if (!context) return baseLabel;
  
  const contextParts = Object.entries(context)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}: ${value}`);
    
  return contextParts.length > 0 
    ? `${baseLabel}, ${contextParts.join(', ')}`
    : baseLabel;
};
```

## 6. Testing Architecture

### 6.1 Component Testing Examples

```typescript
// /src/components/Admin/__tests__/AdminViewToggle.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminViewToggle } from '../AdminViewToggle';

describe('AdminViewToggle', () => {
  const mockProps = {
    currentView: 'main' as const,
    adminRole: 'creator' as const,
    hasPermission: true,
    onToggle: jest.fn()
  };

  it('should render toggle button with correct initial state', () => {
    render(<AdminViewToggle {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('USER VIEW')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', async () => {
    const onToggle = jest.fn();
    render(<AdminViewToggle {...mockProps} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith('admin');
    });
  });

  it('should show permission error when user lacks permissions', () => {
    render(<AdminViewToggle {...mockProps} hasPermission={false} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('should be accessible with screen readers', () => {
    render(<AdminViewToggle {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to admin view');
  });
});
```

### 6.2 Integration Testing

```typescript
// /src/test/integration/dashboard-variants.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardV2 } from '../../components/Dashboard/DashboardV2';
import { TestProviders } from '../test-utils';

describe('Dashboard Variants Integration', () => {
  it('should render Variant A for unauthenticated users', () => {
    render(
      <TestProviders authState={{ isAuthenticated: false }}>
        <DashboardV2 />
      </TestProviders>
    );
    
    expect(screen.getByText('Welcome to CF1 Platform')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should render Variant B for investors with assets', () => {
    render(
      <TestProviders 
        authState={{ isAuthenticated: true }}
        portfolioState={{ assets: [mockAsset], portfolioValue: 10000 }}
      >
        <DashboardV2 />
      </TestProviders>
    );
    
    expect(screen.getByText('Investment Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
  });

  it('should render Variant C for creators', () => {
    render(
      <TestProviders 
        authState={{ isAuthenticated: true }}
        sessionState={{ selectedRole: 'creator' }}
      >
        <DashboardV2 />
      </TestProviders>
    );
    
    expect(screen.getByText('Creator Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Active Assets')).toBeInTheDocument();
  });
});
```

This component architecture guide provides a comprehensive blueprint for implementing the CF1 platform enhancements with proper TypeScript interfaces, React patterns, state management, accessibility features, and testing strategies.