import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import Doctor from "../models/doctor.models.js";

// Generate JWT token
const generateToken = (id) => {
    if (!process.env.Access_TOKEN_SECRET) {
        throw new Error("Access_TOKEN_SECRET is missing from .env");
    }

    if (!process.env.ACCESS_TOKEN_EXPIRY) {
        throw new Error("ACCESS_TOKEN_EXPIRY is missing from .env");
    }

    return jwt.sign(
        {
            _id: id,
        },
        process.env.Access_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};


// Register user
const registerUser = asyncHandler(async (req, res) => {
    //const { name, email, password } = req.body ?? {};
    const { name, email, password, role } = req.body ;


    // Validate field types
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        throw new ApiError(
            400,
            "Name, email and password must be valid strings"
        );
    }

    // Normalize input
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Required fields
    if (!cleanName || !cleanEmail || !password.trim()) {
        throw new ApiError(
            400,
            "Name, email and password are required"
        );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        throw new ApiError(
            400,
            "Please provide a valid email"
        );
    }

    // Validate password length
    if (password.length < 8 || password.length > 72) {
        throw new ApiError(
            400,
            "Password must be between 8 and 72 characters"
        );
    }

    // Check for existing user
    const userExist = await User.findOne({
        email: cleanEmail,
    });

    if (userExist) {
        throw new ApiError(
            409,
            "User already exists"
        );
    }

    // Create user
    const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password,
    });

    const token = generateToken(user._id);

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                token,
            },
            "User registered successfully"
        )
    );
});


// Register doctor (public registration; admin approval required)
const registerDoctor = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        specialization,
        qualification,
        experience,
        consultationFee,
        about,
        clinicAddress,
    } = req.body ?? {};

    // Validate required string fields
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof specialization !== "string" ||
        typeof qualification !== "string" ||
        typeof clinicAddress !== "string"
    ) {
        throw new ApiError(
            400,
            "Name, email, password, specialization, qualification and clinic address are required"
        );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSpecialization = specialization.trim();
    const cleanQualification = qualification.trim();
    const cleanClinicAddress = clinicAddress.trim();

    if (
        !cleanName ||
        !cleanEmail ||
        !password.trim() ||
        !cleanSpecialization ||
        !cleanQualification ||
        !cleanClinicAddress
    ) {
        throw new ApiError(400, "Please fill in all required fields");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        throw new ApiError(400, "Please provide a valid email");
    }

    // Match the password limits used by your existing registration
    if (password.length < 8 || password.length > 72) {
        throw new ApiError(
            400,
            "Password must be between 8 and 72 characters"
        );
    }

    // Validate numeric fields
    const doctorExperience = Number(experience);
    const doctorFee = Number(consultationFee);

    if (
        experience === undefined ||
        experience === null ||
        experience === "" ||
        !Number.isFinite(doctorExperience) ||
        doctorExperience < 0
    ) {
        throw new ApiError(
            400,
            "Experience must be a valid non-negative number"
        );
    }

    if (
        consultationFee === undefined ||
        consultationFee === null ||
        consultationFee === "" ||
        !Number.isFinite(doctorFee) ||
        doctorFee < 0
    ) {
        throw new ApiError(
            400,
            "Consultation fee must be a valid non-negative number"
        );
    }

    // Check whether this email is already registered
    const userExists = await User.findOne({
        email: cleanEmail,
    });

    if (userExists) {
        throw new ApiError(409, "User already exists");
    }

    // Create the account with the doctor role assigned by the server
    const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password,
        role: "doctor",
    });

    try {
        // Create the doctor's profile
        const doctor = await Doctor.create({
            user: user._id,
            specialization: cleanSpecialization,
            qualification: cleanQualification,
            experience: doctorExperience,
            consultationFee: doctorFee,
            about:
                typeof about === "string"
                    ? about.trim()
                    : "",
            clinicAddress: cleanClinicAddress,
            approvalStatus: "pending",
            isActive: true,
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    doctor: {
                        _id: doctor._id,
                        specialization: doctor.specialization,
                        qualification: doctor.qualification,
                        approvalStatus: doctor.approvalStatus,
                    },
                },
                "Doctor registration submitted successfully. Please wait for admin approval."
            )
        );
    } catch (error) {
        // Avoid leaving an account without its doctor profile
        await User.deleteOne({ _id: user._id });
        throw error;
    }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    // Validate required fields and types
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        throw new ApiError(
            400,
            "Email and password are required"
        );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        throw new ApiError(
            400,
            "Please provide a valid email"
        );
    }

    // Prevent oversized password input
    if (password.length > 72) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Find user
    const user = await User.findOne({
        email: cleanEmail,
    });

    // Use the same error for unknown email and wrong password
    if (!user) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    const token = generateToken(user._id);

    // Return safe user data only
    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: safeUser,
                token,
            },
            "User logged in successfully"
        )
    );
});


// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
            },
            "Current user fetched successfully"
        )
    );
});


// Patient dashboard
const patientDashboard = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
            },
            "Welcome to patient dashboard"
        )
    );
});


// Doctor dashboard
const doctorDashboard = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
            },
            "Welcome to doctor dashboard"
        )
    );
});


// Admin dashboard
const adminDashboard = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
            },
            "Welcome to admin dashboard"
        )
    );
});


export {
    registerUser,
    registerDoctor,
    loginUser,
    getCurrentUser,
    patientDashboard,
    doctorDashboard,
    adminDashboard,
};