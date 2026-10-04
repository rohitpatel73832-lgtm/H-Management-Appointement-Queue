import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Availability from "../models/availability.model.js";

import { generateSlots } from "../services/slot.service.js";


const getDoctorSlots = asyncHandler(async (req, res) => {

    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        throw new ApiError(
            400,
            "Doctor ID and date are required"
        );
    }

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor not found"
        );
    }

    // Convert date into JavaScript Date
    const selectedDate = new Date(`${date}T00:00:00`);

    if (isNaN(selectedDate.getTime())) {
        throw new ApiError(
            400,
            "Invalid date"
        );
    }

    // Get day name
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const dayOfWeek = days[selectedDate.getDay()];

    // Find doctor's availability for that day
    const availability = await Availability.find({
        doctor: doctorId,
        dayOfWeek
    }).sort({
        startTime: 1
    });

    if (availability.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    date,
                    dayOfWeek,
                    slots: []
                },
                "No availability found for this date"
            )
        );
    }

    // Generate slots
    let slots = [];

    for (const schedule of availability) {

        const generatedSlots = generateSlots(
            schedule.startTime,
            schedule.endTime,
            30
        );

        slots.push(...generatedSlots);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                date,
                dayOfWeek,
                slots
            },
            "Slots generated successfully"
        )
    );
});


export {
    getDoctorSlots
};