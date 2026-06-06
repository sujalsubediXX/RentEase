import mongoose from "mongoose";

const itemImageSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        imageUrl: {
            type: String,
            required: true,
            maxlength: 255
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('ItemImage', itemImageSchema);