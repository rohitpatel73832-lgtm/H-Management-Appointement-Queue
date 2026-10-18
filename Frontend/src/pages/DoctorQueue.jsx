
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await api.get("/queue/my", {
        params: { date },
      });

      const list = response.data?.data?.queue;

      if (!Array.isArray(list)) {
        throw new Error("Unexpected queue response.");
      }

      setQueue(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load the queue."
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const updateStatus = async (queueId, status) => {
    try {
      setUpdatingId(queueId);
      setError("");
      setSuccessMessage("");

      await api.patch(`/queue/${queueId}/status`, { status });

      setSuccessMessage(`Queue status updated to ${status}.`);
      await loadQueue();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update queue status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case "waiting":
        return "bg-amber-100 text-amber-800";
      case "called":
        return "bg-blue-100 text-blue-800";
      case "serving":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "skipped":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case "waiting":
        return [
          { label: "Call Patient", status: "called" },
          { label: "Skip", status: "skipped" },
          { label: "Cancel", status: "cancelled" },
        ];

      case "called":
        return [
          { label: "Start Consultation", status: "serving" },
          { label: "Skip", status: "skipped" },
        ];

      case "serving":
        return [
          { label: "Complete Consultation", status: "completed" },
        ];

      default:
        return [];
    }
  };

  const waitingCount = queue.filter(
    (item) => item.status === "waiting"
  ).length;

  const servingCount = queue.filter(
    (item) => item.status === "serving"
  ).length;

  const completedCount = queue.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Doctor Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Patient Queue
          </h1>
          <p className="mt-2 text-slate-600">
            Manage today's tokens and patient consultations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Refresh Queue
        </button>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="queue-date"
          className="block text-sm font-semibold text-slate-700"
        >
          Select queue date
        </label>

        <input
          id="queue-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-2 rounded-xl border border-slate-300 px-4 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </section>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Waiting</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {waitingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In Consultation</p>
          <p className="mt-2 text-3xl font-bold text-purple-700">
            {servingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {completedCount}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">
          Queue Tokens
        </h2>

        {loading ? (
          <p className="py-10 text-center text-slate-600">
            Loading queue...
          </p>
        ) : queue.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <h3 className="font-semibold text-slate-800">
              No queue entries
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              There are no queue tokens for this date.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {queue.map((item) => {
              const actions = getAvailableActions(item.status);

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
                        {item.tokenNumber}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.patient?.name || "Patient"}
                        </h3>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {item.patient?.email || "Email unavailable"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {actions.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() =>
                            updateStatus(item._id, action.status)
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            action.status === "completed"
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : action.status === "cancelled" ||
                                  action.status === "skipped"
                                ? "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {updatingId === item._id
                            ? "Updating..."
                            : action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate("/doctor-dashboard")}
        className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default DoctorQueue;
