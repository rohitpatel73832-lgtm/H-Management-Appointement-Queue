import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setMenuOpen(false);
  };

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
          to={token ? "/dashboard" : "/login"}
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
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

        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {token ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/my-appointements" className={navLinkClass}>
                My Appointments
              </NavLink>
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

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {token ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/my-appointements" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  My Appointments
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-left text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
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