import mongoose from 'mongoose';
const rentalSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Items',
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
    enum: ['pending','confirmed', 'ongoing','completed', 'cancelled','rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Rentals', rentalSchema);