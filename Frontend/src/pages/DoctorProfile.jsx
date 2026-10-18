
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const initialForm = {
  specialization: "",
  qualification: "",
  experience: "",
  consultationFee: "",
  about: "",
  clinicAddress: "",
};

function DoctorProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch the logged-in user's account details
        const userResponse = await api.get("/users/me");
        const currentUser = userResponse.data?.data?.user;

        if (!currentUser) {
          throw new Error("Unable to fetch your account details.");
        }

        if (currentUser.role !== "doctor") {
          navigate("/login", { replace: true });
          return;
        }

        setUser(currentUser);

        // Fetch the doctor's professional profile
        const response = await api.get("/doctors/profile");

        const profile =
          response.data?.data?.doctor ||
          response.data?.data?.profile ||
          response.data?.doctor ||
          response.data?.profile;

        if (!profile) {
          throw new Error(
            "Doctor profile data was not returned by the server. Please check the backend API."
          );
        }

        setForm({
          specialization: profile.specialization ?? "",
          qualification: profile.qualification ?? "",
          experience: profile.experience ?? "",
          consultationFee: profile.consultationFee ?? "",
          about: profile.about ?? "",
          clinicAddress: profile.clinicAddress ?? "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your doctor profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        about: form.about.trim(),
        clinicAddress: form.clinicAddress.trim(),
      };

      if (
        !payload.specialization ||
        !payload.qualification ||
        !payload.clinicAddress ||
        form.experience === "" ||
        form.consultationFee === ""
      ) {
        setError("Please fill in all required fields.");
        return;
      }

      if (
        !Number.isFinite(payload.experience) ||
        payload.experience < 0 ||
        !Number.isFinite(payload.consultationFee) ||
        payload.consultationFee < 0
      ) {
        setError(
          "Experience and consultation fee must be valid non-negative numbers."
        );
        return;
      }

      await api.patch("/doctors/profile", payload);

      setSuccess("Your doctor profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your doctor profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-600">
        Loading doctor profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/doctor-dashboard")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          My Doctor Profile
        </h1>

        <p className="mt-2 text-slate-600">
          Manage your professional information and clinic details.
        </p>
      </div>

      {user && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Account Information
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Name: <span className="font-medium text-slate-900">{user.name}</span>
          </p>

          <p className="mt-2 break-words text-sm text-slate-600">
            Email: <span className="font-medium text-slate-900">{user.email}</span>
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <label
            htmlFor="specialization"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Specialization *
          </label>

          <input
            id="specialization"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="e.g. Cardiologist"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="qualification"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Qualification *
          </label>

          <input
            id="qualification"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="e.g. MBBS, MD"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="experience"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Experience (years) *
            </label>

            <input
              id="experience"
              name="experience"
              type="number"
              min="0"
              step="1"
              value={form.experience}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="consultationFee"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Consultation Fee (₹) *
            </label>

            <input
              id="consultationFee"
              name="consultationFee"
              type="number"
              min="0"
              step="1"
              value={form.consultationFee}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="clinicAddress"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Clinic Address *
          </label>

          <textarea
            id="clinicAddress"
            name="clinicAddress"
            value={form.clinicAddress}
            onChange={handleChange}
            required
            maxLength={300}
            rows={3}
            placeholder="Enter your clinic address"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="about"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            About
          </label>

          <textarea
            id="about"
            name="about"
            value={form.about}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            placeholder="Write a short introduction about your practice"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {form.about.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving Profile..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default DoctorProfile;
