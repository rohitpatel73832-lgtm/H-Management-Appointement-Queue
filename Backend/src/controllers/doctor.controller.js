import asyncHandler from "../utils/AsyncHandler.js";
import Doctor from "../models/doctor.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.models.js";

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

// Get All Doctors + Search
const getAllDoctors = asyncHandler(async (req, res) => {

    const { specialization, search } = req.query;

    let filter = {};

    // Filter by specialization
    if (specialization) {
        filter.specialization = {
            $regex: specialization,
            $options: "i"
        };
    }

    // Search doctor by name
    if (search) {

        const users = await User.find({
            name: {
                $regex: search,
                $options: "i"
            }
        }).select("_id");

        const userIds = users.map(user => user._id);

        filter.user = {
            $in: userIds
        };
    }

    const doctors = await Doctor.find(filter)
        .populate("user", "name email");

    return res.status(200).json(
        new ApiResponse(
            200,
            { doctors },
            "Doctors fetched successfully"
        )
    );
});

// Get Single Doctor
const getDoctorById = asyncHandler(async (req, res) => {

    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
        .populate("user", "name email");

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { doctor },
            "Doctor fetched successfully"
        )
    );
});

export {
    createDoctorProfile,
    getAllDoctors,
    getDoctorById
};