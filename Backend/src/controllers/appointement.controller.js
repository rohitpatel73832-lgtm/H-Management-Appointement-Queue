import mongoose from "mongoose";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import Availability from "../models/availability.model.js";
import Appointment from "../models/appointement.model.js";
import { generateSlots } from "../services/slot.service.js";
import Queue from "../models/queue.model.js";
import {
  getAppointmentCache,
  setAppointmentCache,
  patientAppointmentKey,
  clearAppointmentCaches,
} from "../services/appointementCache.service.js";

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
    "Saturday",
  ];

  const dayOfWeek = days[selectedDate.getDay()];

  const availability = await Availability.find({
    doctor: doctorId,
    dayOfWeek,
  });

  if (availability.length === 0) {
    throw new ApiError(400, "Doctor is not available on this day");
  }

  let validSlot = false;

  for (const schedule of availability) {
    const slots = generateSlots(schedule.startTime, schedule.endTime, 30);

    const slotExists = slots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

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
    status: "booked",
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
      status: "booked",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "This slot is already booked");
    }

    throw error;
  }

  const lastQueue = await Queue.findOne({
    doctor: doctorId,
    date,
  }).sort({
    tokenNumber: -1,
  });

  const nextToken = lastQueue ? lastQueue.tokenNumber + 1 : 1;

  let queue;

  try {
    queue = await Queue.create({
      appointment: appointment._id,
      doctor: doctorId,
      patient: req.userId,
      date,
      tokenNumber: nextToken,
      status: "waiting",
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
    doctorId: String(doctorId),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { appointment, queue },
        "Appointment booked successfully"
      )
    );
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const cacheKey = patientAppointmentKey(String(req.userId));

  // Check Redis
  const cachedAppointments = await getAppointmentCache(cacheKey);

  if (cachedAppointments !== null) {
    console.log("Patient appointment cache HIT");

    return res.status(200).json(cachedAppointments);
  }

  console.log("Patient appointment cache MISS");

  // Fetch from MongoDB
  const appointments = await Appointment.find({
    patient: req.userId,
  })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .sort({
      date: 1,
      startTime: 1,
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

const getDoctorAppointments = asyncHandler(async (req, res) => {
  // Find the doctor profile linked to the logged-in user
  const doctor = await Doctor.findOne({
    user: req.userId,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // Fetch appointments belonging only to this doctor
  const appointments = await Appointment.find({
    doctor: doctor._id,
  })
    .populate({
      path: "patient",
      select: "name email",
    })
    .sort({
      date: 1,
      startTime: 1,
    });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointments },
        "Doctor appointments fetched successfully"
      )
    );
});

const completeAppointment = asyncHandler(async (req, res) => {
  const { appointementId: appointmentId } = req.params;

  if (!appointmentId || !mongoose.isValidObjectId(appointmentId)) {
    throw new ApiError(400, "Valid appointment ID is required");
  }

  // Find the doctor profile of the logged-in user
  const doctor = await Doctor.findOne({
    user: req.userId,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const session = await mongoose.startSession();

  let completedAppointment;

  try {
    await session.withTransaction(async () => {
      // Find only an appointment belonging to this doctor
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctor: doctor._id,
      }).session(session);

      if (!appointment) {
        throw new ApiError(404, "Appointment not found for this doctor");
      }

      if (appointment.status !== "booked") {
        throw new ApiError(
          400,
          `Cannot complete an appointment with status "${appointment.status}"`
        );
      }

      // Find the queue entry linked to this appointment
      const queue = await Queue.findOne({
        appointment: appointment._id,
        doctor: doctor._id,
      }).session(session);

      if (!queue) {
        throw new ApiError(404, "Queue entry not found for this appointment");
      }

      if (queue.status !== "serving") {
        throw new ApiError(
          400,
          "The patient must be in serving status before completing the appointment"
        );
      }

      // Update both records within the same transaction
      appointment.status = "completed";
      queue.status = "completed";

      await appointment.save({ session });
      await queue.save({ session });

      completedAppointment = appointment;
    });
  } finally {
    await session.endSession();
  }

  // Clear cached appointment lists after the transaction succeeds
  await clearAppointmentCaches({
    patientId: String(completedAppointment.patient),
    doctorId: String(doctor._id),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointment: completedAppointment },
        "Appointment and queue marked as completed successfully"
      )
    );
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointementId: appointmentId } = req.params;

  if (!appointmentId || !mongoose.isValidObjectId(appointmentId)) {
    throw new ApiError(400, "Valid appointment ID is required");
  }

  const session = await mongoose.startSession();

  let cancelledAppointment;

  try {
    await session.withTransaction(async () => {
      // Find only an appointment belonging to this patient
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: req.userId,
      }).session(session);

      if (!appointment) {
        throw new ApiError(404, "Appointment not found for this patient");
      }

      // Only booked appointments can be cancelled
      if (appointment.status?.trim() !== "booked") {
        throw new ApiError(
          400,
          `Cannot cancel an appointment with status "${appointment.status}"`
        );
      }

      // Find the queue entry linked to this appointment
      const queue = await Queue.findOne({
        appointment: appointment._id,
      }).session(session);

      if (!queue) {
        throw new ApiError(404, "Queue entry not found for this appointment");
      }

      // Do not cancel a patient who is already being served
      //   if (queue.status !== "waiting") {
      //     throw new ApiError(
      //       400,
      //       "Only appointments with a waiting queue status can be cancelled"
      //     );
      //   }

      console.log("Appointment status:", JSON.stringify(appointment.status));
      console.log("Queue status:", JSON.stringify(queue.status));

      if (queue.status !== "waiting") {
        throw new ApiError(
          400,
          "Only appointments with a waiting queue status can be cancelled"
        );
      }

      // Update appointment and queue together
      appointment.status = "cancelled";
      queue.status = "cancelled";

      await appointment.save({ session });
      await queue.save({ session });

      cancelledAppointment = appointment;
    });
  } finally {
    await session.endSession();
  }

  // Clear cached appointment lists after successful cancellation
  await clearAppointmentCaches({
    patientId: String(cancelledAppointment.patient),
    doctorId: String(cancelledAppointment.doctor),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointment: cancelledAppointment },
        "Appointment cancelled successfully"
      )
    );
});

export {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  completeAppointment,
  cancelAppointment,
};
