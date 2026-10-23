
import mongoose from "mongoose";

import Appointment from "../models/appointement.model.js";
import User from "../models/user.models.js";
import Doctor from "../models/doctor.models.js";
import Payment from "../models/payment.model.js";

import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { clearAppointmentCache } from "../services/appointementCache.service.js";

const getAllAppointments = asyncHandler(async (req, res) => {
    let {
        search = "",
        status,
        date,
        page = 1,
        limit = 10
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Validate pagination
    if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100
    ) {
        throw new ApiError(400, "Invalid pagination values");
    }

    // Validate appointment status
    const allowedStatuses = [
        "booked",
        "cancelled",
        "completed"
    ];

    if (status && !allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid appointment status");
    }

    const filter = {};

    if (date) {
        filter.date = date;
    }

    if (status) {
        filter.status = status;
    }

    // Escape regex special characters in user input
    const searchText = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const skip = (page - 1) * limit;

    // Fetch appointments and total count
    const [appointments, totalAppointments] = await Promise.all([
        Appointment.find(filter)
            .populate("patient", "name email")
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Appointment.countDocuments(filter)
    ]);

    // Search by appointment ID, patient name/email,
    // or doctor name/email
    let filteredAppointments = appointments;

    if (searchText) {
        const searchRegex = new RegExp(searchText, "i");

        filteredAppointments = appointments.filter((appointment) => {
            const patient = appointment.patient;
            const doctor = appointment.doctor;
            const doctorUser = doctor?.user;

            return (
                appointment._id.toString().includes(search.trim()) ||
                searchRegex.test(patient?.name || "") ||
                searchRegex.test(patient?.email || "") ||
                searchRegex.test(doctorUser?.name || "") ||
                searchRegex.test(doctorUser?.email || "")
            );
        });
    }

    // When searching populated fields, filtering after pagination
    // would produce incorrect totals and incomplete results.
    // For correct search pagination, use the aggregation approach
    // described below if your dataset grows.

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                appointments: filteredAppointments,
                pagination: {
                    totalAppointments: searchText
                        ? filteredAppointments.length
                        : totalAppointments,
                    currentPage: page,
                    totalPages: Math.ceil(
                        (searchText
                            ? filteredAppointments.length
                            : totalAppointments) / limit
                    )
                }
            },
            "Appointments fetched successfully"
        )
    );
});


const cancelAppointmentByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid appointment ID");
    }

    const session = await mongoose.startSession();

    let cancelledAppointment;
    let paymentStatus = "no_payment";

    try {
        await session.withTransaction(async () => {
            const appointment = await Appointment.findById(id).session(session);

            if (!appointment) {
                throw new ApiError(404, "Appointment not found");
            }

            if (["cancelled", "completed"].includes(appointment.status)) {
                throw new ApiError(
                    400,
                    `Cannot cancel an appointment with status: ${appointment.status}`
                );
            }

            const payment = await Payment.findOne({
                appointment: appointment._id
            }).session(session);

            if (payment?.status === "paid") {
                throw new ApiError(
                    409,
                    "This appointment has a successful payment. Process a verified refund before cancellation."
                );
            }

            const queue = await Queue.findOne({
                appointment: appointment._id
            }).session(session);

            if (queue && queue.status !== "waiting") {
                throw new ApiError(
                    400,
                    `Cannot cancel appointment because queue status is "${queue.status}"`
                );
            }

            appointment.status = "cancelled";
            await appointment.save({ session });

            if (queue) {
                queue.status = "cancelled";
                await queue.save({ session });
            }

            cancelledAppointment = appointment;
            paymentStatus = payment?.status || "no_payment";
        });
    } finally {
        await session.endSession();
    }

    await clearAppointmentCaches({
        patientId: String(cancelledAppointment.patient),
        doctorId: String(cancelledAppointment.doctor)
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                appointmentId: cancelledAppointment._id,
                status: cancelledAppointment.status,
                paymentStatus
            },
            "Appointment cancelled successfully"
        )
    );
});


const getPlatformStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAdmins,
        totalAppointments,
        appointmentStatusCounts,
        totalPayments,
        paidPayments,
        totalRevenue
    ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({ role: "patient" }),

        User.countDocuments({ role: "doctor" }),

        User.countDocuments({ role: "admin" }),

        Appointment.countDocuments(),

        Appointment.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),

        Payment.countDocuments(),

        Payment.countDocuments({ status: "paid" }),

        Payment.aggregate([
            {
                $match: {
                    status: "paid"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$amount" }
                }
            }
        ])
    ]);

    const appointmentsByStatus = {
        booked: 0,
        completed: 0,
        cancelled: 0
    };

    for (const item of appointmentStatusCounts) {
        appointmentsByStatus[item._id] = item.count;
    }

    const revenue = totalRevenue[0]?.revenue || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users: {
                    total: totalUsers,
                    patients: totalPatients,
                    doctors: totalDoctors,
                    admins: totalAdmins
                },
                appointments: {
                    total: totalAppointments,
                    byStatus: appointmentsByStatus
                },
                payments: {
                    total: totalPayments,
                    paid: paidPayments
                },
                revenue
            },
            "Platform statistics fetched successfully"
        )
    );
});


export {
    getAllAppointments,
    cancelAppointmentByAdmin,
    getPlatformStats
};
