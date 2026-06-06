import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('Categories', categorySchema)