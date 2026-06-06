import mongoose from "mongoose";

const kycVerificationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    fullname: {
        type: String,
        require: true,
        trim: true
    },
    id_type: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',   
        require: true,   
    },
    id_number: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',    
        require: true,       
    },
    front_img: {
        type: String,
        require: true,       
    },
    back_img: {
        type: String,   
        require: true,       
    },

},
    {
        timestamps: true
    })


export default mongoose.model("KYCVerification",kycVerificationSchema)