// backend/routes/assets.js
const express = require('express');
const AssetHolding = require('../models/AssetHolding');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Add asset
router.post('/:returnId/add', async (req, res) => {
  try {
    const { returnId } = req.params;
    
    const asset = new AssetHolding({
      userId: req.userId,
      taxReturnId: returnId,
      ...req.body
    });

    await asset.save();

    res.status(201).json({
      message: 'Asset added',
      asset
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assets for return
router.get('/:returnId/all', async (req, res) => {
  try {
    const { returnId } = req.params;
    const assets = await AssetHolding.find({ taxReturnId: returnId });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset
router.put('/:assetId', async (req, res) => {
  try {
    const asset = await AssetHolding.findByIdAndUpdate(
      req.params.assetId,
      req.body,
      { new: true }
    );

    res.json({ message: 'Asset updated', asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:assetId', async (req, res) => {
  try {
    await AssetHolding.findByIdAndDelete(req.params.assetId);
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;