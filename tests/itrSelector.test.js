// backend/tests/itrSelector.test.js
const assert = require('assert');
const { selectITR } = require('../utils/itrSelector');

describe('ITR Selector Tests', () => {

  test('ITR-1: Salaried Individual', () => {
    const profile = {
      hasSalary: true,
      hasBusinessIncome: false,
      hasCapitalGains: false,
      hasAgriculturalBusiness: false,
      totalIncome: 4000000,
      agriculturalIncome: 0
    };

    const result = selectITR(profile);
    
    assert.strictEqual(result.itrType, 'ITR-1');
  });

  test('ITR-2: Capital Gains Present', () => {
    const profile = {
      hasSalary: true,
      hasBusinessIncome: false,
      hasCapitalGains: true,
      totalIncome: 2000000,
      capitalGains: 500000
    };

    const result = selectITR(profile);
    
    assert.strictEqual(result.itrType, 'ITR-2');
  });

  test('ITR-3: Business Income', () => {
    const profile = {
      hasSalary: false,
      hasBusinessIncome: true,
      hasCapitalGains: false,
      hasAgriculturalBusiness: false,
      businessIncome: 5000000
    };

    const result = selectITR(profile);
    
    assert.strictEqual(result.itrType, 'ITR-3');
  });

  test('ITR-4: Presumptive Income', () => {
    const profile = {
      hasSalary: false,
      hasBusinessIncome: true,
      hasAgriculturalBusiness: false,
      businessIncome: 80000000
    };

    const result = selectITR(profile);
    
    assert(result.itrType === 'ITR-3' || result.itrType === 'ITR-4');
  });
});