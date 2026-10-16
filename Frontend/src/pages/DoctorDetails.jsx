
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  bookAppointment,
  getAvailableSlots,
} from "../services/appointementApi";

function DoctorDetails() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [doctorLoading, setDoctorLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    let active = true;

    async function fetchDoctor() {
      try {
        setDoctorLoading(true);
        setError("");

        const response = await api.get(`/doctors/${doctorId}`);

        if (active) {
          setDoctor(response.data?.data?.doctor ?? null);

          if (!response.data?.data?.doctor) {
            setError("Doctor details were not found.");
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load doctor details."
          );
        }
      } finally {
        if (active) setDoctorLoading(false);
      }
    }

    fetchDoctor();

    return () => {
      active = false;
    };
  }, [doctorId]);

  const fetchSlots = useCallback(async () => {
    if (!date) {
      setSlots([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSelectedSlot(null);

      const response = await getAvailableSlots(doctorId, date);

      // The service returns Axios response.data.
      // Support either common API response shape.
      const availableSlots =
        response?.data?.slots ?? response?.slots ?? [];

      setSlots(Array.isArray(availableSlots) ? availableSlots : []);
    } catch (err) {
      setSlots([]);
      setError(
        err.response?.data?.message ||
          "Unable to load available slots. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, date]);

  useEffect(() => {
    if (date) fetchSlots();
  }, [date, fetchSlots]);

  const handleBookAppointment = async () => {
    if (!selectedSlot || !date) {
      setMessageType("error");
      setMessage("Please select a date and time slot.");
      return;
    }

    try {
      setBooking(true);
      setMessage("");

      const response = await bookAppointment({
        doctorId,
        date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      setMessageType("success");
      setMessage(
        response?.message || "Appointment booked successfully!"
      );
      setSelectedSlot(null);

      // Refresh the available slots after booking.
      const slotsResponse = await getAvailableSlots(doctorId, date);
      const availableSlots =
        slotsResponse?.data?.slots ?? slotsResponse?.slots ?? [];

      setSlots(Array.isArray(availableSlots) ? availableSlots : []);
    } catch (err) {
      setMessageType("error");
      setMessage(
        err.response?.data?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (doctorLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 font-medium text-slate-600">
            Loading doctor profile...
          </p>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="min-h-[60vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Doctor unavailable
          </h1>
          <p className="mt-2 text-slate-600">
            {error || "We couldn't find this doctor."}
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to doctors
          </button>
        </div>
      </main>
    );
  }

  const doctorName = doctor.user?.name || "Doctor";
  const displayName = doctorName.toLowerCase().startsWith("dr.")
    ? doctorName
    : `Dr. ${doctorName}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate("/doctors")}
            className="mb-6 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            ← Back to doctors
          </button>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Doctor profile
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Meet your doctor
          </h1>
          <p className="mt-2 max-w-2xl text-blue-100">
            Review the doctor's details and choose an available appointment
            slot.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700">
              {doctorName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                {displayName}
              </h2>
              <p className="mt-1 font-semibold text-blue-700">
                {doctor.specialization}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {doctor.qualification}
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                EXPERIENCE
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {doctor.experience ?? 0} years
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">
                CONSULTATION
              </p>
              <p className="mt-2 text-lg font-bold text-blue-800">
                {doctor.consultationFee != null
                  ? `₹${doctor.consultationFee}`
                  : "Not listed"}
              </p>
            </div>
          </div>

          {doctor.about && (
            <div className="mt-6">
              <h3 className="font-bold text-slate-900">About the doctor</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {doctor.about}
              </p>
            </div>
          )}

          {doctor.clinicAddress && (
            <div className="mt-6">
              <h3 className="font-bold text-slate-900">Clinic address</h3>
              <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                {doctor.clinicAddress}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Before you book
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-800">
              Choose a date to check the available appointment times.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              APPOINTMENT BOOKING
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Choose your slot
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select a date first, then choose one of the available times.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="appointment-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Appointment date
            </label>
            <input
              id="appointment-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setMessage("");
                setError("");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
              <button
                onClick={fetchSlots}
                className="ml-2 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">Available times</h3>
              {date && !loading && !error && (
                <span className="text-sm text-slate-500">
                  {slots.length} available
                </span>
              )}
            </div>

            {!date ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                <p className="font-medium text-slate-700">
                  Select a date to view slots
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Available appointment times will appear here.
                </p>
              </div>
            ) : loading ? (
              <div className="py-10 text-center text-slate-500">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="mt-3 text-sm">Checking availability...</p>
              </div>
            ) : !error && slots.length === 0 ? (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-10 text-center">
                <p className="font-semibold text-slate-700">
                  No available slots
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try selecting another date.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot, index) => {
                  const isSelected =
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;

                  return (
                    <button
                      key={`${slot.startTime}-${slot.endTime}-${index}`}
                      type="button"
                      disabled={booking}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setMessage("");
                      }}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {slot.startTime}
                      {" – "}
                      {slot.endTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedSlot && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                Selected appointment
              </p>
              <p className="mt-1 font-bold text-blue-950">
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </p>
            </div>
          )}

          {message && (
            <div
              role="status"
              className={`mt-5 rounded-xl border p-4 text-sm ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleBookAppointment}
            disabled={!selectedSlot || booking || loading || Boolean(error)}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {booking ? "Booking appointment..." : "Confirm appointment"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            Your booking is subject to the server confirming slot availability.
          </p>
        </section>
      </div>
    </main>
  );
}

export default DoctorDetails;
