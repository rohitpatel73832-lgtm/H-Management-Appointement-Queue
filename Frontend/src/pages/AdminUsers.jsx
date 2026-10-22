import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalUsers: 0,
        currentPage: 1,
        totalPages: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/users", {
                params: {
                    search: search.trim(),
                    role,
                    page,
                    limit: 10
                }
            });

            const data = response.data.data;

            setUsers(data.users || []);
            setPagination(data.pagination);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    }, [search, role, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleChange = (value) => {
        setRole(value);
        setPage(1);
    };

    const getRoleStyle = (userRole) => {
        switch (userRole) {
            case "admin":
                return "bg-purple-100 text-purple-700";
            case "doctor":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-green-100 text-green-700";
        }
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

                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        User Management
                    </h1>

                    <p className="mt-2 text-gray-500">
                        View and search registered H-Manage users.
                    </p>
                </div>

                {/* Search and filter */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="md:col-span-2">
                            <label
                                htmlFor="user-search"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Search users
                            </label>

                            <input
                                id="user-search"
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(event) =>
                                    handleSearchChange(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="role-filter"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Filter by role
                            </label>

                            <select
                                id="role-filter"
                                value={role}
                                onChange={(event) =>
                                    handleRoleChange(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All roles</option>
                                <option value="patient">Patients</option>
                                <option value="doctor">Doctors</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        <p>{error}</p>

                        <button
                            onClick={fetchUsers}
                            className="mt-2 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Users table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
                        <h2 className="font-semibold text-gray-900">
                            Registered Users
                        </h2>

                        <p className="text-sm text-gray-500">
                            {pagination.totalUsers} users found
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            Loading users...
                        </div>
                    ) : !error && users.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="font-medium text-gray-700">
                                No users found
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Try another search or role filter.
                            </p>
                        </div>
                    ) : !error ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">
                                                User
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Email
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Role
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Registered
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                                            {user.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <span className="font-medium text-gray-900">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                    {user.email}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                    {user.createdAt
                                                        ? new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row">
                                <p className="text-sm text-gray-500">
                                    Page {pagination.currentPage} of{" "}
                                    {Math.max(pagination.totalPages, 1)}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((current) => current - 1)
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        disabled={
                                            page >= pagination.totalPages
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

export default AdminUsers;