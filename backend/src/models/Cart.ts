import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Item'
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            rentalDays: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ]
}, {
    timestamps: true
});

export default mongoose.model('Cart', CartSchema)
