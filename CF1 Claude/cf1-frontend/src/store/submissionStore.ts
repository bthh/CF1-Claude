import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubmittedProposal {
  id: string;
  submissionDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'draft';
  
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
}

// Data validation helper for submissions
const validateSubmissionData = (submission: Partial<SubmittedProposal>): SubmittedProposal => {
  return {
    ...submission,
    // Ensure all required string fields have valid defaults
    id: submission.id || '',
    submissionDate: submission.submissionDate || new Date().toISOString(),
    status: submission.status || 'draft',
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
  saveDraft: (proposal: Omit<SubmittedProposal, 'id' | 'submissionDate' | 'status'>) => string;
  submitDraft: (draftId: string) => { success: boolean; proposalId?: string; error?: string };
  updateDraft: (draftId: string, proposalData: Partial<SubmittedProposal>) => void;
  deleteDraft: (draftId: string) => void;
  getDrafts: () => SubmittedProposal[];
  updateSubmissionStatus: (id: string, status: SubmittedProposal['status'], comments?: string) => void;
  getSubmissionById: (id: string) => SubmittedProposal | undefined;
  getSubmissionsByStatus: (status: SubmittedProposal['status']) => SubmittedProposal[];
  removeSubmission: (id: string) => void;
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
    reviewComments: 'Excellent proposal with strong financials and market positioning. Approved for launch.'
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
  }
];

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set, get) => ({
      submissions: mockSubmissions.map(submission => validateSubmissionData(submission)),

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
            status: 'submitted' as const,
            estimatedReviewDate: estimatedReviewDate.toISOString(),
            ...proposalData
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

      saveDraft: (proposalData) => {
        const id = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const submissionDate = new Date().toISOString();
        
        const newDraft: SubmittedProposal = {
          id,
          submissionDate,
          status: 'draft',
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
        set((state) => ({
          submissions: state.submissions.filter(s => s.id !== draftId)
        }));
      },

      getDrafts: () => {
        return get().submissions.filter(s => s.status === 'draft');
      },

      updateSubmissionStatus: (id, status, comments) => {
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