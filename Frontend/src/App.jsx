import { Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import DoctorDetails from "./pages/DoctorDetails";
import MyAppointements from "./pages/MyAppointements";

function App() {

    return (
        <Routes>

            {/* Public Routes */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* Protected Routes */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/:doctorId"
                element={<DoctorDetails />}
            />

            <Route
                path="/my-appointements"
                element={<MyAppointements />}
            />

        </Routes>
    );
}

export default App;