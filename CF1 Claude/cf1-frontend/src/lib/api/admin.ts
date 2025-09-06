/**
 * CF1 Frontend - Admin API Client
 * Real data APIs for Platform Admin functionality
 */

import { apiClient } from './client';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  fullName: string;
  role: string;
  accountStatus: string;
  kycStatus: string;
  emailVerified: boolean;
  walletAddress?: string;
  primaryAuthMethod: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KycSubmission {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  kycStatus: string;
  submittedAt: string;
  lastUpdated: string;
  documents: any[];
  notes?: string;
}

export interface KycSubmissionResponse {
  submissions: KycSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupportTicketData {
  id: string;
  subject: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
}

export interface SupportTicketResponse {
  tickets: SupportTicketData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  kycStatus?: string;
}

export interface KycSearchParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface SupportTicketSearchParams {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  priority?: string;
  category?: string;
}

export interface UserUpdateData {
  role?: string;
  accountStatus?: string;
  kycStatus?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface KycStatusUpdateData {
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

/**
 * Admin API functions for Platform Admin
 */
export const adminAPI = {
  /**
   * Get all users with search and pagination
   */
  async getUsers(params?: UserSearchParams): Promise<AdminUserResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.kycStatus) queryParams.append('kycStatus', params.kycStatus);

    const response = await apiClient.get<{ success: boolean; data: AdminUserResponse }>(
      `/api/admin/users?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch users');
    }

    return response.data.data;
  },

  /**
   * Update user details (admin only)
   */
  async updateUser(userId: string, data: UserUpdateData): Promise<AdminUser> {
    const response = await apiClient.put<{ success: boolean; data: { user: AdminUser } }>(
      `/api/admin/users/${userId}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to update user');
    }

    return response.data.data.user;
  },

  /**
   * Get KYC submissions for compliance review
   */
  async getKycSubmissions(params?: KycSearchParams): Promise<KycSubmissionResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<{ success: boolean; data: KycSubmissionResponse }>(
      `/api/admin/kyc-submissions?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch KYC submissions');
    }

    return response.data.data;
  },

  /**
   * Update KYC status
   */
  async updateKycStatus(userId: string, data: KycStatusUpdateData): Promise<KycSubmission> {
    const response = await apiClient.put<{ success: boolean; data: { submission: KycSubmission } }>(
      `/api/admin/kyc-submissions/${userId}`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to update KYC status');
    }

    return response.data.data.submission;
  },

  /**
   * Get support tickets
   */
  async getSupportTickets(params?: SupportTicketSearchParams): Promise<SupportTicketResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<{ success: boolean; data: SupportTicketResponse }>(
      `/api/admin/support-tickets?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch support tickets');
    }

    return response.data.data;
  },

  /**
   * Create a support ticket (for frontend submission)
   */
  async createSupportTicket(data: CreateSupportTicketData): Promise<SupportTicketData> {
    const response = await apiClient.post<{ success: boolean; data: { ticket: SupportTicketData } }>(
      `/api/admin/support-tickets`,
      data
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to create support ticket');
    }

    return response.data.data.ticket;
  }
};