import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Login(){

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
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
        setLoading(true);

        try {

            const response = await api.post(
                "/users/login",
                formData
            );

            console.log(response.data);

            const token = response.data.data.token;

            localStorage.setItem("token", token);

            navigate("/dashboard");

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div>

            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

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

                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading ? "Logging in..." : "Login"}

                </button>

            </form>

            {error && (
                <p>
                    {error}
                </p>
            )}

            <p>
                Don't have an account?
            </p>

            <button onClick={() => navigate("/register")}>
                Register
            </button>

        </div>
    );
};

export default Login;