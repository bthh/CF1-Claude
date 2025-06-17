import { create } from 'zustand';

export interface ManagedUser {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  role: 'user' | 'creator' | 'admin';
  verificationLevel: 'anonymous' | 'basic' | 'verified' | 'accredited';
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastActive: string;
  totalInvestments: number;
  activeProposals: number;
  isBlocked: boolean;
  blockReason?: string;
  notes?: string;
  permissions: string[];
  complianceFlags: {
    amlCheck: boolean;
    sanctionsCheck: boolean;
    pep: boolean;
  };
}

interface UserManagementState {
  users: ManagedUser[];
  totalUsers: number;
  filters: {
    role?: string;
    verificationLevel?: string;
    kycStatus?: string;
    isBlocked?: boolean;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  loading: boolean;
  
  // Actions
  loadUsers: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  updateUserStatus: (userId: string, updates: Partial<ManagedUser>) => Promise<void>;
  blockUser: (userId: string, reason: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: ManagedUser['role']) => Promise<void>;
  updateUserKYC: (userId: string, status: ManagedUser['kycStatus']) => Promise<void>;
  setFilters: (filters: UserManagementState['filters']) => void;
  exportUsers: () => Promise<void>;
}

// Mock data generator
const generateMockUsers = (count: number): ManagedUser[] => {
  const roles: ManagedUser['role'][] = ['user', 'creator', 'admin'];
  const verificationLevels: ManagedUser['verificationLevel'][] = ['anonymous', 'basic', 'verified', 'accredited'];
  const kycStatuses: ManagedUser['kycStatus'][] = ['none', 'pending', 'approved', 'rejected'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    walletAddress: `neutron1${Math.random().toString(36).substring(2, 15)}...`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    verificationLevel: verificationLevels[Math.floor(Math.random() * verificationLevels.length)],
    kycStatus: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalInvestments: Math.floor(Math.random() * 10),
    activeProposals: Math.floor(Math.random() * 3),
    isBlocked: Math.random() < 0.05,
    blockReason: Math.random() < 0.05 ? 'Suspicious activity detected' : undefined,
    permissions: ['view_marketplace', 'invest', 'create_proposals'].slice(0, Math.floor(Math.random() * 3) + 1),
    complianceFlags: {
      amlCheck: Math.random() > 0.1,
      sanctionsCheck: Math.random() > 0.05,
      pep: Math.random() < 0.02
    }
  }));
};

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  totalUsers: 0,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },
  loading: false,

  loadUsers: async (page = 1) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const filters = get().filters;
      let allUsers = generateMockUsers(150);
      
      // Apply filters
      if (filters.role) {
        allUsers = allUsers.filter(u => u.role === filters.role);
      }
      if (filters.verificationLevel) {
        allUsers = allUsers.filter(u => u.verificationLevel === filters.verificationLevel);
      }
      if (filters.kycStatus) {
        allUsers = allUsers.filter(u => u.kycStatus === filters.kycStatus);
      }
      if (filters.isBlocked !== undefined) {
        allUsers = allUsers.filter(u => u.isBlocked === filters.isBlocked);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        allUsers = allUsers.filter(u => 
          u.walletAddress.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.name?.toLowerCase().includes(search)
        );
      }
      
      const limit = get().pagination.limit;
      const start = (page - 1) * limit;
      const paginatedUsers = allUsers.slice(start, start + limit);
      
      set({
        users: paginatedUsers,
        totalUsers: allUsers.length,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(allUsers.length / limit)
        }
      });
    } finally {
      set({ loading: false });
    }
  },

  searchUsers: async (query: string) => {
    set({ filters: { ...get().filters, search: query } });
    await get().loadUsers(1);
  },

  updateUserStatus: async (userId: string, updates: Partial<ManagedUser>) => {
    set({ loading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        )
      }));
    } finally {
      set({ loading: false });
    }
  },

  blockUser: async (userId: string, reason: string) => {
    await get().updateUserStatus(userId, { 
      isBlocked: true, 
      blockReason: reason 
    });
  },

  unblockUser: async (userId: string) => {
    await get().updateUserStatus(userId, { 
      isBlocked: false, 
      blockReason: undefined 
    });
  },

  updateUserRole: async (userId: string, role: ManagedUser['role']) => {
    await get().updateUserStatus(userId, { role });
  },

  updateUserKYC: async (userId: string, status: ManagedUser['kycStatus']) => {
    await get().updateUserStatus(userId, { kycStatus: status });
  },

  setFilters: (filters: UserManagementState['filters']) => {
    set({ filters });
    get().loadUsers(1);
  },

  exportUsers: async () => {
    const allUsers = generateMockUsers(150);
    
    // Convert to CSV
    const headers = [
      'ID', 'Wallet Address', 'Email', 'Name', 'Role', 
      'Verification Level', 'KYC Status', 'Created At', 
      'Last Active', 'Total Investments', 'Is Blocked'
    ];
    
    const csvContent = [
      headers.join(','),
      ...allUsers.map(user => [
        user.id,
        user.walletAddress,
        user.email || '',
        user.name || '',
        user.role,
        user.verificationLevel,
        user.kycStatus,
        user.createdAt,
        user.lastActive,
        user.totalInvestments,
        user.isBlocked
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cf1-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}));