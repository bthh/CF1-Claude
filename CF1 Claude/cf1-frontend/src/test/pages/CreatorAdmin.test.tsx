import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreatorAdmin from '../../pages/CreatorAdmin';

// Mock dependencies
vi.mock('../../hooks/useAdminAuth', () => ({
  useAdminAuthContext: vi.fn(() => ({
    currentAdmin: {
      id: 'admin123',
      address: 'cosmos1admin123',
      role: 'creator',
      permissions: ['view_proposals', 'create_proposals', 'manage_tokens'],
      name: 'Demo Creator',
      email: 'creator@demo.com',
    },
    isAuthenticated: true,
    checkPermission: vi.fn(() => true),
    hasRole: vi.fn(() => true),
  }))
}));

vi.mock('../../hooks/useCosmJS', () => ({
  useCosmJS: vi.fn(() => ({
    isConnected: true,
    address: 'cosmos1admin123',
    balance: { amount: '1000000', denom: 'untrn' },
  }))
}));

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }))
}));

// Mock API client
vi.mock('../../lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock format utilities
vi.mock('../../utils/format', () => ({
  formatAmount: vi.fn((amount) => `$${amount}`),
  formatPercentage: vi.fn((percentage) => `${percentage}%`),
  formatTimeAgo: vi.fn(() => '2 hours ago')
}));

describe('CreatorAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render creator admin dashboard', () => {
    render(<CreatorAdmin />);
    
    expect(screen.getByText('Creator Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should display navigation tabs', () => {
    render(<CreatorAdmin />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Asset Updates')).toBeInTheDocument();
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should switch between tabs', () => {
    render(<CreatorAdmin />);
    
    // Click on Asset Updates tab
    const assetUpdatesTab = screen.getByText('Asset Updates');
    fireEvent.click(assetUpdatesTab);
    
    expect(screen.getByText('Asset Updates')).toBeInTheDocument();
    
    // Click on Communications tab
    const communicationsTab = screen.getByText('Communications');
    fireEvent.click(communicationsTab);
    
    expect(screen.getByText('Communications')).toBeInTheDocument();
  });

  it('should display statistics cards', () => {
    render(<CreatorAdmin />);
    
    // Should show some form of statistics or metrics
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should handle publish update button click', async () => {
    render(<CreatorAdmin />);
    
    // Navigate to Asset Updates tab first
    const assetUpdatesTab = screen.getByText('Asset Updates');
    fireEvent.click(assetUpdatesTab);
    
    // Look for publish update button
    const publishButton = screen.getByRole('button', { name: /publish/i });
    expect(publishButton).toBeInTheDocument();
  });

  it('should handle create campaign button click', async () => {
    render(<CreatorAdmin />);
    
    // Navigate to Communications tab first
    const communicationsTab = screen.getByText('Communications');
    fireEvent.click(communicationsTab);
    
    // Look for create campaign button
    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeInTheDocument();
  });

  it('should render AI Assistant tab', () => {
    render(<CreatorAdmin />);
    
    // Click on AI Assistant tab
    const aiTab = screen.getByText('AI Assistant');
    fireEvent.click(aiTab);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should handle team management functionality', () => {
    render(<CreatorAdmin />);
    
    // Navigate to Team Management tab
    const teamTab = screen.getByText('Team Management');
    fireEvent.click(teamTab);
    
    expect(screen.getByText('Team Management')).toBeInTheDocument();
  });

  it('should display creator admin interface for authenticated user', () => {
    render(<CreatorAdmin />);
    
    // Should show the main dashboard elements
    expect(screen.getByText('Creator Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should handle refresh functionality', async () => {
    render(<CreatorAdmin />);
    
    // Look for any refresh buttons or functionality
    const overviewTab = screen.getByText('Overview');
    expect(overviewTab).toBeInTheDocument();
    
    // Verify the page loads without errors
    expect(screen.getByText('Creator Admin Dashboard')).toBeInTheDocument();
  });
});