import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  BookOpen,
  Star,
  Building2,
  Shield,
  Zap
} from 'lucide-react';
import StockLogo1 from '../../assets/StockLogo1.webp';
import { usePortfolioData } from '../../services/portfolioDataService';
import { useUnifiedAuthStore } from '../../store/unifiedAuthStore';
import { useOnboarding } from '../../hooks/useOnboarding';
import { formatCurrency, formatPercentage } from '../../utils/format';
import Card from '../UI/Card';
import Button from '../UI/Button';
import SkylineHero from '../UI/SkylineHero';
import { UserPathEntryModal } from '../Onboarding/UserPathEntryModal';
import { OnboardingTourComponent } from '../Onboarding/OnboardingTour';
import AIInvestmentInsights from './AIInvestmentInsights';
import { useState } from 'react';


const ModernDashboard: React.FC = memo(() => {
  const navigate = useNavigate();
  const { showLogin } = useUnifiedAuthStore();
  const { summary, isEmpty } = usePortfolioData();
  const [showPathModal, setShowPathModal] = useState(false);

  const {
    startTour,
    isActive,
    currentTour,
    currentStep,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    highlightElement,
    clearHighlight,
    scrollToElement,
    navigateToPage,
    waitForElement
  } = useOnboarding();


  // Other action handlers
  const handleGetStarted = useCallback(() => {
    setShowPathModal(true);
  }, []);

  const handleBrowseAssets = useCallback(() => {
    navigate('/launchpad');
  }, [navigate]);

  const handleLearnMore = useCallback(() => {
    startTour('platform_overview');
  }, [startTour]);

  const handleConnectWallet = useCallback(() => {
    showLogin();
  }, [showLogin]);

  const handlePathSelect = useCallback((path: 'investor' | 'creator') => {
    setShowPathModal(false);
    // Navigate to appropriate onboarding flow
    if (path === 'investor') {
      startTour('investor_onboarding');
    } else {
      startTour('creator_onboarding');
    }
  }, [startTour]);

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
                  variant="secondary"
                  size="large"
                  className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg border-0"
                  onClick={handleGetStarted}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="large"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
                  onClick={handleBrowseAssets}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Assets
                </Button>
                <Button
                  variant="outline"
                  size="large"
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

      {/* Quick Actions Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quick Actions
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Get started with your investment journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Explore Assets
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover premium investment opportunities
            </p>
            <Button onClick={handleBrowseAssets} className="w-full">
              Browse Marketplace
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign In
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect with wallet or email to get started
            </p>
            <Button onClick={handleConnectWallet} variant="outline" className="w-full">
              Sign In Now
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Learn & Tour
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Take a guided tour of the platform
            </p>
            <Button onClick={handleLearnMore} variant="outline" className="w-full">
              Start Tour
            </Button>
          </Card>
        </div>
      </section>

      {/* AI Investment Insights */}
      <AIInvestmentInsights />

      {/* Getting Started CTA */}
      <section>
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="text-center relative z-10">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of investors who are building wealth through our platform.
              Connect your wallet, browse opportunities, and start investing in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              <Button
                variant="secondary"
                className="!bg-white !text-blue-600 hover:!bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleGetStarted}
              >
                <Users className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              <Button
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleBrowseAssets}
                variant="outline"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Assets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* User Path Entry Modal */}
      <UserPathEntryModal
        isOpen={showPathModal}
        onClose={() => setShowPathModal(false)}
        onSelectPath={handlePathSelect}
      />

      {/* Onboarding Tour Component */}
      <OnboardingTourComponent
        tourId={currentTour}
        currentStep={currentStep}
        isActive={isActive}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTour}
        onComplete={() => currentTour && completeTour(currentTour)}
        onClose={() => currentTour && completeTour(currentTour)}
        highlightElement={highlightElement}
        clearHighlight={clearHighlight}
        scrollToElement={scrollToElement}
        navigateToPage={navigateToPage}
        waitForElement={waitForElement}
      />
    </div>
  );
});

// Add display name for debugging
ModernDashboard.displayName = 'ModernDashboard';

export default ModernDashboard;