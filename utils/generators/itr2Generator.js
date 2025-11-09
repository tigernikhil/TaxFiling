const generateITR2 = (taxReturnData) => {
  return {
    formType: 'ITR-2',
    assesseeInfo: taxReturnData.personalInfo,
    incomeDetails: taxReturnData.incomeDetails,
    capitalGains: taxReturnData.incomeDetails.capitalGains,
    deductions: taxReturnData.deductions,
    taxCalculation: taxReturnData.chosenRegime === 'new' 
      ? taxReturnData.taxCalculationNewRegime 
      : taxReturnData.taxCalculationOldRegime,
    generatedAt: new Date()
  };
};

module.exports = { generateITR2 };