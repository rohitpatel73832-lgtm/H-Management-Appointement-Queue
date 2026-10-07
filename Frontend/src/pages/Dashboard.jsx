import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import socket from "../services/socket.js";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [waitingTime, setWaitingTime] = useState(null);


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

            setWaitingTime(
                response.data.data
            );

        } catch (error) {

            console.log(
                "WAITING TIME ERROR:",
                error.response?.data
            );
        }
    };


    // Get current user
    useEffect(() => {
        const getCurrentUser = async () => {
             try {
                const response = await api.get(
                    "/users/me"
                );

                console.log(response.data);

                setUser(
                    response.data.data.user
                );

            } catch (error) {                console.log(error);
                setError(
                    error.response?.data?.message ||
                    "Failed to fetch user"
                );
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        getCurrentUser();
    }, [navigate]);


    // Get waiting time
    useEffect(() => {
        if (!user) {
            return;
        }
        getWaitingTime();

    }, [user]);


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


        const handleQueueUpdate = async (data) => {

            console.log(
                "QUEUE UPDATED:",
                data
            );

            await getWaitingTime();

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


        // If socket is already connected
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


    // Conditional return comes AFTER all hooks
    if (loading) {

        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );

    }


    return (
        <div>

            <h1>
                Dashboard
            </h1>


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


            {waitingTime && (

                <div>

                    <h2>
                        My Queue
                    </h2>

                    <p>
                        Your Token:
                        {waitingTime.tokenNumber}
                    </p>

                    <p>
                        Patients Ahead:
                        {waitingTime.patientsAhead}
                    </p>

                    <p>
                        Estimated Waiting Time:
                        {waitingTime.estimatedWaitingTime}
                        {" "}minutes
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