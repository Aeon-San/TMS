import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import PasswordChecklist from "../components/PasswordChecklist.jsx";

const features = [
  { icon: "🎯", label: "Smart priorities & cleanup" },
  { icon: "📊", label: "Real-time analytics dashboard" },
  { icon: "👥", label: "Team collaboration sync" },
];

const InputField = ({ id, type, icon: Icon, iconRight, placeholder, value, onChange, required }) => {
  return (
    <div style={{ position: "relative" }}>
      {Icon && (
        <Icon size={16} style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: "var(--tf-text-subtle)", pointerEvents: "none",
        }} />
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
          borderRadius: 12, paddingLeft: Icon ? 42 : 16, paddingRight: iconRight ? 48 : 16,
          fontSize: 14, color: "var(--tf-text)", outline: "none", fontFamily: "inherit",
          transition: "border-color 0.2s, box-shadow 0.2s",
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
  );
};

const Signup = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 480);
  const { signup }              = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 480);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
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
        background: "linear-gradient(145deg, #0f0b2d, #1a1040, #0d1538)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px",
      }} className="hidden lg:flex">
        <div className="orb orb-violet animate-pulse-glow" style={{ width: 450, height: 450, top: "-100px", right: "-100px" }} />
        <div className="orb orb-cyan" style={{ width: 250, height: 250, bottom: "-40px", left: "-40px", opacity: 0.5 }} />
        <div className="orb orb-indigo" style={{ width: 200, height: 200, top: "40%", left: "10%", opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: "-0.03em" }}>TaskFlow Pro</span>
          </Link>

          <div style={{
            display: "inline-block", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(208,188,255,0.2)",
            borderRadius: 40, padding: "6px 16px", fontSize: 12, fontWeight: 700,
            color: "#d0bcff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20,
          }}>✦ Join 10K+ teams</div>

          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, color: "white" }}>
            Start your<br />
            <span style={{ background: "linear-gradient(135deg,#d0bcff,#4cd7f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              focused journey.
            </span>
          </h2>
          <p style={{ color: "rgba(199,196,215,0.7)", lineHeight: 1.7, marginBottom: 40, fontSize: 15 }}>
            Create your account and manage tasks with a workspace that feels as clean as your thinking.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f) => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(30,30,47,0.5)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(196,193,255,0.1)", borderRadius: 14, padding: "14px 16px",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>{f.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 14, color: "rgba(227,224,248,0.85)" }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["🎨","💻","🚀","📊"].map((emoji, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: "50%", background: `hsl(${240 + i * 30}, 60%, 30%)`,
                  border: "2px solid rgba(30,30,47,0.8)", marginLeft: i ? -8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>{emoji}</div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "rgba(199,196,215,0.6)" }}>Join 10,000+ focused teams</span>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: isCompact ? "30px 14px" : "48px 24px", overflowY: "auto",
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

          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-block", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 40, padding: "4px 14px", fontSize: 11, fontWeight: 700,
              color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
            }}>✦ Create Account</div>
            <h1 style={{ fontSize: isCompact ? 26 : 30, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>
              Join TaskFlow Pro
            </h1>
            <p style={{ color: "var(--tf-text-muted)", fontSize: 14 }}>
              Start managing tasks beautifully — no credit card needed.
            </p>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text-muted)", display: "block", marginBottom: 6 }}>
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tf-text-subtle)", pointerEvents: "none" }} />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, paddingLeft: 42, paddingRight: 16, fontSize: 14,
                    color: "var(--tf-text)", outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tf-border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text-muted)", display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tf-text-subtle)", pointerEvents: "none" }} />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, paddingLeft: 42, paddingRight: 16, fontSize: 14,
                    color: "var(--tf-text)", outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tf-border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--tf-text-muted)", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tf-text-subtle)", pointerEvents: "none" }} />
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", height: 48, background: "var(--tf-bg)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, paddingLeft: 42, paddingRight: 48, fontSize: 14,
                    color: "var(--tf-text)", outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tf-border)"; e.target.style.boxShadow = "none"; }}
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

              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[8, 16, 24, 32].map((threshold, i) => {
                      const strength = [
                        password.length >= 8,
                        /[A-Z]/.test(password),
                        /[a-z]/.test(password),
                        /\d/.test(password),
                      ][i];
                      return (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 4,
                          background: strength
                            ? i < 2 ? "#f43f5e" : i < 3 ? "#f59e0b" : "#10b981"
                            : "var(--tf-surface-high)",
                          transition: "background 0.3s",
                        }} />
                      );
                    })}
                  </div>
                  <PasswordChecklist password={password} />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-glow"
              style={{
                width: "100%", height: 48, borderRadius: 12, fontSize: 15, fontWeight: 700,
                border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "white",
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <div className="tf-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--tf-border)" }} />
              <span style={{ fontSize: 12, color: "var(--tf-text-subtle)", fontWeight: 500 }}>Or sign up with</span>
              <div style={{ flex: 1, height: 1, background: "var(--tf-border)" }} />
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { Icon: FcGoogle, label: "Google" },
                { Icon: FaApple, label: "Apple" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    flex: isCompact ? "1 1 100%" : 1, height: 44, background: "var(--tf-surface-mid)", border: "1px solid var(--tf-border)",
                    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--tf-text)", transition: "all 0.2s", fontSize: 13,
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

            <p style={{ textAlign: "center", fontSize: 14, color: "var(--tf-text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: 700, color: "#818cf8", textDecoration: "none" }}>
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
