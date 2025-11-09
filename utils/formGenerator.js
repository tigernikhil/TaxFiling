// backend/utils/formGenerator.js

const generateITRJSON = (taxReturn, itrType) => {
  const itrJSON = {
    formType: itrType,
    assesseeInfo: {
      pan: taxReturn.personalInfo.pan,
      assessee_name: taxReturn.personalInfo.name,
      dob: taxReturn.personalInfo.dob,
      address: taxReturn.personalInfo.address,
      residential_status: taxReturn.personalInfo.residentialStatus,
      aadhaar: taxReturn.personalInfo.aadhaar,
      email: taxReturn.personalInfo.email,
      phone: taxReturn.personalInfo.phone
    },
    incomeDetails: taxReturn.incomeDetails,
    deductions: taxReturn.deductions,
    taxCredits: taxReturn.taxCredits,
    taxCalculation: {
      newRegime: taxReturn.taxCalculationNewRegime,
      oldRegime: taxReturn.taxCalculationOldRegime,
      chosenRegime: taxReturn.chosenRegime
    },
    refund: taxReturn.refundDetails,
    assessmentYear: taxReturn.assessmentYear,
    filingDate: new Date().toISOString()
  };

  return itrJSON;
};

const generateScheduleFA = (assetHoldings) => {
  // Foreign Assets Schedule
  return {
    scheduleType: 'FA',
    foreignAssets: assetHoldings.filter(a => a.scheduleFA),
    totalValue: assetHoldings
      .filter(a => a.scheduleFA)
      .reduce((sum, a) => sum + (a.currentValue || 0), 0)
  };
};

const generateScheduleFSI = (capitalGains, incomeDetails) => {
  // Foreign Source Income Schedule
  return {
    scheduleType: 'FSI',
    foreignIncome: capitalGains.filter(g => g.assetType === 'foreign-share'),
    totalForeignIncome: capitalGains
      .filter(g => g.assetType === 'foreign-share')
      .reduce((sum, g) => sum + (g.capitalGain || 0), 0)
  };
};

const generateScheduleBP = (businessIncome, deductions) => {
  // Business/Profession Schedule
  return {
    scheduleType: 'BP',
    businessIncome: businessIncome,
    deductions: deductions,
    profit: businessIncome - Object.values(deductions || {}).reduce((a, b) => a + (b || 0), 0)
  };
};

const generateScheduleCA = (capitalGains) => {
  // Capital Gains Schedule
  const shortTermGains = capitalGains.filter(g => !g.isLongTerm);
  const longTermGains = capitalGains.filter(g => g.isLongTerm);

  return {
    scheduleType: 'CA',
    shortTermCapitalGains: shortTermGains,
    longTermCapitalGains: longTermGains,
    totalSTCG: shortTermGains.reduce((sum, g) => sum + (g.capitalGain || 0), 0),
    totalLTCG: longTermGains.reduce((sum, g) => sum + (g.capitalGain || 0), 0)
  };
};

module.exports = {
  generateITRJSON,
  generateScheduleFA,
  generateScheduleFSI,
  generateScheduleBP,
  generateScheduleCA
};