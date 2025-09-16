import React from 'react';
import StockLogo1 from '../../assets/StockLogo1.webp';

interface SkylineHeroProps {
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  gradientIntensity?: 'light' | 'medium' | 'dark';
}

const SkylineHero: React.FC<SkylineHeroProps> = ({ 
  children, 
  className = '', 
  overlay = true,
  gradientIntensity = 'medium'
}) => {
  const overlayClasses = {
    light: 'bg-gradient-to-b from-blue-900/20 via-blue-800/30 to-gray-900/40',
    medium: 'bg-gradient-to-b from-blue-900/40 via-blue-800/50 to-gray-900/60',
    dark: 'bg-gradient-to-b from-blue-900/60 via-blue-800/70 to-gray-900/80'
  };

  return (
    <div className={`relative min-h-[500px] bg-gradient-to-b from-blue-900 via-blue-800 to-gray-900 overflow-hidden ${className}`}>
      {/* StockLogo1 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${StockLogo1})`,
        }}
      ></div>
      
      {/* Overlay for better text readability */}
      {overlay && (
        <div className={`absolute inset-0 ${overlayClasses[gradientIntensity]}`}></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default SkylineHero;