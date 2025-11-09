const mongoose = require('mongoose');

const taxReturnSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assessmentYear: {
    type: String,
    required: true,
    default: '2024-25',
  },
  status: {
    type: String,
    enum: ['draft', 'ready', 'submitted'],
    default: 'draft',
  },

  // Personal Information
  personalInfo: {
    name: String,
    pan: {
      type: String,
      uppercase: true,
    },
    dob: Date,
    aadhaar: String,
    address: String,
    phone: String,
    email: String,
    residentialStatus: {
      type: String,
      enum: ['resident', 'non-resident', 'nri'],
      default: 'resident',
    },
  },

  // Income Details
  incomeDetails: {
    salary: { type: Number, default: 0 },
    housePropertyIncome: { type: Number, default: 0 },
    capitalGains: { type: Number, default: 0 },
    businessProfession: { type: Number, default: 0 },
    otherSources: { type: Number, default: 0 },
    agriculturalIncome: { type: Number, default: 0 },
  },

  // TDS and Tax Credits
  taxCredits: {
    tdsSalary: { type: Number, default: 0 },
    tdsOtherSources: { type: Number, default: 0 },
    advanceTax: { type: Number, default: 0 },
    selfAssessmentTax: { type: Number, default: 0 },
  },

  // Deductions
  deductions: {
    section80C: { type: Number, default: 0 },
    section80D: { type: Number, default: 0 },
    section80E: { type: Number, default: 0 },
    section80G: { type: Number, default: 0 },
    section80CCD: { type: Number, default: 0 },
    section80U: { type: Number, default: 0 },
    section80TTA: { type: Number, default: 0 },
    section80TTB: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
  },

  // Tax Calculation - New Regime
  taxCalculationNewRegime: {
    totalIncome: Number,
    standardDeduction: Number,
    grossTotalIncome: Number,
    taxableIncome: Number,
    tax: Number,
    surcharge: Number,
    cess: Number,
    totalTax: Number,
    tdsCredited: Number,
    refundDue: Number,
    taxPayable: Number,
  },

  // Tax Calculation - Old Regime
  taxCalculationOldRegime: {
    totalIncome: Number,
    deductionsTotal: Number,
    grossTotalIncome: Number,
    taxableIncome: Number,
    tax: Number,
    surcharge: Number,
    cess: Number,
    totalTax: Number,
    tdsCredited: Number,
    refundDue: Number,
    taxPayable: Number,
  },

  // User Chosen Regime
  chosenRegime: {
    type: String,
    enum: ['new', 'old'],
    default: 'new',
  },

  // Bank Details for Refund
  refundDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },

  // Generated JSON for portal upload
  generatedJSON: mongoose.Schema.Types.Mixed,
  jsonFilePath: String,

  // Uploaded Files Metadata
  uploadedFiles: [
    {
      fileName: String,
      fileType: {
        type: String,
        enum: ['form16', 'form26as', 'capitalGains', 'previousYearJSON'],
      },
      uploadedAt: Date,
      extractedData: mongoose.Schema.Types.Mixed,
    },
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: Date,
});

// Indexes for efficient querying
taxReturnSchema.index({ userId: 1, createdAt: -1 });
taxReturnSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TaxReturn', taxReturnSchema);
