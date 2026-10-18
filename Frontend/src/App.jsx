import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorDetails from "./pages/DoctorDetails";
import MyAppointements from "./pages/MyAppointements";
import AppLayout from "./components/AppLayout";
import Doctors from "./pages/Doctors";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorAppointments from "./pages/DoctorAppointments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<AppLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-availability"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />

        {/* Doctor dashboard */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Patient: browse doctors */}
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Doctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        {/* Patient: view doctor details */}
        <Route
          path="/doctor/:doctorId"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DoctorDetails />
            </ProtectedRoute>
          }
        />

        {/* Patient: view appointments */}
        <Route
          path="/my-appointements"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <MyAppointements />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
