import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { NotificationProvider } from './components/NotificationProvider';
import { OnboardingProvider } from './components/Onboarding/OnboardingProvider';
import { AccessibilityProvider } from './providers/AccessibilityProvider';
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorBoundary } from './components/ErrorBoundary/GlobalErrorBoundary';
import { AsyncErrorBoundary } from './components/ErrorBoundary/AsyncErrorBoundary';
// import { usePageTracking } from './hooks/useMonitoring';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import Activity from './pages/Activity';
import { UnifiedMarketplace } from './components/UnifiedMarketplace/UnifiedMarketplace';
import AssetDetail from './pages/AssetDetail';
import Portfolio from './pages/Portfolio';
import PortfolioPerformance from './pages/PortfolioPerformance';
import PortfolioTransactions from './pages/PortfolioTransactions';
import Launchpad from './pages/Launchpad';
import CreateProposal from './pages/CreateProposal';
import ProposalDetail from './pages/ProposalDetail';
import LaunchpadDrafts from './pages/LaunchpadDrafts';
import MySubmissions from './pages/MySubmissions';
import './utils/testProposalFlow'; // Load test utilities
import Governance from './pages/Governance';
import CreateGovernanceProposal from './pages/CreateGovernanceProposal';
import GovernanceProposalDetail from './pages/GovernanceProposalDetail';
import GovernanceDrafts from './pages/GovernanceDrafts';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Verification from './pages/Verification';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import SecondaryTrading from './pages/SecondaryTrading';
import ShareholderDetail from './pages/ShareholderDetail';
import Discovery from './pages/Discovery';
import CreatorAdmin from './pages/CreatorAdmin';
import SuperAdmin from './pages/SuperAdmin';
import PlatformAdmin from './pages/PlatformAdmin';
import RoleBasedTestingPage from './pages/RoleBasedTestingPage';
import AdminNavigation from './components/Admin/AdminNavigation';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import { CosmJSProvider } from './providers/CosmJSProvider';
import DemoModeIndicator from './components/DemoMode/DemoModeIndicator';
import DemoModeInitializer from './components/DemoMode/DemoModeInitializer';
import PerformanceDashboard from './components/Performance/PerformanceDashboard';

// Component for tracking page views
const PageTracker = () => {
  // usePageTracking();
  return null;
};

function App() {
  return (
    <GlobalErrorBoundary level="page" context="App">
      <AsyncErrorBoundary context="App">
        <QueryProvider>
          <CosmJSProvider>
            <NotificationProvider>
              <AdminAuthProvider>
                <AccessibilityProvider>
                  <OnboardingProvider>
                <Router>
                  <PageTracker />
                  <DemoModeIndicator />
                  <DemoModeInitializer />
                  <PerformanceDashboard />
                  <Layout>
                <RouteErrorBoundary>
                  <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/performance" element={<Performance />} />
              <Route path="/dashboard/activity" element={<Activity />} />
              <Route path="/marketplace" element={<UnifiedMarketplace />} />
              <Route path="/marketplace/assets/:id" element={<AssetDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/performance" element={<PortfolioPerformance />} />
              <Route path="/portfolio/transactions" element={<PortfolioTransactions />} />
              <Route path="/launchpad" element={<Launchpad />} />
              <Route path="/launchpad/create" element={<CreateProposal />} />
              <Route path="/launchpad/proposal/:id" element={<ProposalDetail />} />
              <Route path="/launchpad/drafts" element={<LaunchpadDrafts />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/governance/active" element={<Governance />} />
              <Route path="/governance/passed" element={<Governance />} />
              <Route path="/governance/rejected" element={<Governance />} />
              <Route path="/governance/my-votes" element={<Governance />} />
              <Route path="/governance/create" element={<CreateGovernanceProposal />} />
              <Route path="/governance/proposal/:id" element={<GovernanceProposalDetail />} />
              <Route path="/governance/drafts" element={<GovernanceDrafts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/settings" element={<Settings />} />
              <Route path="/profile/verification" element={<Verification />} />
              <Route path="/secondary-trading" element={<SecondaryTrading />} />
              <Route path="/shareholder/:id" element={<ShareholderDetail />} />
              <Route path="/discovery" element={<Discovery />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminNavigation />} />
              <Route path="/admin/creator" element={<CreatorAdmin />} />
              <Route path="/admin/super" element={<SuperAdmin />} />
              <Route path="/admin/platform" element={<PlatformAdmin />} />
              <Route path="/admin/testing" element={<RoleBasedTestingPage />} />
              </Routes>
            </RouteErrorBoundary>
            </Layout>
          </Router>
                </OnboardingProvider>
              </AccessibilityProvider>
            </AdminAuthProvider>
          </NotificationProvider>
        </CosmJSProvider>
      </QueryProvider>
      </AsyncErrorBoundary>
    </GlobalErrorBoundary>
  );
}

export default App;
