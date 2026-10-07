import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Queue from "../models/queue.model.js";
import { getIO } from "../socket.js";



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

const updateQueueStatus = asyncHandler(async(req,res)=>{
    const { queueId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(
            400,
            "Status is required"
        );
    }

    // Allowed statuses
    const allowedStatuses = [
        "waiting",
        "called",
        "serving",
        "completed",
        "skipped",
        "cancelled"
    ];

     if (!allowedStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid queue status"
        );
    }

    // Find doctor using logged-in user
    const doctor = await Doctor.findOne({
        user: req.userId
    });


    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor profile not found"
        );
    }

    // Find queue
    const queue = await Queue.findById(
        queueId
    );


    if (!queue) {
        throw new ApiError(
            404,
            "Queue not found"
        );
    }

    // Make sure queue belongs to this doctor
    if (
        queue.doctor.toString() !==
        doctor._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this queue"
        );
    }

    // Update status
    queue.status = status;

    await queue.save();

    // Send real-time update to patient
    const io= getIO();
    io.to(`patient:${queue.patient}`).emit(
        "queue-updated",
        {
            queueId: queue._id,
            doctorId: queue.doctor,
            patientId: queue.patient,
            tokenNumber: queue.tokenNumber,
            status: queue.status
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
               200,
                {
                    queue
                },
                "Queue status updated successfully"
            )
        );

})

    



export {
    getDoctorQueue,
    updateQueueStatus,
}