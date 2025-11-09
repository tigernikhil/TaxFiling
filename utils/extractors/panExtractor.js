const extractPAN = async (imageBuffer) => {
  const extractedData = {
    personalInfo: {
      pan: 'EXTRACTED_PAN',
      name: 'EXTRACTED_NAME'
    },
    source: 'PAN Card'
  };
  return extractedData;
};

module.exports = { extractPAN };