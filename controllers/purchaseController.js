import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/purchases';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// @desc    Get all purchases with filters
// @route   GET /api/purchases
// @access  Private
const getPurchases = async (req, res) => {
  try {
    const { q, type, startDate, endDate } = req.query;

    let filter = {};

    if (q) {
      filter.$or = [
        { itemName: { $regex: q, $options: 'i' } },
        { expenseType: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name')
      .populate('createdBy', 'name')
      .sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single purchase
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create purchase
// @route   POST /api/purchases
// @access  Private
const createPurchase = async (req, res) => {
  try {
    const purchaseData = { ...req.body };

    // Handle file upload
    if (req.file) {
      purchaseData.document = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };
    }

    // Convert date string to Date object
    if (purchaseData.date) {
      purchaseData.date = new Date(purchaseData.date);
    }

    // Validate supplier exists for purchases
    if (purchaseData.type === 'purchase' && purchaseData.supplier) {
      const supplier = await Supplier.findById(purchaseData.supplier);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
    }

    const purchase = await Purchase.create(purchaseData);
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    res.status(201).json(populatedPurchase);
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate purchase entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update purchase
// @route   PUT /api/purchases/:id
// @access  Private
const updatePurchase = async (req, res) => {
  try {
    const purchaseData = { ...req.body };

    // Handle file upload
    if (req.file) {
      purchaseData.document = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };
    }

    // Convert date string to Date object
    if (purchaseData.date) {
      purchaseData.date = new Date(purchaseData.date);
    }

    // Validate supplier exists for purchases
    if (purchaseData.type === 'purchase' && purchaseData.supplier) {
      const supplier = await Supplier.findById(purchaseData.supplier);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
    }

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      purchaseData,
      { new: true, runValidators: true }
    )
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete purchase
// @route   DELETE /api/purchases/:id
// @access  Private
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Delete associated file
    if (purchase.document && fs.existsSync(purchase.document.path)) {
      fs.unlinkSync(purchase.document.path);
    }

    await Purchase.findByIdAndDelete(req.params.id);

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
};