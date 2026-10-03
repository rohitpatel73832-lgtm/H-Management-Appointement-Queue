import asyncHandler from "../utils/AsyncHandler.js";
import Doctor from "../models/doctor.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createDoctorProfile = asyncHandler(async (req, res) => {

    const {specialization,qualification,experience,consultationFee,about,clinicAddress} = req.body;
        
    // Check required fields

    if (!specialization ||!qualification ||experience === undefined ||consultationFee === undefined ||!clinicAddress) {
        throw new ApiError(
            400,
            "Specialization, qualification, experience, consultation fee and clinic address are required"
        );
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({
        user: req.userId
    });

    if (existingDoctor) {
        throw new ApiError(
            400,
            "Doctor profile already exists"
        );
    }

    const doctor = await Doctor.create({
        user: req.userId,
        specialization,
        qualification,
        experience,
        consultationFee,
        about,
        clinicAddress
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { doctor },
            "Doctor profile created successfully"
        )
    );
});

export {
    createDoctorProfile
};