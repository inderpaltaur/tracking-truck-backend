import mongoose from 'mongoose';

const insuranceSchema = new mongoose.Schema({
  // Trailer reference - Required since this is for company-owned trailers
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
    required: true,
  },

  // Insurance details
  provider: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  policyType: {
    type: String,
    enum: ['Comprehensive', 'Liability', 'Collision', 'Physical Damage', 'Cargo', 'Other'],
    default: 'Comprehensive',
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  premium: {
    type: Number,
    required: true,
    min: 0,
  },
  premiumFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    default: 'Annual',
  },
  coverageAmount: {
    type: Number,
    min: 0,
  },
  deductible: {
    type: Number,
    min: 0,
  },

  // Document reference (for DocuSign or uploaded documents)
  documents: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    documentType: {
      type: String,
      enum: ['Policy Document', 'Certificate', 'Endorsement', 'Other'],
      default: 'Policy Document',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  docusignEnvelopeId: {
    type: String,
    default: '',
  },

  // Verification workflow
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'requires_update'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    default: '',
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'expiring', 'expired', 'cancelled'],
    default: 'active',
  },

  // Notification settings
  notifyBeforeDays: {
    type: Number,
    default: 30,
    min: 0,
  },
  notifyByEmail: {
    type: Boolean,
    default: true,
  },
  notifyBySms: {
    type: Boolean,
    default: false,
  },
  lastNotificationSent: {
    type: Date,
  },

  // Additional information
  notes: {
    type: String,
    default: '',
  },
  coverageAmount: {
    type: Number,
    min: 0,
  },
  deductible: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: true,
});

// Index for faster queries
insuranceSchema.index({ trailer: 1 });
insuranceSchema.index({ policyNumber: 1 });
insuranceSchema.index({ status: 1 });
insuranceSchema.index({ expiryDate: 1 });
insuranceSchema.index({ verificationStatus: 1 });

// Virtual for days until expiry
insuranceSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save hook to auto-update status based on expiry date
insuranceSchema.pre('save', function(next) {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= this.notifyBeforeDays) {
    this.status = 'expiring';
  } else if (this.status !== 'cancelled') {
    this.status = 'active';
  }

  next();
});

export default mongoose.model('Insurance', insuranceSchema);
