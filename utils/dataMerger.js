const mergeExtractedData = (existingReturn, newData) => {
  const merged = JSON.parse(JSON.stringify(existingReturn));

  // Merge personal info
  if (newData.personalInfo) {
    merged.personalInfo = {
      ...merged.personalInfo,
      ...newData.personalInfo
    };
  }

  // MERGE income details (ADD not replace)
  if (newData.incomeDetails) {
    merged.incomeDetails = merged.incomeDetails || {};
    Object.keys(newData.incomeDetails).forEach(key => {
      merged.incomeDetails[key] = 
        (merged.incomeDetails[key] || 0) + (newData.incomeDetails[key] || 0);
    });
  }

  // MERGE tax credits (ADD not replace)
  if (newData.taxCredits) {
    merged.taxCredits = merged.taxCredits || {};
    Object.keys(newData.taxCredits).forEach(key => {
      merged.taxCredits[key] = 
        (merged.taxCredits[key] || 0) + (newData.taxCredits[key] || 0);
    });
  }

  // MERGE deductions (ADD not replace)
  if (newData.deductions) {
    merged.deductions = merged.deductions || {};
    Object.keys(newData.deductions).forEach(key => {
      merged.deductions[key] = 
        (merged.deductions[key] || 0) + (newData.deductions[key] || 0);
    });
  }

  return merged;
};

module.exports = { mergeExtractedData };
