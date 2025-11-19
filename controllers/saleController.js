import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/sales';
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: fileFilter
}).fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'agreement', maxCount: 1 }
]);

// @desc    Get all sales with filters
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const { q, item, startDate, endDate } = req.query;

    let filter = {};

    if (q) {
      filter.$or = [
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    if (item && item !== 'ALL') {
      filter.item = item;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sales = await Sale.find(filter)
      .populate('customer', 'name')
      .populate('createdBy', 'name')
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name')
      .populate('createdBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const saleData = { ...req.body };

    // Handle file uploads
    const documents = [];
    if (req.files) {
      if (req.files.invoice && req.files.invoice[0]) {
        const file = req.files.invoice[0];
        documents.push({
          type: 'invoice',
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });
      }

      if (req.files.agreement && req.files.agreement[0]) {
        const file = req.files.agreement[0];
        documents.push({
          type: 'agreement',
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });
      }
    }

    if (documents.length > 0) {
      saleData.documents = documents;
    }

    // Convert date string to Date object
    if (saleData.date) {
      saleData.date = new Date(saleData.date);
    }

    // Validate customer exists
    const customer = await Customer.findById(saleData.customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const sale = await Sale.create(saleData);
    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name')
      .populate('createdBy', 'name');

    res.status(201).json(populatedSale);
  } catch (error) {
    // Clean up uploaded files if database operation fails
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate sale entry' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res) => {
  try {
    const saleData = { ...req.body };

    // Handle file uploads
    const documents = [];
    if (req.files) {
      if (req.files.invoice && req.files.invoice[0]) {
        const file = req.files.invoice[0];
        documents.push({
          type: 'invoice',
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });
      }

      if (req.files.agreement && req.files.agreement[0]) {
        const file = req.files.agreement[0];
        documents.push({
          type: 'agreement',
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });
      }
    }

    if (documents.length > 0) {
      saleData.documents = documents;
    }

    // Convert date string to Date object
    if (saleData.date) {
      saleData.date = new Date(saleData.date);
    }

    // Validate customer exists
    const customer = await Customer.findById(saleData.customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      saleData,
      { new: true, runValidators: true }
    )
      .populate('customer', 'name')
      .populate('createdBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    // Clean up uploaded files if database operation fails
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Delete associated files
    if (sale.documents && sale.documents.length > 0) {
      sale.documents.forEach(doc => {
        if (fs.existsSync(doc.path)) {
          fs.unlinkSync(doc.path);
        }
      });
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale
};