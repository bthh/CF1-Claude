import React from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Award,
  ArrowRight,
  Shield,
  Clock,
  Target
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useNavigate } from 'react-router-dom';

interface PlatformHighlight {
  id: string;
  title: string;
  description: string;
  metric: string;
  icon: React.ReactNode;
  color: string;
  action?: {
    label: string;
    path: string;
  };
}

const PlatformHighlights: React.FC = () => {
  const navigate = useNavigate();

  const highlights: PlatformHighlight[] = [
    {
      id: 'total_assets',
      title: 'Total Assets Under Management',
      description: 'Growing portfolio of tokenized real-world assets',
      metric: '$24.3M',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-blue-600',
      action: {
        label: 'View Portfolio',
        path: '/portfolio'
      }
    },
    {
      id: 'active_investors',
      title: 'Active Investors',
      description: 'Community of verified institutional and retail investors',
      metric: '1,247',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600',
      action: {
        label: 'Join Community',
        path: '/profile/verification'
      }
    },
    {
      id: 'avg_returns',
      title: 'Average Annual Returns',
      description: 'Platform-wide performance across all asset classes',
      metric: '12.4%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-600',
      action: {
        label: 'View Analytics',
        path: '/analytics'
      }
    },
    {
      id: 'total_raised',
      title: 'Total Capital Raised',
      description: 'Successful funding through Reg CF and private placements',
      metric: '$18.7M',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-yellow-600',
      action: {
        label: 'Browse Assets',
        path: '/launchpad'
      }
    },
    {
      id: 'success_rate',
      title: 'Funding Success Rate',
      description: 'Percentage of projects that reach funding goals',
      metric: '89%',
      icon: <Target className="w-6 h-6" />,
      color: 'text-emerald-600',
      action: {
        label: 'Success Stories',
        path: '/launchpad'
      }
    },
    {
      id: 'security_rating',
      title: 'Security & Compliance',
      description: 'Bank-grade security with full regulatory compliance',
      metric: 'AAA',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-indigo-600',
      action: {
        label: 'Learn More',
        path: '/security'
      }
    }
  ];

  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <section>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Award className="w-6 h-6 mr-3 text-yellow-500" />
              Platform Highlights
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Key metrics showcasing CF1's growth and performance in Real-World Asset tokenization
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Updated in real-time</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight) => (
          <Card
            key={highlight.id}
            className="p-6 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${highlight.color}`}>
                {highlight.icon}
              </div>

              {highlight.action && (
                <Button
                  onClick={() => handleAction(highlight.action!.path)}
                  variant="outline"
                  size="small"
                  className="text-xs px-3 py-1"
                >
                  {highlight.action.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            {/* Metric */}
            <div className="mb-3">
              <div className={`text-3xl font-bold ${highlight.color} mb-1`}>
                {highlight.metric}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {highlight.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {highlight.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Platform Status Bar */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Platform Status: All Systems Operational
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                99.9% uptime • Next maintenance: Sunday 2:00 AM EST
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlights;