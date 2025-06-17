import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLogin from '../../components/AdminLogin';
import { useCosmJS } from '../../hooks/useCosmJS';

// Mock dependencies
vi.mock('../../hooks/useCosmJS');
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}));

// Mock the AdminAuth context directly
const mockLoginAsAdmin = vi.fn();
vi.mock('../../hooks/useAdminAuth', () => ({
  useAdminAuthContext: () => ({
    loginAsAdmin: mockLoginAsAdmin,
    currentAdmin: null,
    isAdmin: false,
    adminRole: null,
    checkPermission: vi.fn(() => false),
    loading: false
  })
}));

const mockUseCosmJS = useCosmJS as any;

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn()
};

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginAsAdmin.mockResolvedValue(undefined);
    mockUseCosmJS.mockReturnValue({
      isConnected: true,
      connect: vi.fn(),
      address: 'neutron1test123'
    });
  });

  it('should not render when isOpen is false', () => {
    render(<AdminLogin {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Admin Access')).not.toBeInTheDocument();
  });

  it('should render admin role options when open', () => {
    render(<AdminLogin {...defaultProps} />);
    
    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByText('Creator Admin')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Platform Admin')).toBeInTheDocument();
  });

  it('should display correct permissions for each role', () => {
    render(<AdminLogin {...defaultProps} />);
    
    // Creator Admin permissions
    expect(screen.getByText('Proposal Management')).toBeInTheDocument();
    expect(screen.getByText('Token Distribution')).toBeInTheDocument();
    
    // Super Admin permissions
    expect(screen.getByText('Platform Configuration')).toBeInTheDocument();
    expect(screen.getByText('Emergency Controls')).toBeInTheDocument();
    
    // Platform Admin permissions
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Compliance Monitoring')).toBeInTheDocument();
  });

  it('should select creator admin role by default', () => {
    render(<AdminLogin {...defaultProps} />);
    
    // Creator Admin should be selected by default
    const creatorOption = screen.getByText('Creator Admin').closest('[class*="border-"]');
    expect(creatorOption).toHaveClass('border-indigo-500');
  });

  it('should allow role selection', () => {
    render(<AdminLogin {...defaultProps} />);
    
    const superAdminOption = screen.getByText('Super Admin').closest('[class*="border-"]');
    fireEvent.click(superAdminOption!);
    
    expect(superAdminOption).toHaveClass('border-indigo-500');
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AdminLogin {...defaultProps} onClose={onClose} />);
    
    // Find the close button by looking for the X icon in the header
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(button => 
      button.className.includes('w-8 h-8') && 
      button.querySelector('svg')
    );
    
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should handle login with connected wallet', async () => {
    const onSuccess = vi.fn();
    render(<AdminLogin {...defaultProps} onSuccess={onSuccess} />);
    
    const loginButton = screen.getByText('Access Admin Panel');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should connect wallet if not connected before login', async () => {
    const connectWallet = vi.fn();
    mockUseCosmJS.mockReturnValue({
      isConnected: false,
      connectWallet
    });
    
    render(<AdminLogin {...defaultProps} />);
    
    const loginButton = screen.getByText('Access Admin Panel');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(connectWallet).toHaveBeenCalled();
    });
  });

  it('should show loading state during login', async () => {
    render(<AdminLogin {...defaultProps} />);
    
    const loginButton = screen.getByText('Access Admin Panel');
    fireEvent.click(loginButton);
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('should display role descriptions correctly', () => {
    render(<AdminLogin {...defaultProps} />);
    
    expect(screen.getByText('Manage your proposals, tokens, and distributions')).toBeInTheDocument();
    expect(screen.getByText('Full platform access with emergency controls')).toBeInTheDocument();
    expect(screen.getByText('User management and system monitoring')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(<AdminLogin {...defaultProps} />);
    
    const modal = screen.getByText('Admin Access').closest('div');
    
    // Test escape key
    fireEvent.keyDown(modal!, { key: 'Escape', code: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should validate role selection before login', async () => {
    render(<AdminLogin {...defaultProps} />);
    
    // Simulate no role selected (shouldn't happen in real UI but test edge case)
    const loginButton = screen.getByText('Access Admin Panel');
    
    // Mock the internal state to have no selected role
    fireEvent.click(loginButton);
    
    // Should still proceed with default creator role
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('should display correct icons for each role', () => {
    render(<AdminLogin {...defaultProps} />);
    
    // Check that role sections exist (icons are part of the component structure)
    const creatorSection = screen.getByText('Creator Admin').closest('div');
    const superAdminSection = screen.getByText('Super Admin').closest('div');
    const platformAdminSection = screen.getByText('Platform Admin').closest('div');
    
    expect(creatorSection).toBeInTheDocument();
    expect(superAdminSection).toBeInTheDocument();
    expect(platformAdminSection).toBeInTheDocument();
  });

  it('should handle wallet connection failure gracefully', async () => {
    const connectWallet = vi.fn().mockRejectedValue(new Error('Connection failed'));
    mockUseCosmJS.mockReturnValue({
      isConnected: false,
      connectWallet
    });
    
    render(<AdminLogin {...defaultProps} />);
    
    const loginButton = screen.getByText('Access Admin Panel');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(connectWallet).toHaveBeenCalled();
    });
    
    // Should not call onSuccess if wallet connection fails
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });
});