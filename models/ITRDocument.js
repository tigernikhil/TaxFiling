// backend/models/ITRDocument.js
const mongoose = require('mongoose');

const itrDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taxReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxReturn',
    required: true
  },
  
  // ITR Type Selection
  itrType: {
    type: String,
    enum: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'],
    required: true
  },
  
  // Selection Details
  autoSelected: { type: Boolean, default: true },
  selectionReason: String,
  
  // Document Generation
  documentGenerated: Boolean,
  generatedJSON: mongoose.Schema.Types.Mixed,
  generatedXML: String,
  
  // File References
  jsonFilePath: String,
  xmlFilePath: String,
  
  // Status Tracking
  status: {
    type: String,
    enum: ['draft', 'generated', 'validated', 'submitted'],
    default: 'draft'
  },
  
  // Portal Details
  submittedToPortal: { type: Boolean, default: false },
  submissionDate: Date,
  acknowledgmentNumber: String,
  
  // Schedules Included
  schedulesIncluded: [String],
  
  // Validation
  isValid: Boolean,
  validationErrors: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ITRDocument', itrDocumentSchema);