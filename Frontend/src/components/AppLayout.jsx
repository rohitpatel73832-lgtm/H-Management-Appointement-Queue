import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} H-Manage. Healthcare made simpler.
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;