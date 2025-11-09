// backend/routes/itrSelection.js
const express = require('express');
const TaxReturn = require('../models/TaxReturn');
const ITRDocument = require('../models/ITRDocument');
const { protect } = require('../middleware/auth');
const { selectITR } = require('../utils/itrSelector');

const router = express.Router();
router.use(protect);

// Auto-select ITR based on income profile
router.post('/:returnId/auto-select', async (req, res) => {
  try {
    const { returnId } = req.params;
    
    const taxReturn = await TaxReturn.findById(returnId);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }

    // Build income profile
    const incomeProfile = {
      hasSalary: (taxReturn.incomeDetails.salary || 0) > 0,
      hasBusinessIncome: (taxReturn.incomeDetails.businessProfession || 0) > 0,
      hasCapitalGains: (taxReturn.incomeDetails.capitalGains || 0) > 0,
      hasAgriculturalBusiness: (taxReturn.incomeDetails.agriculturalIncome || 0) > 0,
      totalIncome: 
        (taxReturn.incomeDetails.salary || 0) +
        (taxReturn.incomeDetails.housePropertyIncome || 0) +
        (taxReturn.incomeDetails.capitalGains || 0) +
        (taxReturn.incomeDetails.businessProfession || 0) +
        (taxReturn.incomeDetails.otherSources || 0),
      agriculturalIncome: taxReturn.incomeDetails.agriculturalIncome || 0,
      businessIncome: taxReturn.incomeDetails.businessProfession || 0,
      capitalGains: taxReturn.incomeDetails.capitalGains || 0
    };

    // Get ITR selection
    const itrSelection = selectITR(incomeProfile);

    // Create ITR document
    const itrDoc = new ITRDocument({
      userId: req.userId,
      taxReturnId: returnId,
      itrType: itrSelection.itrType,
      autoSelected: true,
      selectionReason: itrSelection.reason,
      schedulesIncluded: itrSelection.schedule
    });

    await itrDoc.save();

    res.json({
      message: 'ITR auto-selected',
      itrType: itrSelection.itrType,
      reason: itrSelection.reason,
      schedules: itrSelection.schedule,
      incomeProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ITR document
router.get('/:returnId', async (req, res) => {
  try {
    const { returnId } = req.params;
    const itrDoc = await ITRDocument.findOne({ taxReturnId: returnId });
    
    if (!itrDoc) {
      return res.status(404).json({ message: 'ITR document not found' });
    }

    res.json(itrDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;