import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';
import { useDemoModeStore } from './demoModeStore';
import { cleanupDraftFiles } from '../utils/draftFileStorage';

export interface SubmittedProposal {
  id: string;
  submissionDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'draft';
  source?: 'local' | 'backend'; // Track whether this is a local draft/submission or backend proposal
  createdBy?: string;
  
  // Asset Details
  assetName: string;
  assetType: string;
  category: string;
  location: string;
  description: string;
  
  // Financial Terms
  targetAmount: string;
  tokenPrice: string;
  minimumInvestment: string;
  expectedAPY: string;
  fundingDeadline: string;
  
  // Documentation (file names only for display)
  businessPlan?: string;
  financialProjections?: string;
  legalDocuments?: string;
  assetValuation?: string;
  
  // Additional Info
  riskFactors: string;
  useOfFunds: string;
  
  // Review info
  reviewComments?: string;
  reviewDate?: string;
  estimatedReviewDate?: string;
  
  // Funding status (for approved proposals)
  fundingStatus?: {
    raisedAmount: number;
    raisedPercentage: number;
    investorCount: number;
    isFunded: boolean;
    status: 'active' | 'funded' | 'upcoming';
  };
}

// Data validation helper for submissions
const validateSubmissionData = (submission: Partial<SubmittedProposal>): SubmittedProposal => {
  return {
    ...submission,
    // Ensure all required string fields have valid defaults
    id: submission.id || '',
    submissionDate: submission.submissionDate || new Date().toISOString(),
    status: submission.status || 'submitted', // Default to 'submitted' instead of 'draft'
    source: submission.source || 'local', // Default to local if not specified
    assetName: submission.assetName || '',
    assetType: submission.assetType || '',
    category: submission.category || '',
    location: submission.location || '',
    description: submission.description || '',
    targetAmount: submission.targetAmount || '0',
    tokenPrice: submission.tokenPrice || '0',
    minimumInvestment: submission.minimumInvestment || '0',
    expectedAPY: submission.expectedAPY || '0',
    fundingDeadline: submission.fundingDeadline || '',
    riskFactors: submission.riskFactors || '',
    useOfFunds: submission.useOfFunds || '',
    estimatedReviewDate: submission.estimatedReviewDate || ''
  } as SubmittedProposal;
};

interface SubmissionState {
  submissions: SubmittedProposal[];
  
  // Actions
  addSubmission: (proposal: Omit<SubmittedProposal, 'id' | 'submissionDate' | 'status'>) => { success: boolean; proposalId?: string; error?: string };
  addBackendProposalReference: (backendProposalId: string, originalData: Partial<SubmittedProposal>) => void;
  saveDraft: (proposal: Omit<SubmittedProposal, 'id' | 'submissionDate' | 'status'>) => string;
  submitDraft: (draftId: string) => { success: boolean; proposalId?: string; error?: string };
  updateDraft: (draftId: string, proposalData: Partial<SubmittedProposal>) => void;
  deleteDraft: (draftId: string) => void;
  getDrafts: () => SubmittedProposal[];
  getLocalSubmissions: () => SubmittedProposal[];
  getBackendReferences: () => SubmittedProposal[];
  updateSubmissionStatus: (id: string, status: SubmittedProposal['status'], comments?: string) => void;
  updateFundingStatus: (id: string, fundingStatus: SubmittedProposal['fundingStatus']) => void;
  saveReviewComments: (id: string, comments: string) => void;
  getSubmissionById: (id: string) => SubmittedProposal | undefined;
  getSubmissionsByStatus: (status: SubmittedProposal['status']) => SubmittedProposal[];
  removeSubmission: (id: string) => void;
  refreshDataForDemoMode: () => void;
}

