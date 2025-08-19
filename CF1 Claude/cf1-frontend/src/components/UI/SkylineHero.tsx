import React from 'react';

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
      {/* Professional Skyline Background Pattern */}
      <div className="absolute inset-0">
        {/* City skyline silhouette using CSS */}
        <div className="absolute bottom-0 left-0 right-0 h-48">
          {/* Background buildings */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            {/* Building 1 */}
            <div className="absolute bottom-0 left-[5%] w-12 h-32 bg-gray-800/60 transform rotate-0"></div>
            <div className="absolute bottom-32 left-[6%] w-8 h-12 bg-gray-700/40"></div>
            
            {/* Building 2 */}
            <div className="absolute bottom-0 left-[12%] w-16 h-40 bg-gray-800/70"></div>
            <div className="absolute bottom-40 left-[14%] w-10 h-16 bg-gray-700/50"></div>
            
            {/* Building 3 - Tallest */}
            <div className="absolute bottom-0 left-[20%] w-20 h-56 bg-gray-800/80"></div>
            <div className="absolute bottom-56 left-[22%] w-12 h-20 bg-gray-700/60"></div>
            <div className="absolute bottom-76 left-[24%] w-6 h-8 bg-yellow-400/80"></div>
            
            {/* Building 4 */}
            <div className="absolute bottom-0 left-[30%] w-14 h-36 bg-gray-800/65"></div>
            <div className="absolute bottom-36 left-[31%] w-10 h-14 bg-gray-700/45"></div>
            
            {/* Building 5 */}
            <div className="absolute bottom-0 left-[38%] w-18 h-44 bg-gray-800/75"></div>
            <div className="absolute bottom-44 left-[40%] w-12 h-18 bg-gray-700/55"></div>
            
            {/* Building 6 */}
            <div className="absolute bottom-0 left-[48%] w-16 h-38 bg-gray-800/68"></div>
            
            {/* Building 7 - Second tallest */}
            <div className="absolute bottom-0 left-[55%] w-22 h-52 bg-gray-800/82"></div>
            <div className="absolute bottom-52 left-[57%] w-14 h-16 bg-gray-700/62"></div>
            
            {/* Building 8 */}
            <div className="absolute bottom-0 left-[65%] w-15 h-42 bg-gray-800/70"></div>
            
            {/* Building 9 */}
            <div className="absolute bottom-0 left-[72%] w-13 h-34 bg-gray-800/60"></div>
            <div className="absolute bottom-34 left-[73%] w-9 h-12 bg-gray-700/40"></div>
            
            {/* Building 10 */}
            <div className="absolute bottom-0 left-[80%] w-17 h-46 bg-gray-800/75"></div>
            <div className="absolute bottom-46 left-[82%] w-11 h-15 bg-gray-700/55"></div>
            
            {/* Building 11 */}
            <div className="absolute bottom-0 left-[88%] w-14 h-30 bg-gray-800/65"></div>
            
            {/* Building 12 */}
            <div className="absolute bottom-0 left-[94%] w-12 h-28 bg-gray-800/60"></div>
          </div>
          
          {/* Window lights scattered across buildings */}
          <div className="absolute inset-0">
            {/* Building 1 windows */}
            <div className="absolute bottom-8 left-[6.5%] w-1 h-1 bg-yellow-300/90"></div>
            <div className="absolute bottom-16 left-[7.5%] w-1 h-1 bg-yellow-300/70"></div>
            <div className="absolute bottom-24 left-[6.5%] w-1 h-1 bg-yellow-300/80"></div>
            
            {/* Building 2 windows */}
            <div className="absolute bottom-12 left-[14%] w-1 h-1 bg-yellow-300/85"></div>
            <div className="absolute bottom-20 left-[15.5%] w-1 h-1 bg-yellow-300/75"></div>
            <div className="absolute bottom-28 left-[14%] w-1 h-1 bg-yellow-300/90"></div>
            <div className="absolute bottom-36 left-[15.5%] w-1 h-1 bg-yellow-300/65"></div>
            
            {/* Building 3 windows (tallest) */}
            <div className="absolute bottom-16 left-[22%] w-1 h-1 bg-yellow-300/90"></div>
            <div className="absolute bottom-24 left-[24%] w-1 h-1 bg-yellow-300/80"></div>
            <div className="absolute bottom-32 left-[22%] w-1 h-1 bg-yellow-300/85"></div>
            <div className="absolute bottom-40 left-[24%] w-1 h-1 bg-yellow-300/75"></div>
            <div className="absolute bottom-48 left-[22%] w-1 h-1 bg-yellow-300/70"></div>
            <div className="absolute bottom-56 left-[24%] w-1 h-1 bg-yellow-300/90"></div>
            
            {/* Building 5 windows */}
            <div className="absolute bottom-14 left-[40%] w-1 h-1 bg-yellow-300/85"></div>
            <div className="absolute bottom-22 left-[41.5%] w-1 h-1 bg-yellow-300/75"></div>
            <div className="absolute bottom-30 left-[40%] w-1 h-1 bg-yellow-300/80"></div>
            <div className="absolute bottom-38 left-[41.5%] w-1 h-1 bg-yellow-300/70"></div>
            
            {/* Building 7 windows (second tallest) */}
            <div className="absolute bottom-18 left-[57%] w-1 h-1 bg-yellow-300/90"></div>
            <div className="absolute bottom-26 left-[59%] w-1 h-1 bg-yellow-300/80"></div>
            <div className="absolute bottom-34 left-[57%] w-1 h-1 bg-yellow-300/85"></div>
            <div className="absolute bottom-42 left-[59%] w-1 h-1 bg-yellow-300/75"></div>
            <div className="absolute bottom-50 left-[57%] w-1 h-1 bg-yellow-300/70"></div>
            
            {/* Building 10 windows */}
            <div className="absolute bottom-15 left-[82%] w-1 h-1 bg-yellow-300/85"></div>
            <div className="absolute bottom-23 left-[83.5%] w-1 h-1 bg-yellow-300/75"></div>
            <div className="absolute bottom-31 left-[82%] w-1 h-1 bg-yellow-300/80"></div>
            <div className="absolute bottom-39 left-[83.5%] w-1 h-1 bg-yellow-300/70"></div>
          </div>
        </div>
        
        {/* Stars in the sky */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[15%] w-0.5 h-0.5 bg-white/80 rounded-full"></div>
          <div className="absolute top-[20%] left-[25%] w-0.5 h-0.5 bg-white/60 rounded-full"></div>
          <div className="absolute top-[15%] left-[45%] w-0.5 h-0.5 bg-white/90 rounded-full"></div>
          <div className="absolute top-[25%] left-[65%] w-0.5 h-0.5 bg-white/70 rounded-full"></div>
          <div className="absolute top-[12%] left-[80%] w-0.5 h-0.5 bg-white/85 rounded-full"></div>
          <div className="absolute top-[30%] left-[35%] w-0.5 h-0.5 bg-white/75 rounded-full"></div>
          <div className="absolute top-[18%] left-[55%] w-0.5 h-0.5 bg-white/65 rounded-full"></div>
          <div className="absolute top-[28%] left-[85%] w-0.5 h-0.5 bg-white/80 rounded-full"></div>
        </div>
      </div>
      
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