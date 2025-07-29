import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSwipeToDismiss, useGestures } from '../../hooks/useGestures';

interface SwipeableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  swipeToClose?: boolean;
  showCloseButton?: boolean;
  maxHeight?: string;
  className?: string;
}

export const SwipeableModal: React.FC<SwipeableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  swipeToClose = true,
  showCloseButton = true,
  maxHeight = '90vh',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const { dismissProgress, bindGestures } = useSwipeToDismiss(
    onClose,
    { direction: 'down', threshold: 150, enabled: swipeToClose }
  );

  const modalVariants = {
    hidden: {
      y: '100%',
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    },
    exit: {
      y: '100%',
      opacity: 0
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{
              opacity: 1 - dismissProgress * 0.5
            }}
          />

          {/* Modal */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl z-50 ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            style={{
              transform: `translateY(${dismissProgress * 150}px)`,
              maxHeight
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            {...(swipeToClose ? bindGestures() : {})}
          >
            {/* Drag Handle */}
            {swipeToClose && (
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  disabled = false
}) => {
  const { gestureState, bindGestures } = useGestures({
    onSwipeLeft: disabled ? undefined : onSwipeLeft,
    onSwipeRight: disabled ? undefined : onSwipeRight,
    onSwipeUp: disabled ? undefined : onSwipeUp,
    onSwipeDown: disabled ? undefined : onSwipeDown,
    threshold: 100
  });

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transform: disabled ? 'none' : `translate(${gestureState.deltaX}px, ${gestureState.deltaY}px)`,
        opacity: disabled ? 1 : Math.max(0.5, 1 - Math.abs(gestureState.deltaX) / 200)
      }}
      animate={{
        transform: gestureState.isGesturing ? undefined : 'translate(0px, 0px)',
        opacity: gestureState.isGesturing ? undefined : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...(disabled ? {} : bindGestures())}
    >
      {children}
      
      {/* Swipe indicators */}
      {!disabled && gestureState.isGesturing && (
        <>
          {gestureState.deltaX > 50 && (
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Accept
            </div>
          )}
          {gestureState.deltaX < -50 && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Reject
            </div>
          )}
          {gestureState.deltaY > 50 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Info
            </div>
          )}
          {gestureState.deltaY < -50 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Favorite
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

// Pull to refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 100,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { gestureState, bindGestures } = useGestures({
    onSwipeDown: async (gesture) => {
      if (gesture.distance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    },
    threshold
  });

  const pullDistance = Math.max(0, gestureState.deltaY);
  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div className={`relative overflow-hidden ${className}`} {...bindGestures()}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: refreshProgress
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        ) : refreshProgress > 0.8 ? (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Release to refresh
          </span>
        ) : (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Pull to refresh
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: gestureState.isGesturing ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Swipeable tabs
interface SwipeableTabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  const { bindGestures } = useGestures({
    onSwipeLeft: () => {
      if (currentIndex < tabs.length - 1) {
        onTabChange(tabs[currentIndex + 1].id);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        onTabChange(tabs[currentIndex - 1].id);
      }
    },
    threshold: 50
  });

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              tab.id === activeTab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="relative overflow-hidden" {...bindGestures()}>
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {tabs.map((tab) => (
            <div key={tab.id} className="w-full flex-shrink-0">
              {tab.content}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};