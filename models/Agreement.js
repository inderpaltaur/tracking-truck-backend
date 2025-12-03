import mongoose from 'mongoose';

const agreementSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  agreementType: {
    type: String,
    enum: ['Employment', 'Contract', 'NDA', 'Service Agreement', 'Other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  terms: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Terminated', 'Pending'],
    default: 'Pending',
  },
  signedDate: {
    type: Date,
  },
  document: {
    type: String, // URL or path to document
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Agreement', agreementSchema);