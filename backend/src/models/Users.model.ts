import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        },
        profileImage: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            required: true,
            enum: ['renter', 'owner', 'admin'],
            default: 'renter'
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        kycStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'not_submitted'],
            default: 'not_submitted'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)