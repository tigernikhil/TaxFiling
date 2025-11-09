// backend/tests/capitalGains.test.js
const assert = require('assert');
const { calculateHoldingPeriod, calculateLongTermGain, calculateShortTermGain } = require('../utils/capitalGainsCalc');

describe('Capital Gains Tests', () => {

  test('Short-term Capital Gains', () => {
    const acquisitionCost = 100000;
    const saleProceeds = 150000;
    
    const gain = calculateShortTermGain(saleProceeds, acquisitionCost);
    
    assert.strictEqual(gain, 50000);
  });

  test('Long-term Capital Gains with Indexation', () => {
    const acquisitionCost = 100000;
    const saleProceeds = 150000;
    const assetType = 'property';
    
    const gain = calculateLongTermGain(acquisitionCost, saleProceeds, assetType);
    
    assert(gain > 0);
    assert(gain < 50000); // After indexation
  });

  test('Holding Period Calculation', () => {
    const buyDate = '2023-01-01';
    const sellDate = '2024-06-01';
    
    const period = calculateHoldingPeriod(buyDate, sellDate);
    
    assert(period > 365); // Long-term
  });

  test('Short-term Holding Period', () => {
    const buyDate = '2024-09-01';
    const sellDate = '2024-11-01';
    
    const period = calculateHoldingPeriod(buyDate, sellDate);
    
    assert(period < 365); // Short-term
  });
});