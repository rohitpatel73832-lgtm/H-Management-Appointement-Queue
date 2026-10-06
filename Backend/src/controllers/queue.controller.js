import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Queue from "../models/queue.model.js";



const getDoctorQueue= asyncHandler(async(req,res)=>{
    const { date } = req.query;
    if (!date) {
        throw new ApiError(
            400,
            "Date is required"
        );
    }

    const doctor = await Doctor.findOne({
        user: req.userId
    });
    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor profile not found"
        );
    }

    const queue = await Queue.find({
        doctor: doctor._id,
        date
    })
        .populate(
            "patient",
            "name email"
        )
        .sort({
            tokenNumber: 1
        });

        return res
        .status(200)
        .json(

            new ApiResponse(

                200,

                {
                    queue
                },

                "Queue fetched successfully"

            )

        );

})



export { getDoctorQueue }