import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";


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


export { registerUser };