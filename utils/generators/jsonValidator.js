const validateJSON = (jsonData) => {
  const requiredFields = ['formType', 'assesseeInfo', 'incomeDetails'];
  const missingFields = requiredFields.filter(field => !jsonData[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings: []
  };
};

module.exports = { validateJSON };