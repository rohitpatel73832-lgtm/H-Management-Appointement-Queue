
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        totalDoctors: 0,
        currentPage: 1,
        totalPages: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [notice, setNotice] = useState("");

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/doctors", {
                params: {
                    search: search.trim(),
                    page,
                    limit: 10
                }
            });

            const data = response.data.data;

            setDoctors(data.doctors || []);
            setPagination(data.pagination);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load doctors."
            );
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
        setNotice("");
    };

    const toggleDoctorStatus = async (doctor) => {
        const doctorId = doctor._id;
        const currentStatus = doctor.isActive ?? true;
        const nextStatus = !currentStatus;

        try {
            setUpdatingId(doctorId);
            setError("");
            setNotice("");

            await api.patch(`/admin/doctors/${doctorId}/status`, {
                isActive: nextStatus
            });

            // Update only after the server confirms success.
            setDoctors((currentDoctors) =>
                currentDoctors.map((item) =>
                    item._id === doctorId
                        ? { ...item, isActive: nextStatus }
                        : item
                )
            );

            setNotice(
                `${doctor.user?.name || "Doctor"} ${
                    nextStatus ? "activated" : "deactivated"
                } successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update doctor status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount ?? 0);

    const getInitials = (name = "") =>
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "DR";

    return (
        <div className="min-h-screen bg-[#f4fafa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <header className="mb-8">
                    <Link
                        to="/admin-dashboard"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#087f80] transition hover:text-[#065f60] focus:outline-none focus:ring-2 focus:ring-[#a4dbdc]"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Dashboard
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#21b6a8]" />
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#47999c]">
                                    H-Manage / Administration
                                </p>
                            </div>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#163031] sm:text-4xl">
                                Doctor Management
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718889] sm:text-base">
                                Manage doctor profiles, review qualifications,
                                and control account access.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-[#dceaea] bg-white px-5 py-3 shadow-sm">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e3f7f6] text-xl text-[#168b88]">
                                🩺
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#718889]">
                                    Doctor profiles
                                </p>
                                <p className="text-2xl font-bold text-[#163031]">
                                    {pagination.totalDoctors}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Search */}
                <section className="mb-6 rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-bold text-[#163031]">
                        Find a doctor
                    </h2>
                    <p className="mt-1 text-sm text-[#718889]">
                        Search doctor profiles by specialization or qualification.
                    </p>

                    <div className="relative mt-4">
                        <span
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8aa6a6]"
                            aria-hidden="true"
                        >
                            ⌕
                        </span>

                        <input
                            id="doctor-search"
                            type="text"
                            value={search}
                            onChange={(event) => handleSearch(event.target.value)}
                            placeholder="Search by specialization or qualification..."
                            aria-label="Search doctors"
                            className="w-full rounded-xl border border-[#dceaea] bg-[#fbfefe] py-3 pl-11 pr-4 text-sm text-[#163031] outline-none transition placeholder:text-[#9aabab] focus:border-[#69b0b8] focus:ring-4 focus:ring-[#d9eeee]/70"
                        />
                    </div>
                </section>

                {/* Success notification */}
                {notice && (
                    <div
                        role="status"
                        className="mb-5 flex items-center gap-3 rounded-2xl border border-[#ccefe0] bg-white p-4 text-sm text-[#25865d] shadow-sm"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f7ef] font-bold">
                            ✓
                        </span>
                        <p className="font-medium">{notice}</p>
                    </div>
                )}

                {/* Error notification */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                    >
                        <p className="font-semibold text-[#163031]">
                            Something went wrong
                        </p>
                        <p className="mt-1 text-sm text-red-600">{error}</p>

                        <button
                            type="button"
                            onClick={fetchDoctors}
                            className="mt-3 rounded-lg bg-[#087f80] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#06696a]"
                        >
                            Reload doctors
                        </button>
                    </div>
                )}

                {/* Doctors table */}
                <section className="overflow-hidden rounded-2xl border border-[#e1eeee] bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-[#eaf1f1] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#163031]">
                                Registered Doctors
                            </h2>
                            <p className="mt-1 text-sm text-[#718889]">
                                Doctor directory and account status
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e3f7f6] px-3 py-1.5 text-xs font-bold text-[#087f80]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#21b6a8]" />
                            Page {pagination.currentPage || page} of{" "}
                            {Math.max(pagination.totalPages, 1)}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d9eeee] border-t-[#168b88]" />
                            <p className="mt-4 text-sm font-medium text-[#718889]">
                                Loading doctor profiles...
                            </p>
                        </div>
                    ) : !error && doctors.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f7f6] text-2xl">
                                🩺
                            </div>
                            <h3 className="mt-4 font-bold text-[#163031]">
                                No doctors found
                            </h3>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-[#718889]">
                                Try searching for another specialization or qualification.
                            </p>
                        </div>
                    ) : !error ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left text-sm">
                                    <thead className="bg-[#f5fafa] text-xs uppercase tracking-wider text-[#718889]">
                                        <tr>
                                            <th className="px-5 py-4 font-bold">
                                                Doctor
                                            </th>
                                            <th className="px-5 py-4 font-bold">
                                                Specialization
                                            </th>
                                            <th className="px-5 py-4 font-bold">
                                                Experience
                                            </th>
                                            <th className="px-5 py-4 font-bold">
                                                Consultation fee
                                            </th>
                                            <th className="px-5 py-4 font-bold">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 font-bold">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#edf3f3]">
                                        {doctors.map((doctor) => {
                                            const isActive = doctor.isActive ?? true;
                                            const isUpdating = updatingId === doctor._id;

                                            return (
                                                <tr
                                                    key={doctor._id}
                                                    className="transition-colors hover:bg-[#f8fcfc]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dceeee] bg-[#e3f7f6] text-sm font-bold text-[#087f80]">
                                                                {getInitials(doctor.user?.name)}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-[#163031]">
                                                                    {doctor.user?.name
                                                                        ? `Dr. ${doctor.user.name}`
                                                                        : "Doctor"}
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#718889]">
                                                                    {doctor.user?.email || "No email"}
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#9aabab]">
                                                                    {doctor.qualification || "Qualification not provided"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-lg bg-[#f0f7f7] px-3 py-1.5 font-medium text-[#345354]">
                                                            {doctor.specialization || "—"}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-[#526e6f]">
                                                        <span className="font-semibold text-[#163031]">
                                                            {doctor.experience ?? "—"}
                                                        </span>{" "}
                                                        years
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#163031]">
                                                        {formatCurrency(doctor.consultationFee)}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                                                                isActive
                                                                    ? "bg-[#e7f7ef] text-[#25865d] ring-[#d0f0df]"
                                                                    : "bg-[#fff0ef] text-[#bd5a56] ring-[#ffdcda]"
                                                            }`}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() => toggleDoctorStatus(doctor)}
                                                            className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                                isActive
                                                                    ? "border border-[#f2d8d6] bg-white text-[#bd5a56] hover:bg-[#fff5f4] focus:ring-[#ffe5e3]"
                                                                    : "bg-[#087f80] text-white hover:bg-[#06696a] focus:ring-[#d9eeee]"
                                                            }`}
                                                        >
                                                            {isUpdating
                                                                ? "Updating..."
                                                                : isActive
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eaf1f1] px-5 py-5 sm:flex-row sm:px-6">
                                <p className="text-sm text-[#718889]">
                                    <span className="font-bold text-[#163031]">
                                        {pagination.totalDoctors}
                                    </span>{" "}
                                    doctor profiles
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1 || loading}
                                        onClick={() =>
                                            setPage((current) => current - 1)
                                        }
                                        className="rounded-xl border border-[#dceaea] bg-white px-4 py-2.5 text-sm font-semibold text-[#345354] transition hover:bg-[#f4fafa] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ← Previous
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            page >= pagination.totalPages ||
                                            loading
                                        }
                                        onClick={() =>
                                            setPage((current) => current + 1)
                                        }
                                        className="rounded-xl bg-[#087f80] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#d9eeee] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </section>

                {/* Footer */}
                <footer className="py-6 text-center">
                    <p className="text-xs font-semibold tracking-wide text-[#8aa0a0]">
                        H-MANAGE · HEALTHCARE MANAGEMENT
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default AdminDoctors;
