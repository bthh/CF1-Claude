import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { PriceChart } from '../PriceChart'

describe('PriceChart', () => {
  const mockData = [
    { date: '2024-01-01', price: 100, volume: 1000 },
    { date: '2024-01-02', price: 105, volume: 1200 },
    { date: '2024-01-03', price: 102, volume: 800 },
    { date: '2024-01-04', price: 108, volume: 1500 },
    { date: '2024-01-05', price: 110, volume: 1100 },
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
      
      expect(screen.getByText('$110.00')).toBeInTheDocument()
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
      expect(screen.getByText('$110.00')).toBeInTheDocument() // Max price from data
      
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('$100.00')).toBeInTheDocument() // Min price from data
    })
  })

  describe('timeframe selector', () => {
    it('renders all timeframe options', () => {
      render(<PriceChart {...defaultProps} />)
      
      expect(screen.getByText('1D')).toBeInTheDocument()
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
      
      const oneDayButton = screen.getByText('1D')
      fireEvent.click(oneDayButton)
      
      expect(oneDayButton).toHaveClass('bg-white')
    })
  })

  describe('chart visualization', () => {
    it('renders SVG chart when data is available', () => {
      render(<PriceChart {...defaultProps} />)
      
      const svgElement = screen.getByRole('img', { hidden: true }) // SVG has implicit img role
      expect(svgElement).toBeInTheDocument()
    })

    it('renders chart with correct viewBox', () => {
      render(<PriceChart {...defaultProps} />)
      
      const svgElement = document.querySelector('svg')
      expect(svgElement).toHaveAttribute('viewBox', '0 0 400 200')
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
        data: [{ date: '2024-01-01', price: 100, volume: 1000 }],
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
      expect(highPrices.length).toBeGreaterThan(0)
    })

    it('calculates and displays correct low price', () => {
      render(<PriceChart {...defaultProps} />)
      
      // Low price should be the minimum from the data (100)
      expect(screen.getByText('$100.00')).toBeInTheDocument()
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