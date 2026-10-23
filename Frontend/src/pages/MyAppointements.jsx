import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAppointments } from "../services/appointementApi";
import {
  createPaymentOrder,
  verifyPayment,
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
      setPaymentError("Only booked appointments can be paid for.");
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
        throw new Error("Invalid payment order response from server.");
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
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            if (verification?.data?.status === "paid") {
              setSuccessMessage("Payment verified successfully.");
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
          email: appointment.patient?.email || "",
        },

        theme: {
          color: "#163031",
        },

        modal: {
          ondismiss: () => setPayingId(null),
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (event) => {
        setPaymentError(
          event.error?.description || "Payment failed. Please try again."
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
          year: "numeric",
        });
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-[#e5f4f4] text-[#438e91] ring-[#c7e5e3]";

      case "confirmed":
      case "completed":
      case "paid":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "cancelled":
        return "bg-red-50 text-red-700 ring-red-200";

      default:
        return "bg-slate-100 text-slate-600 ring-slate-200";
    }
  };

  const bookedCount = appointments.filter(
    (appointment) => appointment.status?.toLowerCase() === "booked"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status?.toLowerCase() === "completed"
  ).length;

  const paidCount = appointments.filter(
    (appointment) => appointment.status?.toLowerCase() === "paid"
  ).length;

  if (loading) {
    return (
      <main className="min-h-[75vh] bg-[#f4f9f8] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-56 rounded-[2rem] bg-[#dcebea]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
          <div className="h-52 rounded-3xl bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f9f8] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Hero header */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#163031] p-6 text-white shadow-xl shadow-[#163031]/10 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-3 -top-10 h-52 w-52 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#438e91]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#a4dbdc]">
                <span className="h-2 w-2 rounded-full bg-[#a4dbdc]" />
                Patient portal
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                My appointments
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#c2d6d5] sm:text-base">
                Your consultations, booking details, and payments — organized
                in one place for a smoother healthcare experience.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <span aria-hidden="true">↻</span>
              Refresh appointments
            </button>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm text-[#c2d6d5]">
            <span className="flex items-center gap-2">
              <span className="text-[#a4dbdc]">✓</span>
              Manage your bookings
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#a4dbdc]">✓</span>
              Secure payment checkout
            </span>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total appointments",
              value: appointments.length,
              icon: "▦",
              bg: "bg-[#e5f4f4]",
              color: "text-[#438e91]",
              description: "All your bookings",
            },
            {
              label: "Awaiting consultation",
              value: bookedCount,
              icon: "◷",
              bg: "bg-[#fff2e4]",
              color: "text-[#bd7b35]",
              description: "Currently booked",
            },
            {
              label: "Completed",
              value: completedCount + paidCount,
              icon: "✓",
              bg: "bg-[#e5f4ea]",
              color: "text-[#39855a]",
              description: "Completed or paid status",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#718889]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#163031]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-[#8ba2a2]">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.bg} ${item.color}`}
                >
                  {item.icon}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Error and feedback messages */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            <p className="font-semibold">Unable to load appointments</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={fetchAppointments}
              className="mt-3 font-bold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {paymentError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="text-lg" aria-hidden="true">
              !
            </span>
            <div>
              <p className="font-bold">Payment needs attention</p>
              <p className="mt-1 leading-6">{paymentError}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="text-lg" aria-hidden="true">
              ✓
            </span>
            <div>
              <p className="font-bold">Payment successful</p>
              <p className="mt-1 leading-6">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!error && appointments.length === 0 && (
          <section className="mt-6 rounded-[2rem] border border-[#e1eeee] bg-white px-6 py-16 text-center shadow-sm sm:py-20">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e5f4f4] text-4xl text-[#438e91]">
              ▦
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-[#163031]">
              Your healthcare journey starts here
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#718889]">
              You haven't booked any appointments yet. Find a doctor and
              choose a time that works for you.
            </p>

            <Link
              to="/doctors"
              className="mt-7 inline-flex items-center rounded-full bg-[#163031] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#285253]"
            >
              Find a doctor <span className="ml-2">→</span>
            </Link>
          </section>
        )}

        {/* Appointment list */}
        {appointments.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#438e91]">
                  Your bookings
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#163031]">
                  Appointment history
                </h2>
              </div>

              <p className="text-sm text-[#718889]">
                {appointments.length}{" "}
                {appointments.length === 1 ? "appointment" : "appointments"}
              </p>
            </div>

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
                    className="overflow-hidden rounded-3xl border border-[#e1eeee] bg-white shadow-sm transition duration-300 hover:shadow-lg hover:shadow-[#163031]/5"
                  >
                    {/* Doctor header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-[#edf2f2] p-5 sm:flex-row sm:items-start sm:p-6">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e5f4f4] text-2xl font-extrabold text-[#438e91]">
                          {doctorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8ba2a2]">
                            Consultation with
                          </p>

                          <h3 className="mt-2 break-words text-lg font-extrabold text-[#163031] sm:text-xl">
                            {displayDoctorName}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-[#438e91]">
                            {doctor?.specialization ||
                              "Specialization unavailable"}
                          </p>

                          <p className="mt-2 break-all text-xs text-[#8ba2a2]">
                            Booking ID: {appointment._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${statusStyle(
                          appointment.status
                        )}`}
                      >
                        <span className="mr-1.5">●</span>
                        {appointment.status || "Unknown"}
                      </span>
                    </div>

                    {/* Appointment details */}
                    <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                      <div className="rounded-2xl border border-[#e8f0ef] bg-[#f7fafa] p-4">
                        <div className="flex items-center gap-2 text-[#438e91]">
                          <span aria-hidden="true">▦</span>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#718889]">
                            Appointment date
                          </p>
                        </div>
                        <p className="mt-3 font-extrabold text-[#163031]">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e8f0ef] bg-[#f7fafa] p-4">
                        <div className="flex items-center gap-2 text-[#438e91]">
                          <span aria-hidden="true">◷</span>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#718889]">
                            Time slot
                          </p>
                        </div>
                        <p className="mt-3 font-extrabold text-[#163031]">
                          {appointment.startTime || "--:--"} –{" "}
                          {appointment.endTime || "--:--"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e8f0ef] bg-[#f7fafa] p-4">
                        <div className="flex items-center gap-2 text-[#438e91]">
                          <span aria-hidden="true">₹</span>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#718889]">
                            Consultation fee
                          </p>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-[#163031]">
                          {doctor?.consultationFee != null
                            ? `₹${doctor.consultationFee}`
                            : "Not listed"}
                        </p>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex flex-col justify-between gap-4 border-t border-[#edf2f2] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                      <div>
                        <p className="text-sm font-semibold text-[#365354]">
                          {canPay
                            ? "Complete your consultation payment"
                            : "Your booking details are available above"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#8ba2a2]">
                          {canPay
                            ? "Continue to secure checkout when you're ready."
                            : "Refer to your appointment status for the latest information."}
                        </p>
                      </div>

                      {canPay && (
                        <button
                          type="button"
                          onClick={() => handlePayment(appointment)}
                          disabled={payingId !== null}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#163031] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#163031]/10 transition hover:-translate-y-0.5 hover:bg-[#285253] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {isPaying ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Processing payment...
                            </>
                          ) : (
                            <>
                              Pay{" "}
                              {doctor?.consultationFee != null
                                ? `₹${doctor.consultationFee}`
                                : "now"}
                              <span>→</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom help panel */}
        <section className="mt-8 flex flex-col justify-between gap-4 rounded-3xl border border-[#dcebea] bg-[#eaf5f4] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-[#438e91]">
              ?
            </div>
            <div>
              <h3 className="font-extrabold text-[#163031]">
                Need to book another consultation?
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#718889]">
                Explore available doctors and find a suitable appointment.
              </p>
            </div>
          </div>

          <Link
            to="/doctors"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#c5dfdd] bg-white px-5 py-3 text-sm font-bold text-[#438e91] transition hover:bg-[#f7fbfb]"
          >
            Browse doctors <span className="ml-2">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
};

export default MyAppointments;