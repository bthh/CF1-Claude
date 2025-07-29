import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useResponsiveChart } from '../../hooks/useResponsiveChart';

interface PlatformGrowthData {
  category: string;
  value: number;
  count: number;
}

interface PlatformGrowthChartProps {
  data: PlatformGrowthData[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

const categoryColors = [
  '#3b82f6', // Blue - Real Estate
  '#10b981', // Green - Renewable Energy  
  '#f59e0b', // Yellow - Collectibles
  '#8b5cf6', // Purple - Infrastructure
  '#ef4444', // Red - Technology
  '#06b6d4'  // Cyan - Agriculture
];

export const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({
  data,
  height,
  showGrid = true,
  showTooltip = true
}) => {
  const responsive = useResponsiveChart();
  const chartHeight = height || responsive.height;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Value Locked: ${data.value}M
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {data.count} assets
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

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
          />
        )}
        <XAxis 
          dataKey="category" 
          tick={{ 
            fontSize: responsive.fontSize,
            fill: 'currentColor'
          }}
          className="text-gray-600 dark:text-gray-400"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ 
            fontSize: responsive.fontSize,
            fill: 'currentColor'
          }}
          className="text-gray-600 dark:text-gray-400"
          tickFormatter={(value) => `$${value}M`}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        <Bar 
          dataKey="value" 
          radius={[4, 4, 0, 0]}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};