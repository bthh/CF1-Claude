import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  skeleton?: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  delay?: number;
  className?: string;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  loading = false,
  skeleton,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  className = ''
}) => {
  const [showContent, setShowContent] = useState(!loading);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowContent(true), delay * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [loading, delay]);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { x: -50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 50, opacity: 0 }
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    },
    slideUp: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 }
    },
    slideDown: {
      initial: { y: -50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 }
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {loading ? (
          skeleton ? (
            <motion.div
              key="skeleton"
              {...variants[type]}
              transition={{ duration }}
            >
              {skeleton}
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              {...variants[type]}
              transition={{ duration }}
              className="flex items-center justify-center py-8"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </motion.div>
          )
        ) : showContent ? (
          <motion.div
            key="content"
            {...variants[type]}
            transition={{ duration }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

// Staggered children animation
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.1,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.4 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Button press animation
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-200 font-medium rounded-xl';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <motion.button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileTap={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

// Number counter animation
interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const change = value - startValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (change * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// Progress bar with animation
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  animated?: boolean;
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  showLabel = false,
  color = 'blue',
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} ${animated ? 'animate-pulse' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {showLabel && (
        <motion.div
          className="absolute top-0 right-0 transform -translate-y-6 text-xs font-medium text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage.toFixed(1)}%
        </motion.div>
      )}
    </div>
  );
};