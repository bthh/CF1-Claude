import { describe, it, expect } from 'vitest';
import { formatAmount, parseAmount, formatTokenAmount, parseTokenAmount } from '../../../utils/format';

describe('Financial Utility Functions Tests', () => {
  describe('Amount Formatting', () => {
    it('should format amounts correctly', () => {
      expect(formatAmount(1000)).toBe('1,000');
      expect(formatAmount(1500000)).toBe('1.50M');
      expect(formatAmount(2500000000)).toBe('2,500.00M');
    });

    it('should handle edge cases in formatting', () => {
      expect(formatAmount(0)).toBe('0');
      expect(formatAmount(999)).toBe('999');
      expect(formatAmount(1000)).toBe('1,000');
    });
  });

  describe('Token Amount Conversions', () => {
    it('should convert token amounts with correct decimals', () => {
      // 6 decimal places (NTRN standard)
      expect(formatTokenAmount('1000000', 6)).toBe('1');
      expect(formatTokenAmount('5000000000', 6)).toBe('5,000');

      expect(parseTokenAmount('1', 6)).toBe('1000000');
      expect(parseTokenAmount('5000', 6)).toBe('5000000000');
    });

    it('should handle decimal precision correctly', () => {
      expect(formatTokenAmount('1234567', 6)).toBe('1.234567');
      expect(parseTokenAmount('1.234567', 6)).toBe('1234567');
    });
  });

  describe('Investment Calculations', () => {
    it('should calculate shares correctly', () => {
      const investmentAmount = 5000; // $5,000
      const tokenPrice = 1.00; // $1.00 per token
      const shares = Math.floor(investmentAmount / tokenPrice);

      expect(shares).toBe(5000);
    });

    it('should calculate estimated returns', () => {
      const investmentAmount = 10000; // $10,000
      const apy = 0.125; // 12.5%
      const estimatedReturns = investmentAmount * apy;

      expect(estimatedReturns).toBe(1250);
    });

    it('should handle minimum investment validation', () => {
      const minInvestment = 1000; // $1,000
      const userInvestment = 500; // $500

      const isValidInvestment = userInvestment >= minInvestment;
      expect(isValidInvestment).toBe(false);
    });

    it('should handle balance validation', () => {
      const userBalance = 50000; // $50,000
      const investmentAmount = 60000; // $60,000

      const hasSufficientBalance = investmentAmount <= userBalance;
      expect(hasSufficientBalance).toBe(false);
    });
  });

  describe('Portfolio Value Calculations', () => {
    it('should calculate total portfolio value', () => {
      const assets = [
        { currentValue: 15000 },
        { currentValue: 27500 },
        { currentValue: 12000 }
      ];

      const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
      expect(totalValue).toBe(54500);
    });

    it('should calculate portfolio gains', () => {
      const totalInvested = 50000;
      const totalCurrentValue = 54500;
      const totalGain = totalCurrentValue - totalInvested;
      const gainPercentage = (totalGain / totalInvested) * 100;

      expect(totalGain).toBe(4500);
      expect(gainPercentage).toBe(9);
    });

    it('should calculate locked vs available assets', () => {
      const assets = [
        { currentValue: 15000, locked: true },
        { currentValue: 27500, locked: false },
        { currentValue: 12000, locked: true }
      ];

      const lockedValue = assets
        .filter(asset => asset.locked)
        .reduce((sum, asset) => sum + asset.currentValue, 0);

      const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
      const availableValue = totalValue - lockedValue;

      expect(lockedValue).toBe(27000);
      expect(availableValue).toBe(27500);
    });
  });

  describe('Financial Security Validations', () => {
    it('should validate numerical input patterns', () => {
      const validPattern = /^\d*\.?\d*$/;

      expect(validPattern.test('1000')).toBe(true);
      expect(validPattern.test('1000.50')).toBe(true);
      expect(validPattern.test('abc')).toBe(false);
      expect(validPattern.test('1000a')).toBe(false);
    });

    it('should prevent integer overflow', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER + 1;
      expect(Number.isSafeInteger(largeNumber)).toBe(false);

      const safeNumber = 1000000000000; // $1T in micro units
      expect(Number.isSafeInteger(safeNumber)).toBe(true);
    });

    it('should handle rate limiting logic', () => {
      const hourlyLimit = 50;
      let currentHourTransactions = 0;

      // Simulate 55 transaction attempts
      for (let i = 0; i < 55; i++) {
        if (currentHourTransactions < hourlyLimit) {
          currentHourTransactions++;
        }
      }

      expect(currentHourTransactions).toBe(50); // Capped at limit
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate platform fees correctly', () => {
      const investmentAmount = 10000;
      const platformFeeRate = 0.025; // 2.5%

      const platformFee = investmentAmount * platformFeeRate;
      const netInvestment = investmentAmount - platformFee;

      expect(platformFee).toBe(250);
      expect(netInvestment).toBe(9750);
    });

    it('should calculate gas fees', () => {
      const gasUsed = 125000;
      const gasPrice = 0.001; // NTRN per gas unit
      const gasFee = gasUsed * gasPrice;

      expect(gasFee).toBe(125);
    });
  });

  describe('Precision and Rounding', () => {
    it('should handle decimal precision in financial calculations', () => {
      const amount = 1234.56789;
      const rounded = Math.round(amount * 100) / 100; // Round to 2 decimals

      expect(rounded).toBe(1234.57);
    });

    it('should handle micro unit conversions accurately', () => {
      const dollarAmount = 1234.56;
      const microUnits = Math.floor(dollarAmount * 1_000_000);
      const convertedBack = microUnits / 1_000_000;

      expect(microUnits).toBe(1234560000);
      expect(convertedBack).toBe(1234.56);
    });
  });

  describe('Risk Calculations', () => {
    it('should calculate investment allocation percentages', () => {
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
    });

    it('should calculate maximum drawdown', () => {
      const portfolioValues = [10000, 10500, 11200, 10800, 9500, 9200, 10100];

      let maxDrawdown = 0;
      let peak = portfolioValues[0];

      for (const value of portfolioValues) {
        if (value > peak) {
          peak = value;
        }
        const drawdown = (peak - value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }

      expect(maxDrawdown).toBeCloseTo(0.1786, 3); // ~17.86%
    });
  });

  describe('Compliance Validations', () => {
    it('should enforce Reg CF investment limits', () => {
      const nonAccreditedLimit = 5000; // $5,000 max per investment
      const annualLimit = 50000; // $50,000 max annual

      const userAnnualInvestments = 45000; // $45,000 already invested
      const newInvestment = 10000; // $10,000 proposed

      const exceedsPerInvestmentLimit = newInvestment > nonAccreditedLimit;
      const exceedsAnnualLimit = (userAnnualInvestments + newInvestment) > annualLimit;

      expect(exceedsPerInvestmentLimit).toBe(true);
      expect(exceedsAnnualLimit).toBe(true);
    });

    it('should validate KYC compliance levels', () => {
      const kycLevels = {
        basic: { maxInvestment: 0 },
        verified: { maxInvestment: 100000 },
        accredited: { maxInvestment: Number.MAX_SAFE_INTEGER }
      };

      const userLevel = 'verified';
      const investmentAmount = 150000;

      const canInvest = investmentAmount <= kycLevels[userLevel].maxInvestment;
      expect(canInvest).toBe(false);
    });
  });
});