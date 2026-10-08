import { useEffect, useState } from "react";
import { getMyAppointments } from "../services/appointementApi";
import { createPaymentOrder, verifyPayment } from "../services/paymentApi";

//import {  getMyAppointments } from "../services/appointmentApi";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Fetch appointments

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await getMyAppointments();

      setAppointments(response.data.appointments);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Loading

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  // Error

  if (error) {
    return <div>{error}</div>;
  }

  const handlePayment = async (appointment) => {
    try {
      console.log("Starting payment...");

      // 1. Create Razorpay order
      const response = await createPaymentOrder(appointment._id);

      console.log("Order created:", response);

      const paymentData = response.data;

      // 2. Razorpay Checkout options
      const options = {
        key: paymentData.keyId,

        amount: paymentData.amount,

        currency: paymentData.currency,

        name: "H-Manage",

        description: "Doctor Consultation",

        order_id: paymentData.razorpayOrderId,

        // 3. Successful payment
        handler: async function (razorpayResponse) {
          console.log("Razorpay response:", razorpayResponse);

          const verifyResponse = await verifyPayment({
            razorpay_order_id: razorpayResponse.razorpay_order_id,

            razorpay_payment_id: razorpayResponse.razorpay_payment_id,

            razorpay_signature: razorpayResponse.razorpay_signature,
          });

          console.log("Verification:", verifyResponse);

          if (verifyResponse.success) {
            alert("Payment successful!");
          }
        },

        prefill: {
          name: "Test Patient",

          email: "test@example.com",
        },

        theme: {
          color: "#3399cc",
        },
      };

      // 4. Create Razorpay instance
      const razorpay = new window.Razorpay(options);

      // 5. Payment failed
      razorpay.on("payment.failed", function (response) {
        console.log("Payment failed:", response);

        alert("Payment failed");
      });

      // 6. Open Razorpay
      razorpay.open();
    } catch (error) {
      console.log("Payment error:", error);

      console.log("Backend error:", error.response?.data);

      alert(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div>
      <h1>My Appointments</h1>

      {appointments.length === 0 ? (
        <p>You don't have any appointments.</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment._id}>
            <h2>{appointment.doctor?.user?.name}</h2>

            <p>{appointment.doctor?.specialization}</p>

            <p>Date: {appointment.date}</p>

            <p>
              Time: {appointment.startTime}
              {" - "}
              {appointment.endTime}
            </p>

            <p>Status: {appointment.status}</p>
            <button onClick={() => handlePayment(appointment)}>
              Pay ₹{appointment.doctor?.consultationFee}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyAppointments;
