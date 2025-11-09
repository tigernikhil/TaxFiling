// backend/utils/itrSelector.js

const selectITR = (incomeProfile) => {
  const {
    hasSalary,
    hasBusinessIncome,
    hasCapitalGains,
    hasAgriculturalBusiness,
    totalIncome,
    agriculturalIncome,
    businessIncome,
    capitalGains
  } = incomeProfile;

  // Check for ITR-1 (Sahaj) eligibility
  if (hasSalary && !hasCapitalGains && !hasBusinessIncome && 
      totalIncome < 5000000 && agriculturalIncome < 5000) {
    return {
      itrType: 'ITR-1',
      reason: 'Salaried individual with no capital gains or business',
      schedule: ['SA', 'CA']
    };
  }

  // Check for ITR-2 eligibility
  if (hasCapitalGains || (hasSalary && totalIncome > 5000000)) {
    return {
      itrType: 'ITR-2',
      reason: 'Capital gains or high income salaried',
      schedule: ['SA', 'CA', 'FA', 'FSI']
    };
  }

  // Check for ITR-3 eligibility
  if (hasBusinessIncome && !hasAgriculturalBusiness) {
    return {
      itrType: 'ITR-3',
      reason: 'Business/professional income',
      schedule: ['BP', 'FA', 'FSI']
    };
  }

  // Check for ITR-4 (Sugam) eligibility
  if (businessIncome < 200000000 && !hasAgriculturalBusiness) {
    return {
      itrType: 'ITR-4',
      reason: 'Presumptive income scheme eligible',
      schedule: ['SA', 'SI']
    };
  }

  // Default to ITR-2 for complex cases
  return {
    itrType: 'ITR-2',
    reason: 'Complex income profile',
    schedule: ['SA', 'CA', 'FA', 'FSI']
  };
};

module.exports = { selectITR };
