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


    // Check whether appointment belongs
    // to logged-in patient

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


    if (!amount || amount <= 0) {

        throw new ApiError(
            400,
            "Invalid consultation fee"
        );

    }


    // Check whether payment already exists

    let payment = await Payment.findOne({
        appointment: appointment._id
    });



    // Don't create another payment
    // if appointment is already paid

    if (
        payment &&
        payment.status === "paid"
    ) {

        throw new ApiError(
            400,
            "Appointment is already paid"
        );

    }


    // Create Razorpay order

    const razorpayOrder =
        await razorpay.orders.create({

            // Razorpay expects amount in paise
            // ₹800 = 80000 paise

            amount: amount * 100,

            currency: "INR",

            receipt:
                `appointment_${appointment._id}`,

            notes: {

                appointmentId:
                    appointment._id.toString(),

                patientId:
                    req.userId.toString()

            }

        });



    // Create our Payment document

    if (!payment) {

        payment = await Payment.create({

            appointment:
                appointment._id,

            patient:
                appointment.patient,

            doctor:
                appointment.doctor,

            amount:
                amount,

            status:
                "pending",

            gatewayOrderId:
                razorpayOrder.id

        });

    } else {

        payment.amount =
            amount;

        payment.status =
            "pending";

        payment.gatewayOrderId =
            razorpayOrder.id;

        await payment.save();

    }


    // Send response

    return res.status(201).json(

        new ApiResponse(

            201,

            {

                paymentId:
                    payment._id,

                razorpayOrderId:
                    razorpayOrder.id,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,

                keyId:
                    process.env.RAZORPAY_KEY_ID

            },

            "Payment order created successfully"

        )

    );

});

const verifyPayment = asyncHandler(async(req,res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
    throw new ApiError(
        400,
        "Payment verification details are required"
    )
}

console.log(
        "Razorpay Order ID:",
        razorpay_order_id
    );

    console.log(
        "Razorpay Payment ID:",
        razorpay_payment_id
    );

    
    // Find our payment using the Razorpay order ID
    const payment = await Payment.findOne({
        gatewayOrderId: razorpay_order_id
    });

    if(!payment){
        throw new ApiError(
            404,
            "Payment record not found"
        );
    }

    // Check whether this payment belongs
    // to the logged-in patient
    if(payment.patient.toString()!==req.userId.toString()){
        throw new ApiError(
            403,
            "You are not authorized to verify this payment"
        );
    }

    // If already paid, don't process again
    if (payment.status === "paid") {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    paymentId: payment._id,
                    status: payment.status
                },
                "Payment is already verified"
            )
        );
    }

    // Create signature

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");


    console.log(
        "Generated Signature:",
        generatedSignature
    );


    console.log(
        "Received Signature:",
        razorpay_signature
    );

    if(generatedSignature!=razorpay_signature){
        throw new ApiError(
            400,
            "Invalid payment signature"
        );
    }

    // Signature is valid
    payment.status = "paid";
    payment.gatewayPaymentId = razorpay_payment_id;
    await payment.save();

    console.log(
        "Payment verified successfully:",
        payment._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                paymentId:payment._id,
                appointmentId:payment.appointment,
                razorpayOrderId:razorpay_order_id,
                razorpayPaymentId:razorpay_payment_id,
                status:payment.status
            },
            "Payment verified successfully"
            )

    );

});


export {
    testPayment,
    createPaymentOrder,
    verifyPayment
};