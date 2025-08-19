/**
 * Mobile Performance Optimizations Hook
 * Provides mobile-specific performance enhancements and optimizations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

export interface MobileOptimizationOptions {
  enableTouchOptimizations?: boolean;
  enableImageOptimizations?: boolean;
  enableReducedMotion?: boolean;
  enableDataSaver?: boolean;
  enableOfflineSupport?: boolean;
  touchDebounceMs?: number;
  imageQuality?: 'low' | 'medium' | 'high';
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isLowEndDevice: boolean;
  supportsWebP: boolean;
  supportsTouch: boolean;
  memoryLevel: 'low' | 'medium' | 'high';
  cpuLevel: 'low' | 'medium' | 'high';
  batteryLevel?: number;
  isCharging?: boolean;
}

const DEFAULT_OPTIONS: MobileOptimizationOptions = {
  enableTouchOptimizations: true,
  enableImageOptimizations: true,
  enableReducedMotion: false,
  enableDataSaver: false,
  enableOfflineSupport: true,
  touchDebounceMs: 16,
  imageQuality: 'medium'
};

export const useMobileOptimizations = (options: MobileOptimizationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [shouldOptimize, setShouldOptimize] = useState(false);
  
  const touchStartTime = useRef<number>(0);
  const lastTouchEnd = useRef<number>(0);
  
  // Detect device capabilities
  const detectDeviceCapabilities = useCallback((): DeviceCapabilities => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    // Detect memory constraints
    const memory = (navigator as any).deviceMemory || 4;
    const memoryLevel: 'low' | 'medium' | 'high' = 
      memory <= 2 ? 'low' : memory <= 4 ? 'medium' : 'high';
    
    // Detect CPU performance (rough estimation)
    const cpuLevel: 'low' | 'medium' | 'high' = 
      navigator.hardwareConcurrency <= 2 ? 'low' : 
      navigator.hardwareConcurrency <= 4 ? 'medium' : 'high';
    
    // Check for low-end device indicators
    const isLowEndDevice = memoryLevel === 'low' || cpuLevel === 'low';
    
    // WebP support detection
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('webp') > -1;
    
    // Touch support
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isMobile,
      isTablet,
      isLowEndDevice,
      supportsWebP,
      supportsTouch,
      memoryLevel,
      cpuLevel
    };
  }, []);

  // Detect connection information
  const detectConnectionInfo = useCallback((): ConnectionInfo | null => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false
    };
  }, []);

  // Battery API detection
  const detectBatteryInfo = useCallback(async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging
        };
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
    return null;
  }, []);

  // Initialize optimizations
  useEffect(() => {
    const capabilities = detectDeviceCapabilities();
    const connection = detectConnectionInfo();
    
    setDeviceCapabilities(capabilities);
    setConnectionInfo(connection);
    
    // Determine if we should optimize
    const shouldOpt = capabilities.isMobile || 
                     capabilities.isLowEndDevice ||
                     connection?.effectiveType === '2g' ||
                     connection?.effectiveType === 'slow-2g' ||
                     connection?.saveData;
    
    setShouldOptimize(shouldOpt);
    
    // Battery optimization
    detectBatteryInfo().then(battery => {
      if (battery) {
        setDeviceCapabilities(prev => prev ? {
          ...prev,
          batteryLevel: battery.level,
          isCharging: battery.charging
        } : null);
        
        // Enable low power mode if battery is low and not charging
        setIsLowPowerMode(battery.level < 0.2 && !battery.charging);
      }
    });

    // Monitor connection changes
    const handleConnectionChange = () => {
      const newConnection = detectConnectionInfo();
      setConnectionInfo(newConnection);
      
      const shouldOptimizeNow = capabilities.isMobile || 
                               capabilities.isLowEndDevice ||
                               newConnection?.effectiveType === '2g' ||
                               newConnection?.effectiveType === 'slow-2g' ||
                               newConnection?.saveData;
      
      setShouldOptimize(shouldOptimizeNow);
    };

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [detectDeviceCapabilities, detectConnectionInfo, detectBatteryInfo]);

  // Optimized image loading
  const getOptimizedImageUrl = useCallback((
    originalUrl: string,
    width?: number,
    height?: number
  ): string => {
    if (!mergedOptions.enableImageOptimizations || !shouldOptimize) {
      return originalUrl;
    }

    const params = new URLSearchParams();
    
    // Add width/height if provided
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    
    // Quality based on connection and device
    let quality = 80;
    if (connectionInfo?.effectiveType === '2g' || connectionInfo?.effectiveType === 'slow-2g') {
      quality = 50;
    } else if (deviceCapabilities?.isLowEndDevice) {
      quality = 60;
    } else if (connectionInfo?.saveData) {
      quality = 55;
    }
    
    params.set('q', quality.toString());
    
    // WebP format if supported
    if (deviceCapabilities?.supportsWebP) {
      params.set('f', 'webp');
    }
    
    // Auto format selection
    params.set('auto', 'format,compress');
    
    return `${originalUrl}?${params.toString()}`;
  }, [mergedOptions.enableImageOptimizations, shouldOptimize, connectionInfo, deviceCapabilities]);

  // Touch optimization helpers
  const optimizedTouchHandler = useCallback((
    handler: (event: TouchEvent) => void,
    options: { passive?: boolean; debounce?: boolean } = {}
  ) => {
    if (!mergedOptions.enableTouchOptimizations) {
      return handler;
    }

    return (event: TouchEvent) => {
      const now = performance.now();
      
      if (options.debounce) {
        if (now - lastTouchEnd.current < mergedOptions.touchDebounceMs!) {
          return;
        }
        lastTouchEnd.current = now;
      }
      
      // Track touch performance
      performanceMonitor.trackUserInteraction('touch_interaction', 'mobile');
      
      handler(event);
    };
  }, [mergedOptions.enableTouchOptimizations, mergedOptions.touchDebounceMs]);

  // Reduce animation/motion based on device capabilities
  const shouldReduceMotion = useCallback(() => {
    if (mergedOptions.enableReducedMotion) return true;
    if (isLowPowerMode) return true;
    if (deviceCapabilities?.isLowEndDevice) return true;
    if (connectionInfo?.effectiveType === '2g') return true;
    
    // Check user preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion;
  }, [mergedOptions.enableReducedMotion, isLowPowerMode, deviceCapabilities, connectionInfo]);

  // Adaptive rendering based on performance
  const getAdaptiveRenderingOptions = useCallback(() => {
    const options = {
      maxItems: 50,
      enableVirtualization: false,
      enableLazyLoading: true,
      reducedAnimations: shouldReduceMotion(),
      imageQuality: mergedOptions.imageQuality || 'medium'
    };

    if (deviceCapabilities?.isLowEndDevice) {
      options.maxItems = 25;
      options.enableVirtualization = true;
      options.imageQuality = 'low';
    }

    if (connectionInfo?.effectiveType === '2g' || connectionInfo?.effectiveType === 'slow-2g') {
      options.maxItems = 15;
      options.enableVirtualization = true;
      options.imageQuality = 'low';
    }

    if (connectionInfo?.saveData) {
      options.maxItems = 20;
      options.imageQuality = 'low';
    }

    if (isLowPowerMode) {
      options.maxItems = 10;
      options.enableVirtualization = true;
      options.imageQuality = 'low';
    }

    return options;
  }, [
    shouldReduceMotion,
    mergedOptions.imageQuality,
    deviceCapabilities,
    connectionInfo,
    isLowPowerMode
  ]);

  // Preload critical resources
  const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style' | 'font') => {
    // Skip preloading on slow connections or low-end devices
    if (connectionInfo?.effectiveType === '2g' || 
        connectionInfo?.effectiveType === 'slow-2g' ||
        deviceCapabilities?.isLowEndDevice) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    if (type === 'image') {
      link.href = getOptimizedImageUrl(url);
    }
    
    document.head.appendChild(link);
  }, [connectionInfo, deviceCapabilities, getOptimizedImageUrl]);

  // Intersection Observer with performance considerations
  const createOptimizedIntersectionObserver = useCallback((
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) => {
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: deviceCapabilities?.isMobile ? '50px' : '100px',
      threshold: deviceCapabilities?.isLowEndDevice ? 0.1 : 0.25,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  }, [deviceCapabilities]);

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }, []);

  // Cleanup and optimize memory
  const optimizeMemoryUsage = useCallback(() => {
    // Force garbage collection if available (development only)
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc();
    }

    // Clear image caches
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if (!(img as HTMLImageElement).complete) {
        (img as HTMLImageElement).removeAttribute('src');
      }
    });

    performanceMonitor.trackUserInteraction('memory_optimized', 'performance');
  }, []);

  return {
    // Device information
    deviceCapabilities,
    connectionInfo,
    isLowPowerMode,
    shouldOptimize,

    // Optimization utilities
    getOptimizedImageUrl,
    optimizedTouchHandler,
    shouldReduceMotion,
    getAdaptiveRenderingOptions,
    preloadResource,
    createOptimizedIntersectionObserver,

    // Memory management
    getMemoryUsage,
    optimizeMemoryUsage,

    // Conditional rendering helpers
    isMobile: deviceCapabilities?.isMobile || false,
    isLowEndDevice: deviceCapabilities?.isLowEndDevice || false,
    isSlowConnection: connectionInfo?.effectiveType === '2g' || 
                     connectionInfo?.effectiveType === 'slow-2g' || false,
    dataSaverEnabled: connectionInfo?.saveData || false
  };
};

export default useMobileOptimizations;