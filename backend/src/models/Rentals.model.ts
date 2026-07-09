import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'ongoing', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { 
    type: String,
    default: ''
  },
  customerDetails: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    deliveryAddress: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'digital'],
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payments'
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  rentalDays: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  securityDeposit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Rentals', rentalSchema);