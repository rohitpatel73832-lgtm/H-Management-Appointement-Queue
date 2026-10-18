
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/users/login", {
        email: email.trim(),
        password,
      });

      const data = response.data?.data;
      const token = data?.token;
      const user = data?.user;

      if (!token) {
        throw new Error("Login succeeded, but no token was returned.");
      }

      if (!user || !user.role) {
        throw new Error(
          "The server did not return user details or a role. Please check the login API response."
        );
      }

      // Save authentication details.
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate according to the user's role.
      if (user.role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (user.role === "patient") {
        navigate("/dashboard", { replace: true });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Your account has an unsupported role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-10 py-8 md:grid-cols-2 md:gap-14">
      <section className="hidden md:block">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Your healthcare, organized
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl">
          Better care starts with
          <span className="text-blue-600"> a simpler experience.</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
          Manage appointments, follow your queue, and stay connected with your
          healthcare journey—all in one place.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">Easy booking</p>
            <p className="mt-1 text-sm text-slate-500">
              Choose a doctor and an available slot.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">Live queue</p>
            <p className="mt-1 text-sm text-slate-500">
              Check your queue information.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-600">WELCOME BACK</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your details to access your account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to H-Manage"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
