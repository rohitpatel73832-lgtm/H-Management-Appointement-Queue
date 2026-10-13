import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

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
    loginUser,
    getCurrentUser,
    patientDashboard,
    doctorDashboard,
    adminDashboard,
};