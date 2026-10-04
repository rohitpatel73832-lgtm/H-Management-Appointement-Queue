import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
    {
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor is required"]
        },

        dayOfWeek: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            required: [true, "Day of week is required"]
        },

        startTime: {
            type: String,
            required: [true, "Start time is required"]
        },

        endTime: {
            type: String,
            required: [true, "End time is required"]
        }
    },
    {
        timestamps: true
    }
);

const Availability = mongoose.model(
    "Availability",
    availabilitySchema
);

export default Availability;