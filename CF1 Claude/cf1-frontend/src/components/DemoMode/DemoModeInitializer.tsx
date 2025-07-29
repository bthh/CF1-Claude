import React from 'react';
import { useDemoModeInitialization } from '../../hooks/useDemoModeInitialization';

/**
 * Component that handles demo mode initialization
 * This ensures role-based demo data is loaded when the app starts with demo mode enabled
 */
export const DemoModeInitializer: React.FC = () => {
  useDemoModeInitialization();
  
  // This component doesn't render anything, it just handles initialization
  return null;
};

export default DemoModeInitializer;