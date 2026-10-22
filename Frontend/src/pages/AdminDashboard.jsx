import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function StatCard({ title, value, description, icon, color }) {
  return (
    <div className="group rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#a4dbdc] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#718889]">{title}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#163031]">
            {value ?? "—"}
          </h2>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${color}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 border-t border-[#edf3f3] pt-3">
        <p className="text-sm text-[#718889]">{description}</p>
      </div>
    </div>
  );
}

const managementLinks = [
  {
    title: "Manage Users",
    description: "View and manage all registered accounts.",
    to: "/admin-users",
    icon: "👥",
    label: "User management",
    color: "bg-[#e3f7f6] text-[#168b88]",
  },
  {
    title: "Manage Doctors",
    description: "Manage doctor profiles and account status.",
    to: "/admin-doctors",
    icon: "🩺",
    label: "Doctor management",
    color: "bg-[#eaf0ff] text-[#5475d1]",
  },
  {
    title: "Manage Appointments",
    description: "Review and manage platform bookings.",
    to: "/admin-appointments",
    icon: "📅",
    label: "Appointment management",
    color: "bg-[#fff2df] text-[#c58a35]",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#47999c]">
        {eyebrow}
      </p>

      <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#163031] sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1.5 text-sm leading-6 text-[#718889]">
        {description}
      </p>
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
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fafa] px-4">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#d9eeee] border-t-[#168b88]" />
          <p className="mt-4 text-sm font-medium text-[#718889]">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-[#f4fafa] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#163031]">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            onClick={fetchStats}
            className="mt-5 rounded-xl bg-[#087f80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#c9eeee]"
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
    <div className="min-h-screen bg-[#f4fafa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#21b6a8]" />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#47999c]">
                H-Manage / Administration
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#163031] sm:text-4xl">
              Welcome back, Admin <span aria-hidden="true">👋</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#718889] sm:text-base">
              Here's an overview of your healthcare platform today.
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#087f80] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#c9eeee] sm:self-auto"
          >
            <span className="text-lg" aria-hidden="true">↻</span>
            Refresh Statistics
          </button>
        </header>

        {/* Summary statistics */}
        <section className="mb-9">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.total}
              description="All registered accounts"
              icon="👥"
              color="bg-[#e3f7f6] text-[#168b88]"
            />

            <StatCard
              title="Patients"
              value={users.patients}
              description="Registered patient accounts"
              icon="🧑"
              color="bg-[#e7f7ef] text-[#36956c]"
            />

            <StatCard
              title="Doctors"
              value={users.doctors}
              description="Registered doctor accounts"
              icon="🩺"
              color="bg-[#eaf0ff] text-[#5475d1]"
            />

            <StatCard
              title="Appointments"
              value={appointments.total}
              description="Total platform appointments"
              icon="📅"
              color="bg-[#fff2df] text-[#c58a35]"
            />
          </div>
        </section>

        {/* Management tools */}
        <section className="mb-9">
          <SectionHeading
            eyebrow="Workspace"
            title="Quick access"
            description="Everything you need to manage your healthcare platform."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {managementLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className="group rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#a4dbdc] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#c9eeee]"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${item.color}`}
                  >
                    {item.icon}
                  </div>

                  <span className="text-xl text-[#8aa6a6] transition-transform group-hover:translate-x-1 group-hover:text-[#087f80]">
                    →
                  </span>
                </div>

                <h3 className="mt-5 font-bold text-[#163031]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#718889]">
                  {item.description}
                </p>

                <div className="mt-5 border-t border-[#edf3f3] pt-4">
                  <span className="text-sm font-semibold text-[#087f80]">
                    Open section
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* User overview */}
        <section className="mb-9">
          <SectionHeading
            eyebrow="Platform activity"
            title="User overview"
            description="Understand the accounts across your platform."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.total}
              description="All registered accounts"
              icon="👥"
              color="bg-[#e3f7f6] text-[#168b88]"
            />

            <StatCard
              title="Patients"
              value={users.patients}
              description="Patient accounts"
              icon="🧑"
              color="bg-[#e7f7ef] text-[#36956c]"
            />

            <StatCard
              title="Doctors"
              value={users.doctors}
              description="Doctor accounts"
              icon="🩺"
              color="bg-[#eaf0ff] text-[#5475d1]"
            />

            <StatCard
              title="Administrators"
              value={users.admins}
              description="Accounts with admin access"
              icon="🛡️"
              color="bg-[#fff2df] text-[#c58a35]"
            />
          </div>
        </section>

        {/* Appointment overview */}
        <section className="mb-9">
          <SectionHeading
            eyebrow="Scheduling"
            title="Appointment overview"
            description="Monitor bookings and consultation outcomes."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Appointments"
              value={appointments.total}
              description="All appointment records"
              icon="📅"
              color="bg-[#e3f7f6] text-[#168b88]"
            />

            <StatCard
              title="Booked"
              value={appointments.byStatus.booked}
              description="Currently booked appointments"
              icon="🗓️"
              color="bg-[#eaf0ff] text-[#5475d1]"
            />

            <StatCard
              title="Completed"
              value={appointments.byStatus.completed}
              description="Successfully completed visits"
              icon="✓"
              color="bg-[#e7f7ef] text-[#36956c]"
            />

            <StatCard
              title="Cancelled"
              value={appointments.byStatus.cancelled}
              description="Cancelled appointment records"
              icon="✕"
              color="bg-[#fff0ef] text-[#c16c68]"
            />
          </div>
        </section>

        {/* Payment overview */}
        <section className="mb-9">
          <SectionHeading
            eyebrow="Financial overview"
            title="Payment summary"
            description="Review recorded payments and revenue."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="Total Payments"
              value={payments.total}
              description={`${payments.paid} payments marked as paid`}
              icon="💳"
              color="bg-[#eaf0ff] text-[#5475d1]"
            />

            <StatCard
              title="Recorded Revenue"
              value={formatCurrency(stats.revenue)}
              description="Sum of payments marked as paid"
              icon="₹"
              color="bg-[#e7f7ef] text-[#36956c]"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#dceaea] py-6 text-center">
          <p className="text-sm font-bold tracking-[0.18em] text-[#087f80]">
            H-MANAGE
          </p>

          <p className="mt-2 text-xs text-[#8aa0a0]">
            Healthcare management made simpler.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;