
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Read the logged-in user's role.
  // Update "user" below if your localStorage uses a different key.
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const role = user?.role;

  const navigation = {
    patient: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Find Doctors", to: "/doctors" },
      { label: "My Appointments", to: "/my-appointements" },
    ],
    doctor: [
      { label: "Dashboard", to: "/doctor-dashboard" },
      { label: "Availability", to: "/doctor-availability" },
      { label: "Appointments", to: "/doctor-appointments" },
      { label: "Queue", to: "/doctor-queue" },
      { label: "Profile", to: "/doctor-profile" },
    ],
    admin: [
      { label: "Admin Dashboard", to: "/admin-dashboard" },
      { label: "Manage Users", to: "/admin-users" },
      { label: "Manage Doctors", to: "/admin-doctors" },
      { label: "Manage Appointments", to: "/admin-appointments" },
    ],
  };

  const links = navigation[role] || [];

  const homePath = {
    patient: "/dashboard",
    doctor: "/doctor-dashboard",
    admin: "/admin-dashboard",
  }[role] || "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={token ? homePath : "/login"}
          className="flex items-center gap-3"
          onClick={closeMenu}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            H
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-900">
              H-Manage
            </span>
            <span className="block text-xs text-slate-500">
              Healthcare made simpler
            </span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {token ? (
            <>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {token ? (
              <>
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navLinkClass}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-left text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Login
                </NavLink>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
