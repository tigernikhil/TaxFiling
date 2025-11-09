// Updates to backend/utils/pdfExtractor.js

const extractForm16WithPassword = async (pdfBuffer, password = '') => {
  try {
    const pdfLib = require('pdf-lib');
    const PDFDocument = await pdfLib.PDFDocument.load(pdfBuffer);
    
    if (PDFDocument.isEncrypted) {
      if (!password) {
        throw new Error('PDF is password protected. Please provide password.');
      }
      
      try {
        await PDFDocument.getPages();
      } catch {
        throw new Error('Incorrect password for PDF');
      }
    }
    
    // Continue with extraction...
    return extractFormData(PDFDocument);
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

// backend/utils/pdfExtractor.js
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');

// Form 16 Data Extraction
const extractForm16Data = async (pdfBuffer, password = null) => {
  try {
    let parsedPDF;
    
    // Try to parse PDF (if encrypted, password needed)
    try {
      parsedPDF = await pdfParse(pdfBuffer);
    } catch (error) {
      if (error.message.includes('encrypted') && password) {
        // Handle password-protected PDF
        const PDFParser = require('pdf-parse/lib/pdf-parse');
        parsedPDF = await PDFParser(pdfBuffer, { password });
      } else {
        throw error;
      }
    }

    const text = parsedPDF.text;

    // Extract Form 16 fields using regex patterns
    const extractedData = {
      // Employee Details
      employeeName: extractField(text, /Employee Name[:\s]+([^\n]+)/i),
      pan: extractField(text, /PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z]{1})/i),
      aadhaar: extractField(text, /Aadhaar[:\s]+(\d{12})/i),
      
      // Employer Details
      employerName: extractField(text, /Employer Name[:\s]+([^\n]+)/i),
      employerPAN: extractField(text, /Employer PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z]{1})/i),
      
      // Salary Details
      salary: extractNumber(text, /Salary[:\s]+[₹]?\s*([0-9,]+)/i),
      basicSalary: extractNumber(text, /Basic Salary[:\s]+[₹]?\s*([0-9,]+)/i),
      dearness: extractNumber(text, /Dearness Allowance[:\s]+[₹]?\s*([0-9,]+)/i),
      houseRent: extractNumber(text, /House Rent Allowance[:\s]+[₹]?\s*([0-9,]+)/i),
      otherAllowances: extractNumber(text, /Other Allowances[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Deductions
      standardDeduction: extractNumber(text, /Standard Deduction[:\s]+[₹]?\s*([0-9,]+)/i),
      section80C: extractNumber(text, /Section 80C[:\s]+[₹]?\s*([0-9,]+)/i),
      section80D: extractNumber(text, /Section 80D[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // TDS
      tdsSalary: extractNumber(text, /TDS on Salary[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Income Details
      totalIncome: extractNumber(text, /Total Income[:\s]+[₹]?\s*([0-9,]+)/i),
      taxableIncome: extractNumber(text, /Taxable Income[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Other Details
      financialYear: extractField(text, /([0-9]{4}-[0-9]{2})/),
      assessmentYear: extractField(text, /A\.Y\.\s*([0-9]{4}-[0-9]{2})/i),
      
      // Extracted timestamp
      extractedAt: new Date(),
      sourceDocument: 'Form 16'
    };

    return extractedData;
  } catch (error) {
    throw new Error(`Form 16 extraction failed: ${error.message}`);
  }
};

// Form 26AS Data Extraction
const extractForm26ASData = async (pdfBuffer) => {
  try {
    const parsedPDF = await pdfParse(pdfBuffer);
    const text = parsedPDF.text;

    const extractedData = {
      // PAN Details
      pan: extractField(text, /PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z]{1})/i),
      
      // TDS Information
      tdsSalary: extractNumber(text, /Salary[:\s]+[₹]?\s*([0-9,]+)/i),
      tdsOtherSources: extractNumber(text, /Other Sources[:\s]+[₹]?\s*([0-9,]+)/i),
      tdsRentReceived: extractNumber(text, /Rent Received[:\s]+[₹]?\s*([0-9,]+)/i),
      tdsInterest: extractNumber(text, /Interest Received[:\s]+[₹]?\s*([0-9,]+)/i),
      tdsDividend: extractNumber(text, /Dividend[:\s]+[₹]?\s*([0-9,]+)/i),
      tdsCommission: extractNumber(text, /Commission[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Total TDS
      totalTDS: extractNumber(text, /Total TDS[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Tax Collected at Source
      tcs: extractNumber(text, /TCS[:\s]+[₹]?\s*([0-9,]+)/i),
      
      // Financial Year
      financialYear: extractField(text, /([0-9]{4}-[0-9]{2})/),
      
      extractedAt: new Date(),
      sourceDocument: 'Form 26AS'
    };

    return extractedData;
  } catch (error) {
    throw new Error(`Form 26AS extraction failed: ${error.message}`);
  }
};

// Helper function to extract text field
const extractField = (text, regex) => {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

// Helper function to extract numbers
const extractNumber = (text, regex) => {
  const match = text.match(regex);
  if (match) {
    return parseInt(match[1].replace(/,/g, '')) || 0;
  }
  return 0;
};

module.exports = {
  extractForm16Data,
  extractForm26ASData
};
