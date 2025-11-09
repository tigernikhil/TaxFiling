const extractForm26AS = async (pdfBuffer, password = null) => {
  // Form 26AS extraction logic
  const extractedData = {
    personalInfo: {
      pan: 'EXTRACTED_PAN'
    },
    taxCredits: {
      tdsSalary: 0,
      tdsOtherSources: 0,
      advanceTax: 0
    },
    source: 'Form 26AS'
  };
  return extractedData;
};

module.exports = { extractForm26AS };