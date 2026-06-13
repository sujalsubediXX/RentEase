import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Wishlist', WishlistSchema)
