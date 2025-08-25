import React from 'react';
import { Crown, Award, Medal, Star, Shield, Gem } from 'lucide-react';
import { AssetTier } from '../../types/tiers';

interface TierBadgeProps {
  tier: AssetTier;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const TIER_ICONS: Record<string, any> = {
  diamond: Gem,
  platinum: Award,
  gold: Medal,
  silver: Star,
  bronze: Shield
};

const TierBadge: React.FC<TierBadgeProps> = ({ 
  tier, 
  size = 'md', 
  showName = false,
  className = '' 
}) => {
  const TierIcon = TIER_ICONS[tier.name.toLowerCase()] || Star;
  
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'space-x-1'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'space-x-2'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'space-x-2'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div 
      className={`
        inline-flex items-center ${styles.gap} ${styles.container} 
        rounded-full font-medium transition-all
        ${className}
      `}
      style={{ 
        backgroundColor: tier.colorScheme?.primary || '#F3F4F6',
        color: tier.colorScheme?.secondary || '#6B7280'
      }}
    >
      <TierIcon className={styles.icon} />
      {showName && <span>{tier.name}</span>}
    </div>
  );
};

export default TierBadge;