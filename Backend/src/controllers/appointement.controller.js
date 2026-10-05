import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Availability from "../models/availability.model.js";
import Appointment from "../models/appointement.model.js";
import { generateSlots } from "../services/slot.service.js";



const createAppointment = asyncHandler(async (req, res) => {
    const {doctorId,date,startTime,endTime} = req.body;

    if (!doctorId ||!date ||!startTime ||!endTime)
        {
        throw new ApiError(
            400,
            "Doctor, date, start time and end time are required"
        );
    }
        

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor not found"
        );
    }


    //  Validate date

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
        throw new ApiError(
            400,
            "Invalid date"
        );
    }


    //  Find day of week

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


    //  Find doctor's availability

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


    //  Check whether requested slot
    //    exists inside doctor's availability

    let validSlot = false;

    for (const schedule of availability) {

        const slots = generateSlots(
            schedule.startTime,
            schedule.endTime,
            30
        );

        const slotExists = slots.some((slot) => {
            return (
                slot.startTime === startTime &&
                slot.endTime === endTime
            );
        });

        if (slotExists) {
            validSlot = true;
            break;
        }
    }


    if (!validSlot) {
        throw new ApiError(
            400,
            "Selected slot is not available"
        );
    }


    //  Check double booking

    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        date,
        startTime,
        endTime,
        status: "booked"
    });

    if (existingAppointment) {
        throw new ApiError(
            400,
            "This slot is already booked"
        );
    }


    //  Create appointment

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

        // MongoDB duplicate key error

        if (error.code === 11000) {

            throw new ApiError(
                400,
                "This slot is already booked"
            );
        }

        throw error;
    }



    // 9. Return response

    return res.status(201).json(
        new ApiResponse(
            201,
            { appointment },
            "Appointment booked successfully"
        )
    );
});

const getMyAppointments = asyncHandler(async (req, res) => {

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

    return res.status(200).json(
        new ApiResponse(
            200,
            { appointments },
            "Appointments fetched successfully"
        )
    );
});


export {
    createAppointment,
    getMyAppointments
};