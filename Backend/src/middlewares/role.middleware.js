import { ApiError } from "../utils/ApiError.js";

const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            throw new ApiError(
                401,
                "User is not authenticated"
            );
        }
        // console.log("Authenticated user:", req.user.email);
        // console.log("Authenticated role:", req.user.role);
        // console.log("Allowed roles:", allowedRoles);


        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You are not authorized to access this resource"
            );
        }

        next();
    };
};

export { authorize };