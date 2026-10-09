import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Queue from "../models/queue.model.js";
import { getIO } from "../socket.js";
import { createNotification } from "../services/notification.service.js";



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

    //notifiaction message
    const notificationMessages = {
    called: {
        title: "Your token has been called",
        message: `Your token number ${queue.tokenNumber} has been called. Please be ready.`,
        type: "queue"
    },

    serving: {
        title: "Your consultation has started",
        message: `Your consultation for token number ${queue.tokenNumber} is now in progress.`,
        type: "queue"
    },

    completed: {
        title: "Consultation completed",
        message: `Your consultation for token number ${queue.tokenNumber} has been completed.`,
        type: "queue"
    }
};

const notificationDetails = notificationMessages[status];

if (notificationDetails) {
    await createNotification({
        userId: queue.patient,
        title: notificationDetails.title,
        message: notificationDetails.message,
        type: notificationDetails.type,
        relatedId: queue._id
    });
}

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

const getMyWaitingTime = asyncHandler(async (req, res) => {

    const { date } = req.query;

    const AVERAGE_SERVICE_TIME = 30;


    // Check date

    if (!date) {

        throw new ApiError(
            400,
            "Date is required"
        );

    }


    // Find patient's active queue

    const myQueue = await Queue.findOne({

        patient: req.userId,

        date,

        status: {
            $in: [
                "waiting",
                "called",
                "serving"
            ]
        }

    });


    if (!myQueue) {

        throw new ApiError(
            404,
            "No active queue found for this date"
        );

    }


    // Find active patients ahead

    const patientsAhead =
        await Queue.countDocuments({

            doctor: myQueue.doctor,

            date: myQueue.date,

            tokenNumber: {
                $lt: myQueue.tokenNumber
            },

            status: {
                $in: [
                    "waiting",
                    "called",
                    "serving"
                ]
            }

        });


    // Calculate estimated waiting time

    const estimatedWaitingTime =
        patientsAhead * AVERAGE_SERVICE_TIME;


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tokenNumber:
                        myQueue.tokenNumber,

                    patientsAhead,

                    estimatedWaitingTime
                },
                "Waiting time calculated successfully"
            )
        );

});

    



export {
    getDoctorQueue,
    updateQueueStatus,
    getMyWaitingTime,
}