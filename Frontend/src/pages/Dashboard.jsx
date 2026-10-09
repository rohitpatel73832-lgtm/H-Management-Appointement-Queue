import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api.js";
import socket from "../services/socket.js";

import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/notificationApi.js";


function Dashboard() {

    const navigate = useNavigate();

    // User state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Queue state
    const [waitingTime, setWaitingTime] = useState(null);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(true);
    const [notificationError, setNotificationError] = useState("");
    const [notificationActionError, setNotificationActionError] = useState("");


    // =========================================
    // 1. Get current logged-in user
    // =========================================

    useEffect(() => {

        let active = true;

        const getCurrentUser = async () => {

            try {

                const response = await api.get("/users/me");

                if (active) {
                    setUser(response.data.data.user);
                }

            } catch (error) {

                console.error(
                    "CURRENT USER ERROR:",
                    error.response?.data || error.message
                );

                if (active) {
                    setError(
                        error.response?.data?.message ||
                        "Failed to fetch user"
                    );

                    localStorage.removeItem("token");
                    navigate("/login");
                }

            } finally {

                if (active) {
                    setLoading(false);
                }

            }
        };

        getCurrentUser();

        return () => {
            active = false;
        };

    }, [navigate]);


    // =========================================
    // 2. Get patient's estimated waiting time
    // =========================================

    const getWaitingTime = async () => {

        try {

            const response = await api.get(
                "/queue/my-wait-time",
                {
                    params: {
                        date: "2026-10-05"
                    }
                }
            );

            console.log(
                "WAITING TIME:",
                response.data
            );

            setWaitingTime(response.data.data);

        } catch (error) {

            console.log(
                "WAITING TIME ERROR:",
                error.response?.data || error.message
            );

            setWaitingTime(null);

        }

    };


    useEffect(() => {

        if (!user?._id || user.role !== "patient") {
            return;
        }

        getWaitingTime();

    }, [user?._id, user?.role]);


    // =========================================
    // 3. Socket.IO connection and queue updates
    // =========================================

    useEffect(() => {

        if (!user?._id || user.role !== "patient") {
            return;
        }

        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            socket.emit(
                "join-patient",
                user._id
            );

        };


        const handleQueueUpdate = (data) => {

            console.log(
                "QUEUE UPDATED:",
                data
            );

            getWaitingTime();

        };


        const handleDisconnect = () => {

            console.log("Socket disconnected");

        };


        socket.on("connect", handleConnect);

        socket.on("queue-updated", handleQueueUpdate);

        socket.on("disconnect", handleDisconnect);


        // Join the room if Socket.IO is already connected.
        if (socket.connected) {

            handleConnect();

        }


        return () => {

            socket.off("connect", handleConnect);

            socket.off("queue-updated", handleQueueUpdate);

            socket.off("disconnect", handleDisconnect);

        };

    }, [user?._id, user?.role]);


    // =========================================
    // 4. Load saved notifications and receive
    //    new notifications in real time
    // =========================================

    useEffect(() => {

        if (!user?._id) {
            return;
        }

        let active = true;

        const loadNotifications = async () => {

            setNotificationLoading(true);

            try {

                const result = await getMyNotifications();

                if (active) {

                    setNotifications(
                        result.data.notifications || []
                    );

                    setNotificationError("");

                }

            } catch (error) {

                console.error(
                    "NOTIFICATION FETCH ERROR:",
                    error.response?.data || error.message
                );

                if (active) {

                    setNotificationError(
                        error.response?.data?.message ||
                        "Could not load notifications."
                    );

                }

            } finally {

                if (active) {
                    setNotificationLoading(false);
                }

            }

        };


        // Load notifications already saved in MongoDB.
        loadNotifications();


        // Join the patient's Socket.IO room.
        const joinPatientRoom = () => {

            socket.emit(
                "join-patient",
                user._id
            );

        };


        // Receive notifications sent by the backend.
        const handleNewNotification = (notification) => {

            console.log("NEW NOTIFICATION RECEIVED:", notification);
            // The notification's user can be either an ID
            // string or a populated object.
            const notificationUserId =
                typeof notification.user === "string"
                    ? notification.user
                    : notification.user?._id;

            if (notificationUserId !== user._id) {
                return;
            }

            setNotifications((previous) => {

                // Prevent duplicate notifications.
                const alreadyExists = previous.some(
                    (item) => item._id === notification._id
                );

                if (alreadyExists) {
                    return previous;
                }

                return [
                    notification,
                    ...previous
                ];

            });

        };


        socket.on("connect", joinPatientRoom);

        socket.on(
            "new-notification",
            handleNewNotification
        );


        // The socket may already be connected.
        if (socket.connected) {
            joinPatientRoom();
        }


        return () => {

            active = false;

            socket.off("connect", joinPatientRoom);

            socket.off(
                "new-notification",
                handleNewNotification
            );

        };

    }, [user?._id]);


    // =========================================
    // 5. Mark one notification as read
    // =========================================

    const handleMarkAsRead = async (notificationId) => {

        setNotificationActionError("");

        try {

            await markNotificationAsRead(notificationId);

            setNotifications((previous) =>

                previous.map((notification) =>

                    notification._id === notificationId
                        ? {
                            ...notification,
                            isRead: true
                        }
                        : notification

                )

            );

        } catch (error) {

            console.error(
                "MARK AS READ ERROR:",
                error.response?.data || error.message
            );

            setNotificationActionError(
                "Could not mark notification as read."
            );

        }

    };


    // =========================================
    // 6. Mark all notifications as read
    // =========================================

    const handleMarkAllAsRead = async () => {

        setNotificationActionError("");

        try {

            await markAllNotificationsAsRead();

            setNotifications((previous) =>

                previous.map((notification) => ({
                    ...notification,
                    isRead: true
                }))

            );

        } catch (error) {

            console.error(
                "MARK ALL AS READ ERROR:",
                error.response?.data || error.message
            );

            setNotificationActionError(
                "Could not mark all notifications as read."
            );

        }

    };


    // =========================================
    // 7. Logout
    // =========================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        socket.disconnect();

        navigate("/login");

    };


    // =========================================
    // 8. Calculate unread notification count
    // =========================================

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;


    // =========================================
    // 9. Loading screen
    // =========================================

    if (loading) {

        return (
            <div className="p-6">

                <h1 className="text-xl font-semibold">
                    Loading dashboard...
                </h1>

            </div>
        );

    }


    // =========================================
    // 10. Dashboard UI
    // =========================================

    return (

        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

            <div className="mx-auto max-w-5xl">

                {/* Dashboard heading */}

                <div className="mb-6 flex items-center justify-between gap-4">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>

                </div>


                {/* Error */}

                {error && (

                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                        {error}
                    </div>

                )}


                {/* User details */}

                {user && (

                    <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                        <h2 className="mb-3 text-xl font-semibold">
                            Welcome, {user.name}
                        </h2>

                        <div className="space-y-2 text-gray-600">

                            <p>
                                <span className="font-medium text-gray-800">
                                    Email:
                                </span>{" "}
                                {user.email}
                            </p>

                            <p>
                                <span className="font-medium text-gray-800">
                                    Role:
                                </span>{" "}
                                {user.role}
                            </p>

                            <p className="break-all">
                                <span className="font-medium text-gray-800">
                                    User ID:
                                </span>{" "}
                                {user._id}
                            </p>

                        </div>

                    </section>

                )}


                {/* Queue information */}

                {user?.role === "patient" && (

                    <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">

                        <div className="mb-4 flex items-center justify-between">

                            <h2 className="text-xl font-semibold">
                                My Queue
                            </h2>

                            <button
                                type="button"
                                onClick={getWaitingTime}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Refresh
                            </button>

                        </div>

                        {waitingTime ? (

                            <div className="grid gap-4 sm:grid-cols-3">

                                <div className="rounded-lg bg-blue-50 p-4">

                                    <p className="text-sm text-gray-600">
                                        Your Token
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-blue-700">
                                        {waitingTime.tokenNumber}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-gray-100 p-4">

                                    <p className="text-sm text-gray-600">
                                        Patients Ahead
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {waitingTime.patientsAhead}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-green-50 p-4">

                                    <p className="text-sm text-gray-600">
                                        Estimated Waiting Time
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-green-700">
                                        {waitingTime.estimatedWaitingTime} min
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <p className="text-gray-500">
                                No active queue found for the selected date.
                            </p>

                        )}

                        <p className="mt-3 text-xs text-gray-400">
                            Queue date: 5 October 2026
                        </p>

                    </section>

                )}


                {/* Notifications */}

                <section className="rounded-xl border bg-white p-5 shadow-sm">

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                Notifications
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Your appointment and queue updates
                            </p>

                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            {unreadCount} unread
                        </span>

                    </div>


                    {notificationActionError && (

                        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {notificationActionError}
                        </p>

                    )}


                    {notificationLoading ? (

                        <p className="text-gray-500">
                            Loading notifications...
                        </p>

                    ) : notificationError ? (

                        <div>

                            <p className="text-red-600">
                                {notificationError}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationError("");
                                    setNotificationLoading(true);

                                    getMyNotifications()
                                        .then((result) => {
                                            setNotifications(
                                                result.data.notifications || []
                                            );
                                        })
                                        .catch(() => {
                                            setNotificationError(
                                                "Could not load notifications."
                                            );
                                        })
                                        .finally(() => {
                                            setNotificationLoading(false);
                                        });
                                }}
                                className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                            >
                                Try again
                            </button>

                        </div>

                    ) : notifications.length === 0 ? (

                        <p className="rounded-lg bg-gray-50 p-4 text-gray-500">
                            No notifications yet. New queue updates will appear here.
                        </p>

                    ) : (

                        <>

                            {unreadCount > 0 && (

                                <div className="mb-4 text-right">

                                    <button
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        Mark all as read
                                    </button>

                                </div>

                            )}


                            <div className="space-y-3">

                                {notifications.map((notification) => (

                                    <div
                                        key={notification._id}
                                        className={`rounded-lg border p-4 ${
                                            notification.isRead
                                                ? "border-gray-200 bg-white"
                                                : "border-blue-200 bg-blue-50"
                                        }`}
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0">

                                                <h3 className="font-semibold text-gray-900">
                                                    {notification.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.message}
                                                </p>

                                                <p className="mt-2 text-xs capitalize text-gray-400">
                                                    Type: {notification.type}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()}
                                                </p>

                                            </div>


                                            {!notification.isRead && (

                                                <span
                                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                                                    title="Unread notification"
                                                />

                                            )}

                                        </div>


                                        {!notification.isRead && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notification._id
                                                    )
                                                }
                                                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                                            >
                                                Mark as read
                                            </button>

                                        )}

                                    </div>

                                ))}

                            </div>

                        </>

                    )}

                </section>

            </div>

        </div>

    );

}

export default Dashboard;