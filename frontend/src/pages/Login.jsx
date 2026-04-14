import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const floatingCards = [
  { title: "Launch redesign 🚀", priority: "High", pct: 78, color: "#f43f5e" },
  { title: "Write documentation 📝", priority: "Med",  pct: 50, color: "#f59e0b" },
  { title: "Review PRs ✅", priority: "Low",  pct: 95, color: "#4cd7f6" },
];

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 480);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 480);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--tf-surface)" }}>
      {/* ─── Left Branding Panel ─── */}
      <div style={{
        width: "42%", position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #1a1040, #0f0b2d, #1a1645)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px",
      }} className="hidden lg:flex">
        {/* Orbs */}
        <div className="orb orb-indigo animate-pulse-glow" style={{ width: 400, height: 400, top: "-100px", left: "-80px" }} />
        <div className="orb orb-violet" style={{ width: 300, height: 300, bottom: "-60px", right: "-60px", opacity: 0.6 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: "-0.03em" }}>TaskFlow Pro</span>
          </Link>

          <div style={{
            display: "inline-block", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(196,193,255,0.2)",
            borderRadius: 40, padding: "6px 16px", fontSize: 12, fontWeight: 700,
            color: "#c0c1ff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20,
          }}>✦ Welcome back</div>

          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, color: "white" }}>
            Your Tasks,<br />
            <span style={{ background: "linear-gradient(135deg,#c0c1ff,#4cd7f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Way.
            </span>
          </h2>
          <p style={{ color: "rgba(199,196,215,0.7)", lineHeight: 1.7, marginBottom: 40, fontSize: 15 }}>
            Sign in to your premium workspace and keep the momentum going.
          </p>

          {/* Floating task cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {floatingCards.map((card, i) => (
              <div
                key={card.title}
                style={{
                  background: "rgba(30,30,47,0.7)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(196,193,255,0.1)", borderRadius: 14, padding: "14px 16px",
                  transform: `translateX(${i % 2 === 0 ? 0 : 12}px)`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "rgba(227,224,248,0.9)" }}>{card.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: `${card.color}22`, color: card.color, border: `1px solid ${card.color}33`,
                  }}>{card.priority}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${card.pct}%`, background: `linear-gradient(90deg,#6366f1,${card.color})`, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Stat pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
            {[["🔥", "14-day streak"], ["✅", "98% uptime"], ["👥", "10K+ teams"]].map(([icon, label]) => (
              <div key={label} style={{
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(196,193,255,0.12)",
                borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#c0c1ff",
              }}>{icon} {label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: isCompact ? "30px 14px" : "48px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Mobile logo */}
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 32 }} className="lg:hidden">
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em", color: "var(--tf-text)" }}>TaskFlow Pro</span>
          </Link>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: isCompact ? 28 : 32, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Sign in
            </h1>
            <p style={{ color: "var(--tf-text-muted)", fontSize: 14 }}>
              Continue managing your work with focus and clarity.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text-muted)", display: "block", marginBottom: 8 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tf-text-subtle)" }} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, paddingLeft: 42, paddingRight: 16, fontSize: 14, color: "var(--tf-text)",
                    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(99,102,241,0.6)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--tf-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text-muted)", display: "block", marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tf-text-subtle)" }} />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, paddingLeft: 42, paddingRight: 48, fontSize: 14, color: "var(--tf-text)",
                    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(99,102,241,0.6)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--tf-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--tf-text-subtle)", cursor: "pointer", padding: 4,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginTop: -4 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: "#818cf8", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-glow"
              style={{
                width: "100%", height: 48, borderRadius: 12, fontSize: 15, fontWeight: 700,
                border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "white",
              }}
            >
              {loading ? (
                <>
                  <div className="tf-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : "Log In →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--tf-border)" }} />
              <span style={{ fontSize: 12, color: "var(--tf-text-subtle)", fontWeight: 500 }}>Or continue with</span>
              <div style={{ flex: 1, height: 1, background: "var(--tf-border)" }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { Icon: FcGoogle, label: "Google" },
                { Icon: FaFacebookF, label: "Facebook", color: "#1877f2" },
                { Icon: FaApple, label: "Apple" },
              ].map(({ Icon, label, color }) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    flex: isCompact ? "1 1 100%" : 1, height: 46, background: "var(--tf-surface-mid)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: color || "var(--tf-text)", transition: "all 0.2s", fontSize: 13,
                    fontWeight: 600, gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--tf-surface-high)";
                    e.currentTarget.style.borderColor = "var(--tf-border-hover)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--tf-surface-mid)";
                    e.currentTarget.style.borderColor = "var(--tf-border)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            {/* Sign Up Link */}
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--tf-text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link to="/signup" style={{ fontWeight: 700, color: "#818cf8", textDecoration: "none" }}>
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
