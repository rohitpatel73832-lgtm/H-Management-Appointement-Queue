
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
import DoctorQueue from "./pages/DoctorQueue";
import DoctorProfile from "./pages/DoctorProfile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDoctors from "./pages/AdminDoctors";
import AdminAppointments from "./pages/AdminAppointments";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      <Route element={<AppLayout />}>
        {/* Authentication */}
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

        {/* Patient: browse doctors */}
        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Doctors />
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

        {/* Doctor dashboard */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor availability */}
        <Route
          path="/doctor-availability"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />

        {/* Doctor appointments */}
        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        {/* Doctor queue */}
        <Route
          path="/doctor-queue"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorQueue />
            </ProtectedRoute>
          }
        />

        {/* Doctor profile */}
        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin user management */}
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Admin doctor management */}
        <Route
          path="/admin-doctors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDoctors />
            </ProtectedRoute>
          }
        />

        {/* Admin appointment management */}
        <Route
          path="/admin-appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
