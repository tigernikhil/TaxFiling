const express = require('express');
const UploadedDocument = require('../models/UploadedDocument');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/:returnId', async (req, res) => {
  try {
    const docs = await UploadedDocument.find({ taxReturnId: req.params.returnId });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:docId', async (req, res) => {
  try {
    await UploadedDocument.findByIdAndDelete(req.params.docId);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;