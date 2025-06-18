import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCampaignModal } from '../../../components/Creator/CreateCampaignModal';

// Mock the notifications hook
vi.mock('../../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }))
}));

const mockShareholders = [
  {
    id: 'sh_1',
    name: 'John Smith',
    tier: 'GOLD',
    kycStatus: 'VERIFIED',
    communicationPreferences: { email: true, sms: false, push: true }
  },
  {
    id: 'sh_2',
    name: 'Sarah Johnson',
    tier: 'PLATINUM',
    kycStatus: 'VERIFIED',
    communicationPreferences: { email: true, sms: true, push: true }
  },
  {
    id: 'sh_3',
    name: 'Mike Brown',
    tier: 'SILVER',
    kycStatus: 'PENDING',
    communicationPreferences: { email: true, sms: false, push: false }
  }
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  shareholders: mockShareholders
};

describe('CreateCampaignModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<CreateCampaignModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Create Communication Campaign')).not.toBeInTheDocument();
  });

  it('should render modal with step 1 initially', () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    expect(screen.getByText('Create Communication Campaign')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3 - Campaign Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Campaign Title *')).toBeInTheDocument();
  });

  it('should display all communication types', () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('SMS')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
    expect(screen.getByText('In-App')).toBeInTheDocument();
  });

  it('should update campaign title', () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Campaign Title *');
    fireEvent.change(titleInput, { target: { value: 'Monthly Newsletter' } });
    
    expect(titleInput).toHaveValue('Monthly Newsletter');
  });

  it('should select communication type', () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    const smsButton = screen.getByRole('button', { name: /sms/i });
    fireEvent.click(smsButton);
    
    // Should highlight SMS button - checking for blue border color classes
    expect(smsButton).toHaveClass('border-blue-500');
  });

  it('should navigate to step 2 when Next is clicked', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Fill campaign title (required)
    const titleInput = screen.getByLabelText('Campaign Title *');
    fireEvent.change(titleInput, { target: { value: 'Test Campaign' } });
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3 - Target Audience')).toBeInTheDocument();
      expect(screen.getByText('All Shareholders')).toBeInTheDocument();
    });
  });

  it('should calculate recipient count correctly for all shareholders', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 2
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(() => {
      // For EMAIL type, should count shareholders with email preference (all 3)
      expect(screen.getByText('Estimated Recipients: 3')).toBeInTheDocument();
    });
  });

  it('should handle tier-based targeting', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 2
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(() => {
      // Select tier-based targeting
      const tierBasedRadio = screen.getByLabelText('Specific Tiers');
      fireEvent.click(tierBasedRadio);
      
      // Select GOLD tier
      const goldCheckbox = screen.getByLabelText('GOLD');
      fireEvent.click(goldCheckbox);
      
      // Should show 1 recipient (John Smith who is GOLD tier with email preference)
      expect(screen.getByText('Estimated Recipients: 1')).toBeInTheDocument();
    });
  });

  it('should navigate to step 3 and show content form', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate through steps
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Test Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Step 3 of 3 - Content & Schedule')).toBeInTheDocument();
        expect(screen.getByLabelText('Subject Line *')).toBeInTheDocument(); // For EMAIL type
        expect(screen.getByLabelText('Message Content *')).toBeInTheDocument();
      });
    });
  });

  it('should handle SMS content with character limit', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Select SMS type
    const smsButton = screen.getByRole('button', { name: /sms/i });
    fireEvent.click(smsButton);
    
    // Navigate to step 3
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'SMS Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        const messageTextarea = screen.getByLabelText('Message Content *');
        fireEvent.change(messageTextarea, { target: { value: 'Short SMS message' } });
        
        // Should show character count for SMS
        expect(screen.getByText('17 characters / 160')).toBeInTheDocument();
      });
    });
  });

  it('should add call to action for email campaigns', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 3 (EMAIL is default)
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Email Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        const ctaTextInput = screen.getByPlaceholderText('Button text (e.g., \'View Details\')');
        const ctaUrlInput = screen.getByPlaceholderText('https://example.com');
        
        fireEvent.change(ctaTextInput, { target: { value: 'Learn More' } });
        fireEvent.change(ctaUrlInput, { target: { value: 'https://example.com/details' } });
        
        expect(ctaTextInput).toHaveValue('Learn More');
        expect(ctaUrlInput).toHaveValue('https://example.com/details');
      });
    });
  });

  it('should enable scheduling option', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 3
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Scheduled Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        const scheduleCheckbox = screen.getByLabelText('Schedule for later');
        fireEvent.click(scheduleCheckbox);
        
        expect(screen.getByLabelText('Send Date & Time')).toBeInTheDocument();
      });
    });
  });

  it('should show campaign summary', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 3
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Summary Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Campaign Summary')).toBeInTheDocument();
        expect(screen.getByText('Type: EMAIL')).toBeInTheDocument();
        expect(screen.getByText('Recipients: 3 shareholders')).toBeInTheDocument();
        expect(screen.getByText('Priority: MEDIUM')).toBeInTheDocument();
      });
    });
  });

  it('should validate email campaigns require subject', async () => {
    const mockOnCreate = vi.fn();
    render(<CreateCampaignModal {...defaultProps} onCreate={mockOnCreate} />);
    
    // Navigate to step 3 and try to submit without subject
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Email Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        // Fill message but not subject
        fireEvent.change(screen.getByLabelText('Message Content *'), { target: { value: 'Test message' } });
        
        const createButton = screen.getByRole('button', { name: /create campaign/i });
        fireEvent.click(createButton);
        
        // Should not call onCreate without subject for email
        expect(mockOnCreate).not.toHaveBeenCalled();
      });
    });
  });

  it('should create campaign with valid data', async () => {
    const mockOnCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateCampaignModal {...defaultProps} onCreate={mockOnCreate} />);
    
    // Fill complete form
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Complete Campaign' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Subject Line *'), { target: { value: 'Test Subject' } });
        fireEvent.change(screen.getByLabelText('Message Content *'), { target: { value: 'Test message content' } });
        
        const createButton = screen.getByRole('button', { name: /create campaign/i });
        fireEvent.click(createButton);
        
        expect(mockOnCreate).toHaveBeenCalledWith({
          title: 'Complete Campaign',
          type: 'EMAIL',
          targetAudience: { type: 'ALL' },
          content: {
            subject: 'Test Subject',
            body: 'Test message content'
          },
          priority: 'MEDIUM'
        });
      });
    });
  });

  it('should handle going back to previous steps', async () => {
    render(<CreateCampaignModal {...defaultProps} />);
    
    // Navigate to step 2
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Back Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3 - Target Audience')).toBeInTheDocument();
      
      // Go back to step 1
      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);
      
      expect(screen.getByText('Step 1 of 3 - Campaign Type')).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    const mockOnClose = vi.fn();
    render(<CreateCampaignModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show loading state during campaign creation', async () => {
    const mockOnCreate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<CreateCampaignModal {...defaultProps} onCreate={mockOnCreate} />);
    
    // Navigate to step 3 and submit
    fireEvent.change(screen.getByLabelText('Campaign Title *'), { target: { value: 'Loading Test' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    await waitFor(async () => {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Subject Line *'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText('Message Content *'), { target: { value: 'Test' } });
        
        const createButton = screen.getByRole('button', { name: /create campaign/i });
        fireEvent.click(createButton);
        
        // Should show loading state
        expect(screen.getByText('Creating...')).toBeInTheDocument();
        expect(createButton).toBeDisabled();
      });
    });
  });
});