import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TouchInput, TouchModal, TouchSelect, TouchTable, TouchTextarea } from '../../components/TouchOptimized';

describe('TouchOptimized Components', () => {
  describe('TouchInput', () => {
    it('should render with proper touch-friendly attributes', () => {
      render(
        <TouchInput
          label="Test Input"
          value=""
          onChange={() => {}}
          placeholder="Enter value"
        />
      );

      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('placeholder', 'Enter value');
      expect(input).toHaveClass('touch-manipulation');
    });

    it('should handle focus and blur events', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      render(
        <TouchInput
          label="Test Input"
          value=""
          onChange={() => {}}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );

      const input = screen.getByLabelText('Test Input');
      
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalled();

      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalled();
    });

    it('should display validation errors', () => {
      render(
        <TouchInput
          label="Test Input"
          value=""
          onChange={() => {}}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Input')).toHaveClass('border-red-500');
    });

    it('should show success state', () => {
      render(
        <TouchInput
          label="Test Input"
          value="valid value"
          onChange={() => {}}
          success={true}
        />
      );

      expect(screen.getByLabelText('Test Input')).toHaveClass('border-green-500');
    });

    it('should handle disabled state', () => {
      render(
        <TouchInput
          label="Test Input"
          value=""
          onChange={() => {}}
          disabled={true}
        />
      );

      const input = screen.getByLabelText('Test Input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('opacity-60');
    });
  });

  describe('TouchModal', () => {
    it('should render when open', () => {
      render(
        <TouchModal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
        >
          <div>Modal content</div>
        </TouchModal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TouchModal
          isOpen={false}
          onClose={() => {}}
          title="Test Modal"
        >
          <div>Modal content</div>
        </TouchModal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should call onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      
      render(
        <TouchModal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        >
          <div>Modal content</div>
        </TouchModal>
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      
      render(
        <TouchModal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        >
          <div>Modal content</div>
        </TouchModal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should handle swipe gestures to close', () => {
      const onClose = vi.fn();
      
      render(
        <TouchModal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
          swipeToClose={true}
        >
          <div>Modal content</div>
        </TouchModal>
      );

      const modal = screen.getByRole('dialog');
      
      // Simulate swipe down gesture
      fireEvent.touchStart(modal, {
        touches: [{ clientY: 100 }]
      });
      fireEvent.touchEnd(modal, {
        changedTouches: [{ clientY: 300 }]
      });
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('TouchSelect', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ];

    it('should render with options', () => {
      render(
        <TouchSelect
          label="Test Select"
          value=""
          onChange={() => {}}
          options={options}
        />
      );

      expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    });

    it('should open dropdown on click', () => {
      render(
        <TouchSelect
          label="Test Select"
          value=""
          onChange={() => {}}
          options={options}
        />
      );

      const select = screen.getByLabelText('Test Select');
      fireEvent.click(select);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should handle option selection', () => {
      const onChange = vi.fn();
      
      render(
        <TouchSelect
          label="Test Select"
          value=""
          onChange={onChange}
          options={options}
        />
      );

      const select = screen.getByLabelText('Test Select');
      fireEvent.click(select);

      const option = screen.getByText('Option 2');
      fireEvent.click(option);

      expect(onChange).toHaveBeenCalledWith('option2');
    });

    it('should handle search functionality', () => {
      render(
        <TouchSelect
          label="Test Select"
          value=""
          onChange={() => {}}
          options={options}
          searchable={true}
        />
      );

      const select = screen.getByLabelText('Test Select');
      fireEvent.click(select);

      const searchInput = screen.getByPlaceholderText('Search options...');
      fireEvent.change(searchInput, { target: { value: 'Option 2' } });

      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('TouchTable', () => {
    const columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age', sortable: true },
      { key: 'city', label: 'City', sortable: false }
    ];

    const data = [
      { name: 'John Doe', age: 30, city: 'New York' },
      { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
      { name: 'Bob Johnson', age: 35, city: 'Chicago' }
    ];

    it('should render table with data', () => {
      render(
        <TouchTable
          columns={columns}
          data={data}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle sorting', () => {
      const onSort = vi.fn();
      
      render(
        <TouchTable
          columns={columns}
          data={data}
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should handle row selection', () => {
      const onRowSelect = vi.fn();
      
      render(
        <TouchTable
          columns={columns}
          data={data}
          selectable={true}
          onRowSelect={onRowSelect}
        />
      );

      const firstRowCheckbox = screen.getAllByRole('checkbox')[1]; // First is select all
      fireEvent.click(firstRowCheckbox);

      expect(onRowSelect).toHaveBeenCalledWith([data[0]]);
    });

    it('should render in mobile card view', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(
        <TouchTable
          columns={columns}
          data={data}
          mobileCardView={true}
        />
      );

      // In mobile view, should render cards instead of table
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('TouchTextarea', () => {
    it('should render with proper attributes', () => {
      render(
        <TouchTextarea
          label="Test Textarea"
          value=""
          onChange={() => {}}
          placeholder="Enter text"
          rows={4}
        />
      );

      const textarea = screen.getByLabelText('Test Textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Enter text');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('should show character count', () => {
      render(
        <TouchTextarea
          label="Test Textarea"
          value="Hello world"
          onChange={() => {}}
          maxLength={100}
          showCharCount={true}
        />
      );

      expect(screen.getByText('11 / 100')).toBeInTheDocument();
    });

    it('should handle auto-resize', () => {
      render(
        <TouchTextarea
          label="Test Textarea"
          value=""
          onChange={() => {}}
          autoResize={true}
        />
      );

      const textarea = screen.getByLabelText('Test Textarea');
      
      // Simulate typing to trigger resize
      fireEvent.change(textarea, { 
        target: { value: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5' } 
      });

      // Height should adjust (testing the resize logic would require more complex setup)
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
    });

    it('should handle validation', () => {
      render(
        <TouchTextarea
          label="Test Textarea"
          value=""
          onChange={() => {}}
          required={true}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Textarea')).toHaveClass('border-red-500');
    });
  });
});