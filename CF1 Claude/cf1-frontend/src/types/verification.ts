// CF1 Platform - User Verification Types
// Progressive KYC and compliance tracking

export type VerificationLevel = 'anonymous' | 'basic' | 'verified' | 'accredited';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'not_started';

export interface UserProfile {
  id: string;
  walletAddress: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BasicVerification {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  marketingConsent?: boolean;
  status: VerificationStatus;
  submittedAt?: string;
  completedAt?: string;
}

export interface IdentityVerification {
  // Personal Information
  dateOfBirth: string;
  ssn: string; // Last 4 digits only
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Government ID
  idType: 'drivers_license' | 'passport' | 'state_id';
  idNumber: string;
  idExpirationDate: string;
  idFrontImage?: string; // Base64 or file ID
  idBackImage?: string;
  
  // Verification Status
  status: VerificationStatus;
  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  
  // Third-party verification
  verificationProvider?: 'jumio' | 'onfido' | 'persona';
  verificationSessionId?: string;
}

export interface AccreditedInvestorVerification {
  // Income/Net Worth Declaration
  annualIncome: number;
  netWorth: number;
  liquidNetWorth: number;
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'unemployed' | 'student';
  employer?: string;
  jobTitle?: string;
  
  // Accreditation Method
  accreditationMethod: 'income_networth' | 'professional_license' | 'investment_advisor' | 'entity';
  
  // Supporting Documentation
  supportingDocuments: {
    type: 'tax_return' | 'bank_statement' | 'investment_statement' | 'cpa_letter' | 'other';
    fileName: string;
    fileId: string;
    uploadedAt: string;
  }[];
  
  // Professional Verification (if applicable)
  professionalLicense?: {
    type: 'cpa' | 'attorney' | 'investment_advisor' | 'broker_dealer';
    licenseNumber: string;
    issuingState: string;
    expirationDate: string;
  };
  
  // Entity Information (if investing as entity)
  entityInfo?: {
    entityName: string;
    entityType: 'llc' | 'corporation' | 'partnership' | 'trust';
    entityState: string;
    ein: string;
    authorizingDocuments: string[]; // File IDs
  };
  
  status: VerificationStatus;
  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface InvestmentLimits {
  // Reg CF Investment Limits (based on income/net worth)
  annualLimit: number; // Maximum per year across all Reg CF offerings
  perOfferingLimit: number; // Maximum per individual offering
  currentYearInvested: number; // Amount already invested this year
  availableToInvest: number; // Remaining capacity
  
  // Calculation basis
  limitBasis: 'income_networth' | 'minimum' | 'accredited_unlimited';
  calculatedAt: string;
  expiresAt: string;
}

export interface ComplianceChecks {
  // Anti-Money Laundering
  amlScreening: {
    status: VerificationStatus;
    provider: 'chainalysis' | 'elliptic' | 'manual';
    checkedAt?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    flags?: string[];
  };
  
  // Office of Foreign Assets Control
  ofacScreening: {
    status: VerificationStatus;
    checkedAt?: string;
    isMatch: boolean;
    matches?: {
      name: string;
      score: number;
      listType: string;
    }[];
  };
  
  // Politically Exposed Person
  pepScreening: {
    status: VerificationStatus;
    checkedAt?: string;
    isPEP: boolean;
    pepDetails?: {
      position: string;
      country: string;
      riskLevel: 'low' | 'medium' | 'high';
    };
  };
  
  // Enhanced Due Diligence (for high-risk users)
  eddRequired: boolean;
  eddCompleted?: boolean;
  eddCompletedAt?: string;
}

export interface UserVerificationState {
  level: VerificationLevel;
  profile?: UserProfile;
  basicVerification?: BasicVerification;
  identityVerification?: IdentityVerification;
  accreditedVerification?: AccreditedInvestorVerification;
  investmentLimits?: InvestmentLimits;
  complianceChecks?: ComplianceChecks;
  
  // Permissions
  canBrowse: boolean;
  canCreateProposals: boolean;
  canInvest: boolean;
  canVote: boolean;
  
  // Next steps
  nextRequiredStep?: 'basic' | 'identity' | 'accredited' | 'compliance';
  requiredBy?: string; // ISO date when verification needed
  blockedActions: string[]; // Actions blocked until verification
}

// Verification flow step definitions
export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  estimatedTime: string; // "5 minutes", "1-2 business days"
  status: VerificationStatus;
  dependencies?: string[]; // Other steps that must be completed first
  documents?: string[]; // Required document types
  minimumLevel: VerificationLevel;
}

// Form field definitions for dynamic form generation
export interface VerificationFormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'number' | 'file' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: string; // Custom validation function name
  };
  options?: { value: string; label: string }[]; // For select/radio
  helpText?: string;
  sensitive?: boolean; // For PII fields
  fileTypes?: string[]; // For file uploads
  maxFileSize?: number; // In MB
}

export interface VerificationForm {
  id: string;
  title: string;
  description: string;
  fields: VerificationFormField[];
  submitText: string;
  level: VerificationLevel;
  step: string;
}

// Investment eligibility check result
export interface InvestmentEligibilityCheck {
  eligible: boolean;
  amount?: number;
  reason?: string;
  requiredVerificationLevel?: VerificationLevel;
  blockedUntil?: string;
  nextSteps?: string[];
  investmentLimits?: {
    maxAmount: number;
    remainingThisYear: number;
    perOfferingLimit: number;
  };
}