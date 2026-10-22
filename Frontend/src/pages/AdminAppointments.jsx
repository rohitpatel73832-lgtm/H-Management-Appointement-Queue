
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function StatusBadge({ status }) {
  const styles = {
    booked: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    totalAppointments: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/appointements", {
        params: {
          page,
          limit: 10,
        },
      });

      const data = response.data.data;

      setAppointments(data.appointments || []);
      setPagination(
        data.pagination || {
          totalAppointments: data.appointments?.length || 0,
          currentPage: page,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (appointment) => {
    if (appointment.status !== "booked") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel the appointment for ${
        appointment.patient?.name || "this patient"
      } with ${
        appointment.doctor?.user?.name || "this doctor"
      }?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(appointment._id);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/appointements/${appointment._id}/cancel`
      );

      setSuccess(
        response.data.message || "Appointment cancelled successfully."
      );

      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel the appointment."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = appointment.patient?.name || "";
    const patientEmail = appointment.patient?.email || "";
    const doctorName = appointment.doctor?.user?.name || "";
    const specialization = appointment.doctor?.specialization || "";

    const searchText = [
      patientName,
      patientEmail,
      doctorName,
      specialization,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              H-Manage Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Manage Appointments
            </h1>

            <p className="mt-2 text-gray-500">
              View appointments and manage their status.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin-dashboard"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              ← Dashboard
            </Link>

            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Appointments
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pagination.totalAppointments}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Booked on This Page
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {appointments.filter((item) => item.status === "booked").length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Completed on This Page
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                appointments.filter((item) => item.status === "completed")
                  .length
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              onClick={fetchAppointments}
              className="self-start rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="appointment-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search appointments on this page
            </label>

            <input
              id="appointment-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient, email, doctor, specialization..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <span className="text-4xl">📅</span>
              <h2 className="mt-3 text-lg font-semibold text-gray-800">
                No appointments found
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Patient</th>
                      <th className="px-5 py-4">Doctor</th>
                      <th className="px-5 py-4">Date & Time</th>
                      <th className="px-5 py-4">Consultation Fee</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {appointment.patient?.name || "Unknown patient"}
                          </p>
                          <p className="mt-1 text-gray-500">
                            {appointment.patient?.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {appointment.doctor?.user?.name || "Unknown doctor"}
                          </p>
                          <p className="mt-1 text-gray-500">
                            {appointment.doctor?.specialization || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="mt-1 text-gray-500">
                            {formatTime(appointment.startTime)} –{" "}
                            {formatTime(appointment.endTime)}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-700">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 2,
                          }).format(
                            appointment.doctor?.consultationFee || 0
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={appointment.status} />
                        </td>

                        <td className="px-5 py-4">
                          {appointment.status === "booked" ? (
                            <button
                              onClick={() => cancelAppointment(appointment)}
                              disabled={cancellingId === appointment._id}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {cancellingId === appointment._id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          ) : (
                            <span className="text-gray-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500">
                  Page {pagination.currentPage} of{" "}
                  {Math.max(pagination.totalPages, 1)} ·{" "}
                  {pagination.totalAppointments} total appointments
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1 || loading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= pagination.totalPages || loading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          H-Manage · Admin Control Panel
        </p>
      </div>
    </div>
  );
}

export default AdminAppointments;
