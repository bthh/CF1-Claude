/**
 * CF1 Backend - Creator Toolkit Routes
 * API endpoints for creator toolkit functionality
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data storage (in production, this would use a proper database)
const assetUpdates: any[] = [];
const communications: any[] = [];
const assistants: any[] = [];

// Asset Updates Endpoints
router.post('/asset-updates', async (req, res) => {
  try {
    const updateData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published'
    };

    assetUpdates.push(updateData);

    console.log('📝 Asset update created:', updateData.title || 'Untitled');

    res.status(201).json({
      success: true,
      message: 'Asset update published successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Error creating asset update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create asset update',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/asset-updates', async (req, res) => {
  try {
    res.json({
      success: true,
      data: assetUpdates,
      total: assetUpdates.length
    });
  } catch (error) {
    console.error('Error fetching asset updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset updates'
    });
  }
});

// Communications Endpoints
router.post('/communications', async (req, res) => {
  try {
    const campaignData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipientCount: Math.floor(Math.random() * 200) + 50, // Mock recipient count
      openRate: Math.floor(Math.random() * 30) + 60, // Mock open rate 60-90%
      clickRate: Math.floor(Math.random() * 20) + 10  // Mock click rate 10-30%
    };

    communications.push(campaignData);

    console.log('📧 Communication campaign created:', campaignData.title || 'Untitled Campaign');

    res.status(201).json({
      success: true,
      message: 'Communication campaign created successfully',
      data: campaignData
    });
  } catch (error) {
    console.error('Error creating communication campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create communication campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/communications', async (req, res) => {
  try {
    res.json({
      success: true,
      data: communications,
      total: communications.length
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communications'
    });
  }
});

// Assistant Management Endpoints
router.post('/assistants', async (req, res) => {
  try {
    const assistantData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    assistants.push(assistantData);

    console.log('👥 Assistant created:', assistantData.name || 'Unnamed Assistant');

    res.status(201).json({
      success: true,
      message: 'Assistant created successfully',
      data: assistantData
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assistant',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/assistants', async (req, res) => {
  try {
    res.json({
      success: true,
      data: assistants,
      total: assistants.length
    });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assistants'
    });
  }
});

router.put('/assistants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assistantIndex = assistants.findIndex(a => a.id === id);
    
    if (assistantIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Assistant not found'
      });
    }

    assistants[assistantIndex] = {
      ...assistants[assistantIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    console.log('👥 Assistant updated:', assistants[assistantIndex].name);

    res.json({
      success: true,
      message: 'Assistant updated successfully',
      data: assistants[assistantIndex]
    });
  } catch (error) {
    console.error('Error updating assistant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assistant'
    });
  }
});

router.delete('/assistants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assistantIndex = assistants.findIndex(a => a.id === id);
    
    if (assistantIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Assistant not found'
      });
    }

    const deletedAssistant = assistants.splice(assistantIndex, 1)[0];

    console.log('👥 Assistant deleted:', deletedAssistant.name);

    res.json({
      success: true,
      message: 'Assistant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assistant'
    });
  }
});

// Shareholders endpoint (for fetching shareholder data)
router.get('/shareholders', async (req, res) => {
  try {
    // Mock shareholder data
    const mockShareholders = [
      {
        id: 'sh_1',
        walletAddress: 'neutron1abc...xyz',
        email: 'investor1@example.com',
        name: 'John Smith',
        tier: 'GOLD',
        totalInvested: 150000,
        tokenBalance: 15000,
        joinedAt: '2024-01-15T14:30:00Z',
        lastActive: '2024-12-15T08:22:00Z',
        kycStatus: 'VERIFIED',
        communicationPreferences: {
          email: true,
          sms: true,
          push: true
        }
      },
      {
        id: 'sh_2', 
        walletAddress: 'neutron1def...abc',
        email: 'investor2@example.com',
        name: 'Sarah Johnson',
        tier: 'GOLD',
        totalInvested: 75000,
        tokenBalance: 7500,
        joinedAt: '2024-02-20T10:15:00Z',
        lastActive: '2024-12-14T16:45:00Z',
        kycStatus: 'VERIFIED',
        communicationPreferences: {
          email: true,
          sms: true,
          push: true
        }
      }
    ];

    res.json({
      success: true,
      data: mockShareholders,
      total: mockShareholders.length
    });
  } catch (error) {
    console.error('Error fetching shareholders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shareholders'
    });
  }
});

export default router;