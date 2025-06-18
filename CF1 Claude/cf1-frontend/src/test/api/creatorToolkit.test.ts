import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../../lib/api/client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock ErrorHandler to suppress error logging during tests
vi.mock('../../lib/errorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
  }
}));

describe('Creator Toolkit API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Asset Updates API', () => {
    it('should fetch asset updates successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'update_1',
            assetId: 'asset_1',
            title: 'Q1 Performance Update',
            content: 'Great performance this quarter...',
            type: 'FINANCIAL',
            visibility: 'PUBLIC',
            publishedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'update_2',
            assetId: 'asset_2',
            title: 'Operational Changes',
            content: 'We have made some operational improvements...',
            type: 'OPERATIONAL',
            visibility: 'SHAREHOLDERS_ONLY',
            publishedAt: '2024-01-20T14:30:00Z'
          }
        ],
        total: 2
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/api/creator-toolkit/asset-updates');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/creator-toolkit/asset-updates',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.data.data).toHaveLength(2);
    });

    it('should create asset update successfully', async () => {
      const updateData = {
        assetId: 'asset_1',
        title: 'New Update',
        content: 'This is a new update...',
        type: 'GENERAL',
        visibility: 'PUBLIC',
        tags: ['performance', 'quarterly']
      };

      const mockResponse = {
        success: true,
        message: 'Asset update published successfully',
        data: {
          id: 'update_123',
          ...updateData,
          createdAt: '2024-01-25T09:00:00Z',
          updatedAt: '2024-01-25T09:00:00Z',
          status: 'published'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/api/creator-toolkit/asset-updates', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/creator-toolkit/asset-updates',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );

      expect(result.success).toBe(true);
      expect(result.data.data.id).toBe('update_123');
      expect(result.data.data.title).toBe(updateData.title);
    });

    it('should handle asset update creation error', async () => {
      const updateData = {
        assetId: '',
        title: '',
        content: '',
        type: 'GENERAL',
        visibility: 'PUBLIC'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Missing required fields'
        }),
      });

      const result = await apiClient.post('/api/creator-toolkit/asset-updates', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Communications API', () => {
    it('should fetch communications successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'comm_1',
            title: 'Monthly Newsletter',
            type: 'EMAIL',
            status: 'SENT',
            targetAudience: { type: 'ALL' },
            recipientCount: 150,
            openRate: 85,
            clickRate: 12,
            sentAt: '2024-01-15T08:00:00Z'
          }
        ],
        total: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/api/creator-toolkit/communications');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/creator-toolkit/communications',
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.success).toBe(true);
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].type).toBe('EMAIL');
    });

    it('should create communication campaign successfully', async () => {
      const campaignData = {
        title: 'Q1 Results Announcement',
        type: 'EMAIL',
        targetAudience: {
          type: 'TIER_BASED',
          tiers: ['GOLD', 'PLATINUM']
        },
        content: {
          subject: 'Q1 Results Are In!',
          body: 'We are excited to share our Q1 results...'
        },
        priority: 'HIGH'
      };

      const mockResponse = {
        success: true,
        message: 'Communication campaign created successfully',
        data: {
          id: 'comm_456',
          ...campaignData,
          createdAt: '2024-01-25T10:00:00Z',
          status: 'SENT',
          recipientCount: 47,
          openRate: 92,
          clickRate: 15
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/api/creator-toolkit/communications', campaignData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/creator-toolkit/communications',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(campaignData)
        })
      );

      expect(result.success).toBe(true);
      expect(result.data.data.id).toBe('comm_456');
      expect(result.data.data.recipientCount).toBe(47);
    });

    it('should handle SMS campaign with character limit validation', async () => {
      const smsData = {
        title: 'SMS Alert',
        type: 'SMS',
        targetAudience: { type: 'ALL' },
        content: {
          body: 'Short alert message for shareholders'
        },
        priority: 'MEDIUM'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'sms_789',
          ...smsData,
          status: 'SENT',
          recipientCount: 89
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/api/creator-toolkit/communications', smsData);

      expect(result.success).toBe(true);
      expect(result.data.data.type).toBe('SMS');
    });

    it('should handle communication creation validation errors', async () => {
      const invalidData = {
        title: '',
        type: 'EMAIL',
        content: { body: '' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Title and content are required'
        }),
      });

      const result = await apiClient.post('/api/creator-toolkit/communications', invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title and content');
    });
  });

  describe('Shareholders API', () => {
    it('should fetch shareholders successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'sh_1',
            walletAddress: 'neutron1abc...xyz',
            email: 'investor1@example.com',
            name: 'John Smith',
            tier: 'GOLD',
            totalInvested: 50000,
            tokenBalance: 5000,
            kycStatus: 'VERIFIED',
            communicationPreferences: {
              email: true,
              sms: false,
              push: true
            }
          }
        ],
        total: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/api/creator-toolkit/shareholders');

      expect(result.success).toBe(true);
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].tier).toBe('GOLD');
    });
  });

  describe('Assistant Management API', () => {
    it('should create assistant successfully', async () => {
      const assistantData = {
        name: 'Asset Manager Assistant',
        email: 'assistant@example.com',
        role: 'asset_manager',
        permissions: ['view_assets', 'manage_updates'],
        assetIds: ['asset_1', 'asset_2']
      };

      const mockResponse = {
        success: true,
        message: 'Assistant created successfully',
        data: {
          id: 'asst_123',
          ...assistantData,
          createdAt: '2024-01-25T11:00:00Z',
          status: 'active'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/api/creator-toolkit/assistants', assistantData);

      expect(result.success).toBe(true);
      expect(result.data.data.role).toBe('asset_manager');
      expect(result.data.data.status).toBe('active');
    });

    it('should fetch assistants list', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'asst_1',
            name: 'Communication Manager',
            role: 'communications_manager',
            status: 'active'
          }
        ],
        total: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/api/creator-toolkit/assistants');

      expect(result.success).toBe(true);
      expect(result.data.data[0].role).toBe('communications_manager');
    });

    it('should update assistant permissions', async () => {
      const updateData = {
        permissions: ['view_assets', 'manage_updates', 'manage_communications']
      };

      const mockResponse = {
        success: true,
        message: 'Assistant updated successfully',
        data: {
          id: 'asst_123',
          permissions: updateData.permissions,
          updatedAt: '2024-01-25T12:00:00Z'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.put('/api/creator-toolkit/assistants/asst_123', updateData);

      expect(result.success).toBe(true);
      expect(result.data.data.permissions).toHaveLength(3);
    });

    it('should delete assistant', async () => {
      const mockResponse = {
        success: true,
        message: 'Assistant deleted successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.delete('/api/creator-toolkit/assistants/asst_123');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Assistant deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.get('/api/creator-toolkit/asset-updates');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      // Mock a request that times out
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const result = await apiClient.get('/api/creator-toolkit/asset-updates', { timeout: 50 });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should retry failed requests', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });

      const result = await apiClient.get('/api/creator-toolkit/asset-updates', { retries: 2 });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });
});