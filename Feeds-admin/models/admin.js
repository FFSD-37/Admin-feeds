import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
