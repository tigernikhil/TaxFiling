const mongoose = require('mongoose');

const uploadedDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  taxReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxReturn',
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'form16', 'form26as', 'ais', 'tis', 'pan', 'aadhaar',
      'salarySlip', 'hraReceipt', 'homeLoan', 'capitalGains',
      'rentalAgreement', 'donationReceipt', 'interestCertificate',
      'insuranceReceipt', 'balanceSheet', 'profitLoss', 'form16a',
      'zerodhaStatement', 'growStatement', 'foreignStocks', 'bankStatement'
    ],
    required: true
  },
  fileName: String,
  fileSize: Number,
  extractedData: mongoose.Schema.Types.Mixed,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadedDocument', uploadedDocumentSchema);
