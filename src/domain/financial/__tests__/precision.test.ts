import { describe, it, expect } from 'vitest';
import { safeAdd, safeSubtract, safeMultiply, safeDivide, safeRound } from '../precision';

describe('Precision Math Utilities', () => {
  it('should accurately perform additions without IEEE-754 errors', () => {
    expect(safeAdd('0.1', '0.2')).toBe('0.3');
    expect(safeAdd('100.005', '0.005')).toBe('100.01');
  });

  it('should accurately perform subtractions', () => {
    expect(safeSubtract('1.00', '0.99')).toBe('0.01');
    expect(safeSubtract('1000000', '0.000001')).toBe('999999.999999');
  });

  it('should accurately perform multiplications', () => {
    expect(safeMultiply('100.5', '1.1')).toBe('110.55');
  });

  it('should perform division and handle division by zero safely', () => {
    expect(safeDivide('10', '4')).toBe('2.5');
    expect(() => safeDivide('10', '0')).toThrow(/Division by zero/);
  });

  it('should round using ROUND_HALF_UP strategy', () => {
    expect(safeRound('1.005', 2)).toBe('1.01');
    expect(safeRound('1.004', 2)).toBe('1.00');
  });
});
