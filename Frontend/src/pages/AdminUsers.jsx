
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
                return "bg-[#f0eaff] text-[#7652b8] ring-[#e5d9ff]";
            case "doctor":
                return "bg-[#eaf0ff] text-[#5475d1] ring-[#dce5ff]";
            default:
                return "bg-[#e7f7ef] text-[#25865d] ring-[#d0f0df]";
        }
    };

    const getInitials = (name = "") => {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "?";
    };

    return (
        <div className="min-h-screen bg-[#f4fafa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <header className="mb-8">
                    <Link
                        to="/admin-dashboard"
                        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#087f80] transition hover:text-[#065f60] focus:outline-none focus:ring-2 focus:ring-[#a4dbdc]"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Dashboard
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#21b6a8]" />
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#47999c]">
                                    H-Manage / Administration
                                </p>
                            </div>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#163031] sm:text-4xl">
                                User Management
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718889] sm:text-base">
                                Manage accounts and view registered patients,
                                doctors, and administrators.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-[#dceaea] bg-white px-4 py-3 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f7f6] text-lg text-[#168b88]">
                                <span aria-hidden="true">👥</span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#718889]">
                                    Total registered users
                                </p>
                                <p className="text-xl font-bold text-[#163031]">
                                    {pagination.totalUsers}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Search and filters */}
                <section className="mb-6 rounded-2xl border border-[#e1eeee] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4">
                        <h2 className="font-bold text-[#163031]">
                            Find users
                        </h2>
                        <p className="mt-1 text-sm text-[#718889]">
                            Search by name or email, or filter by account role.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label
                                htmlFor="user-search"
                                className="mb-2 block text-sm font-semibold text-[#345354]"
                            >
                                Search users
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8aa6a6]" aria-hidden="true">
                                    ⌕
                                </span>

                                <input
                                    id="user-search"
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(event) =>
                                        handleSearchChange(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#dceaea] bg-[#fbfefe] py-3 pl-11 pr-4 text-sm text-[#163031] outline-none transition placeholder:text-[#9aabab] focus:border-[#69b0b8] focus:ring-4 focus:ring-[#d9eeee]/70"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="role-filter"
                                className="mb-2 block text-sm font-semibold text-[#345354]"
                            >
                                Filter by role
                            </label>

                            <select
                                id="role-filter"
                                value={role}
                                onChange={(event) =>
                                    handleRoleChange(event.target.value)
                                }
                                className="w-full rounded-xl border border-[#dceaea] bg-[#fbfefe] px-4 py-3 text-sm text-[#345354] outline-none transition focus:border-[#69b0b8] focus:ring-4 focus:ring-[#d9eeee]/70"
                            >
                                <option value="">All roles</option>
                                <option value="patient">Patients</option>
                                <option value="doctor">Doctors</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
                                ⚠️
                            </div>

                            <div>
                                <h2 className="font-bold text-[#163031]">
                                    Unable to load users
                                </h2>
                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>

                                <button
                                    onClick={fetchUsers}
                                    className="mt-3 rounded-lg bg-[#087f80] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#06696a] focus:outline-none focus:ring-4 focus:ring-[#d9eeee]"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users table */}
                <section className="overflow-hidden rounded-2xl border border-[#e1eeee] bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-[#eaf1f1] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#163031]">
                                Registered Users
                            </h2>
                            <p className="mt-1 text-sm text-[#718889]">
                                User directory and account information
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e3f7f6] px-3 py-1.5 text-xs font-bold text-[#087f80]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#21b6a8]" />
                            {pagination.totalUsers} users found
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d9eeee] border-t-[#168b88]" />
                            <p className="mt-4 text-sm font-medium text-[#718889]">
                                Loading users...
                            </p>
                        </div>
                    ) : !error && users.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f7f6] text-2xl">
                                👥
                            </div>

                            <h3 className="mt-4 font-bold text-[#163031]">
                                No users found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm leading-6 text-[#718889]">
                                Try a different search term or change the role filter.
                            </p>
                        </div>
                    ) : !error ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="bg-[#f5fafa] text-xs uppercase tracking-wider text-[#718889]">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">
                                                User
                                            </th>
                                            <th className="px-6 py-4 font-bold">
                                                Email address
                                            </th>
                                            <th className="px-6 py-4 font-bold">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 font-bold">
                                                Registered on
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#edf3f3]">
                                        {users.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="transition-colors hover:bg-[#f8fcfc]"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dceeee] bg-[#e3f7f6] text-sm font-bold text-[#087f80]">
                                                            {getInitials(user.name)}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-[#163031]">
                                                                {user.name || "Unnamed user"}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-[#8aa0a0]">
                                                                H-Manage account
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-[#526e6f]">
                                                    {user.email}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${getRoleStyle(user.role)}`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                        {user.role}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-[#526e6f]">
                                                    {user.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString(
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
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eaf1f1] px-5 py-5 sm:flex-row sm:px-6">
                                <p className="text-sm text-[#718889]">
                                    Page{" "}
                                    <span className="font-bold text-[#163031]">
                                        {pagination.currentPage}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-bold text-[#163031]">
                                        {Math.max(pagination.totalPages, 1)}
                                    </span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={page <= 1 || loading}
                                        onClick={() =>
                                            setPage((current) => current - 1)
                                        }
                                        className="rounded-xl border border-[#dceaea] bg-white px-4 py-2.5 text-sm font-semibold text-[#345354] transition hover:bg-[#f4fafa] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ← Previous
                                    </button>

                                    <button
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

export default AdminUsers;
