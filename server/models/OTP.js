import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },

    otp: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true,
      enum: ["register", "reset"]
    },

    name: {
      type: String
    },

    password: {
      type: String
    },

    expiresAt: {
      type: Date,
      required: true
    },

    attempts: {
      type: Number,
      default: 0
    },

    requestCount: {
      type: Number,
      default: 1
    },

    lastSentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("OTP", otpSchema);