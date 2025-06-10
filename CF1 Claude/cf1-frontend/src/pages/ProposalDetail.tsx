import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Target, TrendingUp, Calendar, MapPin, Shield, FileText, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

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

  const proposal = {
    id: id || '1',
    title: 'Downtown Seattle Office Building',
    description: 'Prime commercial real estate in the heart of Seattle\'s business district. This Class A office building features modern amenities, sustainable design, and is fully leased with AAA-rated tenants on long-term contracts. The property generates stable rental income with built-in escalation clauses.',
    fullDescription: `This exceptional office building represents a rare opportunity to invest in premium commercial real estate in one of the most desirable business districts in the Pacific Northwest. 

The 15-story building features:
• 180,000 square feet of leasable space
• State-of-the-art HVAC and electrical systems
• LEED Gold certification for sustainability
• Recently renovated lobby and common areas
• Dedicated parking garage with 150 spaces
• Premium location with easy access to public transportation

Current tenant mix includes established companies with strong credit ratings, ensuring stable and predictable rental income. The property has maintained 95%+ occupancy rates over the past 5 years.`,
    category: 'Commercial Real Estate',
    location: 'Seattle, WA',
    targetAmount: '$3,200,000',
    raisedAmount: '$2,100,000',
    raisedPercentage: 66,
    backers: 127,
    daysLeft: 12,
    expectedAPY: '9.2%',
    minimumInvestment: '$500',
    totalShares: 32000,
    pricePerShare: '$100',
    status: 'active' as const,
    creator: {
      name: 'Pacific Realty Partners',
      rating: 4.8,
      totalRaised: '$45.2M',
      successRate: 94,
      established: 2018
    },
    documents: [
      { name: 'Property Appraisal Report', type: 'PDF', size: '2.4 MB' },
      { name: 'Financial Projections', type: 'Excel', size: '1.1 MB' },
      { name: 'Tenant Lease Agreements', type: 'PDF', size: '8.7 MB' },
      { name: 'Environmental Assessment', type: 'PDF', size: '3.2 MB' }
    ],
    riskFactors: [
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
  };

  const handleInvest = () => {
    if (!investmentAmount) return;
    setShowInvestModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/launchpad')}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{proposal.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-secondary-600">
            <span className="bg-secondary-100 px-3 py-1 rounded-full text-sm">{proposal.category}</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{proposal.location}</span>
            </div>
            <span className="bg-success-100 text-success-800 text-sm px-3 py-1 rounded-full">Active</span>
          </div>
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
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-secondary-100 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop" 
              alt={proposal.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          <div id="about" className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">About This Investment</h2>
            <p className="text-secondary-700 mb-4">{proposal.description}</p>
            <div className="prose max-w-none text-secondary-700">
              {proposal.fullDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          <div id="highlights" className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Key Highlights</h2>
            <div className="space-y-3">
              {proposal.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="creators" className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Creator Profile</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {proposal.creator.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">{proposal.creator.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-secondary-600">Rating</p>
                    <p className="font-semibold text-secondary-900">{proposal.creator.rating}/5.0</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Total Raised</p>
                    <p className="font-semibold text-secondary-900">{proposal.creator.totalRaised}</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Success Rate</p>
                    <p className="font-semibold text-success-600">{proposal.creator.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Est.</p>
                    <p className="font-semibold text-secondary-900">{proposal.creator.established}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="documents" className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Documents & Disclosures</h2>
            <div className="space-y-3">
              {proposal.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-secondary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">{doc.name}</p>
                      <p className="text-sm text-secondary-600">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                    <span>Download</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div id="risks" className="card p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Risk Factors</h2>
            <div className="space-y-3">
              {proposal.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 sticky top-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-900">{proposal.raisedPercentage}%</div>
                <div className="text-secondary-600">of target raised</div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-secondary-200 rounded-full h-3">
                  <div 
                    className="bg-primary-600 h-3 rounded-full" 
                    style={{ width: `${proposal.raisedPercentage}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-600">Target</p>
                    <p className="font-semibold text-secondary-900">{proposal.targetAmount}</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Raised</p>
                    <p className="font-semibold text-secondary-900">{proposal.raisedAmount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-secondary-200">
                  <div className="flex items-center space-x-1 text-secondary-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{proposal.backers} backers</span>
                  </div>
                  <div className="flex items-center space-x-1 text-secondary-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{proposal.daysLeft} days left</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-secondary-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-600">Expected APY</p>
                    <p className="font-semibold text-success-600 text-lg">{proposal.expectedAPY}</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Share Price</p>
                    <p className="font-semibold text-secondary-900 text-lg">{proposal.pricePerShare}</p>
                  </div>
                </div>

                <div>
                  <p className="text-secondary-600 text-sm mb-2">Minimum Investment: {proposal.minimumInvestment}</p>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Investment amount ($)"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="input"
                      min={parseInt(proposal.minimumInvestment.replace(/[^0-9]/g, ''))}
                    />
                    <button 
                      onClick={handleInvest}
                      disabled={!investmentAmount || parseInt(investmentAmount) < parseInt(proposal.minimumInvestment.replace(/[^0-9]/g, ''))}
                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary-200 text-xs text-secondary-600 space-y-1">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>SEC Reg CF Compliant</span>
                  </div>
                  <p>This investment is subject to a 12-month lock-up period as required by regulation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">Confirm Investment</h3>
            <div className="space-y-4">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-600">Investment Amount</span>
                  <span className="font-semibold text-secondary-900">${investmentAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-600">Shares</span>
                  <span className="font-semibold text-secondary-900">{Math.floor(parseInt(investmentAmount) / 100)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Expected Annual Return</span>
                  <span className="font-semibold text-success-600">${Math.round(parseInt(investmentAmount) * 0.092)}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 btn-outline py-3"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowInvestModal(false);
                    alert('Investment submitted! You will receive confirmation shortly.');
                  }}
                  className="flex-1 btn-primary py-3"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalDetail;