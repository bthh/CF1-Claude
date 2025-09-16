import React from 'react';
import { useFeatureToggleStore } from '../store/featureToggleStore';
import ConfigurableDashboard from '../components/Dashboard/ConfigurableDashboard';
import DashboardV2 from '../components/Dashboard/DashboardV2';
import ModernDashboard from '../components/Dashboard/ModernDashboard';

const Dashboard: React.FC = () => {
  const { isFeatureEnabled } = useFeatureToggleStore();

  // Use ModernDashboard if modern_dashboard feature is enabled
  if (isFeatureEnabled('modern_dashboard')) {
    return <ModernDashboard />;
  }

  // Use DashboardV2 if feature flag is enabled, otherwise use original
  if (isFeatureEnabled('dashboard_v2')) {
    return <DashboardV2 />;
  }

  return <ConfigurableDashboard />;
};

export default Dashboard;