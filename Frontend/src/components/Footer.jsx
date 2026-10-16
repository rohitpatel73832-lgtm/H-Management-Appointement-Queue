import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#0d1b3d] text-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-14 md:px-8 md:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-lg shadow-blue-900/40">
                ♥
              </span>
              <span className="text-2xl font-extrabold tracking-tight">
                H-Manage
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
              Healthcare made simpler. Book appointments, find trusted
              doctors, and stay updated with your queue — all in one place.
            </p>

            <div className="mt-5 flex gap-3">
              {[
                { label: "LinkedIn", symbol: "in" },
                { label: "Instagram", symbol: "◎" },
                { label: "Facebook", symbol: "f" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#contact"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  {social.symbol}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-cyan-300">Home</Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-cyan-300">
                  Our Features
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-cyan-300">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-cyan-300">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div>
            <h3 className="text-base font-bold">Patient Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/doctors" className="hover:text-cyan-300">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/my-appointements" className="hover:text-cyan-300">
                  My Appointments
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-300">
                  Track My Queue
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-300">
                  Patient Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h3 className="text-base font-bold">Get in Touch</h3>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Have questions about your appointments or using H-Manage?
              Sign in to get started.
            </p>

            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>

            <p className="mt-4 text-xs text-slate-400">
              Your healthcare journey, made easier.
            </p>
          </div>
        </div>

        <div className="my-10 border-t border-white/10" />

        {/* Bottom bar */}
        <div className="flex justify-center text-center text-xs text-slate-400">
  <p>
    © {new Date().getFullYear()} H-Manage. All rights reserved.
  </p>
</div>
      </div>
    </footer>
  );
}

export default Footer;