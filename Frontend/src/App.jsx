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

function App() {
  return (
    <Routes>
      {/* Public home page — no shared dashboard layout */}
      <Route path="/" element={<Home />} />

      {/* Pages that use the shared layout */}
      <Route element={<AppLayout />}>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <Doctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/:doctorId"
          element={
            <ProtectedRoute>
              <DoctorDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointements"
          element={
            <ProtectedRoute>
              <MyAppointements />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect unknown URLs to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;