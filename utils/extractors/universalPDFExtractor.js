const universalExtractPDF = async (pdfBuffer, password = null) => {
  try {
    // Generic PDF extraction
    return {
      extractedText: '',
      confidence: 0.5,
      requiresManualReview: true
    };
  } catch (error) {
    throw new Error(`Universal PDF extraction failed: ${error.message}`);
  }
};

module.exports = { universalExtractPDF };