import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Target, TrendingUp, Calendar, MapPin, Shield, FileText, AlertCircle, CheckCircle, ExternalLink, Wallet, Activity, BarChart3 } from 'lucide-react';
import { useCosmJS, useProposal } from '../hooks/useCosmJS';
import { InvestmentModal } from '../components/InvestmentModal';
import { WalletConnection } from '../components/WalletConnection';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [refreshKey, setRefreshKey] = useState(0);

  // Blockchain integration
  const { isConnected, formatAmount, error: cosmjsError } = useCosmJS();
  const { proposal: blockchainProposal, loading, error, refetch } = useProposal(id || '');

  // Auto-open investment modal if invest=true in URL
  useEffect(() => {
    const shouldInvest = searchParams.get('invest') === 'true';
    if (shouldInvest) {
      setShowInvestModal(true);
      // Remove the query parameter after opening the modal
      setSearchParams(prev => {
        prev.delete('invest');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const sections = ['about', 'highlights', 'creators', 'documents', 'risks'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.1
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  // Mock data for development (used when blockchain data is not available)
  const mockProposal = {
    id: id || '1',
    asset_details: {
      name: 'Downtown Seattle Office Building',
      asset_type: 'Commercial Real Estate',
      category: 'Commercial Real Estate',
      location: 'Seattle, WA',
      description: 'Prime commercial real estate in the heart of Seattle\'s business district. This Class A office building features modern amenities, sustainable design, and is fully leased with AAA-rated tenants on long-term contracts.',
      full_description: `This exceptional office building represents a rare opportunity to invest in premium commercial real estate in one of the most desirable business districts in the Pacific Northwest. 

The 15-story building features:
• 180,000 square feet of leasable space
• State-of-the-art HVAC and electrical systems
• LEED Gold certification for sustainability
• Recently renovated lobby and common areas
• Dedicated parking garage with 150 spaces
• Premium location with easy access to public transportation

Current tenant mix includes established companies with strong credit ratings, ensuring stable and predictable rental income. The property has maintained 95%+ occupancy rates over the past 5 years.`,
      risk_factors: [
        'Commercial real estate values may fluctuate based on market conditions',
        'Tenant vacancy could impact rental income',
        'Interest rate changes may affect property valuations',
        'Economic downturns could reduce demand for office space'
      ],
      highlights: [
        'Prime downtown location with high foot traffic',
        'Stable tenant base with long-term contracts',
        'Recent renovations increase property value',
        'Sustainable LEED Gold certification',
        'Professional property management team'
      ]
    },
    financial_terms: {
      target_amount: '3200000000000', // In micro units
      token_price: '100000000', // In micro units
      total_shares: 32000,
      minimum_investment: '500000000', // In micro units
      expected_apy: '9.2%',
      funding_deadline: Math.floor(Date.now() / 1000) + (12 * 24 * 60 * 60) // 12 days from now
    },
    funding_status: {
      total_raised: '2100000000000', // In micro units
      investor_count: 127,
      is_funded: false
    },
    creator: {
      name: 'Pacific Realty Partners',
      address: 'neutron1...',
      rating: 4.8,
      totalRaised: '$45.2M',
      successRate: 94,
      established: 2018
    },
    documents: [
      { name: 'Property Appraisal Report', doc_type: 'PDF', size: '2.4 MB', hash: 'QmHash1' },
      { name: 'Financial Projections', doc_type: 'Excel', size: '1.1 MB', hash: 'QmHash2' },
      { name: 'Tenant Lease Agreements', doc_type: 'PDF', size: '8.7 MB', hash: 'QmHash3' },
      { name: 'Environmental Assessment', doc_type: 'PDF', size: '3.2 MB', hash: 'QmHash4' }
    ],
    status: 'Active' as const,
    timestamps: {
      created_at: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
      updated_at: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // 1 day ago
    },
    compliance: {
      kyc_required: true,
      accredited_only: false,
      max_investors: 500,
      compliance_notes: ['SEC Regulation CF Compliant', '12-month lockup period required']
    }
  };

  // Use blockchain data if available, otherwise fall back to mock data
  const proposal = blockchainProposal || mockProposal;

  // Calculate derived values
  const targetAmount = proposal?.financial_terms?.target_amount ? 
    parseFloat(formatAmount(proposal.financial_terms.target_amount)) : 3200000;
  const raisedAmount = proposal?.funding_status?.total_raised ? 
    parseFloat(formatAmount(proposal.funding_status.total_raised)) : 2100000;
  const raisedPercentage = targetAmount > 0 ? Math.round((raisedAmount / targetAmount) * 100) : 66;
  const daysLeft = proposal?.financial_terms?.funding_deadline ? 
    Math.max(0, Math.ceil((proposal.financial_terms.funding_deadline - Date.now() / 1000) / (24 * 60 * 60))) : 12;

  const handleInvest = () => {
    setShowInvestModal(true);
  };

  const handleInvestmentSuccess = () => {
    // Refresh proposal data after successful investment
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !proposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Proposal
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Unable to fetch proposal data from blockchain'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {(error || cosmjsError) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                Using Mock Data
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                Unable to connect to blockchain. Showing sample proposal data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/launchpad')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {proposal?.asset_details?.name || 'Unknown Proposal'}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                {proposal?.asset_details?.category || 'Unknown Category'}
              </span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{proposal?.asset_details?.location || 'Unknown Location'}</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                proposal?.status === 'Active' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {proposal?.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Refresh Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              blockchainProposal ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {blockchainProposal ? 'Live Data' : 'Mock Data'}
            </span>
          </div>
          
          {blockchainProposal && (
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Activity className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          )}
          
          {proposal?.timestamps?.updated_at && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Updated {new Date(proposal.timestamps.updated_at * 1000).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-secondary-200">
        <div className="flex space-x-8 px-6 py-4 overflow-x-auto">
          {[
            { id: 'about', label: 'About' },
            { id: 'highlights', label: 'Highlights' },
            { id: 'creators', label: 'Creators' },
            { id: 'documents', label: 'Documents' },
            { id: 'risks', label: 'Risks' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop" 
              alt={proposal.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          <div id="about" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Investment</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {proposal?.asset_details?.description || 'No description available'}
            </p>
            <div className="prose max-w-none text-gray-700 dark:text-gray-300">
              {(proposal?.asset_details?.full_description || proposal?.asset_details?.description || '')
                .split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          <div id="highlights" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Highlights</h2>
            <div className="space-y-3">
              {(proposal?.asset_details?.highlights || []).map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="creators" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Creator Profile</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                  {(proposal?.creator?.name || 'Unknown').split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {proposal?.creator?.name || 'Unknown Creator'}
                </h3>
                {proposal?.creator?.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {proposal.creator.address.slice(0, 20)}...
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  {proposal?.creator?.rating && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Rating</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {proposal.creator.rating}/5.0
                      </p>
                    </div>
                  )}
                  {proposal?.creator?.totalRaised && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Raised</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {proposal.creator.totalRaised}
                      </p>
                    </div>
                  )}
                  {proposal?.creator?.successRate && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="font-semibold text-green-600">
                        {proposal.creator.successRate}%
                      </p>
                    </div>
                  )}
                  {proposal?.creator?.established && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Est.</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {proposal.creator.established}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div id="documents" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documents & Disclosures</h2>
            <div className="space-y-3">
              {(proposal?.documents || []).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.doc_type || doc.type} • {doc.size}
                      </p>
                      {doc.hash && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          IPFS: {doc.hash.slice(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1">
                    <span>Download</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div id="risks" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Risk Factors</h2>
            <div className="space-y-3">
              {(proposal?.asset_details?.risk_factors || []).map((risk, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wallet Connection Card */}
          {!isConnected && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Connect Wallet to Invest
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Connect your wallet to participate in this investment opportunity
                </p>
                <WalletConnection />
              </div>
            </div>
          )}

          {/* Investment Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{raisedPercentage}%</div>
                <div className="text-gray-600 dark:text-gray-400">of target raised</div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      raisedPercentage >= 100 
                        ? 'bg-green-500' 
                        : raisedPercentage >= 75 
                        ? 'bg-blue-500' 
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(raisedPercentage, 100)}%` }}
                  ></div>
                  {raisedPercentage >= 100 && (
                    <div className="absolute right-2 top-0 h-3 flex items-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Funding milestones */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className={raisedPercentage >= 25 ? 'text-blue-600 font-medium' : ''}>25%</span>
                  <span className={raisedPercentage >= 50 ? 'text-blue-600 font-medium' : ''}>50%</span>
                  <span className={raisedPercentage >= 75 ? 'text-blue-600 font-medium' : ''}>75%</span>
                  <span className={raisedPercentage >= 100 ? 'text-green-600 font-medium' : ''}>100%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Target</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Raised</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${raisedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {proposal?.funding_status?.investor_count || 0} investors
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{daysLeft} days left</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Expected APY</p>
                    <p className="font-semibold text-green-600 text-lg">
                      {proposal?.financial_terms?.expected_apy || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Token Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      ${proposal?.financial_terms?.token_price ? 
                        formatAmount(proposal.financial_terms.token_price) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Minimum Investment: ${proposal?.financial_terms?.minimum_investment ? 
                      formatAmount(proposal.financial_terms.minimum_investment) : 'N/A'}
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleInvest}
                      disabled={!isConnected || proposal?.status !== 'Active'}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isConnected && proposal?.status === 'Active'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {!isConnected 
                        ? 'Connect Wallet to Invest'
                        : proposal?.status !== 'Active'
                        ? 'Investment Not Available'
                        : 'Invest Now'
                      }
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>SEC Reg CF Compliant</span>
                  </div>
                  <p>This investment is subject to a 12-month lock-up period as required by regulation.</p>
                  {proposal?.compliance?.compliance_notes?.map((note, index) => (
                    <p key={index}>• {note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        proposal={proposal}
        onSuccess={handleInvestmentSuccess}
      />
    </div>
  );
};

export default ProposalDetail;