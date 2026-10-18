import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (search.trim()) params.search = search.trim();
      if (specialization) params.specialization = specialization;

      const response = await api.get("/doctors", { params });

      setDoctors(response.data?.data?.doctors ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load doctors. Please try again.",
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [search, specialization]);

  useEffect(() => {
  const timer = setTimeout(() => {
    fetchDoctors();
  }, 400);

  return () => clearTimeout(timer);
}, [fetchDoctors]);

  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ].sort();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Find the right care
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Find your doctor
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Discover qualified doctors and book an appointment that fits your
            schedule.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search */}
        <section className="-mt-14 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
          >
            <div>
              <label
                htmlFor="doctor-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Doctor's name
              </label>

              <input
                id="doctor-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by doctor name..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="specialization"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Specialization
              </label>

              <select
                id="specialization"
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All specializations</option>
                {specializations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {loading ? "Searching..." : "Search doctors"}
              </button>
            </div>
          </form>
        </section>

        {/* Results heading */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Available doctors
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a doctor to view their profile and appointment slots.
            </p>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-20 rounded-xl bg-slate-100" />
                <div className="mt-5 h-11 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h3 className="font-semibold text-red-800">
              Couldn't load doctors
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchDoctors}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Doctor cards */}
        {!loading && !error && doctors.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor._id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
                    {doctor.user?.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold text-slate-900">
                      {doctor.user?.name
                        ? doctor.user.name.toLowerCase().startsWith("dr.")
                          ? doctor.user.name
                          : `Dr. ${doctor.user.name}`
                        : "Doctor"}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {doctor.specialization || "General practitioner"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <span className="w-6 shrink-0 text-center">✦</span>
                    <span>
                      {doctor.qualification || "Qualification not provided"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 shrink-0 text-center">◷</span>
                    <span>{doctor.experience ?? 0} years of experience</span>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 shrink-0 text-center">⌖</span>
                    <span className="break-words">
                      {doctor.clinicAddress || "Clinic address not provided"}
                    </span>
                  </div>
                </div>

                {doctor.about && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                    {doctor.about}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-sm text-slate-500">
                      Consultation fee
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {doctor.consultationFee != null
                        ? `₹${doctor.consultationFee}`
                        : "Not listed"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/doctor/${doctor._id}`)}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    View profile & book
                    <span className="ml-2" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && doctors.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <div className="text-4xl">⌕</div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              No doctors found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try another name or clear the specialization filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSpecialization("");
              }}
              className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Doctors;
