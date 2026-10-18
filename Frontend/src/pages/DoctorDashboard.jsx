
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/me");
        const currentUser = response.data?.data?.user;

        if (!currentUser) {
          throw new Error("Unable to fetch your account details.");
        }

        if (currentUser.role !== "doctor") {
          if (currentUser.role === "patient") {
            navigate("/dashboard", { replace: true });
          } else if (currentUser.role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }

          return;
        }

        setUser(currentUser);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your dashboard. Please try logging in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [navigate]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading doctor dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">{error}</p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-8 text-white shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
          Doctor Portal
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Welcome, {user.name}
        </h1>

        <p className="mt-3 max-w-xl text-blue-100">
          Manage your availability and appointments from your H-Manage
          dashboard.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Availability card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            My Availability
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage the days and time slots when patients can book appointments.
          </p>

          <button
            type="button"
            onClick={() => navigate("/doctor-availability")}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Manage Availability
          </button>
        </div>

        {/* Appointments card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            My Appointments
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            View your scheduled appointments, patient details, dates, times,
            and booking statuses.
          </p>

          <button
            type="button"
            onClick={() => navigate("/doctor-appointments")}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            View Appointments
          </button>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            My Profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review your account details and doctor profile.
          </p>

          <p className="mt-4 break-words text-sm font-medium text-blue-600">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
