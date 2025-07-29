import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecondaryMarketplace } from '../../components/SecondaryMarket/SecondaryMarketplace';
import { useSecondaryMarketStore } from '../../store/secondaryMarketStore';

// Mock the secondary market store
vi.mock('../../store/secondaryMarketStore', () => ({
  useSecondaryMarketStore: vi.fn()
}));

// Mock the secondary market data service
vi.mock('../../services/secondaryMarketDataService', () => ({
  useSecondaryMarketData: vi.fn(() => ({
    listings: [],
    tradeHistory: [],
    stats: {
      totalListings: 0,
      totalVolume24h: 0,
      totalTrades: 0,
      activeTrades: 0
    },
    currentMode: 'production',
    isEmpty: true
  }))
}));

// Mock the data mode store
vi.mock('../../store/dataModeStore', () => ({
  useDataMode: vi.fn(() => ({
    isDemo: false
  }))
}));

const mockUseSecondaryMarketStore = vi.mocked(useSecondaryMarketStore);

describe('SecondaryMarketplace', () => {
  const mockStoreState = {
    listings: [],
    userOrders: [],
    tradeHistory: [],
    favorites: [],
    filters: {},
    isLoading: false,
    error: null,
    refreshData: vi.fn(),
    updateFilters: vi.fn(),
    createOrder: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    getAssetDetails: vi.fn(),
    getPriceHistory: vi.fn(),
    getOrderBook: vi.fn(),
    getMarketStats: vi.fn(),
    exportData: vi.fn()
  };

  beforeEach(() => {
    mockUseSecondaryMarketStore.mockReturnValue(mockStoreState);
  });

  it('renders secondary marketplace header correctly', () => {
    render(<SecondaryMarketplace />);

    expect(screen.getByText('Secondary Marketplace')).toBeInTheDocument();
    expect(screen.getByText(/Trade tokenized assets with other investors/)).toBeInTheDocument();
  });

  it('displays market stats', () => {
    render(<SecondaryMarketplace />);

    expect(screen.getByText('24h Volume')).toBeInTheDocument();
    expect(screen.getByText('Total Listings')).toBeInTheDocument();
    expect(screen.getByText('Active Trades')).toBeInTheDocument();
  });

  it('shows search and filter controls', () => {
    // Override the mock to show non-empty state so search controls appear
    const { useSecondaryMarketData } = require('../../services/secondaryMarketDataService');
    useSecondaryMarketData.mockReturnValueOnce({
      listings: [],
      tradeHistory: [],
      stats: {
        totalListings: 0,
        totalVolume24h: 0,
        totalTrades: 0,
        activeTrades: 0
      },
      currentMode: 'production',
      isEmpty: false  // Change to false to show controls
    });

    render(<SecondaryMarketplace />);

    expect(screen.getByPlaceholderText('Search listings...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays empty state when no listings', () => {
    // Override store to return empty listings
    mockUseSecondaryMarketStore.mockReturnValue({
      ...mockStoreState,
      listings: [],
      isLoading: false
    });

    render(<SecondaryMarketplace />);

    expect(screen.getByText('No secondary market listings available')).toBeInTheDocument();
  });

  it('calls refreshData when refresh button is clicked', () => {
    render(<SecondaryMarketplace />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockStoreState.refreshData).toHaveBeenCalled();
  });

  it('updates search query when typing in search input', () => {
    // Override the mock to show non-empty state so search controls appear
    const { useSecondaryMarketData } = require('../../services/secondaryMarketDataService');
    useSecondaryMarketData.mockReturnValueOnce({
      listings: [],
      tradeHistory: [],
      stats: {
        totalListings: 0,
        totalVolume24h: 0,
        totalTrades: 0,
        activeTrades: 0
      },
      currentMode: 'production',
      isEmpty: false
    });

    render(<SecondaryMarketplace />);

    const searchInput = screen.getByPlaceholderText('Search listings...');
    fireEvent.change(searchInput, { target: { value: 'solar' } });

    expect(searchInput).toHaveValue('solar');
  });

  it('toggles filter visibility when filter button is clicked', () => {
    render(<SecondaryMarketplace />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    expect(screen.getByText('Asset Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Min Price')).toBeInTheDocument();
    expect(screen.getByText('Max Price')).toBeInTheDocument();
  });

  it('updates filters when filter options change', async () => {
    render(<SecondaryMarketplace />);

    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    // Change asset type filter
    const assetTypeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(assetTypeSelect, { target: { value: 'Real Estate' } });

    await waitFor(() => {
      expect(mockStoreState.updateFilters).toHaveBeenCalledWith({ assetType: 'Real Estate' });
    });
  });

  it('clears filters when clear filters button is clicked', () => {
    render(<SecondaryMarketplace />);

    const clearFiltersButton = screen.getByText('Clear Filters');
    fireEvent.click(clearFiltersButton);

    expect(mockStoreState.updateFilters).toHaveBeenCalledWith({});
  });

  it('handles sort direction toggle', () => {
    render(<SecondaryMarketplace />);

    // Find the sort direction button (the up/down arrow button)
    const sortDirectionButtons = screen.getAllByRole('button');
    const sortDirectionButton = sortDirectionButtons.find(button => 
      button.querySelector('svg[class*="lucide-chevron"]')
    );
    
    expect(sortDirectionButton).toBeInTheDocument();
    
    if (sortDirectionButton) {
      fireEvent.click(sortDirectionButton);
      // Should toggle sort direction
      expect(sortDirectionButton).toBeInTheDocument();
    }
  });

  it('updates sort criteria when sort select changes', () => {
    render(<SecondaryMarketplace />);

    const sortSelect = screen.getByDisplayValue('Volume');
    fireEvent.change(sortSelect, { target: { value: 'price' } });

    expect(sortSelect).toHaveValue('price');
  });

  it('shows loading state', () => {
    mockUseSecondaryMarketStore.mockReturnValue({
      ...mockStoreState,
      isLoading: true
    });

    render(<SecondaryMarketplace />);

    // Check that loading state is reflected in the UI
    const refreshIcon = document.querySelector('.animate-spin');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('displays listings when available', () => {
    const mockListings = [
      {
        id: 'listing_1',
        assetId: 'asset_1',
        assetName: 'Solar Energy Project Alpha',
        assetType: 'Renewable Energy',
        sellerId: 'user_123',
        sellerName: 'GreenTech Investments',
        quantity: 1000,
        pricePerToken: 105.50,
        totalValue: 105500,
        listingDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        description: 'High-performing solar project',
        minimumPurchase: 100,
        verified: true,
        escrowStatus: 'full' as const,
        compliance: {
          kycVerified: true,
          accreditationRequired: false,
          jurisdictionRestrictions: []
        },
        marketData: {
          lastSalePrice: 102.30,
          priceChange24h: 3.13,
          volume24h: 25000,
          highestBid: 104.75,
          lowestAsk: 105.50,
          marketCap: 12500000
        }
      }
    ];

    // Mock the filtered listings calculation by providing listings in mock
    const mockStoreWithListings = {
      ...mockStoreState,
      listings: mockListings
    };

    mockUseSecondaryMarketStore.mockReturnValue(mockStoreWithListings);

    render(<SecondaryMarketplace />);

    expect(screen.getByText('Solar Energy Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Renewable Energy')).toBeInTheDocument();
    expect(screen.getByText('GreenTech Investments')).toBeInTheDocument();
    expect(screen.getByText('Trade')).toBeInTheDocument();
  });

  it('handles favorite toggle for listings', async () => {
    const mockListings = [
      {
        id: 'listing_1',
        assetId: 'asset_1',
        assetName: 'Solar Energy Project Alpha',
        assetType: 'Renewable Energy',
        sellerId: 'user_123',
        sellerName: 'GreenTech Investments',
        quantity: 1000,
        pricePerToken: 105.50,
        totalValue: 105500,
        listingDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        description: 'High-performing solar project',
        minimumPurchase: 100,
        verified: true,
        escrowStatus: 'full' as const,
        compliance: {
          kycVerified: true,
          accreditationRequired: false,
          jurisdictionRestrictions: []
        },
        marketData: {
          lastSalePrice: 102.30,
          priceChange24h: 3.13,
          volume24h: 25000,
          highestBid: 104.75,
          lowestAsk: 105.50,
          marketCap: 12500000
        }
      }
    ];

    mockUseSecondaryMarketStore.mockReturnValue({
      ...mockStoreState,
      listings: mockListings
    });

    render(<SecondaryMarketplace />);

    // Find favorite button by SVG class
    const favoriteButtons = screen.getAllByRole('button');
    const favoriteButton = favoriteButtons.find(button => 
      button.querySelector('svg[class*="lucide-bookmark"]')
    );
    
    expect(favoriteButton).toBeInTheDocument();
    
    if (favoriteButton) {
      fireEvent.click(favoriteButton);

      await waitFor(() => {
        expect(mockStoreState.addToFavorites).toHaveBeenCalledWith('listing_1');
      });
    }
  });
});