import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublishUpdateModal } from '../../../components/Creator/PublishUpdateModal';

// Mock the notifications hook
vi.mock('../../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }))
}));

const mockAssets = [
  { id: 'asset_1', name: 'Solar Farm Alpha', type: 'Renewable Energy' },
  { id: 'asset_2', name: 'Wind Farm Beta', type: 'Renewable Energy' },
  { id: 'asset_3', name: 'Real Estate Fund', type: 'Real Estate' }
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onPublish: vi.fn(),
  assets: mockAssets
};

describe('PublishUpdateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<PublishUpdateModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Publish Asset Update')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    expect(screen.getByText('Publish Asset Update')).toBeInTheDocument();
    expect(screen.getByText('Share important information with your shareholders')).toBeInTheDocument();
    expect(screen.getByLabelText('Asset *')).toBeInTheDocument();
    expect(screen.getByLabelText('Update Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Content *')).toBeInTheDocument();
  });

  it('should display all asset options in the dropdown', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const assetSelect = screen.getByLabelText('Asset *');
    expect(assetSelect).toBeInTheDocument();
    
    // Check that all assets are available as options
    mockAssets.forEach(asset => {
      expect(screen.getByText(`${asset.name} (${asset.type})`)).toBeInTheDocument();
    });
  });

  it('should update form fields when user types', async () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    // Test title input
    const titleInput = screen.getByLabelText('Update Title *');
    fireEvent.change(titleInput, { target: { value: 'Quarterly Performance Update' } });
    expect(titleInput).toHaveValue('Quarterly Performance Update');
    
    // Test content textarea
    const contentTextarea = screen.getByLabelText('Content *');
    fireEvent.change(contentTextarea, { target: { value: 'We are pleased to announce excellent quarterly results.' } });
    expect(contentTextarea).toHaveValue('We are pleased to announce excellent quarterly results.');
  });

  it('should handle asset selection', async () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const assetSelect = screen.getByLabelText('Asset *');
    fireEvent.change(assetSelect, { target: { value: 'asset_1' } });
    
    expect(assetSelect).toHaveValue('asset_1');
  });

  it('should handle update type selection', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const typeSelect = screen.getByLabelText('Update Type');
    fireEvent.change(typeSelect, { target: { value: 'FINANCIAL' } });
    
    expect(typeSelect).toHaveValue('FINANCIAL');
  });

  it('should handle visibility selection', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const publicRadio = screen.getByLabelText('Public');
    const shareholdersOnlyRadio = screen.getByLabelText('Shareholders Only');
    
    expect(publicRadio).toBeChecked(); // Default should be public
    
    fireEvent.click(shareholdersOnlyRadio);
    expect(shareholdersOnlyRadio).toBeChecked();
    expect(publicRadio).not.toBeChecked();
  });

  it('should add and remove tags', async () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText('Add a tag');
    const addTagButton = screen.getByRole('button', { name: '' }); // Tag button has icon only
    
    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'performance' } });
    fireEvent.click(addTagButton);
    
    // Tag should appear
    expect(screen.getByText('performance')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
    
    // Remove the tag
    const removeTagButton = screen.getByRole('button', { name: '' }); // Remove button with X icon
    fireEvent.click(removeTagButton);
    
    expect(screen.queryByText('performance')).not.toBeInTheDocument();
  });

  it('should handle file attachments', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Upload files');
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('should toggle scheduling option', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const scheduleCheckbox = screen.getByLabelText('Schedule for later');
    expect(scheduleCheckbox).not.toBeChecked();
    
    fireEvent.click(scheduleCheckbox);
    expect(scheduleCheckbox).toBeChecked();
    
    // Should show datetime input when scheduled
    expect(screen.getByLabelText('Publication Date & Time')).toBeInTheDocument();
  });

  it('should show validation error for missing required fields', async () => {
    const mockOnPublish = vi.fn();
    render(<PublishUpdateModal {...defaultProps} onPublish={mockOnPublish} />);
    
    const submitButton = screen.getByRole('button', { name: /publish now/i });
    fireEvent.click(submitButton);
    
    // Should not call onPublish if required fields are missing
    expect(mockOnPublish).not.toHaveBeenCalled();
  });

  it('should call onPublish with correct data when form is valid', async () => {
    const mockOnPublish = vi.fn().mockResolvedValue(undefined);
    render(<PublishUpdateModal {...defaultProps} onPublish={mockOnPublish} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText('Asset *'), { target: { value: 'asset_1' } });
    fireEvent.change(screen.getByLabelText('Update Title *'), { target: { value: 'Test Update' } });
    fireEvent.change(screen.getByLabelText('Content *'), { target: { value: 'Test content for the update' } });
    
    const submitButton = screen.getByRole('button', { name: /publish now/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalledWith({
        assetId: 'asset_1',
        title: 'Test Update',
        content: 'Test content for the update',
        type: 'GENERAL',
        visibility: 'PUBLIC',
        tags: [],
        attachments: []
      });
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<PublishUpdateModal {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when X button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<PublishUpdateModal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no aria-label
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const mockOnPublish = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<PublishUpdateModal {...defaultProps} onPublish={mockOnPublish} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText('Asset *'), { target: { value: 'asset_1' } });
    fireEvent.change(screen.getByLabelText('Update Title *'), { target: { value: 'Test Update' } });
    fireEvent.change(screen.getByLabelText('Content *'), { target: { value: 'Test content' } });
    
    const submitButton = screen.getByRole('button', { name: /publish now/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Publishing...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalled();
    });
  });

  it('should display character count for content', () => {
    render(<PublishUpdateModal {...defaultProps} />);
    
    const contentTextarea = screen.getByLabelText('Content *');
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });
    
    expect(screen.getByText('12 characters')).toBeInTheDocument();
  });

  it('should handle scheduled publishing', async () => {
    const mockOnPublish = vi.fn().mockResolvedValue(undefined);
    render(<PublishUpdateModal {...defaultProps} onPublish={mockOnPublish} />);
    
    // Enable scheduling
    const scheduleCheckbox = screen.getByLabelText('Schedule for later');
    fireEvent.click(scheduleCheckbox);
    
    // Set scheduled date
    const datetimeInput = screen.getByLabelText('Publication Date & Time');
    fireEvent.change(datetimeInput, { target: { value: '2024-12-25T10:00' } });
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText('Asset *'), { target: { value: 'asset_1' } });
    fireEvent.change(screen.getByLabelText('Update Title *'), { target: { value: 'Scheduled Update' } });
    fireEvent.change(screen.getByLabelText('Content *'), { target: { value: 'This is a scheduled update' } });
    
    const submitButton = screen.getByRole('button', { name: /schedule update/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalledWith(expect.objectContaining({
        scheduledFor: '2024-12-25T10:00'
      }));
    });
  });
});