import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            unique: true
        },

        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            trim: true
        },

        qualification: {
            type: String,
            required: [true, "Qualification is required"],
            trim: true
        },

        experience: {
            type: Number,
            required: [true, "Experience is required"],
            min: [0, "Experience cannot be negative"]
        },

        consultationFee: {
            type: Number,
            required: [true, "Consultation fee is required"],
            min: [0, "Consultation fee cannot be negative"]
        },

        about: {
            type: String,
            trim: true,
            maxlength: [500, "About cannot exceed 500 characters"]
        },

        clinicAddress: {
            type: String,
            required: [true, "Clinic address is required"],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;