
import { useEffect, useState } from "react";
import api from "../services/api.js";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getAvailabilityList(responseData) {
  // Handle common API response formats.
  const candidates = [
    responseData?.data?.availabilities,
    responseData?.data?.availability,
    responseData?.data,
    responseData?.availabilities,
    responseData?.availability,
    responseData,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      (candidate._id || candidate.id)
    ) {
      return [candidate];
    }
  }

  return [];
}

function normalizeAvailability(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    ...item,
    _id: item._id ?? item.id ?? "",
    dayOfWeek: item.dayOfWeek ?? item.day ?? "",
    startTime: item.startTime ?? item.start ?? "",
    endTime: item.endTime ?? item.end ?? "",
  };
}

function DoctorAvailability() {
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");

  const [availabilities, setAvailabilities] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/availability");

      console.log("Availability API response:", response.data);

      const list = getAvailabilityList(response.data)
        .map(normalizeAvailability)
        .filter(Boolean);

      setAvailabilities(list);
    } catch (err) {
      console.error("Load availability error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your availability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const resetForm = () => {
    setDayOfWeek("Monday");
    setStartTime("09:00");
    setEndTime("13:00");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!startTime || !endTime) {
      setError("Please select both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const payload = {
      dayOfWeek,
      startTime,
      endTime,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.patch(`/availability/${editingId}`, payload);
      } else {
        await api.post("/availability", payload);
      }

      // Reload the data from the backend before reporting success.
      await loadAvailability();

      setSuccess(
        editingId
          ? "Availability updated successfully."
          : "Availability added successfully."
      );

      resetForm();
    } catch (err) {
      console.error("Save availability error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    if (!item._id) {
      setError(
        "This availability record has no ID. Check the API response and backend."
      );
      return;
    }

    if (
      !days.includes(item.dayOfWeek) ||
      !item.startTime ||
      !item.endTime
    ) {
      setError(
        "This record is missing its day or time fields. Check the API response."
      );
      return;
    }

    setEditingId(item._id);
    setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setError("");
    setSuccess("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Doctor Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Manage Availability
        </h1>

        <p className="mt-2 text-slate-600">
          Set your working days and hours for patient appointments.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          {editingId ? "Edit Availability" : "Add Availability"}
        </h2>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="dayOfWeek"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Day of the week
            </label>

            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startTime"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Start time
              </label>

              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                End time
              </label>

              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Availability"
                  : "Save Availability"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Your Saved Availability
        </h2>

        {loading ? (
          <p className="py-6 text-slate-600">
            Loading availability...
          </p>
        ) : availabilities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold text-slate-800">
              No availability added yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your first working day using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {availabilities.map((item, index) => (
              <div
                key={item._id || `availability-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.dayOfWeek || "Day unavailable"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      {item.startTime || "--:--"} –{" "}
                      {item.endTime || "--:--"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorAvailability;