// Add some mock data for testing
const mockSubmissions: SubmittedProposal[] = [
  {
    id: 'proposal_1701234567890_abc123',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'under_review',
    assetName: 'Downtown Seattle Office Building',
    assetType: 'Commercial Real Estate',
    category: 'Commercial Real Estate',
    location: 'Seattle, WA',
    description: 'Premium Class A office building in downtown Seattle with high-quality tenants and excellent location.',
    targetAmount: '5,000,000',
    tokenPrice: '1000',
    minimumInvestment: '500',
    expectedAPY: '8.5',
    fundingDeadline: '2024-12-31',
    businessPlan: 'business_plan_seattle_office.pdf',
    financialProjections: 'financial_projections_seattle.pdf',
    legalDocuments: 'legal_docs_seattle.pdf',
    assetValuation: 'valuation_report_seattle.pdf',
    riskFactors: 'Commercial real estate market volatility, tenant vacancy risk, interest rate changes.',
    useOfFunds: 'Property acquisition, renovation, operational capital, and marketing.',
    estimatedReviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proposal_1701234567890_def456',
    submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'approved',
    assetName: 'Luxury Manhattan Apartment Complex',
    assetType: 'Residential Real Estate',
    category: 'Residential Real Estate',
    location: 'Manhattan, NY',
    description: 'High-end residential complex in prime Manhattan location with luxury amenities.',
    targetAmount: '12,500,000',
    tokenPrice: '2500',
    minimumInvestment: '1000',
    expectedAPY: '7.2',
    fundingDeadline: '2024-11-30',
    businessPlan: 'business_plan_manhattan_apt.pdf',
    financialProjections: 'financial_projections_manhattan.pdf',
    legalDocuments: 'legal_docs_manhattan.pdf',
    assetValuation: 'valuation_report_manhattan.pdf',
    riskFactors: 'NYC real estate market fluctuations, rent control regulations, high maintenance costs.',
    useOfFunds: 'Property acquisition, luxury renovations, amenity upgrades, and reserve funds.',
    reviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewComments: 'Excellent proposal with strong financials and market positioning. Approved for launch.',
    fundingStatus: {
      raisedAmount: 6250000, // 50% funded
      raisedPercentage: 50,
      investorCount: 42,
      isFunded: false,
      status: 'active'
    }
  },
  {
    id: 'proposal_1701234567890_ghi789',
    submissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    status: 'changes_requested',
    assetName: 'Industrial Warehouse Portfolio',
    assetType: 'Industrial Real Estate',
    category: 'Industrial Real Estate',
    location: 'Phoenix, AZ',
    description: 'Portfolio of 5 industrial warehouses with long-term lease agreements.',
    targetAmount: '8,750,000',
    tokenPrice: '500',
    minimumInvestment: '250',
    expectedAPY: '9.1',
    fundingDeadline: '2025-01-15',
    businessPlan: 'business_plan_phoenix_warehouse.pdf',
    financialProjections: 'financial_projections_phoenix.pdf',
    legalDocuments: 'legal_docs_phoenix.pdf',
    assetValuation: 'valuation_report_phoenix.pdf',
    riskFactors: 'Industrial market demand, tenant concentration risk, economic downturns.',
    useOfFunds: 'Portfolio acquisition, facility improvements, working capital, and debt service.',
    reviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviewComments: 'Please provide additional environmental impact assessments and updated tenant agreements for properties 3 and 4.'
  },
  {
    id: 'proposal_1701234567890_jkl012',
    submissionDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    status: 'approved',
    assetName: 'Miami Beach Luxury Hotel',
    assetType: 'Hospitality Real Estate',
    category: 'Hospitality Real Estate',
    location: 'Miami Beach, FL',
    description: 'Oceanfront luxury boutique hotel with 150 rooms, spa, and multiple dining venues.',
    targetAmount: '25,000,000',
    tokenPrice: '5000',
    minimumInvestment: '2500',
    expectedAPY: '9.8',
    fundingDeadline: '2024-12-15',
    businessPlan: 'business_plan_miami_hotel.pdf',
    financialProjections: 'financial_projections_miami.pdf',
    legalDocuments: 'legal_docs_miami.pdf',
    assetValuation: 'valuation_report_miami.pdf',
    riskFactors: 'Tourism market volatility, seasonal occupancy fluctuations, hurricane risk.',
    useOfFunds: 'Hotel acquisition, luxury renovations, marketing campaign, and operational reserves.',
    reviewDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviewComments: 'Outstanding hospitality investment opportunity with strong market fundamentals. Fully approved.',
    fundingStatus: {
      raisedAmount: 25000000, // 100% funded
      raisedPercentage: 100,
      investorCount: 156,
      isFunded: true,
      status: 'funded'
    }
  }
];

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set, get) => ({
      submissions: useDemoModeStore.getState().isDemoMode() 
        ? mockSubmissions.map(submission => validateSubmissionData(submission))
        : [], // Empty array in development mode

      addSubmission: (proposalData) => {
        try {
          // Validate required fields
          if (!proposalData.assetName || !proposalData.description || !proposalData.targetAmount) {
            return { success: false, error: 'Missing required proposal data' };
          }

          const id = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const submissionDate = new Date().toISOString();
          
          // Calculate estimated review date (3-5 business days)
          const estimatedReviewDate = new Date();
          estimatedReviewDate.setDate(estimatedReviewDate.getDate() + 4); // 4 business days
          
          const submissionBase = {
            id,
            submissionDate,
            estimatedReviewDate: estimatedReviewDate.toISOString(),
            ...proposalData,
            status: 'submitted' as const, // Set status AFTER spreading proposalData to ensure it's not overridden
            source: 'local' as const, // Mark as local submission (fallback case)
          };
          
          const newSubmission = validateSubmissionData(submissionBase);

          set((state) => ({
            submissions: [newSubmission, ...state.submissions]
          }));

          return { success: true, proposalId: id };
        } catch (error) {
          console.error('Error submitting proposal:', error);
          return { success: false, error: 'Failed to submit proposal. Please try again.' };
        }
      },

      addBackendProposalReference: (backendProposalId, originalData) => {
        // Create a reference entry for the backend proposal
        const reference: SubmittedProposal = {
          id: backendProposalId,
          submissionDate: new Date().toISOString(),
          status: 'under_review', // Backend proposals start in review
          source: 'backend',
          estimatedReviewDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          // Use provided data or defaults
          assetName: originalData.assetName || 'Backend Proposal',
          assetType: originalData.assetType || '',
          category: originalData.category || '',
          location: originalData.location || '',
          description: originalData.description || '',
          targetAmount: originalData.targetAmount || '0',
          tokenPrice: originalData.tokenPrice || '0',
          minimumInvestment: originalData.minimumInvestment || '0',
          expectedAPY: originalData.expectedAPY || '0',
          fundingDeadline: originalData.fundingDeadline || '',
          riskFactors: originalData.riskFactors || '',
          useOfFunds: originalData.useOfFunds || ''
        };

        set((state) => ({
          submissions: [reference, ...state.submissions]
        }));

        console.log('📋 [SUBMISSION STORE] Added backend proposal reference:', backendProposalId);
      },

      saveDraft: (proposalData) => {
        const id = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const submissionDate = new Date().toISOString();
        
        const newDraft: SubmittedProposal = {
          id,
          submissionDate,
          status: 'draft',
          source: 'local', // Drafts are always local
          estimatedReviewDate: '',
          ...proposalData
        };

        set((state) => ({
          submissions: [newDraft, ...state.submissions]
        }));

        return id;
      },

      submitDraft: (draftId) => {
        try {
          const submissions = get().submissions;
          const draftIndex = submissions.findIndex(s => s.id === draftId && s.status === 'draft');
          
          if (draftIndex === -1) {
            return { success: false, error: 'Draft not found' };
          }

          const draft = submissions[draftIndex];
          
          // Validate required fields
          if (!draft.assetName || !draft.description || !draft.targetAmount) {
            return { success: false, error: 'Missing required proposal data' };
          }

          const newId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const estimatedReviewDate = new Date();
          estimatedReviewDate.setDate(estimatedReviewDate.getDate() + 4);
          
          const submittedProposal: SubmittedProposal = {
            ...draft,
            id: newId,
            status: 'submitted',
            source: 'local', // Draft converted to local submission (fallback case)
            submissionDate: new Date().toISOString(),
            estimatedReviewDate: estimatedReviewDate.toISOString()
          };

          set((state) => ({
            submissions: [
              submittedProposal,
              ...state.submissions.filter(s => s.id !== draftId)
            ]
          }));

          return { success: true, proposalId: newId };
        } catch (error) {
          console.error('Error submitting draft:', error);
          return { success: false, error: 'Failed to submit draft. Please try again.' };
        }
      },

      updateDraft: (draftId, proposalData) => {
        set((state) => ({
          submissions: state.submissions.map((submission) =>
            submission.id === draftId && submission.status === 'draft'
              ? { ...submission, ...proposalData }
              : submission
          )
        }));
      },

      deleteDraft: (draftId) => {
        // Clean up stored files for this draft
        try {
          cleanupDraftFiles(draftId);
        } catch (error) {
          console.error('Error cleaning up draft files:', error);
        }
        
        set((state) => ({
          submissions: state.submissions.filter(s => s.id !== draftId)
        }));
      },

      getDrafts: () => {
        return get().submissions.filter(s => s.status === 'draft');
      },

      getLocalSubmissions: () => {
        return get().submissions.filter(s => s.source === 'local' && s.status !== 'draft');
      },

      getBackendReferences: () => {
        return get().submissions.filter(s => s.source === 'backend');
      },

      updateSubmissionStatus: (id, status, comments) => {
        const proposal = get().getSubmissionById(id);
        
        set((state) => ({
          submissions: state.submissions.map((submission) =>
            submission.id === id
              ? {
                  ...submission,
                  status,
                  reviewComments: comments,
                  reviewDate: new Date().toISOString()
                }
              : submission
          )
        }));

        // Trigger notifications based on status change
        if (proposal) {
          switch (status) {
            case 'approved':
              notificationService.onProposalApproved(id, proposal.assetName);
              break;
            case 'rejected':
              notificationService.onProposalRejected(id, proposal.assetName, comments);
              break;
            case 'changes_requested':
              notificationService.onChangesRequested(id, proposal.assetName, comments || 'Please review and make necessary changes.');
              break;
          }
        }
      },

      updateFundingStatus: (id, fundingStatus) => {
        console.log(`🔄 Updating funding status for submission ${id}:`, fundingStatus);
        
        set((state) => ({
          submissions: state.submissions.map((submission) =>
            submission.id === id
              ? {
                  ...submission,
                  fundingStatus,
                  // Update the main status field if it's funded
                  status: fundingStatus?.isFunded ? 'approved' : submission.status
                }
              : submission
          )
        }));
        
        console.log(`✅ Funding status updated for submission ${id}`);
      },

      getSubmissionById: (id) => {
        return get().submissions.find((submission) => submission.id === id);
      },

      getSubmissionsByStatus: (status) => {
        return get().submissions.filter((submission) => submission.status === status);
      },

      removeSubmission: (id) => {
        set((state) => ({
          submissions: state.submissions.filter((submission) => submission.id !== id)
        }));
      },

      saveReviewComments: (id, comments) => {
        set((state) => ({
          submissions: state.submissions.map((submission) =>
            submission.id === id
              ? {
                  ...submission,
                  reviewComments: comments,
                  reviewDate: new Date().toISOString()
                  // Note: Status remains unchanged - only saving comments
                }
              : submission
          )
        }));
      },

      refreshDataForDemoMode: () => {
        set(() => ({
          submissions: useDemoModeStore.getState().isDemoMode() 
            ? mockSubmissions.map(submission => validateSubmissionData(submission))
            : [] // Clear all submissions in development mode
        }));
        console.log('🔄 Submissions store refreshed for demo mode change');
      }
    }),
    {
      name: 'cf1-submissions',
      // Only persist essential data
      partialize: (state) => ({
        submissions: state.submissions
      })
    }
  )
);