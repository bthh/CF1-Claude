import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderBookModal } from '../../components/SecondaryMarket/OrderBookModal';
import { useSecondaryMarketStore } from '../../store/secondaryMarketStore';

// Mock the secondary market store
vi.mock('../../store/secondaryMarketStore', () => ({
  useSecondaryMarketStore: vi.fn()
}));

const mockUseSecondaryMarketStore = vi.mocked(useSecondaryMarketStore);

describe('OrderBookModal', () => {
  const mockAsset = {
    id: 'listing_1',
    assetId: 'asset_solar_alpha',
    assetName: 'Solar Energy Project Alpha',
    assetType: 'Renewable Energy',
    pricePerToken: 105.50,
    marketData: {
      lastSalePrice: 102.30,
      priceChange24h: 3.13,
      volume24h: 25000,
      highestBid: 104.75,
      lowestAsk: 105.50,
      marketCap: 12500000
    }
  };

  const mockOnClose = vi.fn();

  const mockStoreState = {
    getOrderBook: vi.fn(),
    formatCurrency: (value: number) => `$${value.toFixed(2)}`
  };

  const mockOrderBook = {
    assetId: 'asset_solar_alpha',
    bids: [
      { price: 104.75, quantity: 100, total: 10475, timestamp: new Date().toISOString() },
      { price: 104.50, quantity: 200, total: 20900, timestamp: new Date().toISOString() },
      { price: 104.25, quantity: 150, total: 15637.50, timestamp: new Date().toISOString() }
    ],
    asks: [
      { price: 105.50, quantity: 120, total: 12660, timestamp: new Date().toISOString() },
      { price: 105.75, quantity: 180, total: 19035, timestamp: new Date().toISOString() },
      { price: 106.00, quantity: 90, total: 9540, timestamp: new Date().toISOString() }
    ],
    spread: 0.75,
    spreadPercent: 0.71,
    lastUpdated: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.getOrderBook.mockResolvedValue(mockOrderBook);
    mockUseSecondaryMarketStore.mockReturnValue(mockStoreState);
  });

  it('renders order book modal correctly', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    expect(screen.getByText('Solar Energy Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Renewable Energy • Order Book & Market Data')).toBeInTheDocument();
  });

  it('displays market summary information', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    expect(screen.getByText('Last Price')).toBeInTheDocument();
    expect(screen.getByText('$102.30')).toBeInTheDocument();
    expect(screen.getByText('3.13%')).toBeInTheDocument();
    expect(screen.getByText('Bid / Ask')).toBeInTheDocument();
    expect(screen.getByText('24h Volume')).toBeInTheDocument();
  });

  it('shows tabs for different views', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    expect(screen.getByText('Order Book')).toBeInTheDocument();
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    expect(screen.getByText('Market Depth')).toBeInTheDocument();
  });

  it('displays order book tab by default', async () => {
    render(
      <OrderBookModal 
        asset={mockAsset} 
        onClose={mockOnClose} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Asks (Sell)')).toBeInTheDocument();
      expect(screen.getByText('Bids (Buy)')).toBeInTheDocument();
    });
  });

  it('loads order book data on mount', async () => {
    render(
      <OrderBookModal 
        asset={mockAsset} 
        onClose={mockOnClose} 
      />
    );

    await waitFor(() => {
      expect(mockStoreState.getOrderBook).toHaveBeenCalledWith('asset_solar_alpha');
    });
  });

  it('displays bid and ask orders correctly', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('104.75')).toHaveLength(2); // Highest bid (bid/ask summary + order book)
      expect(screen.getAllByText('105.50')).toHaveLength(2); // Lowest ask (bid/ask summary + order book)
      expect(screen.getAllByText('100')).toHaveLength(1); // Bid quantity
      expect(screen.getAllByText('120')).toHaveLength(1); // Ask quantity
    });
  });

  it('shows spread information', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Spread')).toBeInTheDocument();
      expect(screen.getByText('$0.75')).toBeInTheDocument();
      expect(screen.getByText('(0.71%)')).toBeInTheDocument();
    });
  });

  it('switches to recent trades tab', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    // Find the tab button specifically (first occurrence should be the tab)
    const tradesTab = screen.getAllByText('Recent Trades')[0];
    await act(async () => {
      fireEvent.click(tradesTab);
    });

    // Check the button parent element has the active classes
    expect(tradesTab.parentElement).toHaveClass('border-blue-500', 'text-blue-600');
    expect(screen.getAllByText('Recent Trades')).toHaveLength(2); // Tab + content header
  });

  it('displays recent trades data', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    const tradesTab = screen.getAllByText('Recent Trades')[0];
    await act(async () => {
      fireEvent.click(tradesTab);
    });

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Side')).toBeInTheDocument();
  });

  it('shows trade history with buy/sell indicators', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    const tradesTab = screen.getAllByText('Recent Trades')[0];
    await act(async () => {
      fireEvent.click(tradesTab);
    });

    expect(screen.getAllByText('BUY')).toHaveLength(3); // Multiple buy trades
    expect(screen.getAllByText('SELL')).toHaveLength(2); // Multiple sell trades
  });

  it('switches to market depth tab', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    const depthTab = screen.getAllByText('Market Depth')[0];
    await act(async () => {
      fireEvent.click(depthTab);
    });

    // Check the button parent element has the active classes
    expect(depthTab.parentElement).toHaveClass('border-blue-500', 'text-blue-600');
    expect(screen.getAllByText('Market Depth')).toHaveLength(2); // Tab + content header
  });

  it('displays market depth visualization placeholder', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    const depthTab = screen.getAllByText('Market Depth')[0];
    await act(async () => {
      fireEvent.click(depthTab);
    });

    expect(screen.getByText('Market depth chart visualization would be implemented here')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    // Mock getOrderBook to return a promise that doesn't resolve immediately
    const slowPromise = new Promise(resolve => setTimeout(() => resolve(mockOrderBook), 100));
    mockStoreState.getOrderBook.mockReturnValue(slowPromise);
    
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    // Should show loading spinner initially
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Wait for loading to complete
    await act(async () => {
      await slowPromise;
    });
  });

  it('displays order book statistics in footer', async () => {
    render(
      <OrderBookModal 
        asset={mockAsset} 
        onClose={mockOnClose} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Last updated:')).toBeInTheDocument();
      expect(screen.getByText('6 active orders')).toBeInTheDocument(); // 3 bids + 3 asks
    });
  });

  it('handles refresh button click', async () => {
    render(
      <OrderBookModal 
        asset={mockAsset} 
        onClose={mockOnClose} 
      />
    );

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(mockStoreState.getOrderBook).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('closes modal when close button is clicked', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    // Find the close button by querying for the X icon
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(button => 
      button.querySelector('.lucide-x')
    );
    expect(closeButton).toBeDefined();
    
    fireEvent.click(closeButton!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('formats timestamps correctly', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    const tradesTab = screen.getAllByText('Recent Trades')[0];
    await act(async () => {
      fireEvent.click(tradesTab);
    });

    // Should show relative timestamps
    expect(screen.getByText(/\d+[mh] ago/)).toBeInTheDocument();
  });

  it('displays order book depth bars', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      // Wait for order book data to load, then check for depth bars
      expect(screen.getByText('Asks (Sell)')).toBeInTheDocument();
      // Should show depth visualization bars for both bids and asks
      const depthBars = document.querySelectorAll('.bg-green-100, .bg-red-100');
      expect(depthBars.length).toBeGreaterThan(0);
    });
  });

  it('shows price precision correctly', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      // Should display prices with 2 decimal places
      expect(screen.getByText('104.75')).toBeInTheDocument();
      expect(screen.getByText('105.50')).toBeInTheDocument();
    });
  });

  it('handles empty order book state', async () => {
    mockStoreState.getOrderBook.mockResolvedValue({
      ...mockOrderBook,
      bids: [],
      asks: []
    });

    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('0 active orders')).toBeInTheDocument();
    });
  });

  it('displays cumulative totals correctly', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('$10,475.00')).toBeInTheDocument(); // First bid total
      expect(screen.getByText('$12,660.00')).toBeInTheDocument(); // First ask total
    });
  });

  it('shows best bid and ask prominently', async () => {
    await act(async () => {
      render(
        <OrderBookModal 
          asset={mockAsset} 
          onClose={mockOnClose} 
        />
      );
    });

    await waitFor(() => {
      // Wait for order book to load
      expect(screen.getByText('Asks (Sell)')).toBeInTheDocument();
      
      // Find best bid in the bids section (should be in green)
      const bidPrices = screen.getAllByText('104.75').filter(el => 
        el.className.includes('text-green-600')
      );
      expect(bidPrices.length).toBeGreaterThan(0);
      
      // Find best ask in the asks section (should be in red)  
      const askPrices = screen.getAllByText('105.50').filter(el => 
        el.className.includes('text-red-600')
      );
      expect(askPrices.length).toBeGreaterThan(0);
    });
  });
});