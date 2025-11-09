const validateITR = (taxReturnData) => {
  const errors = [];
  const warnings = [];

  // PAN validation
  if (!taxReturnData.personalInfo?.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(taxReturnData.personalInfo.pan)) {
    errors.push('Invalid PAN');
  }

  // Income validation
  const totalIncome = Object.values(taxReturnData.incomeDetails || {}).reduce((a, b) => a + (b || 0), 0);
  if (totalIncome < 0) {
    errors.push('Total income cannot be negative');
  }

  // Deduction validation
  const deductionsTotal = Object.values(taxReturnData.deductions || {}).reduce((a, b) => a + (b || 0), 0);
  if (deductionsTotal > totalIncome) {
    warnings.push('Deductions exceed total income');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

module.exports = { validateITR };