import mongoose from "mongoose";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import Appointment from "../models/appointement.model.js";
import { ApiError } from "../utils/ApiError.js";
import Doctor from "../models/doctor.models.js";
import razorpay from "../services/payment.service.js";
import crypto from "crypto";

const testPayment = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Payment system is working"
        )
    );
});

const createPaymentOrder = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;

    // Check appointment ID
    if (!appointmentId) {
        throw new ApiError(
            400,
            "Appointment ID is required"
        );
    }

    if (!/^[a-fA-F0-9]{24}$/.test(appointmentId)) {
        throw new ApiError(
            400,
            "Invalid appointment ID"
        );
    }

    // Find appointment
    const appointment = await Appointment.findById(
        appointmentId
    );

    if (!appointment) {
        throw new ApiError(
            404,
            "Appointment not found"
        );
    }

    // Check whether appointment belongs to logged-in patient
    if (
        appointment.patient.toString() !==
        req.userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to pay for this appointment"
        );
    }

    // Appointment must be booked
    if (appointment.status !== "booked") {
        throw new ApiError(
            400,
            "Appointment cannot be paid for"
        );
    }

    // Find doctor
    const doctor = await Doctor.findById(
        appointment.doctor
    );

    if (!doctor) {
        throw new ApiError(
            404,
            "Doctor not found"
        );
    }

    // Get consultation fee
    const amount = doctor.consultationFee;

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new ApiError(
            400,
            "Invalid consultation fee"
        );
    }

    // Check whether payment already exists
    let payment = await Payment.findOne({
        appointment: appointment._id
    });

    // Don't create another payment if appointment is already paid
    if (payment && payment.status === "paid") {
        throw new ApiError(
            400,
            "Appointment is already paid"
        );
    }

    // Reuse an existing pending order when possible
    if (
        payment &&
        payment.status === "pending" &&
        payment.gatewayOrderId
    ) {
        try {
            const existingOrder = await razorpay.orders.fetch(
                payment.gatewayOrderId
            );

            if (
                existingOrder.status === "created" &&
                existingOrder.amount === Math.round(amount * 100) &&
                existingOrder.currency === "INR"
            ) {
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            paymentId: payment._id,
                            razorpayOrderId: existingOrder.id,
                            amount: existingOrder.amount,
                            currency: existingOrder.currency,
                            keyId: process.env.RAZORPAY_KEY_ID
                        },
                        "Existing payment order reused"
                    )
                );
            }
        } catch (error) {
            // If the old order cannot be fetched, create a new one below.
            // Production systems should log this failure without exposing secrets.
        }
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `appointment_${appointment._id}`,
        notes: {
            appointmentId: appointment._id.toString(),
            patientId: req.userId.toString()
        }
    });

    // Create or update our Payment document
    if (!payment) {
        payment = await Payment.create({
            appointment: appointment._id,
            patient: appointment.patient,
            doctor: appointment.doctor,
            amount: amount,
            status: "pending",
            gatewayOrderId: razorpayOrder.id
        });
    } else {
        payment.amount = amount;
        payment.status = "pending";
        payment.gatewayOrderId = razorpayOrder.id;

        await payment.save();
    }

    // Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                paymentId: payment._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            },
            "Payment order created successfully"
        )
    );
});

