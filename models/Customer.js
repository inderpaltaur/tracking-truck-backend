import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Individual', 'Company'],
  },
  ssn: {
    type: String,
    default: '',
  },
  dl: {
    type: String,
    default: '',
  },
  workPermit: {
    type: String,
    default: '',
  },
  cabCard: {
    type: String,
    default: '',
  },
  truckPolicy: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Customer', customerSchema);