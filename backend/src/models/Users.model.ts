import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true, 
        },
        phone: {
            type: String,
            required: true, 
        },
        password: {
            type: String,
            required: true, 
        },
        profileimage:{
            type: String,
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'owner', 'admin'],
            default: 'user'
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive','suspended'],
            default: 'active'
        },

    },
    {
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)