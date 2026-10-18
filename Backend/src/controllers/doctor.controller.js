
import asyncHandler from "../utils/AsyncHandler.js";
import Doctor from "../models/doctor.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.models.js";
import {
    clearDoctorListCache,
    getCache,
    setCache
} from "../services/redis.service.js";

// Create Doctor Profile
const createDoctorProfile = asyncHandler(async (req, res) => {
    const {
        specialization,
        qualification,
        experience,
        consultationFee,
        about,
        clinicAddress
    } = req.body;

    if (
        !specialization?.trim() ||
        !qualification?.trim() ||
        experience === undefined ||
        consultationFee === undefined ||
        !clinicAddress?.trim()
    ) {
        throw new ApiError(
            400,
            "Specialization, qualification, experience, consultation fee and clinic address are required"
        );
    }

    const parsedExperience = Number(experience);
    const parsedFee = Number(consultationFee);

    if (
        !Number.isFinite(parsedExperience) ||
        parsedExperience < 0 ||
        !Number.isInteger(parsedExperience)
    ) {
        throw new ApiError(
            400,
            "Experience must be a non-negative integer"
        );
    }

    if (!Number.isFinite(parsedFee) || parsedFee < 0) {
        throw new ApiError(
            400,
            "Consultation fee must be a non-negative number"
        );
    }

    const existingDoctor = await Doctor.findOne({
        user: req.userId
    });

    if (existingDoctor) {
        throw new ApiError(400, "Doctor profile already exists");
    }

    const doctor = await Doctor.create({
        user: req.userId,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: parsedExperience,
        consultationFee: parsedFee,
        about: about?.trim() || "",
        clinicAddress: clinicAddress.trim()
    });

    await clearDoctorListCache();

    return res.status(201).json(
        new ApiResponse(
            201,
            { doctor },
            "Doctor profile created successfully"
        )
    );
});

// Get Logged-in Doctor's Profile
const getMyDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({
        user: req.userId
    }).populate("user", "name email");

    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { doctor },
            "Your doctor profile fetched successfully"
        )
    );
});

// Update Logged-in Doctor's Profile
const updateDoctorProfile = asyncHandler(async (req, res) => {
    const {
        specialization,
        qualification,
        experience,
        consultationFee,
        about,
        clinicAddress
    } = req.body;

    const doctor = await Doctor.findOne({
        user: req.userId
    });

    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found");
    }

    // Update only fields supplied in the request
    if (specialization !== undefined) {
        if (
            typeof specialization !== "string" ||
            !specialization.trim()
        ) {
            throw new ApiError(400, "Specialization cannot be empty");
        }

        doctor.specialization = specialization.trim();
    }

    if (qualification !== undefined) {
        if (
            typeof qualification !== "string" ||
            !qualification.trim()
        ) {
            throw new ApiError(400, "Qualification cannot be empty");
        }

        doctor.qualification = qualification.trim();
    }

    if (experience !== undefined) {
        const parsedExperience = Number(experience);

        if (
            !Number.isFinite(parsedExperience) ||
            parsedExperience < 0 ||
            !Number.isInteger(parsedExperience)
        ) {
            throw new ApiError(
                400,
                "Experience must be a non-negative integer"
            );
        }

        doctor.experience = parsedExperience;
    }

    if (consultationFee !== undefined) {
        const parsedFee = Number(consultationFee);

        if (!Number.isFinite(parsedFee) || parsedFee < 0) {
            throw new ApiError(
                400,
                "Consultation fee must be a non-negative number"
            );
        }

        doctor.consultationFee = parsedFee;
    }

    if (about !== undefined) {
        if (typeof about !== "string") {
            throw new ApiError(400, "About must be text");
        }

        doctor.about = about.trim();
    }

    if (clinicAddress !== undefined) {
        if (
            typeof clinicAddress !== "string" ||
            !clinicAddress.trim()
        ) {
            throw new ApiError(400, "Clinic address cannot be empty");
        }

        doctor.clinicAddress = clinicAddress.trim();
    }

    await doctor.save();

    // Clear doctor-list and individual-profile caches
    await clearDoctorListCache();

    const cacheKey = `hmanage:doctors:profile:${doctor._id}`;
    await setCache(cacheKey, null, 1).catch(() => {});

    const updatedDoctor = await Doctor.findById(doctor._id)
        .populate("user", "name email");

    return res.status(200).json(
        new ApiResponse(
            200,
            { doctor: updatedDoctor },
            "Doctor profile updated successfully"
        )
    );
});

// Get All Doctors + Search
const getAllDoctors = asyncHandler(async (req, res) => {
    const { specialization, search } = req.query;

    const normalizedSpecialization = (specialization || "")
        .trim()
        .toLowerCase();

    const normalizedSearch = (search || "").trim().toLowerCase();

    const cacheKey =
        `hmanage:doctors:list:` +
        `specialization:${encodeURIComponent(normalizedSpecialization)}:` +
        `search:${encodeURIComponent(normalizedSearch)}`;

    const cachedDoctors = await getCache(cacheKey);

    if (cachedDoctors !== null) {
        console.log("Doctor list cache HIT");
        return res.status(200).json(cachedDoctors);
    }

    console.log("Doctor list cache MISS");

    const filter = {};

    if (specialization) {
        filter.specialization = {
            $regex: specialization,
            $options: "i"
        };
    }

    if (search) {
        const users = await User.find({
            name: {
                $regex: search,
                $options: "i"
            }
        }).select("_id");

        filter.user = {
            $in: users.map((user) => user._id)
        };
    }

    const doctors = await Doctor.find(filter)
        .populate("user", "name email");

    const response = new ApiResponse(
        200,
        { doctors },
        "Doctors fetched successfully"
    );

    await setCache(cacheKey, response, 60);

    return res.status(200).json(response);
});

// Get Single Doctor + Cache
const getDoctorById = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;

    const cacheKey = `hmanage:doctors:profile:${doctorId}`;

    const cachedDoctor = await getCache(cacheKey);

    if (cachedDoctor !== null) {
        console.log("Doctor profile cache HIT");
        return res.status(200).json(cachedDoctor);
    }

    console.log("Doctor profile cache MISS");

    const doctor = await Doctor.findById(doctorId)
        .populate("user", "name email");

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const response = new ApiResponse(
        200,
        { doctor },
        "Doctor fetched successfully"
    );

    await setCache(cacheKey, response, 60);

    return res.status(200).json(response);
});

export {
    createDoctorProfile,
    getMyDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById
};
