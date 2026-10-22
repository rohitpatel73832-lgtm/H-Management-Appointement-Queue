
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function StatusBadge({ status }) {
  const styles = {
    booked: "bg-[#edf5ff] text-[#477bb8] ring-[#dbeafe]",
    completed: "bg-[#e7f7ef] text-[#25865d] ring-[#d0f0df]",
    cancelled: "bg-[#fff0ef] text-[#bd5a56] ring-[#ffdcda]",
  };

  const dots = {
    booked: "bg-[#477bb8]",
    completed: "bg-[#25865d]",
    cancelled: "bg-[#bd5a56]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-700 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || "bg-gray-500"}`} />
      {status || "Unknown"}
    </span>
  );
}

function SummaryCard({ title, value, icon, accent, description }) {
  return (
    <div className="rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-[0_3px_14px_rgba(22,48,49,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(22,48,49,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#718889]">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#163031]">
            {value}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accent}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 border-t border-[#edf3f3] pt-3 text-xs text-[#8aa0a0]">
        {description}
      </p>
    </div>
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);

  const bookedCount = appointments.filter(
    (item) => item.status === "booked"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-[#f4fafa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header */}
        <header className="mb-8">
          <Link
            to="/admin-dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087f80] transition hover:text-[#065f60] focus:outline-none focus:ring-2 focus:ring-[#a4dbdc]"
          >
            <span aria-hidden="true">←</span>
            Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#21b6a8]" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#47999c]">
                  H-Manage / Administration
                </p>
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#163031] sm:text-4xl">
                Appointment Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718889] sm:text-base">
                Monitor bookings, review consultation details, and manage
                appointment status across your platform.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f80] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#d9eeee] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg" aria-hidden="true">↻</span>
              {loading ? "Refreshing..." : "Refresh Appointments"}
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total Appointments"
            value={pagination.totalAppointments}
            icon="▦"
            accent="bg-[#e3f7f6] text-[#168b88]"
            description="All appointment records"
          />

          <SummaryCard
            title="Booked on This Page"
            value={bookedCount}
            icon="◷"
            accent="bg-[#edf5ff] text-[#477bb8]"
            description="Appointments awaiting consultation"
          />

          <SummaryCard
            title="Completed on This Page"
            value={completedCount}
            icon="✓"
            accent="bg-[#e7f7ef] text-[#25865d]"
            description="Successfully completed visits"
          />
        </section>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold text-[#163031]">
                Unable to complete the request
              </p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              className="self-start rounded-xl bg-[#bd5a56] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a84945] sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-[#ccefe0] bg-white p-4 text-sm text-[#25865d] shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f7ef] font-bold">
              ✓
            </span>
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="font-bold text-[#163031]">Find appointments</h2>
            <p className="mt-1 text-sm text-[#718889]">
              Search by patient, doctor, email, or filter by status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="appointment-search"
                className="mb-2 block text-sm font-semibold text-[#345354]"
              >
                Search
              </label>

              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8aa6a6]"
                  aria-hidden="true"
                >
                  ⌕
                </span>

                <input
                  id="appointment-search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Patient, email, doctor, specialization..."
                  className="w-full rounded-xl border border-[#dceaea] bg-[#fbfefe] py-3 pl-11 pr-4 text-sm text-[#163031] outline-none transition placeholder:text-[#9aabab] focus:border-[#69b0b8] focus:ring-4 focus:ring-[#d9eeee]/70"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-sm font-semibold text-[#345354]"
              >
                Appointment status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-[#dceaea] bg-[#fbfefe] px-4 py-3 text-sm text-[#163031] outline-none transition focus:border-[#69b0b8] focus:ring-4 focus:ring-[#d9eeee]/70"
              >
                <option value="all">All statuses</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appointments table */}
        <section className="overflow-hidden rounded-2xl border border-[#e1eeee] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#eaf1f1] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#163031]">
                Appointment Records
              </h2>
              <p className="mt-1 text-sm text-[#718889]">
                Review patient and doctor consultation details.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e3f7f6] px-3 py-1.5 text-xs font-bold text-[#087f80]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#21b6a8]" />
              {filteredAppointments.length} shown
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d9eeee] border-t-[#168b88]" />
              <p className="mt-4 text-sm font-medium text-[#718889]">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f7f6] text-2xl">
                📅
              </div>
              <h3 className="mt-4 font-bold text-[#163031]">
                No appointments found
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-[#718889]">
                Try another search term or choose a different appointment status.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-[#f5fafa] text-xs uppercase tracking-wider text-[#718889]">
                    <tr>
                      <th className="px-5 py-4 font-bold">Patient</th>
                      <th className="px-5 py-4 font-bold">Doctor</th>
                      <th className="px-5 py-4 font-bold">Date & Time</th>
                      <th className="px-5 py-4 font-bold">Consultation Fee</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                      <th className="px-5 py-4 font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf3f3]">
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment._id}
                        className="transition-colors hover:bg-[#f8fcfc]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3f7f6] text-sm font-bold text-[#087f80]">
                              {(appointment.patient?.name || "P")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-[#163031]">
                                {appointment.patient?.name || "Unknown patient"}
                              </p>
                              <p className="mt-1 text-xs text-[#718889]">
                                {appointment.patient?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf7f7] text-sm font-bold text-[#438e91]">
                              {(appointment.doctor?.user?.name || "D")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-[#163031]">
                                {appointment.doctor?.user?.name || "Unknown doctor"}
                              </p>
                              <p className="mt-1 text-xs text-[#718889]">
                                {appointment.doctor?.specialization || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold text-[#163031]">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="mt-1 text-xs text-[#718889]">
                            {formatTime(appointment.startTime)} –{" "}
                            {formatTime(appointment.endTime)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#163031]">
                          {formatCurrency(
                            appointment.doctor?.consultationFee || 0
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge status={appointment.status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {appointment.status === "booked" ? (
                            <button
                              type="button"
                              onClick={() => cancelAppointment(appointment)}
                              disabled={cancellingId === appointment._id}
                              className="rounded-xl border border-[#f2d8d6] bg-white px-3.5 py-2.5 text-xs font-bold text-[#bd5a56] transition hover:bg-[#fff5f4] focus:outline-none focus:ring-4 focus:ring-[#ffe5e3] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {cancellingId === appointment._id
                                ? "Cancelling..."
                                : "Cancel booking"}
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-[#9aabab]">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col justify-between gap-4 border-t border-[#eaf1f1] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                <p className="text-sm text-[#718889]">
                  Page{" "}
                  <span className="font-bold text-[#163031]">
                    {pagination.currentPage || page}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#163031]">
                    {Math.max(pagination.totalPages, 1)}
                  </span>
                  <span className="mx-2 text-[#c2d6d6]">·</span>
                  {pagination.totalAppointments} total appointments
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1 || loading}
                    className="rounded-xl border border-[#dceaea] bg-white px-4 py-2.5 text-sm font-semibold text-[#345354] transition hover:bg-[#f4fafa] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= pagination.totalPages || loading}
                    className="rounded-xl bg-[#087f80] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#d9eeee] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="py-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-[#8aa0a0]">
            H-MANAGE · HEALTHCARE MANAGEMENT
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminAppointments;
