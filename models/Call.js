import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  callerName: {
    type: String,
    required: true,
  },
  callerContact: {
    type: String,
    required: true,
  },
  callType: {
    type: String,
    enum: ['Inbound', 'Outbound'],
    required: true,
  },
  purpose: {
    type: String,
    enum: ['Inquiry', 'Complaint', 'Support', 'Sales', 'Follow-up', 'Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Missed', 'Ongoing', 'Scheduled'],
    default: 'Completed',
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  notes: {
    type: String,
  },
  callDate: {
    type: Date,
    default: Date.now,
  },
  scheduledDate: {
    type: Date,
  },
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Call', callSchema);