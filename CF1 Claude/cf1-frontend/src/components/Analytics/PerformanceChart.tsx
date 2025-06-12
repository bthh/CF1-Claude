import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useResponsiveChart } from '../../hooks/useResponsiveChart';

interface PerformanceChartProps {
  data: Array<{ name: string; value: number; timestamp?: string }>;
  height?: number;
  color?: string;
  type?: 'line' | 'area';
  showGrid?: boolean;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  height,
  color = '#3b82f6',
  type = 'area',
  showGrid = true,
  showTooltip = true,
  formatValue = (value) => `$${value.toFixed(2)}M`
}) => {
  const responsive = useResponsiveChart();
  const chartHeight = height || responsive.height;
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Value: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg" 
        style={{ height: chartHeight }}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data} margin={responsive.margin}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          {showGrid && <CartesianGrid {...responsive.getGridConfig()} />}
          
          <XAxis 
            dataKey="name" 
            {...responsive.getAxisConfig()}
            hide={responsive.isMobile && !responsive.showLabels}
          />
          
          <YAxis 
            {...responsive.getAxisConfig()}
            tickFormatter={responsive.isMobile ? undefined : formatValue}
            width={responsive.isMobile ? 30 : 60}
          />
          
          {showTooltip && <Tooltip {...responsive.getTooltipConfig()} content={<CustomTooltip />} />}
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={responsive.isMobile ? 1.5 : 2}
            fill={`url(#${gradientId})`}
            dot={responsive.isMobile ? false : { fill: color, strokeWidth: 2, r: 3 }}
            activeDot={{ 
              r: responsive.isMobile ? 4 : 6, 
              stroke: color, 
              strokeWidth: 2, 
              fill: '#ffffff' 
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <LineChart data={data} margin={responsive.margin}>
        {showGrid && <CartesianGrid {...responsive.getGridConfig()} />}
        
        <XAxis 
          dataKey="name" 
          {...responsive.getAxisConfig()}
          hide={responsive.isMobile && !responsive.showLabels}
        />
        
        <YAxis 
          {...responsive.getAxisConfig()}
          tickFormatter={responsive.isMobile ? undefined : formatValue}
          width={responsive.isMobile ? 30 : 60}
        />
        
        {showTooltip && <Tooltip {...responsive.getTooltipConfig()} content={<CustomTooltip />} />}
        
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={responsive.isMobile ? 2 : 3}
          dot={responsive.isMobile ? false : { fill: color, strokeWidth: 2, r: 3 }}
          activeDot={{ 
            r: responsive.isMobile ? 4 : 6, 
            stroke: color, 
            strokeWidth: 2, 
            fill: '#ffffff' 
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};