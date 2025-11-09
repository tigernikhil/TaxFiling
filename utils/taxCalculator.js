// Updates to backend/utils/taxCalculator.js
// backend/utils/taxCalculator.js
const TAX_SLABS_NEW_REGIME = [
  { limit: 300000, rate: 0 },
  { limit: 700000, rate: 0.05 },
  { limit: 1100000, rate: 0.10 },
  { limit: 1500000, rate: 0.15 },
  { limit: 2000000, rate: 0.20 },
  { limit: 5000000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 }
];

const TAX_SLABS_OLD_REGIME = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 }
];

const STANDARD_DEDUCTION = 75000; // FY 2024-25
const CESS_RATE = 0.04;

const calculateTax = (income, slabs) => {
  let tax = 0;
  let previousLimit = 0;

  for (let slab of slabs) {
    if (income > previousLimit) {
      const taxableInThisSlab = Math.min(income, slab.limit) - previousLimit;
      tax += taxableInThisSlab * slab.rate;
      previousLimit = slab.limit;
    } else {
      break;
    }
  }

  return tax;
};

const calculateSurcharge = (income, tax) => {
  if (income > 50000000) return tax * 0.37;
  if (income > 20000000) return tax * 0.25;
  if (income > 5000000) return tax * 0.15;
  if (income > 1000000) return tax * 0.10;
  return 0;
};

const calculateNewRegime = (incomeDetails, taxCredits) => {
  const totalIncome = 
    (incomeDetails.salary || 0) +
    (incomeDetails.housePropertyIncome || 0) +
    (incomeDetails.capitalGains || 0) +
    (incomeDetails.businessProfession || 0) +
    (incomeDetails.otherSources || 0) +
    (incomeDetails.agriculturalIncome || 0);

  const grossTotalIncome = totalIncome;
  const taxableIncome = Math.max(0, grossTotalIncome - STANDARD_DEDUCTION);

  const tax = calculateTax(taxableIncome, TAX_SLABS_NEW_REGIME);
  const surcharge = calculateSurcharge(grossTotalIncome, tax);
  const cess = (tax + surcharge) * CESS_RATE;
  const totalTax = tax + surcharge + cess;

  const totalTaxCredited = 
    (taxCredits.tdsSalary || 0) +
    (taxCredits.tdsOtherSources || 0) +
    (taxCredits.advanceTax || 0) +
    (taxCredits.selfAssessmentTax || 0);

  const taxPayable = Math.max(0, totalTax - totalTaxCredited);
  const refundDue = Math.max(0, totalTaxCredited - totalTax);

  return {
    totalIncome,
    standardDeduction: STANDARD_DEDUCTION,
    grossTotalIncome,
    taxableIncome,
    tax: Math.round(tax),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    tdsCredited: totalTaxCredited,
    refundDue: Math.round(refundDue),
    taxPayable: Math.round(taxPayable)
  };
};

const calculateOldRegime = (incomeDetails, deductions, taxCredits) => {
  const totalIncome = 
    (incomeDetails.salary || 0) +
    (incomeDetails.housePropertyIncome || 0) +
    (incomeDetails.capitalGains || 0) +
    (incomeDetails.businessProfession || 0) +
    (incomeDetails.otherSources || 0) +
    (incomeDetails.agriculturalIncome || 0);

  const deductionsTotal = Object.values(deductions || {}).reduce((a, b) => a + (b || 0), 0);
  const grossTotalIncome = totalIncome;
  const taxableIncome = Math.max(0, grossTotalIncome - deductionsTotal);

  const tax = calculateTax(taxableIncome, TAX_SLABS_OLD_REGIME);
  const surcharge = calculateSurcharge(grossTotalIncome, tax);
  const cess = (tax + surcharge) * CESS_RATE;
  const totalTax = tax + surcharge + cess;

  const totalTaxCredited = 
    (taxCredits.tdsSalary || 0) +
    (taxCredits.tdsOtherSources || 0) +
    (taxCredits.advanceTax || 0) +
    (taxCredits.selfAssessmentTax || 0);

  const taxPayable = Math.max(0, totalTax - totalTaxCredited);
  const refundDue = Math.max(0, totalTaxCredited - totalTax);

  return {
    totalIncome,
    deductionsTotal,
    grossTotalIncome,
    taxableIncome,
    tax: Math.round(tax),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    tdsCredited: totalTaxCredited,
    refundDue: Math.round(refundDue),
    taxPayable: Math.round(taxPayable)
  };
};

const compareRegimes = (newRegimeCalc, oldRegimeCalc) => {
  const savings = oldRegimeCalc.totalTax - newRegimeCalc.totalTax;
  const savingsPercentage = oldRegimeCalc.totalTax > 0 
    ? ((savings / oldRegimeCalc.totalTax) * 100).toFixed(2)
    : 0;

  return {
    savings: Math.round(savings),
    savingsPercentage: parseFloat(savingsPercentage),
    recommendation: savings > 0 ? 'new' : 'old',
    newRegimeTotal: newRegimeCalc.totalTax,
    oldRegimeTotal: oldRegimeCalc.totalTax
  };
};

const calculateTaxableIncome = (incomeDetails, deductions, capitalGains) => {
  const totalIncome = 
    (incomeDetails.salary || 0) +
    (incomeDetails.housePropertyIncome || 0) +
    (incomeDetails.otherSources || 0) +
    (capitalGains || 0);

  const deductionsTotal = Object.values(deductions || {}).reduce((a, b) => a + (b || 0), 0);
  return Math.max(0, totalIncome - deductionsTotal);
};

const calculateFinalTax = (taxableIncome, regime, capitalGainsInfo = {}) => {
  let tax = 0;
  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;
  
  tax = calculateTax(taxableIncome, slabs);
  
  // Add capital gains tax if LTCG
  if (capitalGainsInfo.longTermCapitalGains) {
    tax += capitalGainsInfo.longTermCapitalGains * 0.20; // 20% LTCG
  }
  
  return tax;
};

module.exports = {
  calculateNewRegime,
  calculateOldRegime,
  compareRegimes,
  calculateTaxableIncome,
  calculateFinalTax
};
