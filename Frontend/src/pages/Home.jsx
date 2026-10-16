import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const features = [
  {
    icon: "▦",
    title: "Easy Appointments",
    description:
      "Book your appointment in a few clicks and get instant confirmation.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: "♙",
    title: "Find Trusted Doctors",
    description:
      "Explore experienced doctors across multiple specializations.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: "♧",
    title: "Live Queue Tracking",
    description:
      "Check your token number and estimated waiting time in real-time.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: "♧",
    title: "Instant Notifications",
    description:
      "Get updates on your appointments, queue and health reminders.",
    color: "bg-orange-100 text-orange-600",
  },
];

const doctors = [
  { name: "Dr. Sarah Johnson", specialty: "Cardiologist", rating: "4.8" },
  { name: "Dr. Rajesh Kumar", specialty: "General Physician", rating: "4.7" },
  { name: "Dr. Priya Sharma", specialty: "Dermatologist", rating: "4.9" },
  { name: "Dr. Amit Verma", specialty: "Pediatrician", rating: "4.8" },
];

function Home() {
  const navigate = useNavigate();

  const goToSignup = () => navigate("/login?state=signup");
  const goToLogin = () => navigate("/login?state=login");

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#122957]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-blue-50 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
              ♥
            </span>
            H-Manage
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a className="text-blue-600" href="#home">Home</a>
            <a className="transition hover:text-blue-600" href="#features">
              Features
            </a>
            <a className="transition hover:text-blue-600" href="#about">
              About
            </a>
            <a className="transition hover:text-blue-600" href="#contact">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToLogin}
              className="rounded-full border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </button>
            <button
              onClick={goToSignup}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative bg-gradient-to-br from-white via-white to-blue-50"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              <span>♡</span> Your Health, Our Priority
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Healthcare made easier,{" "}
              <span className="text-blue-600">every day.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 md:text-lg">
              Book appointments with trusted doctors, track your queue in
              real-time and manage your healthcare journey — all in one place.
            </p>

            <form
              className="mt-7 flex max-w-xl items-center gap-2 rounded-full border border-blue-100 bg-white p-1.5 shadow-lg shadow-blue-100/60"
              onSubmit={(event) => {
                event.preventDefault();
                navigate("/login?state=signup");
              }}
            >
              <span className="pl-3 text-xl text-blue-500">⌕</span>
              <input
                aria-label="Search doctors"
                placeholder="Search doctors by name or specialization..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span>▦ Book Appointments</span>
              <span>♧ Track Queue</span>
              <span>♢ Secure &amp; Reliable</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-8 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 md:min-h-[440px]">
              <div className="absolute -right-10 top-8 h-56 w-56 rounded-full bg-blue-200/70" />
              <div className="absolute -bottom-12 -left-8 h-64 w-64 rounded-full bg-cyan-200/50" />

              <div className="relative z-10 px-8 text-center">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-blue-500 to-cyan-400 shadow-xl md:h-52 md:w-52">
                  <span className="text-8xl text-white md:text-9xl">⚕</span>
                </div>
                <div className="mt-5 rounded-2xl border border-white/80 bg-white/90 px-6 py-4 shadow-lg backdrop-blur">
                  <p className="text-lg font-bold">Your health, simplified.</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Book · Track · Get better
                  </p>
                </div>
              </div>

              <div className="absolute left-4 top-8 rounded-2xl bg-white p-4 shadow-lg md:left-5">
                <span className="text-2xl text-blue-600">▦</span>
                <p className="mt-1 text-sm font-bold">Easy Booking</p>
                <p className="text-xs text-slate-500">Choose your time slot</p>
              </div>

              <div className="absolute bottom-8 right-3 rounded-2xl bg-white p-4 shadow-lg md:right-5">
                <span className="text-2xl text-cyan-600">♧</span>
                <p className="mt-1 text-sm font-bold">Live Queue</p>
                <p className="text-xs text-slate-500">Know your token</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#f2f8ff] px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Our Features
            </p>
            <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
              Everything you need for a better healthcare experience
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              From booking appointments to tracking your queue, H-Manage makes
              healthcare simple, transparent and stress-free.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-5 font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">
              Get started in 3 simple steps
            </h2>
            <p className="mt-3 text-slate-600">
              Your health journey is just a few clicks away.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ["1", "Sign Up", "Create your account in seconds."],
                ["2", "Book Appointment", "Choose a doctor and available time slot."],
                ["3", "Visit & Get Treated", "Check your queue and meet your doctor."],
              ].map(([number, title, description], index) => (
                <div key={number}>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ${
                      index === 0
                        ? "bg-blue-600 shadow-blue-200"
                        : index === 1
                          ? "bg-violet-500 shadow-violet-200"
                          : "bg-teal-500 shadow-teal-200"
                    }`}
                  >
                    {number}
                  </div>
                  <h3 className="mt-4 text-sm font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-blue-100 to-cyan-50 p-8">
            <div className="mx-auto max-w-sm rounded-[2rem] border-[7px] border-[#173366] bg-white p-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  ♥
                </span>
                H-Manage
              </div>
              <div className="mt-5 rounded-2xl bg-blue-50 p-5 text-center">
                <p className="text-sm text-slate-500">Your Token</p>
                <p className="mt-1 text-4xl font-extrabold text-blue-700">
                  A12
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Example waiting time
                </p>
                <p className="mt-1 font-bold text-blue-700">15 minutes</p>
              </div>
              <div className="mt-5 space-y-4 text-sm">
                {["Registration", "Waiting", "Consultation"].map((item, i) => (
                  <div key={item} className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        i === 0 ? "bg-teal-500" : "bg-blue-500"
                      }`}
                    />
                    <span className="flex-1">{item}</span>
                    <span className={i === 0 ? "text-teal-600" : "text-slate-300"}>
                      {i === 0 ? "✓" : "●"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor section */}
      <section className="bg-[#f2f8ff] px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Meet Our Doctors
              </p>
              <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
                Experienced doctors, compassionate care
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Find the right specialist for your healthcare needs.
              </p>
            </div>
            <button
              onClick={goToSignup}
              className="rounded-full border border-blue-500 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              View All Doctors →
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor, index) => (
              <article
                key={doctor.name}
                className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white p-4 shadow-sm transition hover:shadow-lg"
              >
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ${
                    index % 2 === 0
                      ? "bg-blue-100 text-blue-600"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  ⚕
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">{doctor.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {doctor.specialty}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-amber-500">
                    ★ {doctor.rating}{" "}
                    <span className="font-normal text-slate-400">
                      Sample rating
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Sample doctor cards for the landing page; connect these to your
            doctors API for live data.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              What Our Patients Say
            </p>
            <h2 className="mt-3 text-2xl font-extrabold">
              Trusted by patients
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A simpler way to organize your healthcare journey.
            </p>
          </div>
          {[
            {
              quote:
                "Booking an appointment was so easy, and the queue tracking feature is helpful.",
              name: "Patient review",
            },
            {
              quote:
                "The platform is simple to use and keeps appointments organized.",
              name: "Patient review",
            },
          ].map((review, i) => (
            <article
              key={i}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
            >
              <p className="text-lg text-blue-500">“</p>
              <p className="text-sm leading-7 text-slate-600">{review.quote}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold">{review.name}</span>
                <span className="text-amber-400">★★★★★</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA and footer */}
      <section id="contact" className="bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-10 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold">
              Ready to take control of your health?
            </h2>
            <p className="mt-2 text-sm text-blue-50">
              Start organizing your appointments with H-Manage.
            </p>
          </div>
          <button
            onClick={goToSignup}
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Get Started →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;