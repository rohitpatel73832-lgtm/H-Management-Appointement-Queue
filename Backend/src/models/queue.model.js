import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: [true, "Appointment is required"],
            unique: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor is required"]
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Patient is required"]
        },

        date: {
            type: String,
            required: [true, "Date is required"]
        },

        tokenNumber: {
            type: Number,
            required: [true, "Token number is required"]
        },

        status: {
            type: String,
            enum: [
                "waiting",
                "called",
                "serving",
                "completed",
                "skipped",
                "cancelled"
            ],
            default: "waiting"
        }
    },
    {
        timestamps: true
    }
);

queueSchema.index(
    {
        doctor: 1,
        date: 1,
        tokenNumber: 1
    },
    {
        unique: true
    }
);

const Queue = mongoose.model(
    "Queue",
    queueSchema
);

export default Queue;