import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Register () {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {

            const response = await api.post(
                "/users/register",
                formData
            );

            console.log(response.data);

            setMessage("Registration successful");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div>

            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />
                </div>

                <br />

                <button type="submit" disabled={loading}>

                    {loading ? "Registering..." : "Register"}

                </button>

            </form>

            {message && (
                <p>
                    {message}
                </p>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}

            <p>
                Already have an account?
            </p>

            <button onClick={() => navigate("/login")}>
                Login
            </button>

        </div>
    );
};

export default Register;