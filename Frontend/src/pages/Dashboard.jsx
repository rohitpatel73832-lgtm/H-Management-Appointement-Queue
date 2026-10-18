import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api.js";
import socket from "../services/socket.js";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationApi.js";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Queue state
  const [queueDate, setQueueDate] = useState(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  });

  const [waitingTime, setWaitingTime] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState("");
  const [queueNotFound, setQueueNotFound] = useState(false);

  // Prevent older queue requests from overwriting newer results.
  const queueRequestId = useRef(0);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [notificationActionError, setNotificationActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load the current user.
  useEffect(() => {
    let active = true;

    async function getCurrentUser() {
      try {
        const response = await api.get("/users/me");

        if (!active) return;

        const currentUser = response.data?.data?.user;

        if (!currentUser) {
          throw new Error("Unable to retrieve your account details.");
        }

        setUser(currentUser);
        setError("");
      } catch (err) {
        if (!active) return;

        setError(err.response?.data?.message || "Unable to load your account.");

        localStorage.removeItem("token");
        socket.disconnect();
        navigate("/login", { replace: true });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getCurrentUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Load queue information for the selected date.
  const getWaitingTime = useCallback(async () => {
    if (!queueDate) return;

    const requestId = ++queueRequestId.current;

    setQueueLoading(true);
    setQueueError("");
    setQueueNotFound(false);

    try {
      const response = await api.get("/queue/my-wait-time", {
        params: { date: queueDate },
      });

      // Ignore responses from older requests.
      if (requestId !== queueRequestId.current) return;

      setWaitingTime(response.data?.data ?? null);
    } catch (err) {
      if (requestId !== queueRequestId.current) return;

      setWaitingTime(null);

      if (err.response?.status === 404) {
        // The backend returns 404 when no active queue exists.
        setQueueNotFound(true);
        setQueueError("");
      } else {
        setQueueNotFound(false);
        setQueueError(
          err.response?.data?.message ||
            "Unable to load queue information. Please try again.",
        );
      }
    } finally {
      if (requestId === queueRequestId.current) {
        setQueueLoading(false);
      }
    }
  }, [queueDate]);

  // Fetch queue information when the selected date changes.
  useEffect(() => {
    if (user?.role === "patient") {
      getWaitingTime();
    } else {
      // Invalidate any outstanding request when the user is not a patient.
      queueRequestId.current += 1;
      setWaitingTime(null);
      setQueueLoading(false);
    }

    return () => {
      // Invalidate requests belonging to the previous effect.
      queueRequestId.current += 1;
    };
  }, [user?.role, getWaitingTime]);

  // Join the patient's room and refresh the queue when it changes.
  useEffect(() => {
    if (!user?._id || user.role !== "patient") return;

    const joinRoom = () => {
      socket.emit("join-patient", user._id);
    };

    const handleQueueUpdate = (update) => {
      // Ignore events explicitly intended for a different patient.
      if (update?.patientId && String(update.patientId) !== String(user._id)) {
        return;
      }

      getWaitingTime();
    };

    socket.on("connect", joinRoom);
    socket.on("queue-updated", handleQueueUpdate);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("queue-updated", handleQueueUpdate);
    };
  }, [user?._id, user?.role, getWaitingTime]);

  // Load saved notifications.
  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    setNotificationError("");

    try {
      const result = await getMyNotifications();
      setNotifications(result.data?.notifications ?? []);
    } catch (err) {
      setNotificationError(
        err.response?.data?.message || "Could not load notifications.",
      );
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  // Listen for new notifications.
  // The queue effect above is the only effect that joins the patient room.
  useEffect(() => {
    if (!user?._id) return;

    let active = true;

    const handleNewNotification = (notification) => {
      if (!active) return;

      const notificationUserId =
        typeof notification.user === "string"
          ? notification.user
          : notification.user?._id;

      if (
        notificationUserId &&
        String(notificationUserId) !== String(user._id)
      ) {
        return;
      }

      setNotifications((previous) => {
        if (previous.some((item) => item._id === notification._id)) {
          return previous;
        }

        return [notification, ...previous];
      });
    };

    loadNotifications();

    socket.on("new-notification", handleNewNotification);

    return () => {
      active = false;
      socket.off("new-notification", handleNewNotification);
    };
  }, [user?._id, loadNotifications]);

  // Mark one notification as read.
  const handleMarkAsRead = async (notificationId) => {
    setNotificationActionError("");
    setActionLoading(true);

    try {
      await markNotificationAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (err) {
      setNotificationActionError(
        err.response?.data?.message || "Could not mark notification as read.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all notifications as read.
  const handleMarkAllAsRead = async () => {
    setNotificationActionError("");
    setActionLoading(true);

    try {
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      setNotificationActionError(
        err.response?.data?.message ||
          "Could not mark all notifications as read.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Logout.
  const handleLogout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    navigate("/login", { replace: true });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 font-medium text-slate-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-100">
              PATIENT DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Manage your appointments, check your queue, and stay up to date
              with your healthcare journey.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-blue-700">
              {user?.name?.charAt(0)?.toUpperCase() || "H"}
            </div>

            <div className="min-w-0">
              <p className="font-semibold">{user?.name}</p>

              <p className="max-w-48 truncate text-sm text-blue-100">
                {user?.email}
              </p>

              <p className="mt-1 text-xs capitalize text-blue-100">
                {user?.role} account
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Quick actions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Get where you need to go.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              +
            </span>

            <span className="flex-1">
              <span className="block font-bold text-slate-900">
                Find a doctor
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                Explore doctors and available slots
              </span>
            </span>

            <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
              →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-appointements")}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              ▣
            </span>

            <span className="flex-1">
              <span className="block font-bold text-slate-900">
                My appointments
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                View bookings and payment status
              </span>
            </span>

            <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
              →
            </span>
          </button>
        </div>
      </section>

      {/* Account details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
            ♙
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Account information
            </h2>

            <p className="text-sm text-slate-500">Your profile details</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full name
            </p>

            <p className="mt-2 break-words font-semibold text-slate-900">
              {user?.name || "Not available"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email address
            </p>

            <p className="mt-2 break-words font-semibold text-slate-900">
              {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </section>

      {/* Patient queue */}
      {user?.role === "patient" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <h2 className="text-xl font-bold text-slate-900">My queue</h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Check your token and estimated waiting time.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="text-sm font-medium text-slate-600">
                Queue date
                <input
                  type="date"
                  value={queueDate}
                  onChange={(event) => setQueueDate(event.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-auto"
                />
              </label>

              <button
                type="button"
                onClick={getWaitingTime}
                disabled={queueLoading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {queueLoading ? "Refreshing..." : "↻ Refresh queue"}
              </button>
            </div>
          </div>

          {queueLoading ? (
            <div className="mt-6 grid animate-pulse gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : queueError ? (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm text-red-700">{queueError}</p>

              <button
                type="button"
                onClick={getWaitingTime}
                disabled={queueLoading}
                className="mt-2 text-sm font-semibold text-red-700 underline disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          ) : waitingTime ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-700">Your token</p>

                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {waitingTime.tokenNumber ?? "—"}
                </p>

                <p className="mt-1 text-xs text-blue-700">Your queue number</p>
              </div>

              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-sm font-medium text-violet-700">
                  Patients ahead
                </p>

                <p className="mt-2 text-3xl font-bold text-violet-900">
                  {waitingTime.patientsAhead ?? "—"}
                </p>

                <p className="mt-1 text-xs text-violet-700">
                  Patients before your turn
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">
                  Estimated wait
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-900">
                  {waitingTime.estimatedWaitingTime ?? "—"}
                  <span className="ml-1 text-base font-medium">min</span>
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Estimated, not guaranteed
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="text-3xl">◷</div>

              <h3 className="mt-2 font-semibold text-slate-900">
                {queueNotFound
                  ? "No active queue for this date"
                  : "Queue information unavailable"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {queueNotFound
                  ? "You may not have an active appointment in the queue for this date. Check your appointment date or view your bookings."
                  : "No queue details were returned. Refresh to check again."}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={getWaitingTime}
                  disabled={queueLoading}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                >
                  Try again
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/my-appointements")}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View appointments
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>

            <p className="mt-1 text-sm text-slate-500">
              Appointment and queue updates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {unreadCount} unread
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleMarkAllAsRead}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {notificationActionError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {notificationActionError}
          </p>
        )}

        {notificationLoading ? (
          <p className="mt-5 text-sm text-slate-500">
            Loading notifications...
          </p>
        ) : notificationError ? (
          <div className="mt-5 rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-700">{notificationError}</p>

            <button
              type="button"
              onClick={loadNotifications}
              className="mt-2 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">
            <div className="text-3xl">♧</div>

            <h3 className="mt-2 font-semibold text-slate-900">
              You're all caught up
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-xl border p-4 transition ${
                  notification.isRead
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      notification.isRead ? "bg-slate-300" : "bg-blue-600"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                      <h3 className="break-words font-semibold text-slate-900">
                        {notification.title}
                      </h3>

                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    {notification.type && (
                      <span className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-xs capitalize text-slate-500">
                        {notification.type}
                      </span>
                    )}

                    {!notification.isRead && (
                      <div>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="mt-3 text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Account action */}
      <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">Signed in as {user?.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
