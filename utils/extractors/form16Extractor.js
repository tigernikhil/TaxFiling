const pdfParse = require('pdf-parse');

// Extract Form 16 data from PDF buffer
// Supports optional password for encrypted PDFs
async function extractForm16Data(pdfBuffer, password = null) {
  let parsedPDF;
  try {
    // Try parsing PDF, pass password if encrypted
    if (password) {
      parsedPDF = await pdfParse(pdfBuffer, { password });
    } else {
      parsedPDF = await pdfParse(pdfBuffer);
    }
  } catch (error) {
    throw new Error('Failed to parse Form 16 PDF: ' + error.message);
  }

  const text = parsedPDF.text;

  // Parse necessary fields from text using regex or string search
  const extractedData = {};

  // Example fields extraction - customize for Form 16 format
  extractedData.personalInfo = {
    employeeName: extractTextField(text, /Employee Name[:\\s]+([^\n]+)/i),
    pan: extractTextField(text, /PAN[:\\s]+([A-Z]{5}[0-9]{4}[A-Z])/i),
    aadhaar: extractTextField(text, /Aadhaar Number[:\\s]+(\d{12})/i),
    dob: extractTextField(text, /Date of Birth[:\\s]+([\d-]+)/i),
  };

  extractedData.incomeDetails = {
    salary: extractNumberField(text, /Salary[:]?[ ₹,]*([\d,]+)/i),
    houseRentAllowance: extractNumberField(text, /House Rent Allowance[:]?[ ₹,]*([\d,]+)/i),
    otherAllowances: extractNumberField(text, /Other Allowances[:]?[ ₹,]*([\d,]+)/i),
  };

  extractedData.deductions = {
    section80C: extractNumberField(text, /Section 80C[:]?[ ₹,]*([\d,]+)/i),
    section80D: extractNumberField(text, /Section 80D[:]?[ ₹,]*([\d,]+)/i),
  };

  extractedData.taxCredits = {
    tdsSalary: extractNumberField(text, /TDS on Salary[:]?[ ₹,]*([\d,]+)/i),
  };

  // Add other necessary fields here

  return extractedData;
}

// Helper function to extract text field using regex
function extractTextField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

// Helper function to extract number field from text using regex
function extractNumberField(text, regex) {
  const match = text.match(regex);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

module.exports = { extractForm16Data };
