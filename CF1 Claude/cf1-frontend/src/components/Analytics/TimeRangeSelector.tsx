import React from 'react';
import { Calendar } from 'lucide-react';
import { AnalyticsFilter } from '../../types/analytics';

interface TimeRangeSelectorProps {
  selected: AnalyticsFilter['timeRange'];
  onChange: (timeRange: AnalyticsFilter['timeRange']) => void;
  className?: string;
}

const timeRangeOptions: Array<{
  value: AnalyticsFilter['timeRange'];
  label: string;
  description: string;
}> = [
  { value: '24h', label: '24H', description: 'Last 24 hours' },
  { value: '7d', label: '7D', description: 'Last 7 days' },
  { value: '30d', label: '30D', description: 'Last 30 days' },
  { value: '90d', label: '3M', description: 'Last 3 months' },
  { value: '1y', label: '1Y', description: 'Last year' },
  { value: 'all', label: 'ALL', description: 'All time' }
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selected,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${
                selected === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};