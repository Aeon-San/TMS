import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const stats = [
  { value: "10K+", label: "Active users" },
  { value: "100K+", label: "Tasks completed" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  {
    icon: "🗂️",
    title: "Clean task organization",
    desc: "Create boards, lists and cards. Organize everything effortlessly.",
    color: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    icon: "🎯",
    title: "Smart priorities & deadlines",
    desc: "Assign High/Medium/Low priorities. Never miss a deadline again.",
    color: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: "👥",
    title: "Team-friendly workflow",
    desc: "Collaborate in real-time. Assign tasks, leave comments, track progress.",
    color: "rgba(6,182,212,0.10)",
    border: "rgba(6,182,212,0.18)",
  },
  {
    icon: "📊",
    title: "Real-time progress tracking",
    desc: "Detailed analytics, Pomodoro timer, and AI-powered suggestions.",
    color: "rgba(244,63,94,0.10)",
    border: "rgba(244,63,94,0.18)",
  },
];

const benefits = [
  {
    tag: "Focus",
    title: "Less noise, more action",
    desc: "Keep the experience calm and remove distractions from the first screen.",
    dark: true,
  },
  {
    tag: "Speed",
    title: "Quick to scan",
    desc: "The layout mirrors a premium dashboard with a strong hierarchy and easy-to-read sections.",
    dark: false,
  },
  {
    tag: "Clarity",
    title: "Designed to feel premium",
    desc: "Deep indigo surfaces, smooth gradients, and glassmorphism that sets the mood.",
    dark: false,
  },
];

const taskItems = [
  { name: "Finish project proposal", priority: "High", pct: 78 },
  { name: "Review team updates",     priority: "Med",  pct: 45 },
  { name: "Deploy to production",    priority: "Low",  pct: 20 },
];

const priorityColor = { High: "#f43f5e", Med: "#f59e0b", Low: "#4cd7f6" };

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth < 1024;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ background: "var(--tf-surface)", color: "var(--tf-text)", minHeight: "100vh" }}>
      {/* ─── Gradient Orbs ─── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div className="orb orb-indigo animate-pulse-glow" style={{ width: 600, height: 600, top: "-200px", left: "-150px" }} />
        <div className="orb orb-violet" style={{ width: 400, height: 400, top: "40%", right: "-100px", opacity: 0.5 }} />
        <div className="orb orb-cyan" style={{ width: 300, height: 300, bottom: "20%", left: "30%" }} />
      </div>

      {/* ─── Navbar ─── */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: scrolled ? "rgba(18,18,34,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--tf-border)" : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 14px" : "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em", color: "var(--tf-text)" }}>
              TaskFlow <span style={{ background: "linear-gradient(135deg,#6366f1,#4cd7f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {["Features", "Benefits", "Get Started"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                style={{ color: "var(--tf-text-muted)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "var(--tf-primary)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--tf-text-muted)")}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link to="/login" style={{
              padding: isMobile ? "8px 12px" : "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: "rgba(196,193,255,0.08)", color: "var(--tf-primary)",
              border: "1px solid rgba(196,193,255,0.15)", textDecoration: "none",
              transition: "all 0.2s",
            }}>Login</Link>
            <Link to="/signup" className="btn-glow" style={{
              padding: isMobile ? "8px 12px" : "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              textDecoration: "none", color: "white",
            }}>Get Started</Link>
          </div>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* ─── Hero Section ─── */}
        <section className="mobile-anim-in" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "38px 14px 38px" : "80px 24px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 60, alignItems: "center" }}>
            {/* Left: Text */}
            <div className="animate-slide-up">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 40, padding: "6px 16px", fontSize: 12, fontWeight: 700,
                color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 24,
              }}>
                <span style={{ color: "#4cd7f6" }}>✦</span> Premium Task Management
              </div>

              <h1 style={{
                fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900,
                lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20,
              }}>
                Manage Tasks.{" "}
                <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Ship Faster.
                </span>{" "}
                Stay Focused.
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--tf-text-muted)", maxWidth: 480, marginBottom: 36 }}>
                Keep every task, deadline, and team update in one calm workspace.
                The layout stays focused, beautiful, and easy to use every day.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
                <Link to="/signup" className="btn-glow" style={{
                  padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                  textDecoration: "none", color: "white",
                }}>
                  Start for Free →
                </Link>
                <a href="#features" style={{
                  padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: "rgba(196,193,255,0.06)", border: "1px solid var(--tf-border)",
                  color: "var(--tf-text-muted)", textDecoration: "none", transition: "all 0.2s",
                }}>
                  Explore Features
                </a>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
                {stats.map((s) => (
                  <div key={s.label} style={{
                    background: "var(--tf-surface-mid)", border: "1px solid var(--tf-border)",
                    borderRadius: 16, padding: "16px",
                  }}>
                    <div style={{
                      fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em",
                      background: "linear-gradient(135deg,#c0c1ff,#4cd7f6)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--tf-text-subtle)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard Preview Card */}
            <div style={{ position: "relative" }}>
              <div className="animate-float" style={{
                background: "rgba(18,18,34,0.9)", border: "1px solid var(--tf-border)",
                borderRadius: 24, padding: isMobile ? 16 : 24, boxShadow: "var(--tf-shadow-elevated)",
                backdropFilter: "blur(16px)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--tf-text-subtle)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Today's Workspace</div>
                    <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>Your Board</div>
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                  }}>7 tasks</div>
                </div>

                {/* Tasks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {taskItems.map((task) => (
                    <div key={task.name} style={{
                      background: "var(--tf-surface-low)", borderRadius: 14, padding: 14,
                      border: "1px solid var(--tf-border)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text)" }}>{task.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
                          background: `${priorityColor[task.priority]}22`,
                          color: priorityColor[task.priority],
                          border: `1px solid ${priorityColor[task.priority]}44`,
                        }}>{task.priority}</span>
                      </div>
                      <div style={{ height: 5, background: "var(--tf-surface-high)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${task.pct}%`, borderRadius: 10,
                          background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                          transition: "width 0.6s",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--tf-text-subtle)", marginTop: 5, textAlign: "right" }}>{task.pct}% complete</div>
                    </div>
                  ))}
                </div>

                {/* Weekly Chart */}
                <div style={{ marginTop: 16, background: "var(--tf-surface-low)", borderRadius: 14, padding: 14, border: "1px solid var(--tf-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--tf-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Weekly progress</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>On Track</div>
                    </div>
                    <div style={{
                      background: "rgba(76,215,246,0.12)", color: "#4cd7f6",
                      border: "1px solid rgba(76,215,246,0.2)", borderRadius: 8,
                      padding: "3px 10px", fontSize: 11, fontWeight: 700,
                    }}>+12% this week</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 50 }}>
                    {[35, 52, 45, 76, 58, 90, 68].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: "linear-gradient(180deg,#8083ff,#6366f1)", borderRadius: "6px 6px 0 0", height: `${h}%`, opacity: i === 5 ? 1 : 0.5 }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating accent pills */}
              {!isMobile ? (
              <div style={{
                position: "absolute", top: -16, right: -16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: 12, padding: "10px 16px", fontSize: 12, fontWeight: 700,
                boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>Focus streak</div>
                <div style={{ color: "white", fontWeight: 800 }}>14 days 🔥</div>
              </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Focus Beam */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div className="focus-beam" />
        </div>

        {/* ─── Features ─── */}
        <section id="features" className="mobile-anim-in mobile-anim-delay-1" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "48px 14px" : "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.2em", color: "#818cf8", marginBottom: 12,
            }}>FEATURES</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-0.03em" }}>
              Simple design,{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#4cd7f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                powerful workflow
              </span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {features.map((f) => (
              <div
                key={f.title}
                className="tf-card-interactive"
                style={{
                  background: f.color, border: `1px solid ${f.border}`,
                  borderRadius: 20, padding: 28,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--tf-text)" }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "var(--tf-text-muted)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Benefits ─── */}
        <section id="benefits" className="mobile-anim-in mobile-anim-delay-2" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 14px 48px" : "0 24px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {benefits.map((b) => (
              <div
                key={b.title}
                style={{
                  background: b.dark ? "linear-gradient(135deg,#1e1e4a,#28183a)" : "var(--tf-surface-mid)",
                  border: "1px solid var(--tf-border)",
                  borderRadius: 22, padding: 32,
                  boxShadow: b.dark ? "var(--tf-glow-sm)" : "none",
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.2em", color: b.dark ? "#c0c1ff" : "#818cf8",
                  marginBottom: 12,
                }}>{b.tag}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10, color: "var(--tf-text)" }}>
                  {b.title}
                </h3>
                <p style={{ color: b.dark ? "rgba(199,196,215,0.8)" : "var(--tf-text-muted)", lineHeight: 1.7, fontSize: 14 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section id="get-started" className="mobile-anim-pop mobile-anim-delay-3" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 14px 48px" : "0 24px 80px" }}>
          <div style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.10),rgba(6,182,212,0.08))",
            border: "1px solid rgba(99,102,241,0.2)", borderRadius: 28, padding: isMobile ? "36px 18px" : "60px 40px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            {/* Background orbs */}
            <div className="orb orb-indigo animate-pulse-glow" style={{ width: 300, height: 300, top: "-80px", left: "10%", zIndex: 0 }} />
            <div className="orb orb-violet" style={{ width: 200, height: 200, bottom: "-50px", right: "15%", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
                Ready to get{" "}
                <span style={{ background: "linear-gradient(135deg,#6366f1,#4cd7f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  organized?
                </span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--tf-text-muted)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Start with a clean workspace that feels simple, modern, and easy to use every day.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/signup" className="btn-glow" style={{
                  padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                  textDecoration: "none", color: "white",
                }}>
                  Sign Up Free
                </Link>
                <Link to="/login" style={{
                  padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: "rgba(196,193,255,0.06)", border: "1px solid var(--tf-border)",
                  color: "var(--tf-text-muted)", textDecoration: "none",
                }}>
                  Login →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: "1px solid var(--tf-border)",
        padding: "24px",
        textAlign: "center",
        color: "var(--tf-text-subtle)",
        fontSize: 13,
      }}>
        © 2026 TaskFlow Pro. Made with ❤️ by Sanjib.
      </footer>
    </div>
  );
};

export default Home;
