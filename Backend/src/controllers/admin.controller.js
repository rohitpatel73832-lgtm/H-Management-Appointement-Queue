import mongoose from "mongoose";
import User  from "../models/user.models.js";
import Doctor from "../models/doctor.models.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};

    // Search by name or email
    if (search?.trim()) {
        const searchText = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { name: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } }
        ];
    }

    // Optional role filter
    if (role) {
        if (!["patient", "doctor", "admin"].includes(role)) {
            throw new ApiError(400, "Invalid role");
        }

        filter.role = role;
    }

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean(),

        User.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    totalUsers,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalUsers / limitNumber)
                }
            },
            "Users fetched successfully"
        )
    );
});


// GET /api/admin/doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};

    if (search?.trim()) {
        const searchText = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { specialization: { $regex: searchText, $options: "i" } },
            { qualification: { $regex: searchText, $options: "i" } }
        ];
    }

    const [doctors, totalDoctors] = await Promise.all([
        Doctor.find(filter)
            .populate("user", "name email role")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean(),

        Doctor.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                doctors,
                pagination: {
                    totalDoctors,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalDoctors / limitNumber)
                }
            },
            "Doctors fetched successfully"
        )
    );
});


// PATCH /api/admin/doctors/:id/status
const updateDoctorStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
//     console.log("isActive value:", isActive);
// console.log("isActive type:", typeof isActive);

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid doctor ID");
    }

    if (typeof isActive !== "boolean") {
        throw new ApiError(400, "isActive must be true or false");
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    doctor.isActive = isActive;
    await doctor.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                doctorId: doctor._id,
                isActive: doctor.isActive
            },
            `Doctor ${isActive ? "activated" : "deactivated"} successfully`
        )
    );
});

export {
    getAllUsers,
    getAllDoctors,
    updateDoctorStatus
};