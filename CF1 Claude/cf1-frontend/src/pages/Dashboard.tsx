import React from 'react';
import { useFeatureToggleStore } from '../store/featureToggleStore';
import ConfigurableDashboard from '../components/Dashboard/ConfigurableDashboard';
import DashboardV2 from '../components/Dashboard/DashboardV2';

const Dashboard: React.FC = () => {
  const { isFeatureEnabled } = useFeatureToggleStore();
  
  // Use DashboardV2 if feature flag is enabled, otherwise use original
  if (isFeatureEnabled('dashboard_v2')) {
    return <DashboardV2 />;
  }
  
  return <ConfigurableDashboard />;
};

export default Dashboard;