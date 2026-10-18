
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [completingId, setCompletingId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointements/doctor");
      const list = response.data?.data?.appointments;

      if (!Array.isArray(list)) {
        throw new Error("Unexpected appointments response.");
      }

      setAppointments(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleComplete = async (appointmentId) => {
    try {
      setCompletingId(appointmentId);
      setActionError("");
      setSuccessMessage("");

      // Your route parameter is named appointementId.
      await api.patch(
        `/appointements/${appointmentId}/complete`
      );

      setSuccessMessage("Appointment marked as completed.");

      // Fetch the latest appointment data from the backend.
      await loadAppointments();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete the appointment."
      );
    } finally {
      setCompletingId("");
    }
  };

  const bookedCount = appointments.filter(
    (appointment) => appointment.status === "booked"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  ).length;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status) => {
    switch (status) {
      case "booked":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Doctor Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Appointments
          </h1>

          <p className="mt-2 text-slate-600">
            Review patient bookings and update appointment status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* Loading error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadAppointments}
            className="mt-3 font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {actionError}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
        >
          {successMessage}
        </div>
      )}

      {!error && (
        <>
          {/* Summary cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Booked</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {bookedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {completedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Cancelled</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {cancelledCount}
              </p>
            </div>
          </div>

          {/* Appointment list */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              Appointment Schedule
            </h2>

            {appointments.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <h3 className="font-semibold text-slate-800">
                  No appointments yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Patient bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {appointment.patient?.name || "Patient"}
                        </h3>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          {appointment.patient?.email || "Email unavailable"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">
                          Appointment Date
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Appointment Time
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Complete appointment action */}
                    {appointment.status === "booked" && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          disabled={completingId === appointment._id}
                          onClick={() =>
                            handleComplete(appointment._id)
                          }
                          className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {completingId === appointment._id
                            ? "Completing..."
                            : "Mark as Completed"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate("/doctor-dashboard")}
        className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default DoctorAppointments;
