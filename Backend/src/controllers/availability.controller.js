import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Availability from "../models/availability.model.js";



//availability controller
const createAvailability = asyncHandler(async(req,res)=>{
    const {dayOfWeek,startTime,endTime} = req.body;

    if(!dayOfWeek||!startTime||!endTime){
        throw new ApiError(
            400,
            "Day,StartTime and endTime is required"
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

    // Check start time < end time
    if (startTime >= endTime) {
        throw new ApiError(
            400,
            "Start time must be before end time"
        );
    }

      // Check overlapping availability
    const existingAvailability = await Availability.findOne({
        doctor: doctor._id,
        dayOfWeek,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    });

    if (existingAvailability) {
        throw new ApiError(
            400,
            "Availability overlaps with an existing schedule"
        );
    }

     const availability = await Availability.create({
        doctor: doctor._id,
        dayOfWeek,
        startTime,
        endTime
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { availability },
            "Availability created successfully"
        )
    );
})

const getMyAvailability = asyncHandler(async (req, res) => {

    const doctor = await Doctor.findOne({
        user: req.userId
    });

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor profile not found"
        );
    }

    const availability = await Availability.find({
        doctor: doctor._id
    }).sort({
        dayOfWeek: 1,
        startTime: 1
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { availability },
            "Availability fetched successfully"
        )
    );
});

const updateAvailability = asyncHandler(async (req, res) => {

    const { availabilityId } = req.params;

    const {
        dayOfWeek,
        startTime,
        endTime
    } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
        throw new ApiError(
            400,
            "Day, start time and end time are required"
        );
    }

    if (startTime >= endTime) {
        throw new ApiError(
            400,
            "Start time must be before end time"
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

    const availability = await Availability.findOne({
        _id: availabilityId,
        doctor: doctor._id
    });

    if (!availability) {
        throw new ApiError(
            404,
            "Availability not found"
        );
    }

    // Check overlapping availability
    const existingAvailability = await Availability.findOne({
        _id: { $ne: availabilityId },
        doctor: doctor._id,
        dayOfWeek,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    });

    if (existingAvailability) {
        throw new ApiError(
            400,
            "Availability overlaps with an existing schedule"
        );
    }

    availability.dayOfWeek = dayOfWeek;
    availability.startTime = startTime;
    availability.endTime = endTime;

    await availability.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { availability },
            "Availability updated successfully"
        )
    );
});

const deleteAvailability = asyncHandler(async (req, res) => {

    const { availabilityId } = req.params;

    const doctor = await Doctor.findOne({
        user: req.userId
    });

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor profile not found"
        );
    }

    const availability = await Availability.findOneAndDelete({
        _id: availabilityId,
        doctor: doctor._id
    });

    if (!availability) {
        throw new ApiError(
            404,
            "Availability not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Availability deleted successfully"
        )
    );
});

export {
    createAvailability,
    getMyAvailability,
    updateAvailability,
    deleteAvailability
};