import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function StatCard({ title, value, description, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <span className="text-2xl">{icon}</span>
      </div>

      <h2 className="mt-3 text-3xl font-bold text-gray-900">{value}</h2>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/stats");

      setStats(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard statistics.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">{error}</p>

          <button
            onClick={fetchStats}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const users = stats.users;
  const appointments = stats.appointments;
  const payments = stats.payments;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              H-Manage Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Monitor users, appointments, payments and revenue.
            </p>

            {/* Manage Users button */}
            <Link
              to="/admin-users"
              className="mt-4 inline-flex items-center rounded-lg border m-2 border-blue-600 px-4 py-2 font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Manage Users →
            </Link>
            {/* Manage Doctors Button */}

            <Link
              to="/admin-doctors"
              className="mt-3 inline-flex items-center rounded-lg m-2 bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Manage Doctors →
            </Link>

            <Link
              to="/admin-appointments"
              className="mt-3 inline-flex items-center rounded-lg m-2 bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Manage Appointments →
            </Link>
          </div>

          <button
            onClick={fetchStats}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            ↻ Refresh Statistics
          </button>
        </div>

        {/* User statistics */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            User Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.total}
              description="All registered accounts"
              icon="👥"
            />

            <StatCard
              title="Patients"
              value={users.patients}
              description="Registered patients"
              icon="🧑"
            />

            <StatCard
              title="Doctors"
              value={users.doctors}
              description="Doctor accounts"
              icon="🩺"
            />

            <StatCard
              title="Administrators"
              value={users.admins}
              description="Admin accounts"
              icon="🛡️"
            />
          </div>
        </section>

        {/* Appointment statistics */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Appointment Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Appointments"
              value={appointments.total}
              description="All appointment records"
              icon="📅"
            />

            <StatCard
              title="Booked"
              value={appointments.byStatus.booked}
              description="Currently booked"
              icon="🟦"
            />

            <StatCard
              title="Completed"
              value={appointments.byStatus.completed}
              description="Successfully completed"
              icon="✅"
            />

            <StatCard
              title="Cancelled"
              value={appointments.byStatus.cancelled}
              description="Cancelled appointments"
              icon="❌"
            />
          </div>
        </section>

        {/* Payment statistics */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Payment Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StatCard
              title="Total Payments"
              value={payments.total}
              description={`${payments.paid} payments marked as paid`}
              icon="💳"
            />

            <StatCard
              title="Recorded Revenue"
              value={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              }).format(stats.revenue)}
              description="Sum of payments marked as paid"
              icon="₹"
            />
          </div>
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          H-Manage · Admin Control Panel
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
