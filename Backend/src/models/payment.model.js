import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment is required"],
            unique: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Patient is required"]
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor is required"]
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"]
        },

        status: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        gatewayOrderId: {
            type: String,
            default: null
        },

        gatewayPaymentId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

export default Payment;