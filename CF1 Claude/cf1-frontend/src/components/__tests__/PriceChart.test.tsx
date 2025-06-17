import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { PriceChart } from '../PriceChart'

describe('PriceChart', () => {
  // Use recent dates that won't be filtered out by the 7D timeframe
  const today = new Date()
  const mockData = [
    { date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 100, volume: 1000 },
    { date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 105, volume: 1200 },
    { date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 102, volume: 800 },
    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 108, volume: 1500 },
    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 110, volume: 1100 },
  ]

  const defaultProps = {
    data: mockData,
    currentPrice: '$110.00',
    priceChange24h: '+5.2%',
    volume24h: '$1.1M',
  }

  describe('rendering', () => {
    it('renders the chart title', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('Price Chart')).toBeInTheDocument()
    })

    it('displays current price', () => {
      render(<PriceChart {...defaultProps} />)
      
      // Should find multiple instances of $110.00 (current price, high price, y-axis label)
      const priceElements = screen.getAllByText('$110.00')
      expect(priceElements.length).toBeGreaterThan(0)
    })

    it('shows price change with positive trend', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('+5.2%')).toBeInTheDocument()
      
      // Should show trending up icon for positive change
      const trendIcon = screen.getByText('+5.2%').parentElement
      expect(trendIcon).toHaveClass('text-green-600')
    })

    it('shows price change with negative trend', () => {
      const propsWithNegativeTrend = {
        ...defaultProps,
        priceChange24h: '-2.1%',
      }
      
      render(<PriceChart {...propsWithNegativeTrend} />)
      
      expect(screen.getByText('-2.1%')).toBeInTheDocument()
      
      // Should show trending down icon for negative change
      const trendIcon = screen.getByText('-2.1%').parentElement
      expect(trendIcon).toHaveClass('text-red-600')
    })

    it('displays volume information', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('24h Volume')).toBeInTheDocument()
      expect(screen.getByText('$1.1M')).toBeInTheDocument()
    })

    it('shows high and low prices', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getAllByText('$110.00').length).toBeGreaterThan(0) // Max price from data
      
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0) // Min price from data (appears in low section and y-axis)
    })
  })

  describe('timeframe selector', () => {
    it('renders all timeframe options', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('7D')).toBeInTheDocument()
      expect(screen.getByText('1M')).toBeInTheDocument()
      expect(screen.getByText('3M')).toBeInTheDocument()
      expect(screen.getByText('1Y')).toBeInTheDocument()
    })

    it('has 7D selected by default', () => {
      render(<PriceChart {...defaultProps} />)
      
      const sevenDayButton = screen.getByText('7D')
      expect(sevenDayButton).toHaveClass('bg-white')
    })

    it('changes timeframe when clicked', () => {
      render(<PriceChart {...defaultProps} />)
      
      const oneMonthButton = screen.getByText('1M')
      fireEvent.click(oneMonthButton)
      
      expect(oneMonthButton).toHaveClass('bg-white')
    })
  })

  describe('chart visualization', () => {
    it('renders SVG chart when data is available', () => {
      render(<PriceChart {...defaultProps} />)
      
      const svgElement = document.querySelector('svg')
      expect(svgElement).toBeInTheDocument()
    })

    it('renders chart with correct viewBox', () => {
      render(<PriceChart {...defaultProps} />)
      
      // Look for the main chart SVG specifically, not the icon SVGs
      const svgElement = document.querySelector('svg[viewBox="0 0 400 200"]')
      expect(svgElement).toBeInTheDocument()
    })

    it('shows placeholder when no data is provided', () => {
      const propsWithNoData = {
        ...defaultProps,
        data: [],
      }
      
      render(<PriceChart {...propsWithNoData} />)
      
      expect(screen.getByText('Price chart data will be available soon')).toBeInTheDocument()
    })

    it('shows placeholder when insufficient data is provided', () => {
      const propsWithInsufficientData = {
        ...defaultProps,
        data: [{ date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], price: 100, volume: 1000 }],
      }
      
      render(<PriceChart {...propsWithInsufficientData} />)
      
      expect(screen.getByText('Price chart data will be available soon')).toBeInTheDocument()
    })
  })

  describe('chart stats', () => {
    it('calculates and displays correct high price', () => {
      render(<PriceChart {...defaultProps} />)
      
      // High price should be the maximum from the data (110)
      const highPrices = screen.getAllByText('$110.00')
      expect(highPrices.length).toBeGreaterThanOrEqual(2) // Should appear as current price and high price
    })

    it('calculates and displays correct low price', () => {
      render(<PriceChart {...defaultProps} />)
      
      // Low price should be the minimum from the data (100)
      const lowPrices = screen.getAllByText('$100.00')
      expect(lowPrices.length).toBeGreaterThanOrEqual(1) // Should appear as low price and possibly y-axis label
    })
  })

  describe('accessibility', () => {
    it('includes tooltips for data points', () => {
      render(<PriceChart {...defaultProps} />)
      
      // Check that title elements exist for tooltips
      const titleElements = document.querySelectorAll('title')
      expect(titleElements.length).toBeGreaterThan(0)
    })
  })

  describe('styling', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <PriceChart {...defaultProps} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('uses green styling for positive price changes', () => {
      render(<PriceChart {...defaultProps} />)
      
      const trendElement = screen.getByText('+5.2%').parentElement
      expect(trendElement).toHaveClass('text-green-600')
    })

    it('uses red styling for negative price changes', () => {
      const propsWithNegativeTrend = {
        ...defaultProps,
        priceChange24h: '-2.1%',
      }
      
      render(<PriceChart {...propsWithNegativeTrend} />)
      
      const trendElement = screen.getByText('-2.1%').parentElement
      expect(trendElement).toHaveClass('text-red-600')
    })
  })
})