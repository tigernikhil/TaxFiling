const express = require('express');
const TaxReturn = require('../models/TaxReturn');
const UploadedDocument = require('../models/UploadedDocument');
const { protect } = require('../middleware/auth');
const { calculateNewRegime, calculateOldRegime, compareRegimes } = require('../utils/taxCalculator');
const { mergeExtractedData } = require('../utils/dataMerger');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create new tax return
router.post('/create', async (req, res) => {
  try {
    const { assessmentYear = '2024-25' } = req.body;

    const taxReturn = new TaxReturn({
      userId: req.userId,
      assessmentYear,
      status: 'draft',
      personalInfo: {},
      incomeDetails: {},
      deductions: {},
      taxCredits: {},
      refundDetails: {},
      generatedJSON: null,
      taxCalculationNewRegime: null,
      taxCalculationOldRegime: null,
      chosenRegime: 'old',
    });

    await taxReturn.save();

    res.status(201).json({
      message: 'Tax return created',
      return: taxReturn,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all returns for user
router.get('/user/all', async (req, res) => {
  try {
    const returns = await TaxReturn.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific return
router.get('/:id', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findById(req.params.id);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }
    res.json(taxReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tax return incrementally - merge with existing data if needed
router.put('/:id', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findById(req.params.id);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }

    // Merge existing data with new data to avoid overwriting full objects
    const mergedData = mergeExtractedData(taxReturn.toObject(), req.body);

    Object.assign(taxReturn, mergedData);
    taxReturn.updatedAt = new Date();
    await taxReturn.save();

    res.json({
      message: 'Return updated',
      return: taxReturn,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate tax
router.post('/:id/calculate-tax', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findById(req.params.id);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }

    const newRegimeCalc = calculateNewRegime(taxReturn.incomeDetails, taxReturn.taxCredits);
    const oldRegimeCalc = calculateOldRegime(taxReturn.incomeDetails, taxReturn.deductions, taxReturn.taxCredits);
    const comparison = compareRegimes(newRegimeCalc, oldRegimeCalc);

    taxReturn.taxCalculationNewRegime = newRegimeCalc;
    taxReturn.taxCalculationOldRegime = oldRegimeCalc;
    taxReturn.status = 'ready';
    await taxReturn.save();

    res.json({
      newRegime: newRegimeCalc,
      oldRegime: oldRegimeCalc,
      comparison,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate JSON
router.post('/:id/generate-json', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findById(req.params.id);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }

    const itrJson = {
      formType: taxReturn.chosenRegime === 'new' ? 'ITR-1' : 'ITR-1', // Placeholder - extend as needed
      assesseeInfo: {
        pan: taxReturn.personalInfo.pan,
        assessee_name: taxReturn.personalInfo.name,
        dob: taxReturn.personalInfo.dob,
        address: taxReturn.personalInfo.address,
        residential_status: taxReturn.personalInfo.residentialStatus,
        aadhaar: taxReturn.personalInfo.aadhaar,
        email: taxReturn.personalInfo.email,
        phone: taxReturn.personalInfo.phone,
      },
      incomeDetails: taxReturn.incomeDetails,
      deductions: taxReturn.deductions,
      taxCredits: taxReturn.taxCredits,
      taxCalculation:
        taxReturn.chosenRegime === 'new' ? taxReturn.taxCalculationNewRegime : taxReturn.taxCalculationOldRegime,
      refund: taxReturn.refundDetails,
      assessmentYear: taxReturn.assessmentYear,
      filingDate: new Date().toISOString(),
    };

    taxReturn.generatedJSON = itrJson;
    taxReturn.status = 'submitted';
    taxReturn.submittedAt = new Date();
    await taxReturn.save();

    res.json({
      message: 'JSON generated successfully',
      json: itrJson,
      fileName: `ITR-1_${taxReturn.personalInfo.pan}_FY${taxReturn.assessmentYear}.json`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete return
router.delete('/:id', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findById(req.params.id);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found' });
    }

    await TaxReturn.findByIdAndDelete(req.params.id);

    res.json({ message: 'Return deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
