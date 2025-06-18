import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import { useGovernanceStore, GovernanceProposal } from '../store/governanceStore';
import { useNotifications } from '../hooks/useNotifications';
import { useSessionStore } from '../store/sessionStore';

const GovernanceProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false);
  const [pendingVote, setPendingVote] = useState<'for' | 'against' | null>(null);
  const [isSimulatingPass, setIsSimulatingPass] = useState(false);
  
  const { getProposalById, voteOnProposal, updateProposalFromSimulate } = useGovernanceStore();
  const { success, error: showError, info } = useNotifications();
  const { selectedRole } = useSessionStore();
  
  // Get proposal from store
  const proposal = getProposalById(id || '');
  
  // Redirect if proposal not found
  useEffect(() => {
    if (id && !proposal) {
      navigate('/governance');
    }
  }, [id, proposal, navigate]);
  
  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Proposal not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested proposal could not be found.</p>
          <button
            onClick={() => navigate('/governance')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Governance
          </button>
        </div>
      </div>
    );
  }

  // Mock user data - in real app this would come from wallet/auth
  const userData = {
    tokens: proposal.userVotingPower || 450,
    votingPower: proposal.userVotingPower || 450,
    estimatedDistribution: proposal.userEstimatedDistribution || (proposal.proposalType === 'dividend' ? 1125 : undefined)
  };

  const forPercentage = proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0;
  const againstPercentage = proposal.totalVotes > 0 ? (proposal.votesAgainst / proposal.totalVotes) * 100 : 0;
  const quorumPercentage = (proposal.totalVotes / proposal.quorumRequired) * 100;

  const getProposalTypeIcon = () => {
    switch (proposal.proposalType) {
      case 'dividend':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'renovation':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'sale':
        return <DollarSign className="w-6 h-6 text-red-600" />;
      case 'management':
        return <Users className="w-6 h-6 text-blue-600" />;
      case 'expansion':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      default:
        return <Vote className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleVote = (voteType: 'for' | 'against') => {
    setPendingVote(voteType);
    setShowVoteConfirmation(true);
  };

  const confirmVote = () => {
    if (pendingVote && proposal) {
      const voteSuccess = voteOnProposal(proposal.id, pendingVote, userData.votingPower);
      if (voteSuccess) {
        setShowVoteConfirmation(false);
        success(
          'Vote Submitted!', 
          `Your ${pendingVote} vote has been recorded with ${userData.votingPower} voting power.`,
          {
            actionLabel: 'View All Proposals',
            onAction: () => navigate('/governance')
          }
        );
        
        // Show additional info for dividend proposals
        if (proposal.proposalType === 'dividend' && pendingVote === 'for' && userData.estimatedDistribution) {
          setTimeout(() => {
            info(
              'Estimated Dividend',
              `If this proposal passes, you may receive approximately $${userData.estimatedDistribution.toLocaleString()} in dividend payments.`,
              { duration: 8000 }
            );
          }, 2000);
        }
      } else {
        showError(
          'Vote Failed',
          'Unable to submit your vote. You may have already voted or the proposal is no longer active.',
          {
            persistent: true,
            actionLabel: 'Contact Support',
            onAction: () => window.open('mailto:support@cf1platform.com', '_blank')
          }
        );
      }
    }
  };

  const cancelVote = () => {
    setPendingVote(null);
    setShowVoteConfirmation(false);
  };

  // Check if user has admin privileges for simulate pass
  const canSimulatePass = selectedRole === 'super_admin' || selectedRole === 'owner' || selectedRole === 'platform_admin';

  // Handle simulate pass (Admin only)
  const handleSimulatePass = async () => {
    if (!canSimulatePass) {
      showError('Access Denied', 'You do not have permission to perform this action.');
      return;
    }

    if (!proposal) return;

    setIsSimulatingPass(true);
    try {
      console.log(`🚀 Calling simulate pass API for governance proposal ${proposal.id}`);
      console.log(`🔍 Full proposal object:`, proposal);
      
      // Check if this is a user-created proposal (frontend-only)
      const isUserCreatedProposal = proposal.id.startsWith('gov_proposal_');
      
      if (isUserCreatedProposal) {
        // Handle user-created proposals locally without backend API call
        console.log('📝 User-created proposal detected, simulating locally');
        
        // Simulate adding votes to pass the proposal
        const additionalVotes = 2000;
        const additionalYesVotes = Math.ceil(additionalVotes * 0.70); // 70% yes votes
        const newTotalVotes = proposal.totalVotes + additionalVotes;
        const newYesVotes = proposal.votesFor + additionalYesVotes;
        const newNoVotes = proposal.votesAgainst + (additionalVotes - additionalYesVotes);
        
        // Update the governance store with the new status
        updateProposalFromSimulate(proposal.id, {
          status: 'passed' as GovernanceProposal['status'],
          totalVotes: newTotalVotes,
          votesFor: newYesVotes,
          votesAgainst: newNoVotes
        });
        
        console.log(`🔄 Updated governance store for user proposal ${proposal.id} with status: passed`);
        
        success(
          'Proposal Simulated to Pass!',
          `${proposal.title} now has enough votes to pass and is ready for execution.`,
          { 
            duration: 5000,
            actionLabel: 'View All Proposals',
            onAction: () => navigate('/governance')
          }
        );

        // Show additional context about what happens next
        setTimeout(() => {
          info(
            'Execution Ready',
            'The proposal has reached the required quorum and majority. It can now be executed by the governance system.',
            { duration: 8000 }
          );
        }, 2000);
        
      } else {
        // Handle backend proposals with API call
        const response = await fetch(`http://localhost:3001/api/v1/governance/proposals/${proposal.id}/admin/simulate-pass`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: Add authorization header when auth is implemented
            // 'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        const result = await response.json();
        console.log(`📋 Response data:`, result);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Proposal not found. Please refresh the page to sync with backend data.`);
          }
          throw new Error(result.error || 'Failed to simulate proposal pass');
        }
        
        console.log('✅ Simulate pass successful:', result);
        
        // Update the governance store with the new status
        updateProposalFromSimulate(proposal.id, {
          status: result.data.status as GovernanceProposal['status'],
          totalVotes: result.data.voting.totalVotes,
          votesFor: result.data.voting.yesVotes,
          votesAgainst: result.data.voting.noVotes
        });
        
        console.log(`🔄 Updated governance store for proposal ${proposal.id} with status: ${result.data.status}`);
        
        if (result.data.status === 'passed') {
          success(
            'Proposal Simulated to Pass!',
            `${proposal.title} now has enough votes to pass and is ready for execution.`,
            { 
              duration: 5000,
              actionLabel: 'View All Proposals',
              onAction: () => navigate('/governance')
            }
          );

          // Show additional context about what happens next
          setTimeout(() => {
            info(
              'Execution Ready',
              'The proposal has reached the required quorum and majority. It can now be executed by the governance system.',
              { duration: 8000 }
            );
          }, 2000);
        } else {
          info(
            'Simulation Complete',
            `The proposal simulation resulted in status: ${result.data.status}`,
            { duration: 5000 }
          );
        }
      }
    } catch (err) {
      console.error('❌ Governance simulate pass error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      showError('Simulation Failed', `Error: ${errorMessage}`);
    } finally {
      setIsSimulatingPass(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/governance')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              {getProposalTypeIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{proposal.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{proposal.assetName} • {proposal.assetType}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-3 mb-1">
            {/* Admin: Simulate Pass Button (Platform Admin/Super Admin/Owner) */}
            {canSimulatePass && proposal.status === 'active' && !proposal.userVoted && (
              <button
                onClick={handleSimulatePass}
                disabled={isSimulatingPass}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
              >
                {isSimulatingPass ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Simulating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>Admin: Simulate Pass</span>
                  </>
                )}
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.timeLeft}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
              Active Voting
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Proposal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Proposal Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{proposal.description}</p>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rationale</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{proposal.rationale}</p>
          </div>

          {/* Financial Breakdown */}
          {proposal.proposalType === 'dividend' && proposal.detailedBreakdown && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Financial Breakdown</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.detailedBreakdown.totalRevenue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Operational Expenses</p>
                  <p className="text-lg font-semibold text-red-600">-{proposal.detailedBreakdown.operationalExpenses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance Reserve</p>
                  <p className="text-lg font-semibold text-yellow-600">-{proposal.detailedBreakdown.maintenanceReserve}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available for Distribution</p>
                  <p className="text-lg font-semibold text-green-600">{proposal.detailedBreakdown.availableForDistribution}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Distribution per Token:</span>
                  <span className="text-xl font-bold text-green-600">{proposal.detailedBreakdown.distributionPerToken}</span>
                </div>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {proposal.risks && proposal.risks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Risk Factors</h2>
              <ul className="space-y-2">
                {proposal.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {proposal.timeline && proposal.timeline.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
              <div className="space-y-4">
                {proposal.timeline.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{item.event}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Voting & Stats */}
        <div className="space-y-6">
          {/* Your Holdings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Position</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your Tokens:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{(proposal.userTokens || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Voting Power:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{(proposal.userVotingPower || 0).toLocaleString()}</span>
              </div>
              {proposal.proposalType === 'dividend' && (
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Distribution:</span>
                  <span className="font-bold text-green-600">${(proposal.userEstimatedDistribution || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Voting Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cast Your Vote</h3>
            
            {proposal.userVoted ? (
              <div className="text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  proposal.userVoted === 'for' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  {proposal.userVoted === 'for' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">You voted {proposal.userVoted}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Thank you for participating in governance!
                </p>
              </div>
            ) : proposal.status === 'active' ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleVote('for')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Vote For</span>
                </button>
                <button
                  onClick={() => handleVote('against')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Vote Against</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Voting has ended</p>
              </div>
            )}
          </div>

          {/* Voting Results */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voting Results</h3>
            
            <div className="space-y-4">
              {/* For Votes */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900 dark:text-white">For ({proposal.votesFor.toLocaleString()})</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{forPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>

              {/* Against Votes */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-gray-900 dark:text-white">Against ({proposal.votesAgainst.toLocaleString()})</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{againstPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${againstPercentage}%` }}
                  />
                </div>
              </div>

              {/* Quorum Progress */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Quorum Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.min(quorumPercentage, 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quorumPercentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {proposal.totalVotes.toLocaleString()} / {proposal.quorumRequired.toLocaleString()} votes needed
                </p>
              </div>
            </div>
          </div>

          {/* Proposal Info */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proposal Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Proposed by:</span>
                <span className="font-medium text-gray-900 dark:text-white">{proposal.proposedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">{proposal.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ends:</span>
                <span className="font-medium text-gray-900 dark:text-white">{proposal.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expected Impact:</span>
                <span className="font-medium text-green-600">{proposal.impact}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Confirmation Modal */}
      {showVoteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Your Vote</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to vote <strong className={pendingVote === 'for' ? 'text-green-600' : 'text-red-600'}>
                {pendingVote}
              </strong> on this proposal? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelVote}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  pendingVote === 'for'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceProposalDetail;