import mongoose from "mongoose";

export const SessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User is required"]
    },
    ip : {
        type: String,
        required: [true, "IP address is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "refreshTokenHash is required"]
    },
    userAgent: {
        type: String,
        required: [true, "userAgent is required"] // to knwo the browser session
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

