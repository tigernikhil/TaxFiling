const mongoose = require('mongoose');

const capitalGainsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taxReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxReturn'
  },
  assetType: {
    type: String,
    enum: ['indian-share', 'foreign-share', 'mutual-fund', 'crypto', 'property', 'bond', 'other'],
    required: true
  },
  description: String,
  
  // Asset Details
  symbol: String, // NSE/BSE code or ticker
  isin: String,
  
  // Acquisition
  acquisitionDate: Date,
  acquisitionPrice: Number,
  acquisitionPriceCurrency: { type: String, default: 'INR' },
  acquisitionExchangeRate: { type: Number, default: 1 },
  quantity: Number,
  totalAcquisitionCost: Number,
  
  // Sale
  saleDate: Date,
  salePrice: Number,
  salePriceCurrency: { type: String, default: 'INR' },
  saleExchangeRate: { type: Number, default: 1 },
  totalSaleProceeds: Number,
  
  // Capital Gains Calculation
  holdingPeriod: Number, // days
  isLongTerm: Boolean, // > 365 days
  capitalGain: Number,
  indexationBenefit: { type: Number, default: 0 },
  capitalGainAfterIndexation: Number,
  
  // Exemptions & Special Cases
  section54Applicable: { type: Boolean, default: false },
  section54F: { type: Boolean, default: false },
  exemptedAmount: { type: Number, default: 0 },
  taxableCapitalGain: Number,
  
  // Additional Details
  brokerName: String,
  transactionID: String,
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CapitalGains', capitalGainsSchema);
