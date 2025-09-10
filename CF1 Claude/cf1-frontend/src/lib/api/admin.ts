/**
 * CF1 Frontend - Admin API Client
 * Real data APIs for Platform Admin functionality
 */

import { apiClient } from './client';
import { getAuthHeaders } from '../../store/unifiedAuthStore';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  walletAddress?: string;
  phoneNumber?: string;
  notes?: string;
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
   * Get all users with search and pagination (both admin and regular users)
   */
  async getUsers(params?: UserSearchParams): Promise<AdminUserResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.kycStatus) queryParams.append('kycStatus', params.kycStatus);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const authHeaders = getAuthHeaders();
    
    console.log('🔍 AdminAPI - Fetching ALL users via unified endpoint:', {
      baseUrl,
      hasAuthToken: !!authHeaders.Authorization
    });

    // Use the new comprehensive backend endpoint that returns both admin and regular users
    const url = `${baseUrl}/api/admin/users/all-users?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      console.log('🔍 AdminAPI - Unified endpoint success:', {
        totalUsers: data.summary?.totalUsers || data.users?.length || 0,
        adminUsers: data.summary?.adminUsers || 0,
        regularUsers: data.summary?.regularUsers || 0,
        userTypes: data.users?.map((u: any) => ({ email: u.email, userType: u.userType })) || []
      });

      // Transform users to match AdminUserResponse interface (data is already properly formatted by backend)
      return {
        users: data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          permissions: user.permissions || [],
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          walletAddress: user.walletAddress,
          phoneNumber: user.phoneNumber,
          notes: user.notes,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          total: data.summary?.totalUsers || data.users?.length || 0,
          totalPages: Math.ceil((data.summary?.totalUsers || data.users?.length || 0) / (params?.limit || 50))
        }
      };
      
    } catch (error) {
      console.error('🔍 AdminAPI - Unified endpoint error:', error);
      throw new Error('Failed to fetch all users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  /**
   * Update user details (admin only)
   */
  async updateUser(userId: string, data: UserUpdateData): Promise<AdminUser> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/admin/users/${userId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to update user');
    }

    return responseData.data.user;
  },

  /**
   * Get KYC submissions for compliance review
   */
  async getKycSubmissions(params?: KycSearchParams): Promise<KycSubmissionResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/admin/kyc-submissions?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch KYC submissions');
    }

    return data.data;
  },

  /**
   * Update KYC status
   */
  async updateKycStatus(userId: string, data: KycStatusUpdateData): Promise<KycSubmission> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/admin/kyc-submissions/${userId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to update KYC status');
    }

    return responseData.data.submission;
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

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/admin/support-tickets?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch support tickets');
    }

    return data.data;
  },

  /**
   * Get regular platform users (registered via auth system)
   */
  async getRegularUsers(params?: UserSearchParams): Promise<AdminUserResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    // Try different possible endpoints for regular users
    const possibleEndpoints = [
      '/api/auth/users',
      '/api/users', 
      '/api/admin/regular-users',
      '/api/admin/platform-users'
    ];

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    for (const endpoint of possibleEndpoints) {
      try {
        const url = `${baseUrl}${endpoint}?${queryParams.toString()}`;
        
        console.log('🔍 Trying regular users endpoint:', endpoint);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Regular users endpoint success:', endpoint, data);
          
          // Transform response to match AdminUserResponse format
          if (data.success && data.users) {
            return {
              users: data.users.map((user: any) => ({
                id: user.id,
                email: user.email,
                username: user.username || user.email?.split('@')[0] || 'user',
                name: user.name || user.displayName || user.username || 'User',
                role: user.role || 'user',
                permissions: user.permissions || [],
                isActive: user.isActive !== false, // Default to true if not specified
                lastLoginAt: user.lastLoginAt,
                walletAddress: user.walletAddress,
                phoneNumber: user.phoneNumber,
                notes: user.notes,
                createdAt: user.createdAt || new Date().toISOString(),
                updatedAt: user.updatedAt || new Date().toISOString()
              })),
              pagination: {
                page: 1,
                limit: params?.limit || 50,
                total: data.users?.length || 0,
                totalPages: 1
              }
            };
          } else if (Array.isArray(data)) {
            // Handle direct array response
            return {
              users: data.map((user: any) => ({
                id: user.id,
                email: user.email,
                username: user.username || user.email?.split('@')[0] || 'user',
                name: user.name || user.displayName || user.username || 'User',
                role: user.role || 'user',
                permissions: user.permissions || [],
                isActive: user.isActive !== false,
                lastLoginAt: user.lastLoginAt,
                walletAddress: user.walletAddress,
                phoneNumber: user.phoneNumber,
                notes: user.notes,
                createdAt: user.createdAt || new Date().toISOString(),
                updatedAt: user.updatedAt || new Date().toISOString()
              })),
              pagination: {
                page: 1,
                limit: params?.limit || 50,
                total: data.length || 0,
                totalPages: 1
              }
            };
          }
        }
      } catch (error) {
        console.log('🔍 Regular users endpoint failed:', endpoint, error);
        // Continue to next endpoint
      }
    }

    // If no endpoint worked, return empty result
    console.log('🔍 No regular users endpoints worked, returning empty');
    return {
      users: [],
      pagination: {
        page: 1,
        limit: params?.limit || 50,
        total: 0,
        totalPages: 0
      }
    };
  },

  /**
   * Create a support ticket (for frontend submission)
   */
  async createSupportTicket(data: CreateSupportTicketData): Promise<SupportTicketData> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/admin/support-tickets`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Failed to create support ticket');
    }

    return responseData.data.ticket;
  }
};