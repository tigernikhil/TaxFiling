// backend/tests/taxCalculator.test.js
const assert = require('assert');
const { calculateNewRegime, calculateOldRegime, compareRegimes } = require('../utils/taxCalculator');

describe('Tax Calculator Tests', () => {
  
  test('New Regime: Salary Income', () => {
    const incomeDetails = { salary: 1500000 };
    const taxCredits = { tdsSalary: 30000 };
    
    const result = calculateNewRegime(incomeDetails, taxCredits);
    
    assert(result.totalTax > 0);
    assert.strictEqual(result.standardDeduction, 75000);
  });

  test('Old Regime: With Deductions', () => {
    const incomeDetails = { salary: 1500000 };
    const deductions = { section80C: 150000, section80D: 25000 };
    const taxCredits = { tdsSalary: 30000 };
    
    const result = calculateOldRegime(incomeDetails, deductions, taxCredits);
    
    assert(result.totalTax > 0);
  });

  test('Tax Comparison: New vs Old', () => {
    const newRegime = { totalTax: 265980, tdsCredited: 30000 };
    const oldRegime = { totalTax: 223080, tdsCredited: 30000 };
    
    const comparison = compareRegimes(newRegime, oldRegime);
    
    assert(comparison.savings > 0);
    assert.strictEqual(comparison.recommendation, 'old');
  });
});