import { Link } from "react-router-dom";

const stats = [
  { value: "10K+", label: "Active users" },
  { value: "100K+", label: "Tasks completed" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  "Clean task organization",
  "Fast priorities and deadlines",
  "Team-friendly workflow",
  "Real-time progress tracking",
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#ececec] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-950">
            TaskFlow
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Benefits
            </a>
            <a href="#cta" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Get Started
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#f5f5f5] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-6 lg:p-8">
            <div className="grid min-h-[72vh] items-center gap-10 rounded-[1.5rem] bg-white px-6 py-10 sm:px-10 lg:grid-cols-2 lg:px-14">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                  To-do list
                </div>

                <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                  Task
                  <span className="block">Management</span>
                </h1>

                <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
                  Keep every task, deadline, and team update in one calm workspace.
                  The layout stays simple, focused, and easy to use.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/signup"
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Get Started
                  </Link>
                  <a
                    href="#features"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Learn More
                  </a>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="text-2xl font-black text-slate-950">
                        {item.value}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex min-h-[420px] items-center justify-center">
                <div className="absolute left-6 top-8 h-24 w-24 rounded-full bg-sky-200/70 blur-3xl" />
                <div className="absolute bottom-8 right-2 h-28 w-28 rounded-full bg-emerald-200/70 blur-3xl" />

                <div className="relative w-full max-w-[460px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="text-sm font-medium text-slate-500">Today</div>
                      <div className="text-2xl font-black text-slate-950">Your board</div>
                    </div>
                    <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      7 tasks active
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[1.4rem] bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-500">
                          Priority
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          High
                        </span>
                      </div>
                      <p className="mt-4 text-xl font-black text-slate-950">
                        Finish project proposal
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Focus on what matters first, then move the rest with
                        confidence.
                      </p>

                      <div className="mt-5 space-y-3">
                        <div className="h-2 rounded-full bg-slate-200">
                          <div className="h-2 w-[78%] rounded-full bg-slate-900" />
                        </div>
                        <div className="text-right text-xs font-semibold text-slate-500">
                          78% complete
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[1.4rem] bg-[#eef4ff] p-4">
                        <div className="text-sm text-slate-500">Focus streak</div>
                        <div className="mt-2 text-3xl font-black text-slate-950">
                          14 days
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                        <div className="text-sm text-slate-500">Next up</div>
                        <div className="mt-2 text-lg font-bold text-slate-950">
                          Review updates
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Scheduled in 20 mins
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-500">
                          Weekly progress
                        </div>
                        <div className="mt-1 text-xl font-black text-slate-950">
                          On track
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        +12% this week
                      </div>
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-3">
                      {[35, 52, 45, 76, 58, 90, 68].map((height, index) => (
                        <div key={index} className="flex-1">
                          <div
                            className="rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
                Features
              </div>
              <h2 className="mt-3 text-4xl font-black text-slate-950">
                Simple design, powerful workflow
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                    TaskFlow
                  </div>
                  <div className="mt-3 text-lg font-bold text-slate-950">
                    {feature}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <div className="rounded-[1.8rem] bg-slate-900 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Focus
              </div>
              <h3 className="mt-3 text-2xl font-black">Less noise, more action</h3>
              <p className="mt-3 text-slate-300">
                Keep the experience calm and remove distractions from the first
                screen.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Speed
              </div>
              <h3 className="mt-3 text-2xl font-black text-slate-950">
                Quick to scan
              </h3>
              <p className="mt-3 text-slate-600">
                The layout mirrors a premium landing page with a strong hero and
                easy-to-read sections.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Clarity
              </div>
              <h3 className="mt-3 text-2xl font-black text-slate-950">
                Designed to feel premium
              </h3>
              <p className="mt-3 text-slate-600">
                Clean whites, muted grays, and one strong dark CTA keep it
                polished.
              </p>
            </div>
          </div>
        </section>

        <section id="cta" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
            <h2 className="text-4xl font-black text-slate-950">
              Ready to get organized?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Start with a clean workspace that feels simple, modern, and easy
              to use every day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
