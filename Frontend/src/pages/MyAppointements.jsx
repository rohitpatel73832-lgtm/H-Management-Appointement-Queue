import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyAppointments,
  cancelAppointment,
} from "../services/appointementApi";

import {
  createPaymentOrder,
  verifyPayment,
  requestRefund,
} from "../services/paymentApi";

import { generatePreConsultationSummary } from "../services/aiApi";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState(null);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [refundLoadingId, setRefundLoadingId] = useState(null);

  const [refundRequestedIds, setRefundRequestedIds] = useState([]);

  // AI consultation question generator
  const [symptoms, setSymptoms] = useState("");
  const [consultationQuestions, setConsultationQuestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // -----------------------------
  // FETCH APPOINTMENTS
  // -----------------------------
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyAppointments();
      const data = response?.data?.appointments;

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your appointments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // -----------------------------
  // AI CONSULTATION QUESTIONS
  // -----------------------------
  const handleGenerateSummary = async (event) => {
    event.preventDefault();

    const cleanedSymptoms = symptoms.trim();

    if (!cleanedSymptoms) {
      setAiError("Please describe your symptoms first.");
      return;
    }

    if (cleanedSymptoms.length > 2000) {
      setAiError("Symptoms cannot exceed 2000 characters.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setConsultationQuestions(null);

      const response = await generatePreConsultationSummary(cleanedSymptoms);

      // Expected API response:
      // { statusCode, data: { questionsForDoctor, disclaimer } }
      const result = response?.data;

      if (
        !result ||
        !Array.isArray(result.questionsForDoctor) ||
        result.questionsForDoctor.length < 3 ||
        result.questionsForDoctor.length > 5 ||
        !result.questionsForDoctor.every(
          (question) =>
            typeof question === "string" && question.trim().length > 0,
        )
      ) {
        throw new Error("The AI service returned an invalid response.");
      }

      setConsultationQuestions(result);
    } catch (err) {
      setAiError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate questions. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // -----------------------------
  // CANCEL APPOINTMENT
  // -----------------------------
  const handleCancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) return;

    try {
      setCancelLoadingId(appointmentId);
      setError("");

      await cancelAppointment(appointmentId);
      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel the appointment. Please try again.",
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  // -----------------------------
  // PAYMENT
  // -----------------------------
  const handlePayment = async (appointment) => {
    try {
      setProcessingId(appointment._id);
      setError("");

      const orderResponse = await createPaymentOrder(appointment._id);

      const orderData = orderResponse?.data?.data || orderResponse?.data;

      if (!orderData) {
        throw new Error("Unable to create the payment order.");
      }

      if (!window.Razorpay) {
        throw new Error(
          "Payment gateway is not available. Please refresh the page.",
        );
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "H-Manage",
        description: "Doctor Appointment Payment",
        order_id: orderData.razorpayOrderId,

        handler: async (paymentResponse) => {
          try {
            await verifyPayment({
              appointmentId: appointment._id,
              ...paymentResponse,
            });

            await fetchAppointments();
            window.alert("Payment successful!");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. If money was deducted, please contact support.",
            );
          } finally {
            setProcessingId(null);
          }
        },

        prefill: {
          name: appointment.patient?.name || "",
          email: appointment.patient?.email || "",
        },

        theme: {
          color: "#163031",
        },

        modal: {
          ondismiss: () => {
            setProcessingId(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );

        setProcessingId(null);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start the payment. Please try again.",
      );

      setProcessingId(null);
    }
  };

  // -----------------------------
  // REQUEST REFUND
  // -----------------------------
  const handleRefundRequest = async (appointmentId) => {
    const confirmed = window.confirm(
      "Do you want to request a refund for this appointment?",
    );

    if (!confirmed) return;

    try {
      setRefundLoadingId(appointmentId);
      setError("");

      await requestRefund(appointmentId);

      setRefundRequestedIds((previous) =>
        previous.includes(appointmentId)
          ? previous
          : [...previous, appointmentId],
      );

      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to request the refund. Please try again.",
      );
    } finally {
      setRefundLoadingId(null);
    }
  };

  // -----------------------------
  // HELPER FUNCTIONS
  // -----------------------------
  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
      case "success":
        return "bg-green-100 text-green-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getRefundStatus = (appointment) =>
    appointment.refundStatus || appointment.payment?.refundStatus || "";

  const isRefundRequested = (appointment) => {
    const refundStatus = getRefundStatus(appointment)?.toLowerCase();

    return (
      refundRequestedIds.includes(appointment._id) ||
      ["pending", "processed", "completed", "refunded"].includes(refundStatus)
    );
  };

  const getDoctorName = (appointment) =>
    appointment.doctor?.user?.name || appointment.doctor?.name || "Doctor";

  const getSpecialization = (appointment) =>
    appointment.doctor?.specialization ||
    appointment.doctor?.speciality ||
    "General Consultation";

  const getAppointmentDate = (appointment) =>
    appointment.appointmentDate ||
    appointment.date ||
    appointment.slot?.date ||
    appointment.slot?.startTime;

  const getPaymentStatus = (appointment) =>
    appointment.paymentStatus || appointment.payment?.status || "pending";

  const getAppointmentStatus = (appointment) => appointment.status || "pending";

  const canCancelAppointment = (appointment) => {
    const status = getAppointmentStatus(appointment).toLowerCase();

    return !["cancelled", "completed"].includes(status);
  };

  const canPay = (appointment) => {
    const status = getAppointmentStatus(appointment).toLowerCase();
    const paymentStatus = getPaymentStatus(appointment).toLowerCase();

    return (
      !["cancelled", "completed"].includes(status) &&
      !["paid", "completed", "success", "refunded"].includes(paymentStatus)
    );
  };

  const canRequestRefund = (appointment) => {
    const status = getAppointmentStatus(appointment).toLowerCase();
    const paymentStatus = getPaymentStatus(appointment).toLowerCase();

    return (
      status === "cancelled" &&
      ["paid", "completed", "success"].includes(paymentStatus) &&
      !isRefundRequested(appointment)
    );
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f7faf8]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dce8e3] border-t-[#163031]" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN PAGE
  // -----------------------------
  return (
    <div className="min-h-screen bg-[#f7faf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#63817b]">
              H-Manage
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#163031] sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Manage your appointments, payments, and consultation preparation.
            </p>
          </div>

          <Link
            to="/doctors"
            className="inline-flex items-center justify-center rounded-full bg-[#163031] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285253]"
          >
            Book an Appointment
          </Link>
        </div>

        {/* AI CONSULTATION QUESTION GENERATOR */}
        <section className="mb-8 rounded-3xl border border-[#dce8e3] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#63817b]">
              AI-powered assistance
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#163031] sm:text-2xl">
              Prepare questions for your doctor
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Describe the symptoms you are experiencing. AI will suggest
              questions you can ask your doctor during your consultation.
            </p>
          </div>

          <form onSubmit={handleGenerateSummary}>
            <label
              htmlFor="patient-symptoms"
              className="mb-2 block text-sm font-semibold text-[#163031]"
            >
              Describe your symptoms
            </label>

            <textarea
              id="patient-symptoms"
              value={symptoms}
              onChange={(event) => {
                setSymptoms(event.target.value);
                setAiError("");
              }}
              maxLength={2000}
              rows={5}
              placeholder="Describe your symptoms and when they started..."
              className="w-full resize-y rounded-2xl border border-[#dce8e3] bg-[#f8faf9] p-4 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#63817b] focus:ring-2 focus:ring-[#dce8e3]"
              required
            />

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                {symptoms.length}/2000 characters
              </p>

              <button
                type="submit"
                disabled={aiLoading || !symptoms.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#163031] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285253] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? "Generating questions..." : "Generate Questions"}
              </button>
            </div>
          </form>

          {aiError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {aiError}
            </p>
          )}

          {aiLoading && (
            <div
              className="mt-5 flex items-center gap-3 rounded-xl bg-[#f5f8f6] p-4"
              role="status"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dce8e3] border-t-[#163031]" />

              <p className="text-sm text-gray-600">
                Preparing questions for your consultation...
              </p>
            </div>
          )}

          {/* GENERATED QUESTIONS */}
          {consultationQuestions && (
            <div className="mt-6 rounded-2xl border border-[#dce8e3] bg-[#f5f8f6] p-5 sm:p-6">
              <h3 className="text-lg font-bold text-[#163031]">
                Questions you can ask your doctor
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Use these suggestions to prepare for your consultation. Choose
                the questions that are relevant to you.
              </p>

              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-gray-700">
                {consultationQuestions.questionsForDoctor.map(
                  (question, index) => (
                    <li key={`${index}-${question}`}>{question}</li>
                  ),
                )}
              </ol>

              <p className="mt-5 border-t border-[#dce8e3] pt-4 text-xs leading-5 text-gray-500">
                {consultationQuestions.disclaimer ||
                  "These questions help you prepare for your consultation. They are not a diagnosis or a substitute for medical advice."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setConsultationQuestions(null);
                  setAiError("");
                }}
                className="mt-4 rounded-full border border-[#dce8e3] px-4 py-2 text-sm font-semibold text-[#163031] transition hover:bg-white"
              >
                Clear Questions
              </button>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-gray-500">
            This tool helps you prepare questions for your doctor. It does not
            diagnose conditions or recommend medication. Avoid entering
            unnecessary personal identifying information.
          </p>
        </section>

        {/* GENERAL ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchAppointments}
              className="shrink-0 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* APPOINTMENT STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5ece8] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Appointments</p>

            <p className="mt-2 text-3xl font-bold text-[#163031]">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5ece8] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Upcoming</p>

            <p className="mt-2 text-3xl font-bold text-[#163031]">
              {
                appointments.filter((appointment) =>
                  ["pending", "confirmed"].includes(
                    getAppointmentStatus(appointment).toLowerCase(),
                  ),
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5ece8] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Completed</p>

            <p className="mt-2 text-3xl font-bold text-[#163031]">
              {
                appointments.filter(
                  (appointment) =>
                    getAppointmentStatus(appointment).toLowerCase() ===
                    "completed",
                ).length
              }
            </p>
          </div>
        </div>

        {/* APPOINTMENTS LIST HEADER */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#163031]">
            Your Appointments
          </h2>

          <button
            type="button"
            onClick={fetchAppointments}
            className="rounded-full border border-[#dce8e3] bg-white px-4 py-2 text-sm font-semibold text-[#163031] transition hover:bg-[#f0f5f2]"
          >
            Refresh
          </button>
        </div>

        {/* APPOINTMENTS LIST */}
        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cbdad3] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f5f2] text-2xl">
              +
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#163031]">
              No appointments yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Book an appointment with a doctor to get started.
            </p>

            <Link
              to="/doctors"
              className="mt-5 inline-flex rounded-full bg-[#163031] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285253]"
            >
              Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((appointment) => {
              const appointmentId = appointment._id;
              const appointmentStatus = getAppointmentStatus(appointment);
              const paymentStatus = getPaymentStatus(appointment);
              const refundStatus = getRefundStatus(appointment);

              return (
                <article
                  key={appointmentId}
                  className="rounded-3xl border border-[#e5ece8] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  {/* APPOINTMENT HEADER */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-[#163031]">
                        Dr. {getDoctorName(appointment)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {getSpecialization(appointment)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                          appointmentStatus,
                        )}`}
                      >
                        {appointmentStatus}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getPaymentStatusClass(
                          paymentStatus,
                        )}`}
                      >
                        Payment: {paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* APPOINTMENT DETAILS */}
                  <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-[#f8faf9] p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Appointment Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#163031]">
                        {formatDate(getAppointmentDate(appointment))}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">Time</p>

                      <p className="mt-1 text-sm font-semibold text-[#163031]">
                        {appointment.time ||
                          appointment.slot?.startTime ||
                          "To be confirmed"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Consultation Fee
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#163031]">
                        ₹
                        {appointment.amount ??
                          appointment.fee ??
                          appointment.doctor?.consultationFee ??
                          appointment.doctor?.fee ??
                          0}
                      </p>
                    </div>
                  </div>

                  {/* REFUND STATUS */}
                  {refundStatus && (
                    <p className="mt-4 text-sm text-gray-600">
                      Refund status:{" "}
                      <span className="font-semibold capitalize text-[#163031]">
                        {refundStatus}
                      </span>
                    </p>
                  )}

                  {/* APPOINTMENT ACTIONS */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {canPay(appointment) && (
                      <button
                        type="button"
                        onClick={() => handlePayment(appointment)}
                        disabled={processingId === appointmentId}
                        className="rounded-full bg-[#163031] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285253] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {processingId === appointmentId
                          ? "Processing..."
                          : "Pay Now"}
                      </button>
                    )}

                    {canCancelAppointment(appointment) && (
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appointmentId)}
                        disabled={cancelLoadingId === appointmentId}
                        className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancelLoadingId === appointmentId
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>
                    )}

                    {canRequestRefund(appointment) && (
                      <button
                        type="button"
                        onClick={() => handleRefundRequest(appointmentId)}
                        disabled={refundLoadingId === appointmentId}
                        className="rounded-full border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {refundLoadingId === appointmentId
                          ? "Requesting..."
                          : "Request Refund"}
                      </button>
                    )}

                    {isRefundRequested(appointment) && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800">
                        Refund Requested
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
