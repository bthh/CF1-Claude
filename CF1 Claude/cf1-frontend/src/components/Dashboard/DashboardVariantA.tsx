import React, { memo, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowRight,
  Clock,
  Star,
  ChevronRight,
  Building2,
  Shield,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { useDashboardV2Store } from '../../store/dashboardV2Store';
import { useDataMode } from '../../store/dataModeStore';
import Card from '../UI/Card';
import Button from '../UI/Button';
import SkylineHero from '../UI/SkylineHero';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceTracker';
import EnhancedMarketplaceWidget from './EnhancedMarketplaceWidget';
import EnhancedPortfolioWidget from './EnhancedPortfolioWidget';
import { getAssetImage } from '../../services/assetImageService';

// Professional Asset Image Component with fallback handling
interface AssetImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

const AssetImage: React.FC<AssetImageProps> = ({ 
  src, 
  alt, 
  className = "w-full h-40 object-cover",
  fallbackClassName = "w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (!src || imageError) {
    return (
      <div className={fallbackClassName}>
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={fallbackClassName}>
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 w-full h-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'absolute inset-0 opacity-0' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

const DashboardVariantA: React.FC = memo(() => {
  const { 
    featuredProposals, 
    platformHighlights, 
    latestNews 
  } = useDashboardV2Store();
  
  const { currentMode } = useDataMode();
  const navigate = useNavigate();

  // Performance monitoring
  const { trackCustomInteraction } = usePerformanceMonitoring('DashboardVariantA');

  // Memoize category image function to get professional stock photography
  const getCategoryImage = useCallback((category: string) => {
    const assetImage = getAssetImage(category);
    return assetImage?.url || null;
  }, []);

  // Memoize button click handlers
  const handleConnectWallet = useCallback(() => {
    trackCustomInteraction?.('connect_wallet_clicked', 0);
  }, [trackCustomInteraction]);

  const handleBrowseAssets = useCallback(() => {
    trackCustomInteraction?.('browse_assets_clicked', 0);
  }, [trackCustomInteraction]);

  const handleLearnMore = useCallback(() => {
    trackCustomInteraction?.('learn_more_clicked', 0);
  }, [trackCustomInteraction]);

  const handleProposalClick = useCallback((proposalId: string) => {
    trackCustomInteraction?.('proposal_card_clicked', 0);
    navigate(`/launchpad/proposal/${proposalId}`);
  }, [navigate, trackCustomInteraction]);

  // Memoize featured proposals to prevent unnecessary re-renders
  const memoizedFeaturedProposals = useMemo(() => featuredProposals, [featuredProposals]);
  const memoizedPlatformHighlights = useMemo(() => platformHighlights, [platformHighlights]);
  const memoizedLatestNews = useMemo(() => latestNews, [latestNews]);

  return (
    <div className="space-y-8">
      {/* Professional Skyline Hero Section */}
      <SkylineHero className="mb-8" gradientIntensity="medium">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 py-16">
            <div className="max-w-4xl mx-auto">
              {/* CF1 Brand Header */}
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
                  CF1 Platform
                </h1>
                <div className="text-xl md:text-2xl text-blue-200 font-medium mb-2">
                  TradFi Feel, DeFi Engine
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
              </div>
              
              {/* Value Proposition */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Institutional-grade fractional asset ownership platform
              </p>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Access premium investment opportunities typically reserved for institutions. 
                Build diversified portfolios through blockchain-powered fractional ownership.
              </p>
              
              {/* Professional CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg border-0" 
                  onClick={handleConnectWallet}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg backdrop-blur-sm" 
                  onClick={handleBrowseAssets}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Assets
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg backdrop-blur-sm" 
                  onClick={handleLearnMore}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-semibold mb-1">Bank-Grade Security</div>
                  <div className="text-white/70 text-sm">Multi-layer security protocols</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-semibold mb-1">Institutional Assets</div>
                  <div className="text-white/70 text-sm">Premium real estate & alternatives</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-semibold mb-1">Blockchain Powered</div>
                  <div className="text-white/70 text-sm">Transparent & efficient transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SkylineHero>

      {/* Featured Proposals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Rocket className="w-7 h-7 mr-3 text-blue-600" />
              Discover Investment Opportunities
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Explore our latest featured proposals from verified creators
            </p>
          </div>
          <Link 
            to="/launchpad"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {memoizedFeaturedProposals.length > 0 ? (
            memoizedFeaturedProposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProposalClick(proposal.id)}
              >
                <div className="aspect-[3/2] relative overflow-hidden">
                  <AssetImage
                    src={getCategoryImage(proposal.category)}
                    alt={`${proposal.category} - ${proposal.title}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    fallbackClassName="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-medium text-gray-800">
                        {proposal.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm">
                    {proposal.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {proposal.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {proposal.timeLeft}
                    </div>
                    <div className="h-6 w-6 p-0 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback content when no proposals are loaded
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-gray-400" />
                </div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-100 dark:bg-gray-600 rounded"></div>
                    <div className="h-6 w-6 bg-gray-100 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Platform Highlights */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center mb-2">
            <TrendingUp className="w-7 h-7 mr-3 text-green-600" />
            Platform Highlights
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            See how our community is building wealth together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {memoizedPlatformHighlights.length > 0 ? (
            memoizedPlatformHighlights.map((highlight, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {highlight.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {highlight.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {highlight.description}
                </div>
              </div>
            ))
          ) : (
            // Fallback content for platform highlights
            [
              { icon: DollarSign, value: "$12.5M+", label: "Assets Under Management", desc: "Total value managed on platform" },
              { icon: Users, value: "5,000+", label: "Active Investors", desc: "Growing community of investors" },
              { icon: TrendingUp, value: "8.5%", label: "Average Returns", desc: "Historical portfolio performance" }
            ].map((fallback, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                <fallback.icon className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-3" />
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {fallback.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {fallback.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {fallback.desc}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Enhanced Demo Components - Professional Stock Images */}
      {currentMode === 'demo' && (
        <>
          {/* Featured Marketplace Assets */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
                <Building2 className="w-7 h-7 mr-3 text-purple-600" />
                Featured Investment Opportunities
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Professional-grade assets with institutional backing
              </p>
            </div>
            <EnhancedMarketplaceWidget size="full" />
          </section>

        </>
      )}

      {/* Getting Started CTA */}
      <section>
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="text-center relative z-10">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4 text-white">Get Started Today</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of investors who are building wealth through our platform. 
              Connect your wallet, browse opportunities, and start investing in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              <button 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleConnectWallet}
              >
                <Users className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleBrowseAssets}
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Assets
              </button>
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleLearnMore}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Updates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
              Latest News & Updates
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Stay informed about platform developments
            </p>
          </div>
          <Link 
            to="/news"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          {memoizedLatestNews.slice(0, 3).map((news) => (
            <Card key={news.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-600 mt-1.5"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {news.timestamp}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      {news.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
});

// Add display name for debugging
DashboardVariantA.displayName = 'DashboardVariantA';

export default DashboardVariantA;