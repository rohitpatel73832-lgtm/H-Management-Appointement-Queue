import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
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

        date: {
            type: String,
            required: [true, "Date is required"]
        },

        startTime: {
            type: String,
            required: [true, "Start time is required"]
        },

        endTime: {
            type: String,
            required: [true, "End time is required"]
        },

        status: {
            type: String,
            enum: ["booked", "cancelled", "completed"],
            default: "booked"
        }
    },
    {
        timestamps: true
    }
);


// Prevent two booked appointments
// for the same doctor and same time slot

appointmentSchema.index(
    {
        doctor: 1,
        date: 1,
        startTime: 1,
        endTime: 1
    },
    {
        unique: true,

        partialFilterExpression: {
            status: "booked"
        }
    }
);


const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

export default Appointment;