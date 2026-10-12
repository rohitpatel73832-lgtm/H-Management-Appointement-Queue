import asyncHandler from "../utils/AsyncHandler.js";
import Doctor from "../models/doctor.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.models.js";
import { clearDoctorListCache, getCache, setCache } from "../services/redis.service.js";

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

    // Clear cached doctor lists after creating a profile
    await clearDoctorListCache();

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

    // Create a unique cache key for each filter combination
    const normalizedSpecialization = (specialization || "").trim().toLowerCase();
    const normalizedSearch = (search || "").trim().toLowerCase();

    const cacheKey =
        `hmanage:doctors:list:` +
        `specialization:${encodeURIComponent(normalizedSpecialization)}:` +
        `search:${encodeURIComponent(normalizedSearch)}`;

    // Check Redis cache first
    const cachedDoctors = await getCache(cacheKey);

    if (cachedDoctors !== null) {
        console.log("Doctor list cache HIT");

        return res.status(200).json(cachedDoctors);
    }

    console.log("Doctor list cache MISS");

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

    const response = new ApiResponse(
        200,
        { doctors },
        "Doctors fetched successfully"
    );

    // Cache the complete API response for 60 seconds
    await setCache(cacheKey, response, 60);

    return res.status(200).json(response);
});

// Get Single Doctor + redis cache
const getDoctorById = asyncHandler(async (req, res) => {

    const { doctorId } = req.params;

    const cacheKey = `hmanage:doctors:profile:${doctorId}`;

    // Check Redis cache first
    const cachedDoctor = await getCache(cacheKey);
    if (cachedDoctor !== null) {
        console.log("Doctor profile cache HIT");

        return res.status(200).json(cachedDoctor);
    }

    console.log("Doctor profile cache MISS");

    const doctor = await Doctor.findById(doctorId)
        .populate("user", "name email");

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor not found"
        );
    }

    const response = new ApiResponse(
        200,
        { doctor },
        "Doctor fetched successfully"
    );
    // Cache the complete API response for 60 seconds
    await setCache(cacheKey, response, 60);

    return res.status(200).json(response);
});

export {
    createDoctorProfile,
    getAllDoctors,
    getDoctorById
};