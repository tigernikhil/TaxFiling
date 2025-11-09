const generateITR1 = (taxReturnData) => {
  return {
    formType: 'ITR-1',
    assesseeInfo: taxReturnData.personalInfo,
    incomeDetails: taxReturnData.incomeDetails,
    taxCalculation: taxReturnData.chosenRegime === 'new' 
      ? taxReturnData.taxCalculationNewRegime 
      : taxReturnData.taxCalculationOldRegime,
    generatedAt: new Date()
  };
};

module.exports = { generateITR1 };