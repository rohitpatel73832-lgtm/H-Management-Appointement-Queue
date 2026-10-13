
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Availability from "../models/availability.model.js";
import Appointment from "../models/appointement.model.js";
import { generateSlots } from "../services/slot.service.js";
import Queue from "../models/queue.model.js";
import {getAppointmentCache,setAppointmentCache,patientAppointmentKey,
  clearAppointmentCaches} from "../services/appointementCache.service.js";

    
    

const createAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, startTime, endTime } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
        throw new ApiError(
            400,
            "Doctor, date, start time and end time are required"
        );
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
        throw new ApiError(400, "Invalid date");
    }

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

    const availability = await Availability.find({
        doctor: doctorId,
        dayOfWeek
    });

    if (availability.length === 0) {
        throw new ApiError(
            400,
            "Doctor is not available on this day"
        );
    }

    let validSlot = false;

    for (const schedule of availability) {
        const slots = generateSlots(
            schedule.startTime,
            schedule.endTime,
            30
        );

        const slotExists = slots.some((slot) => (
            slot.startTime === startTime &&
            slot.endTime === endTime
        ));

        if (slotExists) {
            validSlot = true;
            break;
        }
    }

    if (!validSlot) {
        throw new ApiError(400, "Selected slot is not available");
    }

    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        date,
        startTime,
        endTime,
        status: "booked"
    });

    if (existingAppointment) {
        throw new ApiError(400, "This slot is already booked");
    }

    let appointment;

    try {
        appointment = await Appointment.create({
            patient: req.userId,
            doctor: doctorId,
            date,
            startTime,
            endTime,
            status: "booked"
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, "This slot is already booked");
        }

        throw error;
    }

    const lastQueue = await Queue.findOne({
        doctor: doctorId,
        date
    }).sort({
        tokenNumber: -1
    });

    const nextToken = lastQueue
        ? lastQueue.tokenNumber + 1
        : 1;

    let queue;

    try {
        queue = await Queue.create({
            appointment: appointment._id,
            doctor: doctorId,
            patient: req.userId,
            date,
            tokenNumber: nextToken,
            status: "waiting"
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(
                400,
                "Failed to generate a unique token. Please try again."
            );
        }

        throw error;
    }

    // Invalidate cached appointment lists
    await clearAppointmentCaches({
        patientId: String(req.userId),
        doctorId: String(doctorId)
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { appointment, queue },
            "Appointment booked successfully"
        )
    );
});

const getMyAppointments = asyncHandler(async (req, res) => {
    const cacheKey = patientAppointmentKey(
        String(req.userId)
    );

    // Check Redis
    const cachedAppointments = await getAppointmentCache(cacheKey);

    if (cachedAppointments !== null) {
        console.log("Patient appointment cache HIT");

        return res.status(200).json(cachedAppointments);
    }

    console.log("Patient appointment cache MISS");

    // Fetch from MongoDB
    const appointments = await Appointment.find({
        patient: req.userId
    })
        .populate({
            path: "doctor",
            populate: {
                path: "user",
                select: "name email"
            }
        })
        .sort({
            date: 1,
            startTime: 1
        });

    const response = new ApiResponse(
        200,
        { appointments },
        "Appointments fetched successfully"
    );

    // Store response for 60 seconds
    await setAppointmentCache(cacheKey, response);

    return res.status(200).json(response);
});

export {
    createAppointment,
    getMyAppointments
};
