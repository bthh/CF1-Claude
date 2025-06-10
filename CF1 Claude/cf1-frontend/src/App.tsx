import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import Activity from './pages/Activity';
import Marketplace from './pages/Marketplace';
import AssetDetail from './pages/AssetDetail';
import Portfolio from './pages/Portfolio';
import PortfolioPerformance from './pages/PortfolioPerformance';
import PortfolioTransactions from './pages/PortfolioTransactions';
import Launchpad from './pages/Launchpad';
import CreateProposal from './pages/CreateProposal';
import ProposalDetail from './pages/ProposalDetail';
import Governance from './pages/Governance';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/performance" element={<Performance />} />
          <Route path="/dashboard/activity" element={<Activity />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/asset/:id" element={<AssetDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/performance" element={<PortfolioPerformance />} />
          <Route path="/portfolio/transactions" element={<PortfolioTransactions />} />
          <Route path="/launchpad" element={<Launchpad />} />
          <Route path="/launchpad/create" element={<CreateProposal />} />
          <Route path="/launchpad/proposal/:id" element={<ProposalDetail />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
