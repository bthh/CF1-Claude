import { useState, useEffect, useRef, useCallback } from 'react';

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
  isGesturing: boolean;
}

interface UseGesturesOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', gesture: GestureState) => void;
  onSwipeLeft?: (gesture: GestureState) => void;
  onSwipeRight?: (gesture: GestureState) => void;
  onSwipeUp?: (gesture: GestureState) => void;
  onSwipeDown?: (gesture: GestureState) => void;
  onPinch?: (scale: number, gesture: any) => void;
  onTap?: (gesture: GestureState) => void;
  onDoubleTap?: (gesture: GestureState) => void;
  onLongPress?: (gesture: GestureState) => void;
  longPressDelay?: number;
  preventDefault?: boolean;
}

export const useGestures = (options: UseGesturesOptions = {}) => {
  const {
    threshold = 50,
    velocityThreshold = 0.5,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    longPressDelay = 500,
    preventDefault = true
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    direction: null,
    distance: 0,
    velocity: 0,
    isGesturing: false
  });

  const startTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const touchesRef = useRef<TouchList | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);

  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const calculateDirection = useCallback((deltaX: number, deltaY: number) => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const getPinchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return calculateDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
  }, [calculateDistance]);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const now = Date.now();
    
    startTimeRef.current = now;
    touchesRef.current = e.touches;

    const newState: GestureState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      direction: null,
      distance: 0,
      velocity: 0,
      isGesturing: true
    };

    setGestureState(newState);

    // Handle pinch start
    if (e.touches.length === 2) {
      initialPinchDistanceRef.current = getPinchDistance(e.touches);
    }

    // Handle long press
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress(newState);
      }, longPressDelay);
    }

    // Handle double tap detection
    if (onDoubleTap) {
      const timeDiff = now - lastTapTimeRef.current;
      if (timeDiff < 300) {
        tapCountRef.current += 1;
      } else {
        tapCountRef.current = 1;
      }
      lastTapTimeRef.current = now;
    }
  }, [preventDefault, onLongPress, onDoubleTap, longPressDelay, getPinchDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const now = Date.now();
    const timeDiff = now - startTimeRef.current;

    // Clear long press if finger moves
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    setGestureState(prevState => {
      const deltaX = touch.clientX - prevState.startX;
      const deltaY = touch.clientY - prevState.startY;
      const distance = calculateDistance(prevState.startX, prevState.startY, touch.clientX, touch.clientY);
      const velocity = timeDiff > 0 ? distance / timeDiff : 0;
      const direction = calculateDirection(deltaX, deltaY);

      return {
        ...prevState,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        distance,
        velocity,
        direction
      };
    });

    // Handle pinch
    if (e.touches.length === 2 && onPinch) {
      const currentPinchDistance = getPinchDistance(e.touches);
      if (initialPinchDistanceRef.current > 0) {
        const scale = currentPinchDistance / initialPinchDistanceRef.current;
        onPinch(scale, { touches: e.touches, scale });
      }
    }
  }, [preventDefault, calculateDistance, calculateDirection, onPinch, getPinchDistance]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    setGestureState(prevState => {
      const finalState = { ...prevState, isGesturing: false };

      // Handle swipe detection
      if (prevState.distance > threshold && prevState.velocity > velocityThreshold) {
        const direction = prevState.direction;
        
        if (direction) {
          onSwipe?.(direction, finalState);
          
          switch (direction) {
            case 'left':
              onSwipeLeft?.(finalState);
              break;
            case 'right':
              onSwipeRight?.(finalState);
              break;
            case 'up':
              onSwipeUp?.(finalState);
              break;
            case 'down':
              onSwipeDown?.(finalState);
              break;
          }
        }
      }
      // Handle tap
      else if (prevState.distance < threshold) {
        if (onDoubleTap && tapCountRef.current === 2) {
          onDoubleTap(finalState);
          tapCountRef.current = 0;
        } else if (onTap && tapCountRef.current === 1) {
          // Delay tap to check for double tap
          setTimeout(() => {
            if (tapCountRef.current === 1) {
              onTap(finalState);
              tapCountRef.current = 0;
            }
          }, 300);
        }
      }

      return finalState;
    });

    // Reset pinch distance
    initialPinchDistanceRef.current = 0;
    touchesRef.current = null;
  }, [preventDefault, threshold, velocityThreshold, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap]);

  const bindGestures = useCallback(() => {
    return {
      onTouchStart: (e: React.TouchEvent) => handleTouchStart(e),
      onTouchMove: (e: React.TouchEvent) => handleTouchMove(e),
      onTouchEnd: (e: React.TouchEvent) => handleTouchEnd(e),
      style: { touchAction: 'none' }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState,
    bindGestures
  };
};

// Hook specifically for swipe navigation
export const useSwipeNavigation = (
  onNavigateLeft?: () => void,
  onNavigateRight?: () => void,
  options: { threshold?: number; enabled?: boolean } = {}
) => {
  const { threshold = 100, enabled = true } = options;

  const { bindGestures } = useGestures({
    threshold,
    onSwipeLeft: enabled ? onNavigateLeft : undefined,
    onSwipeRight: enabled ? onNavigateRight : undefined
  });

  return { bindGestures };
};

// Hook for pull-to-refresh
export const usePullToRefresh = (
  onRefresh: () => void | Promise<void>,
  options: { threshold?: number; enabled?: boolean } = {}
) => {
  const { threshold = 100, enabled = true } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { gestureState, bindGestures } = useGestures({
    threshold,
    onSwipeDown: enabled ? async (gesture) => {
      if (gesture.distance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    } : undefined
  });

  return {
    isRefreshing,
    pullDistance: gestureState.deltaY > 0 ? gestureState.deltaY : 0,
    bindGestures
  };
};

// Hook for dismissible modals/panels
export const useSwipeToDismiss = (
  onDismiss: () => void,
  options: { direction?: 'up' | 'down' | 'left' | 'right'; threshold?: number; enabled?: boolean } = {}
) => {
  const { direction = 'down', threshold = 150, enabled = true } = options;

  const gestureOptions: UseGesturesOptions = {
    threshold,
    onSwipeUp: enabled && direction === 'up' ? onDismiss : undefined,
    onSwipeDown: enabled && direction === 'down' ? onDismiss : undefined,
    onSwipeLeft: enabled && direction === 'left' ? onDismiss : undefined,
    onSwipeRight: enabled && direction === 'right' ? onDismiss : undefined
  };

  const { gestureState, bindGestures } = useGestures(gestureOptions);

  const dismissProgress = enabled ? Math.min(
    Math.abs(direction === 'up' || direction === 'down' ? gestureState.deltaY : gestureState.deltaX) / threshold,
    1
  ) : 0;

  return {
    dismissProgress,
    bindGestures
  };
};

// Hook for card stack gestures (like Tinder)
export const useCardStack = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: { threshold?: number; rotationFactor?: number; enabled?: boolean } = {}
) => {
  const { threshold = 100, rotationFactor = 0.1, enabled = true } = options;

  const { gestureState, bindGestures } = useGestures({
    threshold,
    onSwipeLeft: enabled ? onSwipeLeft : undefined,
    onSwipeRight: enabled ? onSwipeRight : undefined
  });

  const cardStyle = enabled ? {
    transform: `translateX(${gestureState.deltaX}px) rotate(${gestureState.deltaX * rotationFactor}deg)`,
    opacity: 1 - Math.abs(gestureState.deltaX) / (threshold * 2)
  } : {};

  return {
    cardStyle,
    isGesturing: gestureState.isGesturing,
    bindGestures
  };
};