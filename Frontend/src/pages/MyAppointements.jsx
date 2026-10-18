
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAppointments } from "../services/appointementApi";
import {
    createPaymentOrder,
    verifyPayment
} from "../services/paymentApi";

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [payingId, setPayingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyAppointments();
            const appointmentList = response?.data?.appointments;

            if (!Array.isArray(appointmentList)) {
                throw new Error("Invalid appointments response from server.");
            }

            setAppointments(appointmentList);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch appointments."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handlePayment = async (appointment) => {
        setPaymentError("");
        setSuccessMessage("");

        if (!window.Razorpay) {
            setPaymentError(
                "Razorpay Checkout did not load. Please refresh and try again."
            );
            return;
        }

        if (appointment.status?.toLowerCase() !== "booked") {
            setPaymentError(
                "Only booked appointments can be paid for."
            );
            return;
        }

        try {
            setPayingId(appointment._id);

            const response = await createPaymentOrder(appointment._id);
            const paymentData = response?.data;

            if (
                !paymentData?.keyId ||
                !paymentData?.razorpayOrderId ||
                paymentData?.amount == null ||
                !paymentData?.currency
            ) {
                throw new Error(
                    "Invalid payment order response from server."
                );
            }

            const options = {
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "H-Manage",
                description: "Doctor Consultation",
                order_id: paymentData.razorpayOrderId,

                handler: async (razorpayResponse) => {
                    try {
                        const verification = await verifyPayment({
                            razorpay_order_id:
                                razorpayResponse.razorpay_order_id,
                            razorpay_payment_id:
                                razorpayResponse.razorpay_payment_id,
                            razorpay_signature:
                                razorpayResponse.razorpay_signature
                        });

                        // Backend returns payment status inside ApiResponse.data.
                        if (verification?.data?.status === "paid") {
                            setSuccessMessage(
                                "Payment verified successfully."
                            );
                            setPaymentError("");
                            await fetchAppointments();
                        } else {
                            setPaymentError(
                                "Payment verification was unsuccessful. Please check your appointment status."
                            );
                        }
                    } catch (err) {
                        setPaymentError(
                            err.response?.data?.message ||
                            "Payment verification failed. Please check your appointment status."
                        );
                    } finally {
                        setPayingId(null);
                    }
                },

                prefill: {
                    name: appointment.patient?.name || "",
                    email: appointment.patient?.email || ""
                },

                theme: {
                    color: "#2563eb"
                },

                modal: {
                    ondismiss: () => setPayingId(null)
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (event) => {
                setPaymentError(
                    event.error?.description ||
                    "Payment failed. Please try again."
                );
                setPayingId(null);
            });

            razorpay.open();
        } catch (err) {
            setPaymentError(
                err.response?.data?.message ||
                err.message ||
                "Could not start payment."
            );
            setPayingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const parsed = new Date(`${date}T00:00:00`);

        return Number.isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    };

    const statusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "booked":
                return "bg-blue-50 text-blue-700 ring-blue-200";

            case "confirmed":
            case "completed":
            case "paid":
                return "bg-green-50 text-green-700 ring-green-200";

            case "cancelled":
                return "bg-red-50 text-red-700 ring-red-200";

            default:
                return "bg-slate-100 text-slate-700 ring-slate-200";
        }
    };

    if (loading) {
        return (
            <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
                <div className="mx-auto max-w-5xl animate-pulse space-y-5">
                    <div className="h-9 w-64 rounded-lg bg-slate-200" />
                    <div className="h-44 rounded-2xl bg-white shadow-sm" />
                    <div className="h-44 rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                            Your healthcare
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            My appointments
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Review your bookings and manage consultation payments.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchAppointments}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                        Refresh appointments
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchAppointments}
                            className="mt-2 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {paymentError && (
                    <div
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {paymentError}
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        {successMessage}
                    </div>
                )}

                {!error && appointments.length === 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
                            <span aria-hidden="true">▦</span>
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            No appointments yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-slate-500">
                            Browse available doctors and book a consultation that suits your schedule.
                        </p>

                        <Link
                            to="/doctors"
                            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Find a doctor
                        </Link>
                    </section>
                )}

                <div className="space-y-5">
                    {appointments.map((appointment) => {
                        const doctor = appointment.doctor;
                        const isPaying = payingId === appointment._id;
                        const canPay =
                            appointment.status?.toLowerCase() === "booked";

                        const doctorName = doctor?.user?.name || "Doctor";
                        const displayDoctorName =
                            doctorName.toLowerCase().startsWith("dr.")
                                ? doctorName
                                : `Dr. ${doctorName}`;

                        return (
                            <article
                                key={appointment._id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="border-b border-slate-100 p-5 sm:p-6">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
                                                {doctorName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="break-words text-lg font-bold text-slate-900">
                                                    {displayDoctorName}
                                                </h2>

                                                <p className="mt-1 text-sm font-medium text-blue-700">
                                                    {doctor?.specialization ||
                                                        "Specialization unavailable"}
                                                </p>

                                                <p className="mt-2 break-all text-xs text-slate-400">
                                                    Booking ID: {appointment._id}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(appointment.status)}`}
                                        >
                                            {appointment.status || "Unknown"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Appointment date
                                        </p>

                                        <p className="mt-2 font-semibold text-slate-900">
                                            {formatDate(appointment.date)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Time slot
                                        </p>

                                        <p className="mt-2 font-semibold text-slate-900">
                                            {appointment.startTime || "--:--"} – {appointment.endTime || "--:--"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Consultation fee
                                        </p>

                                        <p className="mt-2 text-xl font-bold text-slate-900">
                                            {doctor?.consultationFee != null
                                                ? `₹${doctor.consultationFee}`
                                                : "Not listed"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                                    <p className="text-sm text-slate-500">
                                        Keep your booking details handy before your visit.
                                    </p>

                                    {canPay && (
                                        <button
                                            type="button"
                                            onClick={() => handlePayment(appointment)}
                                            disabled={payingId !== null}
                                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isPaying
                                                ? "Processing..."
                                                : `Pay ₹${doctor?.consultationFee ?? ""}`}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};

export default MyAppointments;
