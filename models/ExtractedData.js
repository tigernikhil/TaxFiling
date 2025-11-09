const mongoose = require('mongoose');

const extractedDataSchema = new mongoose.Schema({
  uploadedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedDocument',
    required: true
  },
  taxReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxReturn'
  },
  dataType: String,
  fieldMappings: mongoose.Schema.Types.Mixed,
  confidence: { type: Number, default: 0.8 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExtractedData', extractedDataSchema);