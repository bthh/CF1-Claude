import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  occupation?: string;
  company?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  address?: Address;
  profileImage?: string;
  isProfileComplete: boolean;
  profileCompletionScore: number; // 0-100
  lastUpdated: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    newsUpdates: boolean;
    publicProfile: boolean;
  };
}

export interface ProfileUpdateRequest {
  personalInfo?: Partial<PersonalInfo>;
  address?: Partial<Address>;
  preferences?: Partial<UserProfile['preferences']>;
}

interface UserProfileState {
  // State
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSyncTime: string | null;
  hasUnsavedChanges: boolean;
  
  // Draft state for unsaved changes
  draftChanges: Partial<ProfileUpdateRequest>;
  
  // Actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdateRequest) => Promise<void>;
  updateProfileImage: (imageUrl: string) => Promise<void>;
  saveDraftChanges: () => Promise<void>;
  discardDraftChanges: () => void;
  setDraftChanges: (changes: Partial<ProfileUpdateRequest>) => void;
  calculateCompletionScore: () => number;
  validateProfile: () => { isValid: boolean; errors: string[] };
  exportProfileData: () => string;
  importProfileData: (data: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  resetProfile: () => void;
}

// Helper function to calculate profile completion score
const calculateProfileCompletion = (profile: UserProfile): number => {
  const fields = [
    profile.personalInfo.firstName,
    profile.personalInfo.lastName,
    profile.personalInfo.email,
    profile.personalInfo.phone,
    profile.personalInfo.dateOfBirth,
    profile.personalInfo.bio,
    profile.personalInfo.occupation,
    profile.address?.street,
    profile.address?.city,
    profile.address?.state,
    profile.address?.zipCode,
    profile.address?.country,
    profile.profileImage
  ];
  
  const completedFields = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((completedFields / fields.length) * 100);
};

// Helper function to validate profile data
const validateProfileData = (profile: UserProfile): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!profile.personalInfo.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!profile.personalInfo.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (!profile.personalInfo.email?.trim()) {
    errors.push('Email address is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.personalInfo.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Phone validation (if provided)
  if (profile.personalInfo.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profile.personalInfo.phone.replace(/\D/g, ''))) {
    errors.push('Please enter a valid phone number');
  }
  
  // Date of birth validation (if provided)
  if (profile.personalInfo.dateOfBirth) {
    const dob = new Date(profile.personalInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (age < 18) {
      errors.push('You must be at least 18 years old to use this platform');
    }
    if (age > 120) {
      errors.push('Please enter a valid date of birth');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const useUserProfileStore = create<UserProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: null,
        loading: false,
        saving: false,
        error: null,
        lastSyncTime: null,
        hasUnsavedChanges: false,
        draftChanges: {},

        // Load user profile
        loadProfile: async (userId: string) => {
          set({ loading: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get user from auth store for initial data
            const authUser = useAuthStore.getState().user;
            
            const mockProfile: UserProfile = {
              id: userId,
              personalInfo: {
                firstName: authUser?.name?.split(' ')[0] || 'Demo',
                lastName: authUser?.name?.split(' ')[1] || 'User',
                email: authUser?.email || 'demo@cf1platform.com',
                phone: '+1 (555) 123-4567',
                dateOfBirth: '1990-01-15',
                bio: 'Passionate investor interested in real-world asset tokenization and DeFi opportunities.',
                occupation: 'Software Engineer',
                company: 'Tech Corp',
                linkedIn: 'https://linkedin.com/in/demouser',
                twitter: 'https://twitter.com/demouser'
              },
              address: {
                street: '123 Main Street',
                street2: 'Apt 4B',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
                country: 'United States'
              },
              profileImage: authUser?.profileImage || `https://ui-avatars.com/api/?name=${authUser?.name || 'Demo User'}&background=3B82F6&color=fff`,
              isProfileComplete: false,
              profileCompletionScore: 0,
              lastUpdated: new Date().toISOString(),
              preferences: {
                emailNotifications: true,
                smsNotifications: false,
                marketingEmails: true,
                newsUpdates: true,
                publicProfile: false
              }
            };
            
            // Calculate completion score
            mockProfile.profileCompletionScore = calculateProfileCompletion(mockProfile);
            mockProfile.isProfileComplete = mockProfile.profileCompletionScore >= 80;
            
            set({
              profile: mockProfile,
              loading: false,
              lastSyncTime: new Date().toISOString()
            });
            
          } catch (error) {
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load profile'
            });
          }
        },

        // Update profile
        updateProfile: async (updates: ProfileUpdateRequest) => {
          const { profile } = get();
          if (!profile) return;
          
          set({ saving: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const updatedProfile: UserProfile = {
              ...profile,
              personalInfo: {
                ...profile.personalInfo,
                ...updates.personalInfo
              },
              address: updates.address ? {
                ...profile.address,
                ...updates.address
              } as Address : profile.address,
              preferences: {
                ...profile.preferences,
                ...updates.preferences
              },
              lastUpdated: new Date().toISOString()
            };
            
            // Recalculate completion score
            updatedProfile.profileCompletionScore = calculateProfileCompletion(updatedProfile);
            updatedProfile.isProfileComplete = updatedProfile.profileCompletionScore >= 80;
            
            // Update auth store with basic info
            const authStore = useAuthStore.getState();
            authStore.updateProfile({
              name: `${updatedProfile.personalInfo.firstName} ${updatedProfile.personalInfo.lastName}`,
              email: updatedProfile.personalInfo.email
            });
            
            set({
              profile: updatedProfile,
              saving: false,
              hasUnsavedChanges: false,
              draftChanges: {},
              lastSyncTime: new Date().toISOString()
            });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to update profile'
            });
          }
        },

        // Update profile image
        updateProfileImage: async (imageUrl: string) => {
          const { profile } = get();
          if (!profile) return;
          
          set({ saving: true, error: null });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updatedProfile = {
              ...profile,
              profileImage: imageUrl,
              lastUpdated: new Date().toISOString()
            };
            
            // Update auth store
            const authStore = useAuthStore.getState();
            authStore.updateProfile({ profileImage: imageUrl });
            
            set({
              profile: updatedProfile,
              saving: false,
              lastSyncTime: new Date().toISOString()
            });
            
          } catch (error) {
            set({
              saving: false,
              error: error instanceof Error ? error.message : 'Failed to update profile image'
            });
          }
        },

        // Draft changes management
        setDraftChanges: (changes: Partial<ProfileUpdateRequest>) => {
          const { draftChanges } = get();
          const newDraftChanges = {
            ...draftChanges,
            ...changes,
            personalInfo: {
              ...draftChanges.personalInfo,
              ...changes.personalInfo
            },
            address: {
              ...draftChanges.address,
              ...changes.address
            },
            preferences: {
              ...draftChanges.preferences,
              ...changes.preferences
            }
          };
          
          set({
            draftChanges: newDraftChanges,
            hasUnsavedChanges: Object.keys(newDraftChanges).some(key => 
              newDraftChanges[key as keyof ProfileUpdateRequest] && 
              Object.keys(newDraftChanges[key as keyof ProfileUpdateRequest]!).length > 0
            )
          });
        },

        saveDraftChanges: async () => {
          const { draftChanges, updateProfile } = get();
          if (Object.keys(draftChanges).length === 0) return;
          
          await updateProfile(draftChanges);
        },

        discardDraftChanges: () => {
          set({
            draftChanges: {},
            hasUnsavedChanges: false
          });
        },

        // Utility functions
        calculateCompletionScore: () => {
          const { profile } = get();
          return profile ? calculateProfileCompletion(profile) : 0;
        },

        validateProfile: () => {
          const { profile } = get();
          return profile ? validateProfileData(profile) : { isValid: false, errors: ['No profile data'] };
        },

        exportProfileData: () => {
          const { profile } = get();
          return JSON.stringify(profile, null, 2);
        },

        importProfileData: async (data: string) => {
          try {
            const importedProfile: UserProfile = JSON.parse(data);
            
            // Validate imported data
            const validation = validateProfileData(importedProfile);
            if (!validation.isValid) {
              throw new Error(`Invalid profile data: ${validation.errors.join(', ')}`);
            }
            
            set({
              profile: {
                ...importedProfile,
                lastUpdated: new Date().toISOString()
              },
              error: null,
              lastSyncTime: new Date().toISOString()
            });
            
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to import profile data'
            });
          }
        },

        clearError: () => set({ error: null }),

        resetProfile: () => set({
          profile: null,
          loading: false,
          saving: false,
          error: null,
          lastSyncTime: null,
          hasUnsavedChanges: false,
          draftChanges: {}
        })
      }),
      {
        name: 'cf1-user-profile-storage',
        partialize: (state) => ({
          profile: state.profile,
          lastSyncTime: state.lastSyncTime,
          draftChanges: state.draftChanges,
          hasUnsavedChanges: state.hasUnsavedChanges
        })
      }
    ),
    {
      name: 'user-profile-store'
    }
  )
);

// Export types for use in components
export type { PersonalInfo, Address, ProfileUpdateRequest };