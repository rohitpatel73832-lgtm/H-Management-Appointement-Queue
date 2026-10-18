
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  // Redirect unauthenticated users to login.
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check the role when a route specifies allowed roles.
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    if (user?.role === "doctor") {
      return <Navigate to="/doctor-dashboard" replace />;
    }

    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (user?.role === "patient") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
