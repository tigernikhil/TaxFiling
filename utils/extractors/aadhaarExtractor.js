const extractAadhaar = async (imageBuffer) => {
  const extractedData = {
    personalInfo: {
      aadhaar: 'EXTRACTED_AADHAAR',
      name: 'EXTRACTED_NAME'
    },
    source: 'Aadhaar'
  };
  return extractedData;
};

module.exports = { extractAadhaar };