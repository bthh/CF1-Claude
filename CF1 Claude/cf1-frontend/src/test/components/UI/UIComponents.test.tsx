import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  LoadingSpinner, 
  EmptyState, 
  StatusBadge, 
  Card, 
  Button, 
  SearchInput, 
  ProgressBar, 
  Tooltip 
} from '../../../components/UI';
import { FileText, Plus } from 'lucide-react';

describe('UI Components', () => {
  describe('LoadingSpinner', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      const spinner = document.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should render different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="small" />);
      let spinner = document.querySelector('svg');
      expect(spinner).toHaveClass('w-4', 'h-4');

      rerender(<LoadingSpinner size="large" />);
      spinner = document.querySelector('svg');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });
  });

  describe('EmptyState', () => {
    it('should render title and description', () => {
      render(
        <EmptyState 
          title="No items found"
          description="Try adjusting your search criteria"
        />
      );
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
    });

    it('should render action button', () => {
      const mockAction = vi.fn();
      render(
        <EmptyState 
          title="No items"
          action={{
            label: 'Create New',
            onClick: mockAction
          }}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Create New' });
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should render with icon', () => {
      render(
        <EmptyState 
          icon={FileText}
          title="No files"
        />
      );
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('StatusBadge', () => {
    it('should render different statuses', () => {
      const { rerender } = render(<StatusBadge status="success" text="Active" />);
      let badge = screen.getByText('Active').parentElement;
      expect(badge).toHaveClass('text-green-800');

      rerender(<StatusBadge status="error" text="Failed" />);
      badge = screen.getByText('Failed').parentElement;
      expect(badge).toHaveClass('text-red-800');
    });

    it('should render with icon', () => {
      render(<StatusBadge status="info" text="Info" icon={FileText} />);
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('should render children', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const mockClick = vi.fn();
      render(
        <Card onClick={mockClick}>
          <p>Clickable card</p>
        </Card>
      );
      
      fireEvent.click(screen.getByText('Clickable card'));
      expect(mockClick).toHaveBeenCalled();
    });

    it('should apply different padding sizes', () => {
      const { rerender, container } = render(
        <Card padding="small">
          Content
        </Card>
      );
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-3');

      rerender(
        <Card padding="large">
          Content
        </Card>
      );
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Button', () => {
    it('should render different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');

      rerender(<Button variant="danger">Danger</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(<Button icon={Plus}>Add Item</Button>);
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const mockClick = vi.fn();
      render(<Button onClick={mockClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('SearchInput', () => {
    it('should handle input changes', async () => {
      const mockChange = vi.fn();
      render(<SearchInput value="" onChange={mockChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockChange).toHaveBeenCalledWith('test');
      }, { timeout: 500 });
    });

    it('should show suggestions', () => {
      const suggestions = ['Apple', 'Banana', 'Cherry'];
      render(
        <SearchInput 
          value="a" 
          onChange={vi.fn()} 
          suggestions={suggestions}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('should clear input', () => {
      const mockChange = vi.fn();
      render(<SearchInput value="test" onChange={mockChange} />);
      
      const clearButton = document.querySelector('button');
      fireEvent.click(clearButton!);
      
      expect(mockChange).toHaveBeenCalledWith('');
    });
  });

  describe('ProgressBar', () => {
    it('should render progress correctly', () => {
      render(<ProgressBar value={75} max={100} data-testid="progress" />);
      
      const progressBar = document.querySelector('[style*="width: 75%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show label when enabled', () => {
      render(
        <ProgressBar 
          value={50} 
          showLabel 
          label="Progress" 
        />
      );
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should apply different colors', () => {
      const { rerender } = render(<ProgressBar value={50} color="success" />);
      let progressBar = document.querySelector('.bg-green-600');
      expect(progressBar).toBeInTheDocument();

      rerender(<ProgressBar value={50} color="danger" />);
      progressBar = document.querySelector('.bg-red-600');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
      
      await waitFor(() => {
        expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should toggle on click when trigger is click', () => {
      render(
        <Tooltip content="Tooltip text" trigger="click">
          <button>Click me</button>
        </Tooltip>
      );
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      
      fireEvent.click(trigger);
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });
});