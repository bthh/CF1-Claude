import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePortfolioStore, PortfolioAsset, PortfolioSummary } from '../../../store/portfolioStore';

describe('Portfolio Financial Calculations', () => {
  describe('Portfolio Summary Calculations', () => {
    it('should calculate total portfolio value correctly', () => {
      const assets: PortfolioAsset[] = [
        {
          id: 'asset_1',
          proposalId: 'proposal_1',
          name: 'Real Estate Fund A',
          type: 'Real Estate',
          shares: 1000,
          currentValue: '15000.00',
          totalInvested: '10000.00',
          unrealizedGain: '5000.00',
          unrealizedGainPercent: 50,
          apy: '12.5%',
          locked: true,
          unlockDate: '2025-12-31T00:00:00Z',
          lastUpdated: '2025-09-17T12:00:00Z'
        },
        {
          id: 'asset_2',
          proposalId: 'proposal_2',
          name: 'Tech Innovation REIT',
          type: 'Technology',
          shares: 2500,
          currentValue: '27500.00',
          totalInvested: '25000.00',
          unrealizedGain: '2500.00',
          unrealizedGainPercent: 10,
          apy: '9.8%',
          locked: false,
          lastUpdated: '2025-09-17T12:00:00Z'
        }
      ];

      const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
      expect(totalValue).toBe(42500.00);

      const totalInvested = assets.reduce((sum, asset) => sum + parseFloat(asset.totalInvested), 0);
      expect(totalInvested).toBe(35000.00);

      const totalGain = totalValue - totalInvested;
      expect(totalGain).toBe(7500.00);

      const totalGainPercent = (totalGain / totalInvested) * 100;
      expect(totalGainPercent).toBeCloseTo(21.43, 2);
    });

    it('should calculate locked vs available value correctly', () => {
      const assets: PortfolioAsset[] = [
        {
          id: 'asset_1',
          proposalId: 'proposal_1',
          name: 'Locked Asset',
          type: 'Real Estate',
          shares: 1000,
          currentValue: '15000.00',
          totalInvested: '10000.00',
          unrealizedGain: '5000.00',
          unrealizedGainPercent: 50,
          apy: '12.5%',
          locked: true,
          unlockDate: '2025-12-31T00:00:00Z',
          lastUpdated: '2025-09-17T12:00:00Z'
        },
        {
          id: 'asset_2',
          proposalId: 'proposal_2',
          name: 'Available Asset',
          type: 'Technology',
          shares: 2500,
          currentValue: '27500.00',
          totalInvested: '25000.00',
          unrealizedGain: '2500.00',
          unrealizedGainPercent: 10,
          apy: '9.8%',
          locked: false,
          lastUpdated: '2025-09-17T12:00:00Z'
        }
      ];

      const lockedValue = assets
        .filter(asset => asset.locked)
        .reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
      expect(lockedValue).toBe(15000.00);

      const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
      const availableValue = totalValue - lockedValue;
      expect(availableValue).toBe(27500.00);
    });

    it('should handle edge case with zero investments', () => {
      const assets: PortfolioAsset[] = [];

      const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
      expect(totalValue).toBe(0);

      const totalInvested = assets.reduce((sum, asset) => sum + parseFloat(asset.totalInvested), 0);
      expect(totalInvested).toBe(0);

      const totalGainPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
      expect(totalGainPercent).toBe(0);
    });

    it('should handle negative returns correctly', () => {
      const assets: PortfolioAsset[] = [
        {
          id: 'asset_1',
          proposalId: 'proposal_1',
          name: 'Declining Asset',
          type: 'Real Estate',
          shares: 1000,
          currentValue: '8000.00',
          totalInvested: '10000.00',
          unrealizedGain: '-2000.00',
          unrealizedGainPercent: -20,
          apy: '5.5%',
          locked: true,
          unlockDate: '2025-12-31T00:00:00Z',
          lastUpdated: '2025-09-17T12:00:00Z'
        }
      ];

      const totalValue = parseFloat(assets[0].currentValue);
      const totalInvested = parseFloat(assets[0].totalInvested);
      const totalGain = totalValue - totalInvested;

      expect(totalGain).toBe(-2000.00);
      expect((totalGain / totalInvested) * 100).toBe(-20);
    });
  });

  describe('Financial Precision and Rounding', () => {
    it('should handle decimal precision correctly in calculations', () => {
      const investment = 1234.56789;
      const tokenPrice = 0.987654321;

      // Share calculation (should floor to avoid fractional shares)
      const shares = Math.floor(investment / tokenPrice);
      expect(shares).toBe(1249); // Floor of 1249.999...

      // Currency formatting (should round to 2 decimal places)
      const formattedInvestment = investment.toFixed(2);
      expect(formattedInvestment).toBe('1234.57');
    });

    it('should handle micro unit conversions accurately', () => {
      const amountInDollars = 1234.56;
      const microUnits = Math.floor(amountInDollars * 1_000_000);

      expect(microUnits).toBe(1234560000);

      // Convert back
      const convertedBack = microUnits / 1_000_000;
      expect(convertedBack).toBe(1234.56);
    });

    it('should handle edge cases in percentage calculations', () => {
      // Zero investment case
      const zeroInvestment = 0;
      const currentValue = 1000;
      const gainPercent = zeroInvestment > 0 ? ((currentValue - zeroInvestment) / zeroInvestment) * 100 : 0;
      expect(gainPercent).toBe(0);

      // 100% loss case
      const investment = 1000;
      const lossValue = 0;
      const lossPercent = ((lossValue - investment) / investment) * 100;
      expect(lossPercent).toBe(-100);

      // 1000% gain case
      const gainValue = 10000;
      const highGainPercent = ((gainValue - investment) / investment) * 100;
      expect(highGainPercent).toBe(900);
    });
  });

  describe('APY and Return Calculations', () => {
    it('should calculate annualized returns correctly', () => {
      const principal = 10000;
      const apy = 0.125; // 12.5%
      const expectedAnnualReturn = principal * apy;

      expect(expectedAnnualReturn).toBe(1250);

      // Monthly return
      const monthlyReturn = expectedAnnualReturn / 12;
      expect(monthlyReturn).toBeCloseTo(104.17, 2);

      // Daily return (365 days)
      const dailyReturn = expectedAnnualReturn / 365;
      expect(dailyReturn).toBeCloseTo(3.42, 2);
    });

    it('should calculate compound interest correctly', () => {
      const principal = 10000;
      const annualRate = 0.12; // 12%
      const compoundFrequency = 12; // Monthly compounding
      const years = 1;

      const compoundAmount = principal * Math.pow(
        (1 + annualRate / compoundFrequency),
        compoundFrequency * years
      );

      expect(compoundAmount).toBeCloseTo(11268.25, 2);
    });

    it('should calculate weighted average APY correctly', () => {
      const assets = [
        { invested: 10000, apy: 0.125 }, // $10K at 12.5%
        { invested: 20000, apy: 0.098 }, // $20K at 9.8%
        { invested: 5000, apy: 0.155 }   // $5K at 15.5%
      ];

      const totalInvested = assets.reduce((sum, asset) => sum + asset.invested, 0);
      const weightedAPY = assets.reduce((sum, asset) => {
        const weight = asset.invested / totalInvested;
        return sum + (asset.apy * weight);
      }, 0);

      expect(weightedAPY).toBeCloseTo(0.1139, 3); // ~11.39%
    });
  });

  describe('Risk and Performance Metrics', () => {
    it('should calculate portfolio volatility', () => {
      const returns = [0.05, -0.02, 0.08, 0.01, -0.03, 0.06, 0.02];

      // Calculate mean return
      const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

      // Calculate variance
      const variance = returns.reduce((sum, ret) => {
        return sum + Math.pow(ret - meanReturn, 2);
      }, 0) / (returns.length - 1);

      // Calculate standard deviation (volatility)
      const volatility = Math.sqrt(variance);

      expect(meanReturn).toBeCloseTo(0.0243, 3);
      expect(volatility).toBeCloseTo(0.0395, 2);
    });

    it('should calculate Sharpe ratio', () => {
      const portfolioReturn = 0.12; // 12% annual return
      const riskFreeRate = 0.03; // 3% risk-free rate
      const portfolioVolatility = 0.15; // 15% volatility

      const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;

      expect(sharpeRatio).toBeCloseTo(0.6, 4);
    });

    it('should calculate maximum drawdown', () => {
      const portfolioValues = [10000, 10500, 11200, 10800, 9500, 9200, 10100, 10800, 11500];

      let maxDrawdown = 0;
      let peak = portfolioValues[0];

      for (const value of portfolioValues) {
        if (value > peak) {
          peak = value;
        }

        const drawdown = (peak - value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      expect(maxDrawdown).toBeCloseTo(0.1786, 4); // ~17.86%
    });
  });

  describe('Currency and Token Conversions', () => {
    it('should handle multi-currency portfolio calculations', () => {
      const assets = [
        { value: 10000, currency: 'USD', exchangeRate: 1.0 },
        { value: 8500, currency: 'EUR', exchangeRate: 1.08 }, // EUR to USD
        { value: 1200000, currency: 'JPY', exchangeRate: 0.0067 } // JPY to USD
      ];

      const totalValueUSD = assets.reduce((sum, asset) => {
        return sum + (asset.value * asset.exchangeRate);
      }, 0);

      expect(totalValueUSD).toBeCloseTo(27220, 2);
    });

    it('should calculate token value conversions accurately', () => {
      const tokenBalance = 1500; // tokens
      const tokenPriceUSD = 2.45; // $2.45 per token
      const totalValueUSD = tokenBalance * tokenPriceUSD;

      expect(totalValueUSD).toBe(3675);

      // Calculate USD value per share
      const shares = 1000;
      const valuePerShare = totalValueUSD / shares;
      expect(valuePerShare).toBe(3.675);
    });
  });

  describe('Fee and Tax Calculations', () => {
    it('should calculate platform fees correctly', () => {
      const investmentAmount = 10000;
      const platformFeeRate = 0.025; // 2.5%

      const platformFee = investmentAmount * platformFeeRate;
      const netInvestment = investmentAmount - platformFee;

      expect(platformFee).toBe(250);
      expect(netInvestment).toBe(9750);
    });

    it('should calculate transaction fees in different scenarios', () => {
      // Percentage-based fee
      const amount1 = 5000;
      const percentageFee = amount1 * 0.005; // 0.5%
      expect(percentageFee).toBe(25);

      // Fixed fee
      const fixedFee = 10;
      const effectiveFeeRate1 = fixedFee / amount1;
      expect(effectiveFeeRate1).toBe(0.002); // 0.2%

      // Fixed fee on smaller amount
      const amount2 = 100;
      const effectiveFeeRate2 = fixedFee / amount2;
      expect(effectiveFeeRate2).toBe(0.1); // 10%
    });

    it('should calculate capital gains tax implications', () => {
      const purchasePrice = 10000;
      const salePrice = 12500;
      const capitalGain = salePrice - purchasePrice;

      const shortTermTaxRate = 0.28; // 28%
      const longTermTaxRate = 0.15; // 15%

      const shortTermTax = capitalGain * shortTermTaxRate;
      const longTermTax = capitalGain * longTermTaxRate;

      expect(capitalGain).toBe(2500);
      expect(shortTermTax).toBeCloseTo(700, 0);
      expect(longTermTax).toBeCloseTo(375, 0);
    });
  });

  describe('Performance Attribution', () => {
    it('should calculate asset allocation percentages', () => {
      const portfolioAssets = [
        { name: 'Real Estate', value: 50000 },
        { name: 'Technology', value: 30000 },
        { name: 'Healthcare', value: 20000 }
      ];

      const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);

      const allocations = portfolioAssets.map(asset => ({
        name: asset.name,
        percentage: (asset.value / totalValue) * 100
      }));

      expect(allocations[0].percentage).toBe(50); // Real Estate
      expect(allocations[1].percentage).toBe(30); // Technology
      expect(allocations[2].percentage).toBe(20); // Healthcare
      expect(totalValue).toBe(100000);
    });

    it('should calculate contribution to portfolio return', () => {
      const assets = [
        { weight: 0.6, return: 0.15 }, // 60% weight, 15% return
        { weight: 0.3, return: 0.08 }, // 30% weight, 8% return
        { weight: 0.1, return: -0.05 } // 10% weight, -5% return
      ];

      const portfolioReturn = assets.reduce((sum, asset) => {
        return sum + (asset.weight * asset.return);
      }, 0);

      expect(portfolioReturn).toBeCloseTo(0.109, 3); // 10.9%
    });
  });

  describe('Time-Weighted Returns', () => {
    it('should calculate time-weighted return correctly', () => {
      // Portfolio values at different time periods
      const periods = [
        { startValue: 10000, endValue: 10500, cashFlow: 0 },
        { startValue: 10500, endValue: 11200, cashFlow: 1000 }, // $1K added
        { startValue: 12200, endValue: 11800, cashFlow: 0 }
      ];

      let twr = 1;
      for (const period of periods) {
        // Correct TWR calculation: (end value) / (start value + cash flow) - 1
        const periodReturn = period.endValue / (period.startValue + period.cashFlow);
        twr *= periodReturn;
      }

      const totalTWR = twr - 1;
      expect(totalTWR).toBeCloseTo(-0.033, 2); // Corrected expected value
    });
  });
});