const express = require('express');
const multer = require('multer');
const TaxReturn = require('../models/TaxReturn');
const UploadedDocument = require('../models/UploadedDocument');
const { protect } = require('../middleware/auth');
const { extractForm16Data } = require('../utils/extractors/form16Extractor');
const { extractForm26AS } = require('../utils/extractors/form26ASExtractor');
const { extractAIS } = require('../utils/extractors/aisExtractor');
const { extractPAN } = require('../utils/extractors/panExtractor');
const { extractAadhaar } = require('../utils/extractors/aadhaarExtractor');
const { extractCapitalGains } = require('../utils/extractors/capitalGainsExtractor');
const { extractBankStatement } = require('../utils/extractors/bankStatementExtractor');
const { universalExtractPDF } = require('../utils/extractors/universalPDFExtractor');
const { mergeExtractedData } = require('../utils/dataMerger');
const { parseZerodhaStatement } = require('../utils/zerodhaParser');
const { parseForeignStocks } = require('../utils/foreignStocksParser');

const router = express.Router();

// Protect all routes
router.use(protect);

// Setup multer for memory storage uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
});

router.post('/:returnId/upload', upload.single('file'), async (req, res) => {
  try {
    const { returnId } = req.params;
    const { documentType, password } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const taxReturn = await TaxReturn.findById(returnId);
    if (!taxReturn || taxReturn.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Return not found or unauthorized' });
    }

    let extractedData = {};

    // Route extraction based on document type
    switch (documentType) {
      case 'form16':
        extractedData = await extractForm16Data(file.buffer, password);
        break;
      case 'form26as':
        extractedData = await extractForm26AS(file.buffer, password);
        break;
      case 'ais':
        extractedData = await extractAIS(file.buffer);
        break;
      case 'pan':
        extractedData = await extractPAN(file.buffer);
        break;
      case 'aadhaar':
        extractedData = await extractAadhaar(file.buffer);
        break;
      case 'capitalGains':
        extractedData = await extractCapitalGains(file.buffer);
        break;
      case 'bankStatement':
        extractedData = await extractBankStatement(file.buffer);
        break;
      case 'zerodhaStatement':
        extractedData = parseZerodhaStatement(file.buffer);
        break;
      case 'foreignStocks':
        extractedData = parseForeignStocks(file.buffer);
        break;
      default:
        // fallback to universal extractor
        extractedData = await universalExtractPDF(file.buffer, password);
    }

    // Save uploaded document record
    const uploadedDoc = new UploadedDocument({
      userId: req.userId,
      taxReturnId: returnId,
      documentType,
      fileName: file.originalname,
      fileSize: file.size,
      extractedData,
      uploadedAt: new Date(),
    });
    await uploadedDoc.save();

    // Merge extracted data with existing tax return
    const mergedData = mergeExtractedData(taxReturn.toObject(), extractedData);
    Object.assign(taxReturn, mergedData);
    taxReturn.updatedAt = new Date();
    await taxReturn.save();

    res.json({
      message: 'Document uploaded and processed successfully',
      documentId: uploadedDoc._id,
      extractedData,
      mergedReturn: taxReturn,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:returnId/documents', async (req, res) => {
  try {
    const documents = await UploadedDocument.find({ taxReturnId: req.params.returnId });
    res.json(documents);
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