const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {
        throw new ApiError(
            400,
            "Payment verification details are required"
        );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(
            500,
            "Payment verification is not configured"
        );
    }

    // Find our payment record
    const payment = await Payment.findOne({
        gatewayOrderId: razorpay_order_id
    });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment record not found"
        );
    }

    // Verify patient ownership
    if (
        payment.patient.toString() !==
        req.userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to verify this payment"
        );
    }

    // Repeated verification of the same payment is safe
    if (payment.status === "paid") {
        if (
            payment.gatewayPaymentId !== razorpay_payment_id
        ) {
            throw new ApiError(
                409,
                "This payment order has already been paid"
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    paymentId: payment._id,
                    appointmentId: payment.appointment,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: payment.gatewayPaymentId,
                    status: payment.status
                },
                "Payment is already verified"
            )
        );
    }

    // Check appointment
    const appointment = await Appointment.findById(
        payment.appointment
    );

    if (!appointment) {
        throw new ApiError(
            404,
            "Appointment not found"
        );
    }

    if (
        appointment.patient.toString() !==
        req.userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to verify this appointment"
        );
    }

    if (appointment.status !== "booked") {
        throw new ApiError(
            400,
            "Appointment is not eligible for payment verification"
        );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest();

    // Validate hex signature before comparing
    if (
        typeof razorpay_signature !== "string" ||
        !/^[a-fA-F0-9]{64}$/.test(razorpay_signature)
    ) {
        throw new ApiError(
            400,
            "Invalid payment signature"
        );
    }

    const receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
    );

    if (
        !crypto.timingSafeEqual(
            generatedSignature,
            receivedSignature
        )
    ) {
        throw new ApiError(
            400,
            "Invalid payment signature"
        );
    }

    // Fetch payment directly from Razorpay
    let gatewayPayment;

    try {
        gatewayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );
    } catch (error) {
        throw new ApiError(
            502,
            "Unable to verify payment with Razorpay"
        );
    }

    // Confirm payment belongs to the expected Razorpay order
    if (
        gatewayPayment.order_id !== razorpay_order_id
    ) {
        throw new ApiError(
            400,
            "Payment does not belong to this order"
        );
    }

    // Verify amount and currency
    if (
        gatewayPayment.amount !== Math.round(payment.amount * 100) ||
        gatewayPayment.currency !== "INR"
    ) {
        throw new ApiError(
            400,
            "Payment amount or currency does not match"
        );
    }

    // Only captured payments count as successful
    if (
        gatewayPayment.status !== "captured" ||
        gatewayPayment.captured !== true
    ) {
        throw new ApiError(
            400,
            "Payment has not been captured successfully"
        );
    }

    // Save verified payment details
    payment.status = "paid";
    payment.gatewayPaymentId = razorpay_payment_id;

    await payment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                paymentId: payment._id,
                appointmentId: payment.appointment,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: payment.status
            },
            "Payment verified successfully"
        )
    );
});


const requestRefund = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;

    if (!appointmentId || !mongoose.isValidObjectId(appointmentId)) {
        throw new ApiError(400, "Valid appointment ID is required");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(500, "Refund service is not configured");
    }

    // Find the patient's appointment
    const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: req.userId,
    });

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Refunds are allowed only after cancellation
    if (appointment.status !== "cancelled") {
        throw new ApiError(
            400,
            "Cancel the appointment before requesting a refund"
        );
    }

    const payment = await Payment.findOne({
        appointment: appointment._id,
        patient: req.userId,
    });

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.status === "refunded" ||
        payment.refundStatus === "processed") {
        throw new ApiError(409, "This payment has already been refunded");
    }

    if (payment.refundStatus === "pending") {
        throw new ApiError(
            409,
            "A refund is already being processed"
        );
    }

    if (payment.status !== "paid" || !payment.gatewayPaymentId) {
        throw new ApiError(
            400,
            "Only successfully paid appointments can be refunded"
        );
    }

    // Reserve the refund request before calling Razorpay to reduce
    // the chance of duplicate refund requests.
    payment.refundStatus = "pending";
    payment.refundAmount = payment.amount;
    payment.refundRequestedAt = new Date();
    await payment.save();

    let gatewayRefund;

    try {
        // Payment.amount is in rupees; Razorpay expects paise.
        gatewayRefund = await razorpay.payments.refund(
            payment.gatewayPaymentId,
            {
                amount: Math.round(payment.amount * 100),
                notes: {
                    appointmentId: appointment._id.toString(),
                    patientId: req.userId.toString(),
                },
            }
        );
    } catch (error) {
        // The request may have reached Razorpay even if the response
        // was lost. Keep it pending for reconciliation rather than
        // automatically issuing another refund.
        console.error(
            "Razorpay refund request failed or is uncertain:",
            error.message
        );

        throw new ApiError(
            502,
            "Refund result is uncertain. Check Razorpay before retrying."
        );
    }

    payment.refundId = gatewayRefund.id || null;

    if (gatewayRefund.status === "processed") {
        payment.refundStatus = "processed";
        payment.status = "refunded";
    } else if (gatewayRefund.status === "failed") {
        payment.refundStatus = "failed";
    } else {
        payment.refundStatus = "pending";
    }

    await payment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                appointmentId: appointment._id,
                paymentId: payment._id,
                refundId: payment.refundId,
                refundAmount: payment.refundAmount,
                refundStatus: payment.refundStatus,
                paymentStatus: payment.status,
            },
            payment.refundStatus === "processed"
                ? "Refund processed successfully"
                : "Refund request submitted; check its status for the final result"
        )
    );
});


export {
    testPayment,
    createPaymentOrder,
    verifyPayment,
    requestRefund,
};