
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function DoctorRegisters() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !specialization.trim() ||
      !qualification.trim() ||
      experience === "" ||
      consultationFee === "" ||
      !clinicAddress.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (Number(experience) < 0 || Number(consultationFee) < 0) {
      setError("Experience and consultation fee cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/register-doctor", {
        name: name.trim(),
        email: email.trim(),
        password,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        clinicAddress: clinicAddress.trim(),
      });

      setSuccess(
        "Registration submitted successfully! Your account is awaiting admin approval."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to register as a doctor. Please try again."
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
          Join H-Manage as a doctor
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl">
          Better care starts with
          <span className="text-blue-600"> better connections.</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
          Register your professional details to connect with patients, manage
          appointments, and organize your consultation queue.
        </p>

        <div className="mt-8 space-y-4">
          {[
            "Manage your appointment schedule",
            "Organize your patient queue",
            "Connect with patients through H-Manage",
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
          <p className="text-sm font-semibold text-blue-600">
            DOCTOR REGISTRATION
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create doctor account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your account and professional details.
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
            <p className="mt-2">
              <Link
                to="/login"
                className="font-semibold underline hover:text-green-900"
              >
                Go to login
              </Link>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Dr. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
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

          <div>
            <label htmlFor="specialization" className="mb-2 block text-sm font-semibold text-slate-700">
              Specialization
            </label>
            <input
              id="specialization"
              type="text"
              placeholder="e.g. Cardiologist"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="qualification" className="mb-2 block text-sm font-semibold text-slate-700">
              Qualification
            </label>
            <input
              id="qualification"
              type="text"
              placeholder="e.g. MBBS, MD"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="experience" className="mb-2 block text-sm font-semibold text-slate-700">
                Experience (years)
              </label>
              <input
                id="experience"
                type="number"
                min="0"
                step="1"
                placeholder="5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="consultationFee" className="mb-2 block text-sm font-semibold text-slate-700">
                Fee (₹)
              </label>
              <input
                id="consultationFee"
                type="number"
                min="0"
                step="1"
                placeholder="800"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="clinicAddress" className="mb-2 block text-sm font-semibold text-slate-700">
              Clinic address
            </label>
            <textarea
              id="clinicAddress"
              rows={3}
              placeholder="Enter your clinic address"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting registration..." : "Register as doctor"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-slate-600">
          Registering as a patient?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Patient registration
          </Link>
        </p>
      </section>
    </div>
  );
}

export default DoctorRegisters;
