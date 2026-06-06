import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  condition: {
    type: String,
    enum: ['new','like new' ,'used'],
},
availability: {
    type: String,
    enum: ['available', 'unavailable','rented'],
    default: 'available'
  }
},
 {
  timestamps: true
});

export default mongoose.model('Items', itemSchema);