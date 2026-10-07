import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import socket from "../services/socket.js";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const getCurrentUser = async () => {

            try {

                const response = await api.get("/users/me");

                console.log(response.data);

                setUser(response.data.data.user);

            } catch (error) {

                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Failed to fetch user"
                );

                // Remove invalid token
                localStorage.removeItem("token");

                navigate("/login");

            } finally {

                setLoading(false);

            }
        };

        getCurrentUser();

    }, [navigate]);


    // Socket.IO connection
    useEffect(() => {

    if (!user) {
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

    };


    const handleDisconnect = () => {

        console.log(
            "Socket disconnected"
        );

    };


    socket.on(
        "connect",
        handleConnect
    );

    socket.on(
        "queue-updated",
        handleQueueUpdate
    );

    socket.on(
        "disconnect",
        handleDisconnect
    );


    // IMPORTANT:
    // If socket is already connected,
    // join the room immediately.

    if (socket.connected) {

        console.log(
            "Socket is already connected:",
            socket.id
        );

        socket.emit(
            "join-patient",
            user._id
        );

    }


    return () => {

        socket.off(
            "connect",
            handleConnect
        );

        socket.off(
            "queue-updated",
            handleQueueUpdate
        );

        socket.off(
            "disconnect",
            handleDisconnect
        );

    };

}, [user]);


    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };


    if (loading) {

        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );

    }


    return (
        <div>

            <h1>Dashboard</h1>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {user && (
                <div>

                    <h2>
                        Welcome, {user.name}
                    </h2>

                    <p>
                        Email: {user.email}
                    </p>

                    <p>
                        Role: {user.role}
                    </p>

                    <p>
                        User ID: {user._id}
                    </p>

                </div>
            )}

            <br />

            <button onClick={handleLogout}>
                Logout
            </button>

        </div>
    );
}

export default Dashboard;