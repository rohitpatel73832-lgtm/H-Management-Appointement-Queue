
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

            // Update the UI only after the server confirms success.
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

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin-dashboard"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Admin Dashboard
                    </Link>

                    <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                H-Manage Administration
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-gray-900">
                                Doctor Management
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Review doctor profiles and manage account status.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Total doctor profiles
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {pagination.totalDoctors}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <label
                        htmlFor="doctor-search"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Search doctors
                    </label>

                    <input
                        id="doctor-search"
                        type="text"
                        value={search}
                        onChange={(event) => handleSearch(event.target.value)}
                        placeholder="Search by specialization or qualification..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Notifications */}
                {notice && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        {notice}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={fetchDoctors}
                            className="mt-2 font-semibold underline"
                        >
                            Reload doctors
                        </button>
                    </div>
                )}

                {/* Doctor table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
                        <h2 className="font-semibold text-gray-900">
                            Registered Doctors
                        </h2>

                        <p className="text-sm text-gray-500">
                            Page {pagination.currentPage || page} of{" "}
                            {Math.max(pagination.totalPages, 1)}
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            Loading doctors...
                        </div>
                    ) : !error && doctors.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No doctors found. Try a different search.
                        </div>
                    ) : !error ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">
                                                Doctor
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Specialization
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Experience
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Consultation Fee
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Status
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {doctors.map((doctor) => {
                                            const isActive = doctor.isActive ?? true;
                                            const isUpdating =
                                                updatingId === doctor._id;

                                            return (
                                                <tr
                                                    key={doctor._id}
                                                    className="transition hover:bg-gray-50"
                                                >
                                                    <td className="min-w-64 px-5 py-4">
                                                        <div className="font-semibold text-gray-900">
                                                            {doctor.user?.name
                                                                ? `Dr. ${doctor.user.name}`
                                                                : "Doctor"}
                                                        </div>

                                                        <div className="mt-1 text-gray-500">
                                                            {doctor.user?.email || "No email"}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-400">
                                                            {doctor.qualification}
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {doctor.specialization}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {doctor.experience} years
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                                                        {new Intl.NumberFormat(
                                                            "en-IN",
                                                            {
                                                                style: "currency",
                                                                currency: "INR",
                                                                maximumFractionDigits: 0
                                                            }
                                                        ).format(doctor.consultationFee)}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                isActive
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() =>
                                                                toggleDoctorStatus(doctor)
                                                            }
                                                            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                                isActive
                                                                    ? "bg-red-600 hover:bg-red-700"
                                                                    : "bg-green-600 hover:bg-green-700"
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
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row">
                                <p className="text-sm text-gray-500">
                                    {pagination.totalDoctors} doctor profiles
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1 || loading}
                                        onClick={() =>
                                            setPage((current) => current - 1)
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
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
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default AdminDoctors;
