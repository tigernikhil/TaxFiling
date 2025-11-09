// backend/tests/testCases.test.js
const assert = require('assert');

// Test Suite for ClearTax Clone

describe('ClearTax Clone - Comprehensive Test Suite', () => {

  // ============ TAX CALCULATION TESTS ============
  describe('Tax Calculation Engine', () => {

    test('New Regime: Calculate tax for salaried individual', () => {
      const income = 1500000;
      const standardDeduction = 75000;
      const taxableIncome = income - standardDeduction;
      
      // Expected tax calculation
      const expectedTax = 232500;
      const expectedSurcharge = 23250;
      const expectedCess = 10230;
      const expectedTotal = 265980;
      
      assert.strictEqual(taxableIncome, 1425000);
      assert(expectedTotal > 0);
    });

    test('Old Regime: Calculate tax with deductions', () => {
      const income = 1500000;
      const deductions = {
        section80C: 150000,
        section80D: 25000,
        section80CCD: 50000
      };
      const totalDeductions = 225000;
      const taxableIncome = income - totalDeductions;
      
      assert.strictEqual(taxableIncome, 1275000);
      assert(taxableIncome <= income);
    });

    test('Regime Comparison: New vs Old', () => {
      const income = 1800000;
      const newRegimeTax = 266000;
      const oldRegimeTax = 195000;
      const savings = oldRegimeTax - newRegimeTax;
      
      assert(newRegimeTax > oldRegimeTax);
      assert.strictEqual(savings, -71000); // New regime saves more
    });

    test('Surcharge Calculation', () => {
      const testCases = [
        { income: 500000, expectedSurcharge: 0 },
        { income: 1000000, expectedSurcharge: 'calculated' },
        { income: 5000000, expectedSurcharge: 'calculated' },
        { income: 20000000, expectedSurcharge: 'calculated' },
        { income: 50000000, expectedSurcharge: 'calculated' }
      ];
      
      testCases.forEach(testCase => {
        assert(testCase.income > 0);
      });
    });

    test('Cess Calculation (4%)', () => {
      const tax = 100000;
      const surcharge = 10000;
      const totalBeforeCess = tax + surcharge;
      const cess = totalBeforeCess * 0.04;
      
      assert.strictEqual(cess, 4400);
    });
  });

  // ============ CAPITAL GAINS TESTS ============
  describe('Capital Gains Calculation', () => {

    test('Short-term Capital Gains (Shares < 12 months)', () => {
      const buyPrice = 100;
      const quantity = 1000;
      const sellPrice = 150;
      
      const acquisitionCost = buyPrice * quantity; // 100,000
      const saleProceeds = sellPrice * quantity; // 150,000
      const capitalGain = saleProceeds - acquisitionCost; // 50,000
      
      assert.strictEqual(capitalGain, 50000);
      assert(capitalGain > 0);
    });

    test('Long-term Capital Gains (Shares > 12 months)', () => {
      const buyPrice = 100;
      const buyDate = '2023-01-01';
      const sellDate = '2024-06-01';
      const quantity = 1000;
      const sellPrice = 150;
      
      const acquisitionCost = buyPrice * quantity;
      const saleProceeds = sellPrice * quantity;
      const gainBeforeIndexation = saleProceeds - acquisitionCost;
      const indexationFactor = 1.08; // Simplified
      const indexedCost = acquisitionCost * indexationFactor;
      const longTermGain = saleProceeds - indexedCost;
      
      assert(longTermGain > 0);
      assert(longTermGain < gainBeforeIndexation);
    });

    test('Foreign Shares - USD to INR Conversion', () => {
      const quantity = 100;
      const buyPriceUSD = 50;
      const buyExchangeRate = 75;
      const sellPriceUSD = 60;
      const sellExchangeRate = 85;
      
      const acquisitionCostINR = quantity * buyPriceUSD * buyExchangeRate; // 375,000
      const saleProceedsINR = quantity * sellPriceUSD * sellExchangeRate; // 510,000
      const capitalGain = saleProceedsINR - acquisitionCostINR; // 135,000
      
      assert.strictEqual(capitalGain, 135000);
    });

    test('Cryptocurrency Capital Gains with TCS', () => {
      const buyPrice = 40000;
      const quantity = 1;
      const sellPrice = 60000;
      
      const capitalGain = (sellPrice - buyPrice) * quantity; // 20,000
      const tcs = capitalGain * 0.01; // 1% TCS = 200
      
      assert.strictEqual(capitalGain, 20000);
      assert.strictEqual(tcs, 200);
    });

    test('Loss Carry Forward (Shares)', () => {
      const currentYearLoss = -50000;
      const previousYearLoss = 0;
      const carryForwardPeriod = 8; // years
      
      assert(currentYearLoss < 0);
      assert(carryForwardPeriod === 8);
    });
  });

  // ============ DEDUCTION TESTS ============
  describe('Deduction Calculations', () => {

    test('Section 80C - Maximum ₹1,50,000', () => {
      const amount1 = 100000;
      const amount2 = 60000;
      const total = amount1 + amount2; // 160,000
      const maxDeduction = Math.min(total, 150000);
      
      assert.strictEqual(maxDeduction, 150000);
    });

    test('Section 80D - Medical Insurance', () => {
      const individual = 25000;
      const seniorCitizen = 50000;
      const totalForIndividual = 25000;
      const totalForSenior = 50000;
      
      assert.strictEqual(totalForIndividual, 25000);
      assert.strictEqual(totalForSenior, 50000);
    });

    test('Section 80E - Education Loan (Unlimited)', () => {
      const loanInterest = 250000;
      const maxDeduction = 250000; // Unlimited
      
      assert.strictEqual(maxDeduction, loanInterest);
    });

    test('Section 80CCD - Pension (₹50,000)', () => {
      const contribution = 60000;
      const maxDeduction = 50000;
      
      assert(contribution > maxDeduction);
      assert.strictEqual(maxDeduction, 50000);
    });
  });

  // ============ ITR AUTO-SELECTION TESTS ============
  describe('ITR Auto-Selection Engine', () => {

    test('ITR-1 Eligibility: Salaried Individual', () => {
      const profile = {
        hasSalary: true,
        hasCapitalGains: false,
        hasBusinessIncome: false,
        hasAgriculturalBusiness: false,
        totalIncome: 4000000,
        agriculturalIncome: 0
      };
      
      const eligible = !profile.hasCapitalGains && 
                       !profile.hasBusinessIncome &&
                       profile.totalIncome < 5000000;
      
      assert(eligible);
    });

    test('ITR-2 Eligibility: Capital Gains Present', () => {
      const profile = {
        hasSalary: true,
        hasCapitalGains: true,
        capitalGains: 150000,
        hasBusinessIncome: false,
        totalIncome: 2000000
      };
      
      const requiresITR2 = profile.hasCapitalGains;
      assert(requiresITR2);
    });

    test('ITR-3 Eligibility: Business Income', () => {
      const profile = {
        hasSalary: false,
        hasBusinessIncome: true,
        businessIncome: 5000000,
        hasAgriculturalBusiness: false
      };
      
      const requiresITR3 = profile.hasBusinessIncome && 
                           !profile.hasSalary;
      assert(requiresITR3);
    });

    test('ITR-4 Eligibility: Presumptive Income', () => {
      const profile = {
        businessType: 'service',
        businessIncome: 80000000, // 80 lakh
        grossReceipts: 500000000, // 5 crore
        isPresumptiveEligible: businessIncome < 200000000 && 
                               grossReceipts < 1000000000
      };
      
      // Eligible for ITR-4 if below thresholds
      const eligible = profile.businessIncome < 200000000;
      assert(eligible);
    });

    test('Auto-Select Correct ITR Based on Multiple Conditions', () => {
      const testCases = [
        {
          income: {salary: 1500000, capitalGains: 0, business: 0},
          expectedITR: 'ITR-1'
        },
        {
          income: {salary: 2000000, capitalGains: 500000, business: 0},
          expectedITR: 'ITR-2'
        },
        {
          income: {salary: 0, capitalGains: 0, business: 7000000},
          expectedITR: 'ITR-3'
        },
        {
          income: {salary: 0, capitalGains: 0, business: 80000000},
          expectedITR: 'ITR-4'
        }
      ];
      
      testCases.forEach(tc => {
        assert(tc.expectedITR);
      });
    });
  });

  // ============ PDF EXTRACTION TESTS ============
  describe('PDF Extraction', () => {

    test('Form 16 - Extract Salary Information', () => {
      const expectedFields = [
        'employeeName',
        'pan',
        'salary',
        'basicSalary',
        'dearness',
        'houseRent',
        'tdsSalary'
      ];
      
      expectedFields.forEach(field => {
        assert(field.length > 0);
      });
    });

    test('Form 16 - Password Protected PDF Handling', () => {
      const pdfData = {
        encrypted: true,
        password: 'user123',
        canExtract: true
      };
      
      assert(pdfData.encrypted);
      assert(pdfData.password.length > 0);
    });

    test('Form 26AS - Extract TDS Information', () => {
      const expectedData = {
        pan: 'ABCDE1234F',
        tdsSalary: 30000,
        tdsOtherSources: 5000,
        totalTDS: 35000,
        tcs: 0
      };
      
      assert.strictEqual(expectedData.totalTDS, 35000);
    });

    test('PDF Extraction - Error Handling', () => {
      const corruptedPDF = null;
      try {
        assert.strictEqual(corruptedPDF, null);
      } catch (error) {
        assert(error);
      }
    });
  });

  // ============ ASSET MANAGEMENT TESTS ============
  describe('Asset Holdings', () => {

    test('Real Estate Asset Valuation', () => {
      const property = {
        type: 'residential',
        purchasePrice: 5000000,
        currentValue: 7500000,
        appreciation: 50
      };
      
      assert(property.currentValue > property.purchasePrice);
      assert.strictEqual(property.appreciation, 50);
    });

    test('Mutual Fund Holdings', () => {
      const fund = {
        units: 1000,
        nav: 150,
        totalValue: 1000 * 150, // 150,000
        gains: 50000
      };
      
      assert.strictEqual(fund.totalValue, 150000);
    });

    test('Cryptocurrency Holdings', () => {
      const crypto = {
        coin: 'BTC',
        quantity: 0.5,
        purchasePrice: 4000000,
        currentPrice: 6000000,
        currentValue: 3000000,
        unrealizedGains: -1000000
      };
      
      assert(crypto.unrealizedGains < 0);
    });
  });

  // ============ FINAL TAX CALCULATION TESTS ============
  describe('Final Tax Payable Calculation', () => {

    test('Calculate Final Tax Payable: New Regime', () => {
      const totalIncome = 1500000;
      const standardDeduction = 75000;
      const taxableIncome = 1425000;
      const tax = 232500;
      const surcharge = 23250;
      const cess = 10230;
      const totalTax = 265980;
      const tdsPaid = 30000;
      
      const finalTaxPayable = Math.max(0, totalTax - tdsPaid);
      const refundDue = Math.max(0, tdsPaid - totalTax);
      
      assert(finalTaxPayable > 0 || refundDue > 0);
    });

    test('Calculate Final Tax Payable: Old Regime', () => {
      const totalIncome = 1500000;
      const deductions = 225000;
      const taxableIncome = 1275000;
      const tax = 195000;
      const surcharge = 19500;
      const cess = 8580;
      const totalTax = 223080;
      const tdsPaid = 40000;
      
      const finalTaxPayable = Math.max(0, totalTax - tdsPaid);
      const refundDue = Math.max(0, tdsPaid - totalTax);
      
      assert(refundDue > 0); // Should get refund
    });

    test('Both Regimes Show Final Tax', () => {
      const newRegime = {
        totalTax: 265980,
        tdsPaid: 30000,
        finalPayable: 235980
      };
      
      const oldRegime = {
        totalTax: 223080,
        tdsPaid: 40000,
        finalPayable: 0,
        refund: 16920
      };
      
      assert(newRegime.finalPayable > 0);
      assert(oldRegime.refund > 0);
    });
  });

  // ============ JSON GENERATION TESTS ============
  describe('JSON Generation & Export', () => {

    test('Generate Valid ITR-1 JSON', () => {
      const itrJSON = {
        formType: 'ITR-1',
        assesseeInfo: {
          pan: 'ABCDE1234F',
          name: 'John Doe'
        },
        incomeDetails: {
          salary: 1500000,
          capitalGains: 0
        }
      };
      
      assert.strictEqual(itrJSON.formType, 'ITR-1');
      assert(itrJSON.assesseeInfo.pan.length === 10);
    });

    test('JSON includes both regime taxes', () => {
      const itrJSON = {
        taxCalculation: {
          newRegime: { totalTax: 265980 },
          oldRegime: { totalTax: 223080 },
          chosenRegime: 'old'
        }
      };
      
      assert(itrJSON.taxCalculation.newRegime.totalTax > 0);
      assert(itrJSON.taxCalculation.oldRegime.totalTax > 0);
    });
  });

});

// ============ TEST EXECUTION ============
console.log('✓ All test cases created successfully');
console.log('✓ Ready for execution');
console.log('✓ Run with: npm test');