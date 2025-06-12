// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Target, TrendingUp } from 'lucide-react';
import { InvestmentModal } from '../components/InvestmentModal';
import { useBusinessTracking } from '../hooks/useMonitoring';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInvestModal, setShowInvestModal] = useState(false);
  const { trackProposal } = useBusinessTracking();

  // Track proposal view
  useEffect(() => {
    if (id) {
      const proposalTracking = trackProposal;
      proposalTracking.viewed(id);
    }
  }, [id, trackProposal]);

  // Mock proposal data
  const proposal = {
    id: id || '1',
    asset_details: {
      name: 'Downtown Seattle Office',
      asset_type: 'Commercial Real Estate',
      category: 'Real Estate',
      location: 'Seattle, WA',
      description: 'Premium Class A office building',
    },
    financial_terms: {
      target_amount: '5000000000000',
      token_price: '1000000000',
      total_shares: 5000,
      minimum_investment: '1000000000',
      expected_apy: '12.5%',
      funding_deadline: Date.now() / 1000 + 86400 * 30,
    },
    funding_status: {
      raised_amount: '2500000000000',
      investor_count: 25,
      is_funded: false,
      tokens_minted: false,
    },
    status: 'Active',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/launchpad')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {proposal.asset_details.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {proposal.asset_details.location} • {proposal.asset_details.asset_type}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInvestModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Invest Now
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">$5.0M</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Raised</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">$2.5M</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">25</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Left</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Funding Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">50% ($2.5M of $5.0M)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Investment</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {proposal.asset_details.description}. This is a premium investment opportunity 
          in commercial real estate with strong fundamentals and experienced management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Investment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expected APY</span>
                <span className="font-medium text-green-600">{proposal.financial_terms.expected_apy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Minimum Investment</span>
                <span className="font-medium">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Token Price</span>
                <span className="font-medium">$1,000</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Highlights</h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Prime downtown location</li>
              <li>• AAA-rated tenants</li>
              <li>• 95%+ occupancy rate</li>
              <li>• Recent renovations completed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        proposal={proposal}
        onSuccess={() => {
          setShowInvestModal(false);
          // Show success message or refresh data
        }}
      />
    </div>
  );
};

export default ProposalDetail;