import React from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, ArrowRight, Target, Calendar, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/format';

// Pie Chart Component
interface PieChartComponentProps {
  data: Array<{
    name: string;
    value: number;
    allocation: number;
    color: string;
  }>;
  size?: number;
  showLabels?: boolean;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ 
  data, 
  size = 200,
  showLabels = true 
}) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const center = size / 2;
  
  // Calculate angles for each segment
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    const endAngle = (cumulativePercentage + item.allocation) * 3.6;
    cumulativePercentage += item.allocation;
    
    // Calculate arc path
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const largeArcFlag = item.allocation > 50 ? 1 : 0;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const pathData = [
      'M', center, center,
      'L', x1, y1,
      'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      pathData,
      startAngle,
      endAngle
    };
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </g>
        ))}
        
        {/* Center circle for donut effect */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.6}
          fill="white"
          className="dark:fill-gray-800"
        />
        
        {/* Center text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-xs font-semibold fill-gray-900 dark:fill-white"
        >
          Portfolio
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="text-xs fill-gray-500 dark:fill-gray-400"
        >
          Allocation
        </text>
      </svg>
      
      {showLabels && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full max-w-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPercentage(item.allocation)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface PortfolioWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
  isEditMode?: boolean;
}

const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({ size, isEditMode = false }) => {
  const navigate = useNavigate();

  // Mock data - replace with real data from store/API
  const portfolioStats = {
    totalValue: 45650,
    totalGain: 6780,
    gainPercentage: 17.4,
    activeInvestments: 12,
    assets: [
      {
        name: 'Green Energy Fund',
        value: 15420,
        allocation: 33.8,
        gain: 2340,
        gainPercent: 17.9,
        trend: 'up',
        color: '#10B981' // green-500
      },
      {
        name: 'Tech Innovation',
        value: 12650,
        allocation: 27.7,
        gain: 1890,
        gainPercent: 17.6,
        trend: 'up',
        color: '#3B82F6' // blue-500
      },
      {
        name: 'Real Estate Portfolio',
        value: 9870,
        allocation: 21.6,
        gain: 1240,
        gainPercent: 14.4,
        trend: 'up',
        color: '#8B5CF6' // violet-500
      },
      {
        name: 'Healthcare Research',
        value: 5210,
        allocation: 11.4,
        gain: 890,
        gainPercent: 20.6,
        trend: 'up',
        color: '#F59E0B' // amber-500
      },
      {
        name: 'Sustainable Agriculture',
        value: 2500,
        allocation: 5.5,
        gain: 420,
        gainPercent: 20.2,
        trend: 'up',
        color: '#EF4444' // red-500
      }
    ]
  };

  // Prepare data for pie chart
  const pieChartData = portfolioStats.assets.map(asset => ({
    name: asset.name,
    value: asset.value,
    allocation: asset.allocation,
    color: asset.color
  }));

  const handleNavigate = () => {
    navigate('/portfolio');
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (size === 'small') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioStats.totalValue)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              +{formatPercentage(portfolioStats.gainPercentage)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (size === 'medium') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Portfolio Summary</h3>
          {!isEditMode && (
            <button 
              onClick={handleNavigate}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioStats.totalValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Gain</p>
            <p className="text-lg font-bold text-green-600">
              +{formatPercentage(portfolioStats.gainPercentage)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-center">
            <PieChartComponent 
              data={pieChartData} 
              size={120} 
              showLabels={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Large and Full size
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your investment performance and holdings</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={handleNavigate}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      <div className={`grid ${size === 'full' ? 'grid-cols-4' : 'grid-cols-2'} gap-4 mb-6`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <Wallet className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalValue)}
          </p>
          <p className="text-xs text-blue-600 mt-1">+5.2% this week</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Gain</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioStats.totalGain)}
          </p>
          <p className="text-xs text-green-600 mt-1">+{formatPercentage(portfolioStats.gainPercentage)}</p>
        </div>
        
        {size === 'full' && (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Target className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolioStats.activeInvestments}
              </p>
              <p className="text-xs text-purple-600 mt-1">Well diversified</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <PieChart className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Performer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{formatPercentage(20.6)}
              </p>
              <p className="text-xs text-orange-600 mt-1">Healthcare Research</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Asset Allocation</h4>
        <div className={`${size === 'full' ? 'grid grid-cols-2 gap-6' : 'flex flex-col'} h-full`}>
          
          {/* Pie Chart */}
          <div className={`${size === 'full' ? 'flex justify-center items-center' : 'mb-4'}`}>
            <PieChartComponent 
              data={pieChartData} 
              size={size === 'full' ? 200 : 160} 
              showLabels={size !== 'full'}
            />
          </div>
          
          {/* Asset List */}
          <div className={`${size === 'full' ? 'flex-1' : ''} space-y-3 ${size === 'full' ? 'overflow-y-auto' : ''}`}>
            {portfolioStats.assets.map((asset, index) => (
              <div 
                key={index} 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/marketplace/assets/${index + 1}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0 pr-3">
                    <div 
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: asset.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPercentage(asset.allocation)} of portfolio
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(asset.value)}
                    </p>
                    <div className="flex items-center space-x-1 justify-end">
                      {getTrendIcon(asset.trend)}
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        asset.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        +{formatCurrency(asset.gain)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${asset.allocation}%`,
                      backgroundColor: asset.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PortfolioWidget;