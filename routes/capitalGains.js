// backend/routes/capitalGains.js
const express = require('express');
const CapitalGains = require('../models/CapitalGains');
const { protect } = require('../middleware/auth');
const { calculateHoldingPeriod, calculateLongTermGain, calculateShortTermGain } = require('../utils/capitalGainsCalc');

const router = express.Router();
router.use(protect);

// Add capital gain entry
router.post('/:returnId/add', async (req, res) => {
  try {
    const { returnId } = req.params;
    const capitalGainData = req.body;

    // Calculate holding period
    const holdingPeriod = calculateHoldingPeriod(capitalGainData.acquisitionDate, capitalGainData.saleDate);
    const isLongTerm = holdingPeriod > 365;

    // Calculate gains
    let taxableGain;
    if (isLongTerm) {
      taxableGain = calculateLongTermGain(
        capitalGainData.totalAcquisitionCost,
        capitalGainData.totalSaleProceeds,
        capitalGainData.assetType
      );
    } else {
      taxableGain = calculateShortTermGain(
        capitalGainData.totalSaleProceeds,
        capitalGainData.totalAcquisitionCost
      );
    }

    const capitalGain = new CapitalGains({
      userId: req.userId,
      taxReturnId: returnId,
      ...capitalGainData,
      holdingPeriod,
      isLongTerm,
      capitalGain: taxableGain
    });

    await capitalGain.save();

    res.status(201).json({
      message: 'Capital gain added',
      capitalGain
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all capital gains for return
router.get('/:returnId/all', async (req, res) => {
  try {
    const { returnId } = req.params;
    const gains = await CapitalGains.find({ taxReturnId: returnId });
    
    res.json(gains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update capital gain
router.put('/:gainId', async (req, res) => {
  try {
    const gain = await CapitalGains.findByIdAndUpdate(
      req.params.gainId,
      req.body,
      { new: true }
    );

    res.json({ message: 'Capital gain updated', gain });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete capital gain
router.delete('/:gainId', async (req, res) => {
  try {
    await CapitalGains.findByIdAndDelete(req.params.gainId);
    res.json({ message: 'Capital gain deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;