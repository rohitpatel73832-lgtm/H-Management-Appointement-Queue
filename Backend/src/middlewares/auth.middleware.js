// import jwt from "jsonwebtoken";
// import User from "../models/user.models.js";
// import ApiResponse from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/ApiError.js";
// import asyncHandler from "../utils/AsyncHandler.js";



// const protect = asyncHandler(async (req, res, next) => {

//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         throw new ApiError(401, "No token provided");
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//         throw new ApiError(401, "Invalid authorization format");
//     }

//     const decoded = jwt.verify(
//         token,
//         process.env.Access_TOKEN_SECRET
//     );

//     const user = await User.findById(decoded._id).select("-password");

//     if (!user) {
//         throw new ApiError(401, "User not found");
//     }

//     req.user = user;
//     req.userId = decoded._id;

//     next();
// });

// export { protect };

import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader) {
        throw new ApiError(401, "No token provided");
    }

    // Validate Bearer format
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new ApiError(401, "Invalid authorization format");
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.Access_TOKEN_SECRET
        );
    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            throw new ApiError(401, "Invalid or expired token");
        }

        throw error;
    }

    // Find authenticated user
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    req.userId = user._id;

    next();
});

export { protect };