// const extractBankStatement = async (pdfBuffer) => {
//   const extractedData = {
//     bankDetails: {
//       accountNumber: '',
//       ifscCode: '',
//       accountHolder: ''
//     },
//     interestIncome: 0,
//     source: 'Bank Statement'
//   };
//   return extractedData;
// };

// module.exports = { extractBankStatement };

// backend/utils/extractors/bankStatementExtractor.js

const pdfParse = require('pdf-parse');

// Extract bank statement data from PDF buffer
async function extractBankStatement(pdfBuffer) {
  let parsedPDF;
  try {
    parsedPDF = await pdfParse(pdfBuffer);
  } catch (error) {
    throw new Error('Failed to parse Bank Statement PDF: ' + error.message);
  }

  const text = parsedPDF.text;

  // Example extraction logic
  const extractedData = {};

  // Extract bank account info using regex patterns (customize as per sample PDFs)
  extractedData.bankDetails = {
    accountNumber: extractTextField(text, /Account Number[:\s]+([\w\d]+)/i),
    ifscCode: extractTextField(text, /IFSC Code[:\s]+([\w\d]+)/i),
    accountHolderName: extractTextField(text, /Account Holder[:\s]+([^\n]+)/i),
  };

  // Extract interest income (assuming printed as Interest Earned or similar)
  extractedData.interestIncome = extractNumberField(text, /Interest (Earned|Credited)[:\s₹,]*([\d,]+)/i);

  return extractedData;
}

// Helper to extract text fields with regex
function extractTextField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

// Helper to extract number fields with regex
function extractNumberField(text, regex) {
  const match = text.match(regex);
  if (match) {
    return parseInt(match[2].replace(/,/g, ''), 10);
  }
  return 0;
}

module.exports = { extractBankStatement };
