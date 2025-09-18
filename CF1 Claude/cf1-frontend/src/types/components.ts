// CF1 Platform - Component Props Type Definitions
// Strict TypeScript for React component interfaces

import React from 'react';
import {
  InvestmentProposal,
  InvestmentAmount,
  FinancialTransaction,
  PortfolioPosition,
  InvestmentEligibilityResult
} from './financial';
import { UserVerificationState, VerificationLevel } from './verification';
import { UserAnalytics, ChartData, TimeSeriesData } from './analytics';
import { AssetTier } from './tiers';

/**
 * Base component props
 */
export interface BaseComponentProps {
  readonly className?: string;
  readonly testId?: string;
  readonly children?: React.ReactNode;
}

/**
 * Modal component base props
 */
export interface BaseModalProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  readonly closeOnOverlay?: boolean;
  readonly closeOnEscape?: boolean;
}

/**
 * Investment Modal Props - Critical Financial Component
 */
export interface InvestmentModalProps extends BaseModalProps {
  readonly proposal: InvestmentProposal;
  readonly onSuccess?: (transaction: FinancialTransaction) => void;
  readonly onError?: (error: Error) => void;
  readonly maxInvestmentAmount?: InvestmentAmount;
  readonly userVerificationLevel: VerificationLevel;
  readonly eligibilityCheck?: InvestmentEligibilityResult;
}

/**
 * Investment Form Data - Strict validation required
 */
export interface InvestmentFormData {
  readonly amount: InvestmentAmount;
  readonly acceptedTerms: boolean;
  readonly acceptedRisks: boolean;
  readonly accreditedInvestor: boolean;
  readonly verificationLevel: VerificationLevel;
  readonly investmentMethod: 'wallet' | 'bank_transfer' | 'credit_card';
  readonly agreedToLockup: boolean;
}

/**
 * Investment Form Props
 */
export interface InvestmentFormProps extends BaseComponentProps {
  readonly proposal: InvestmentProposal;
  readonly onSubmit: (data: InvestmentFormData) => Promise<void>;
  readonly isSubmitting: boolean;
  readonly maxAmount?: InvestmentAmount;
  readonly minAmount?: InvestmentAmount;
  readonly eligibilityResult?: InvestmentEligibilityResult;
  readonly verificationState: UserVerificationState;
}

/**
 * Portfolio Component Props
 */
export interface PortfolioOverviewProps extends BaseComponentProps {
  readonly positions: readonly PortfolioPosition[];
  readonly totalValue: InvestmentAmount;
  readonly totalGain: InvestmentAmount;
  readonly gainPercent: number;
  readonly isLoading: boolean;
  readonly onAssetClick?: (assetId: string) => void;
  readonly onRefresh?: () => Promise<void>;
}

/**
 * Asset Card Props - Critical for financial display
 */
export interface AssetCardProps extends BaseComponentProps {
  readonly position: PortfolioPosition;
  readonly onClick?: () => void;
  readonly onInvest?: () => void;
  readonly showActions?: boolean;
  readonly variant?: 'compact' | 'detailed' | 'minimal';
}

/**
 * Proposal Card Props
 */
export interface ProposalCardProps extends BaseComponentProps {
  readonly proposal: InvestmentProposal;
  readonly onClick?: () => void;
  readonly onInvest?: () => void;
  readonly showInvestButton?: boolean;
  readonly featured?: boolean;
  readonly userEligibility?: InvestmentEligibilityResult;
}

/**
 * Transaction History Props
 */
export interface TransactionHistoryProps extends BaseComponentProps {
  readonly transactions: readonly FinancialTransaction[];
  readonly isLoading: boolean;
  readonly onTransactionClick?: (transaction: FinancialTransaction) => void;
  readonly onLoadMore?: () => Promise<void>;
  readonly hasMore?: boolean;
  readonly filter?: {
    readonly type?: FinancialTransaction['type'];
    readonly status?: FinancialTransaction['status'];
    readonly dateRange?: {
      readonly start: string;
      readonly end: string;
    };
  };
}

/**
 * Chart Component Props - Financial data visualization
 */
export interface FinancialChartProps extends BaseComponentProps {
  readonly data: readonly TimeSeriesData[];
  readonly type: 'line' | 'bar' | 'area' | 'pie';
  readonly title?: string;
  readonly height?: number;
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly currency?: string;
  readonly onDataPointClick?: (point: TimeSeriesData) => void;
  readonly responsive?: boolean;
}

/**
 * Performance Metrics Props
 */
export interface PerformanceMetricsProps extends BaseComponentProps {
  readonly analytics: UserAnalytics;
  readonly period: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  readonly onPeriodChange?: (period: string) => void;
  readonly showComparisons?: boolean;
  readonly benchmarkData?: readonly TimeSeriesData[];
}

/**
 * Verification Gate Props - Security critical
 */
export interface VerificationGateProps extends BaseComponentProps {
  readonly requiredLevel: VerificationLevel;
  readonly currentLevel: VerificationLevel;
  readonly onVerificationStart?: () => void;
  readonly onVerificationComplete?: (level: VerificationLevel) => void;
  readonly blockingMode?: boolean;
  readonly customMessage?: string;
}

