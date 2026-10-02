import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

// generating token
const generateToken = (id) => {
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


// register user
const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(
            400,
            "Email, name and password are required"
        );
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
        throw new ApiError(
            400,
            "User already exists"
        );
    }

    const user = await User.create({
        name,
        email,
        password
    });

    const token = generateToken(user._id);

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                token
            },
            "User registered successfully"
        )
    );
});

// login-user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(
            400,
            "Email and password are required"
        );
    }
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
                token,
            },
            "User logged in successfully"
        )
    );
}); 
// get current user
//test
const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user
            },
            "Current user fetched successfully"
        )
    );
});

//test 

const patientDashboard = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user
            },
            "Welcome to patient dashboard"
        )
    );
});

//test
const doctorDashboard = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user
            },
            "Welcome to doctor dashboard"
        )
    );
});

//test
const adminDashboard = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user
            },
            "Welcome to admin dashboard"
        )
    );
});


export { registerUser,
    loginUser,
    getCurrentUser,
    patientDashboard,
    doctorDashboard,
    adminDashboard,

 };