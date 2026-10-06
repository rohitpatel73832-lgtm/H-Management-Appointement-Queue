import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import socket from "../services/socket.js";




function Dashboard(){

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

        socket.on("connect", () => {

            console.log(
                "Socket connected:",
                socket.id
            );

        });


        socket.on("disconnect", () => {

            console.log(
                "Socket disconnected"
            );

        });


        return () => {

            socket.off("connect");
            socket.off("disconnect");

        };

    }, []);

    

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
};

export default Dashboard;