
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
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
          Start your healthcare journey
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl">
          Your health deserves
          <span className="text-blue-600"> a simpler experience.</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
          Create your account to discover doctors, book appointments, and keep
          track of your visits and queue information.
        </p>

        <div className="mt-8 space-y-4">
          {[
            "Find doctors and available appointment slots",
            "Manage your upcoming appointments",
            "Stay informed with notifications",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-600">GET STARTED</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your details to get started with H-Manage.
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

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create my account"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-slate-600">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

          <p>
            Are you a doctor?{" "}
            <Link
              to="/register-doctor"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register as a Doctor
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