/**
 * Admin Components Props
 */
export interface AdminUserTableProps extends BaseComponentProps {
  readonly users: readonly AdminUser[];
  readonly onUserEdit?: (user: AdminUser) => void;
  readonly onUserDelete?: (userId: string) => void;
  readonly onUserCreate?: () => void;
  readonly isLoading?: boolean;
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly onPageChange: (page: number) => void;
  };
}

export interface AdminUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: 'super_admin' | 'platform_admin' | 'creator_admin';
  readonly permissions: readonly string[];
  readonly isActive: boolean;
  readonly lastLoginAt?: string;
  readonly createdAt: string;
}

/**
 * Form Field Props - Reusable form components
 */
export interface FormFieldProps extends BaseComponentProps {
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly helperText?: string;
  readonly autoComplete?: string;
  readonly pattern?: string;
  readonly min?: string | number;
  readonly max?: string | number;
  readonly step?: string | number;
}

/**
 * Amount Input Props - Critical for financial inputs
 */
export interface AmountInputProps extends BaseComponentProps {
  readonly value: InvestmentAmount;
  readonly onChange: (amount: InvestmentAmount) => void;
  readonly currency?: string;
  readonly precision?: number;
  readonly min?: InvestmentAmount;
  readonly max?: InvestmentAmount;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly helperText?: string;
  readonly showCurrencySelect?: boolean;
  readonly supportedCurrencies?: readonly string[];
}

/**
 * Data Table Props - Generic table component
 */
export interface DataTableProps<T> extends BaseComponentProps {
  readonly data: readonly T[];
  readonly columns: readonly TableColumn<T>[];
  readonly onRowClick?: (row: T) => void;
  readonly onSort?: (column: string, direction: 'asc' | 'desc') => void;
  readonly sortBy?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly onPageChange: (page: number) => void;
    readonly onLimitChange: (limit: number) => void;
  };
}

export interface TableColumn<T> {
  readonly key: string;
  readonly title: string;
  readonly render?: (value: unknown, row: T) => React.ReactNode;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly align?: 'left' | 'center' | 'right';
}

/**
 * Search and Filter Props
 */
export interface SearchFilterProps extends BaseComponentProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly filters: readonly FilterOption[];
  readonly activeFilters: Record<string, unknown>;
  readonly onFilterChange: (key: string, value: unknown) => void;
  readonly onClearFilters: () => void;
  readonly placeholder?: string;
  readonly showAdvancedFilters?: boolean;
}

export interface FilterOption {
  readonly key: string;
  readonly label: string;
  readonly type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  readonly options?: readonly { value: string; label: string }[];
  readonly min?: number;
  readonly max?: number;
}

/**
 * Notification Props
 */
export interface NotificationProps extends BaseComponentProps {
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly dismissible?: boolean;
  readonly onDismiss?: () => void;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

/**
 * Loading State Props
 */
export interface LoadingStateProps extends BaseComponentProps {
  readonly isLoading: boolean;
  readonly message?: string;
  readonly spinner?: boolean;
  readonly skeleton?: boolean;
  readonly overlay?: boolean;
}

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps extends BaseComponentProps {
  readonly fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  readonly resetOnPropsChange?: boolean;
}

/**
 * Button Props - Enhanced with financial context
 */
export interface ButtonProps extends BaseComponentProps {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly icon?: React.ReactNode;
  readonly fullWidth?: boolean;
  readonly href?: string;
  readonly target?: string;
  readonly financialAction?: boolean; // Special styling for financial operations
}

/**
 * Type guards for component props validation
 */
export const ComponentTypeGuards = {
  isValidInvestmentFormData: (data: unknown): data is InvestmentFormData => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'amount' in data &&
      'acceptedTerms' in data &&
      'acceptedRisks' in data &&
      'verificationLevel' in data
    );
  },

  isValidProposal: (proposal: unknown): proposal is InvestmentProposal => {
    return (
      typeof proposal === 'object' &&
      proposal !== null &&
      'id' in proposal &&
      'basicInfo' in proposal &&
      'financialTerms' in proposal &&
      'fundingStatus' in proposal
    );
  },

  isValidTransaction: (transaction: unknown): transaction is FinancialTransaction => {
    return (
      typeof transaction === 'object' &&
      transaction !== null &&
      'id' in transaction &&
      'type' in transaction &&
      'amount' in transaction &&
      'timestamp' in transaction
    );
  },
} as const;

/**
 * Default props for common components
 */
export const DefaultProps = {
  modal: {
    size: 'md' as const,
    closeOnOverlay: true,
    closeOnEscape: true,
  },

  button: {
    variant: 'primary' as const,
    size: 'md' as const,
    type: 'button' as const,
  },

  table: {
    sortDirection: 'asc' as const,
    emptyMessage: 'No data available',
  },

  chart: {
    type: 'line' as const,
    height: 300,
    showLegend: true,
    showGrid: true,
    responsive: true,
  },
} as const;