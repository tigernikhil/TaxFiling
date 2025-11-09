const mongoose = require('mongoose');

const assetHoldingSchema = new mongoose.Schema({
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
    enum: ['real-estate', 'vehicle', 'mutual-fund', 'crypto', 'gold', 'bank-deposit', 'jewelry', 'other'],
    required: true
  },
  
  description: String,
  acquisitionDate: Date,
  acquisitionCost: Number,
  currentValue: Number,
  location: String,
  
  // For Real Estate
  propertyType: String,
  areaInSqFt: Number,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,
  
  // For Vehicles
  vehicleType: String,
  registrationNumber: String,
  manufacturer: String,
  modelName: String,
  purchaseYear: Number,
  
  // Schedule References
  scheduleFA: { type: Boolean, default: false }, // Foreign Assets
  scheduleFSI: { type: Boolean, default: false }, // Foreign Source Income
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssetHolding', assetHoldingSchema);
