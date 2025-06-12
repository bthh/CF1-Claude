import { useState, useEffect } from 'react';

interface ResponsiveChartConfig {
  desktop: {
    height: number;
    margin: { top: number; right: number; left: number; bottom: number };
    fontSize: number;
    showLabels: boolean;
    tickRotation?: number;
  };
  tablet: {
    height: number;
    margin: { top: number; right: number; left: number; bottom: number };
    fontSize: number;
    showLabels: boolean;
    tickRotation?: number;
  };
  mobile: {
    height: number;
    margin: { top: number; right: number; left: number; bottom: number };
    fontSize: number;
    showLabels: boolean;
    tickRotation?: number;
  };
}

const defaultConfig: ResponsiveChartConfig = {
  desktop: {
    height: 300,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    fontSize: 12,
    showLabels: true
  },
  tablet: {
    height: 280,
    margin: { top: 15, right: 20, left: 15, bottom: 15 },
    fontSize: 11,
    showLabels: true,
    tickRotation: -45
  },
  mobile: {
    height: 240,
    margin: { top: 10, right: 10, left: 10, bottom: 40 },
    fontSize: 10,
    showLabels: false,
    tickRotation: -60
  }
};

export const useResponsiveChart = (customConfig?: Partial<ResponsiveChartConfig>) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    if (customConfig) {
      setConfig(prev => ({
        desktop: { ...prev.desktop, ...customConfig.desktop },
        tablet: { ...prev.tablet, ...customConfig.tablet },
        mobile: { ...prev.mobile, ...customConfig.mobile }
      }));
    }
  }, [customConfig]);

  const currentConfig = config[screenSize];

  return {
    screenSize,
    ...currentConfig,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    
    // Optimized settings for different chart types
    getAxisConfig: () => ({
      axisLine: false,
      tickLine: false,
      tick: { 
        fill: '#6b7280', 
        fontSize: currentConfig.fontSize,
        ...(currentConfig.tickRotation && { angle: currentConfig.tickRotation })
      },
      className: 'dark:fill-gray-400',
      interval: screenSize === 'mobile' ? ('preserveStartEnd' as const) : 0
    }),

    getTooltipConfig: () => ({
      contentStyle: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: currentConfig.fontSize
      }
    }),

    getGridConfig: () => ({
      strokeDasharray: screenSize === 'mobile' ? '2 2' : '3 3',
      stroke: '#e5e7eb',
      className: 'dark:stroke-gray-600'
    })
  };
};