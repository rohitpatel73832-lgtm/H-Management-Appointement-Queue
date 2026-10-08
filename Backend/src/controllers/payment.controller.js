import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const testPayment = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Payment system is working"
        )
    );

});

export {
    testPayment
};