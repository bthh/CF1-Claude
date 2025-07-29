import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecondaryMarketStore } from '../../store/secondaryMarketStore';

describe('secondaryMarketStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { getState } = useSecondaryMarketStore;
    act(() => {
      useSecondaryMarketStore.setState({
        orders: [],
        userOrders: [],
        trades: [],
        userTrades: [],
        tradeHistory: [],
        marketData: {},
        favorites: [],
        orderBooks: {},
        marketStats: null,
        filters: {},
        isLoading: false,
        error: null,
        selectedAsset: null,
        lastUpdated: new Date().toISOString(),
        priceAlerts: []
      });
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    expect(result.current.orders).toEqual([]);
    expect(result.current.userOrders).toEqual([]);
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.autoRefresh).toBe(true);
    expect(result.current.refreshInterval).toBe(30);
  });

  it('creates order successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    const orderData = {
      assetId: 'asset_1',
      assetName: 'Test Asset',
      userId: 'user_1',
      userName: 'Test User',
      type: 'buy' as const,
      orderType: 'market' as const,
      quantity: 100,
      totalValue: 10000,
      fees: {
        platformFee: 50,
        gasFee: 15,
        total: 65
      },
      compliance: {
        kycVerified: true,
        accreditationChecked: true,
        jurisdictionAllowed: true
      }
    };

    let orderId: string;
    await act(async () => {
      orderId = await result.current.createOrder(orderData);
    });

    expect(orderId).toBeDefined();
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.userOrders).toHaveLength(1);
    expect(result.current.orders[0]).toMatchObject({
      ...orderData,
      id: orderId,
      status: 'pending'
    });
  });

  it('cancels order successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Create an order first
    const orderData = {
      assetId: 'asset_1',
      assetName: 'Test Asset',
      userId: 'user_1',
      userName: 'Test User',
      type: 'buy' as const,
      orderType: 'market' as const,
      quantity: 100,
      totalValue: 10000,
      fees: { platformFee: 50, gasFee: 15, total: 65 },
      compliance: { kycVerified: true, accreditationChecked: true, jurisdictionAllowed: true }
    };

    let orderId: string;
    await act(async () => {
      orderId = await result.current.createOrder(orderData);
    });

    // Cancel the order
    await act(async () => {
      await result.current.cancelOrder(orderId);
    });

    const cancelledOrder = result.current.orders.find(o => o.id === orderId);
    expect(cancelledOrder?.status).toBe('cancelled');
  });

  it('executes market order successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    let orderId: string;
    await act(async () => {
      orderId = await result.current.executeMarketOrder('asset_1', 'buy', 100);
    });

    expect(orderId).toBeDefined();
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].orderType).toBe('market');
    expect(result.current.orders[0].type).toBe('buy');
    expect(result.current.orders[0].quantity).toBe(100);
  });

  it('places limit order successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    let orderId: string;
    await act(async () => {
      orderId = await result.current.placeLimitOrder('asset_1', 'sell', 50, 105.50);
    });

    expect(orderId).toBeDefined();
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].orderType).toBe('limit');
    expect(result.current.orders[0].pricePerToken).toBe(105.50);
  });

  it('adds and removes favorites', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.addToFavorites('asset_1');
    });

    expect(result.current.favorites).toContain('asset_1');

    act(() => {
      result.current.removeFromFavorites('asset_1');
    });

    expect(result.current.favorites).not.toContain('asset_1');
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.updateFilters({
        assetType: 'Real Estate',
        minPrice: 100,
        maxPrice: 500
      });
    });

    expect(result.current.filters).toEqual({
      assetType: 'Real Estate',
      minPrice: 100,
      maxPrice: 500
    });
  });

  it('clears filters', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Set some filters first
    act(() => {
      result.current.updateFilters({ assetType: 'Technology' });
    });

    // Clear filters
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });

  it('calculates fees correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    const marketFees = result.current.calculateFees(10000, 'market');
    expect(marketFees.platformFee).toBe(50); // 0.5% of 10000
    expect(marketFees.gasFee).toBe(16); // 15 + 0.0001 * 10000
    expect(marketFees.total).toBe(66);

    const limitFees = result.current.calculateFees(10000, 'limit');
    expect(limitFees.platformFee).toBe(30); // 0.3% of 10000
    expect(limitFees.total).toBe(46);
  });

  it('validates orders correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Valid order
    const validOrder = {
      quantity: 100,
      pricePerToken: 105.50,
      assetId: 'asset_1',
      orderType: 'limit' as const
    };

    const validResult = result.current.validateOrder(validOrder);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Invalid order - no quantity
    const invalidOrder = {
      quantity: 0,
      assetId: 'asset_1'
    };

    const invalidResult = result.current.validateOrder(invalidOrder);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toContain('Quantity must be greater than 0');
  });

  it('formats currency correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    expect(result.current.formatCurrency(1234.56)).toBe('$1,234.56');
    expect(result.current.formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats percentages correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    expect(result.current.formatPercentage(5.25)).toBe('5.25%');
    expect(result.current.formatPercentage(-2.75)).toBe('-2.75%');
  });

  it('creates price alerts', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.createPriceAlert('asset_1', 'above', 110.00);
    });

    expect(result.current.priceAlerts).toHaveLength(1);
    expect(result.current.priceAlerts[0]).toMatchObject({
      assetId: 'asset_1',
      condition: 'above',
      targetPrice: 110.00,
      enabled: true
    });
  });

  it('removes price alerts', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Create alert first
    act(() => {
      result.current.createPriceAlert('asset_1', 'above', 110.00);
    });

    const alertId = result.current.priceAlerts[0].id;

    // Remove alert
    act(() => {
      result.current.removePriceAlert(alertId);
    });

    expect(result.current.priceAlerts).toHaveLength(0);
  });

  it('updates settings correctly', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.updateSettings({
        orderFilled: false,
        priceAlerts: true
      });
    });

    expect(result.current.notifications.orderFilled).toBe(false);
    expect(result.current.notifications.priceAlerts).toBe(true);
  });

  it('toggles auto refresh', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    const initialAutoRefresh = result.current.autoRefresh;

    act(() => {
      result.current.setAutoRefresh(!initialAutoRefresh);
    });

    expect(result.current.autoRefresh).toBe(!initialAutoRefresh);
  });

  it('sets refresh interval', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.setRefreshInterval(60);
    });

    expect(result.current.refreshInterval).toBe(60);
  });

  it('gets asset details and caches them', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    let assetDetails;
    await act(async () => {
      assetDetails = await result.current.getAssetDetails('asset_1');
    });

    expect(assetDetails).toBeDefined();
    expect(assetDetails.assetId).toBe('asset_1');
    expect(result.current.marketData['asset_1']).toBeDefined();
  });

  it('gets order book successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    let orderBook;
    await act(async () => {
      orderBook = await result.current.getOrderBook('asset_1');
    });

    expect(orderBook).toBeDefined();
    expect(orderBook.assetId).toBe('asset_1');
    expect(orderBook.bids).toBeDefined();
    expect(orderBook.asks).toBeDefined();
    expect(result.current.orderBooks['asset_1']).toBeDefined();
  });

  it('refreshes data successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.marketData).toBeDefined();
    expect(result.current.lastUpdated).toBeDefined();
  });

  it('handles portfolio calculations', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    const portfolioValue = result.current.calculatePortfolioValue();
    expect(typeof portfolioValue).toBe('number');
    expect(portfolioValue).toBeGreaterThan(0);

    let performance;
    await act(async () => {
      performance = await result.current.getPortfolioPerformance('30d');
    });

    expect(performance).toBeDefined();
    expect(performance.totalValue).toBeDefined();
    expect(performance.totalPnl).toBeDefined();
    expect(performance.bestPerformer).toBeDefined();
    expect(performance.worstPerformer).toBeDefined();
  });

  it('modifies orders correctly', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Create an order first
    let orderId: string;
    await act(async () => {
      orderId = await result.current.createOrder({
        assetId: 'asset_1',
        assetName: 'Test Asset',
        userId: 'user_1',
        userName: 'Test User',
        type: 'buy',
        orderType: 'limit',
        quantity: 100,
        pricePerToken: 100.00,
        totalValue: 10000,
        fees: { platformFee: 30, gasFee: 15, total: 45 },
        compliance: { kycVerified: true, accreditationChecked: true, jurisdictionAllowed: true }
      });
    });

    // Modify the order
    await act(async () => {
      await result.current.modifyOrder(orderId, {
        quantity: 150,
        pricePerToken: 105.00
      });
    });

    const modifiedOrder = result.current.orders.find(o => o.id === orderId);
    expect(modifiedOrder?.quantity).toBe(150);
    expect(modifiedOrder?.pricePerToken).toBe(105.00);
  });

  it('handles real-time price updates', () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    act(() => {
      result.current.onPriceUpdate('asset_1', 108.50);
    });

    expect(result.current.marketData['asset_1']?.currentPrice).toBe(108.50);
    expect(result.current.marketData['asset_1']?.lastTradePrice).toBe(108.50);
  });

  it('exports data successfully', async () => {
    const { result } = renderHook(() => useSecondaryMarketStore());

    // Mock document methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const clickSpy = vi.fn();
    createElementSpy.mockReturnValue({
      click: clickSpy,
      href: '',
      download: ''
    } as any);

    await act(async () => {
      await result.current.exportData('json');
    });

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });
});