import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortfolioWidget from '../../../components/Dashboard/PortfolioWidget';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('PortfolioWidget', () => {
  it('should render pie chart in medium size', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="medium" />
      </TestWrapper>
    );

    expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Total Gain')).toBeInTheDocument();
    
    // Check for SVG pie chart
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    // Check for pie chart paths
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should render pie chart with labels in large size', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="large" />
      </TestWrapper>
    );

    expect(screen.getByText('Portfolio Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    
    // Check for asset names in the list (use getAllByText for duplicates)
    expect(screen.getAllByText('Green Energy Fund')).toHaveLength(2);
    expect(screen.getAllByText('Tech Innovation')).toHaveLength(2);
    expect(screen.getAllByText('Real Estate Portfolio')).toHaveLength(2);
    
    // Check for SVG pie chart
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should show different layout for full size', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="full" />
      </TestWrapper>
    );

    expect(screen.getByText('Portfolio Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Active Investments')).toBeInTheDocument();
    expect(screen.getByText('Best Performer')).toBeInTheDocument();
    
    // Should have the pie chart
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should hide view all button in edit mode', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="medium" isEditMode={true} />
      </TestWrapper>
    );

    expect(screen.queryByText('View All')).not.toBeInTheDocument();
  });

  it('should show proper color indicators for assets', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="large" />
      </TestWrapper>
    );

    // Check for colored circles in the asset list
    const colorIndicators = document.querySelectorAll('[style*="background-color"]');
    expect(colorIndicators.length).toBeGreaterThan(0);
  });

  it('should render pie chart center text', () => {
    render(
      <TestWrapper>
        <PortfolioWidget size="medium" />
      </TestWrapper>
    );

    // Check for SVG text elements
    const textElements = document.querySelectorAll('text');
    const portfolioText = Array.from(textElements).find(
      el => el.textContent === 'Portfolio'
    );
    const allocationText = Array.from(textElements).find(
      el => el.textContent === 'Allocation'
    );
    
    expect(portfolioText).toBeInTheDocument();
    expect(allocationText).toBeInTheDocument();
  });
});