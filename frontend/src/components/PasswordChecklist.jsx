const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (v) => String(v || "").length >= 8 },
  { key: "upper",  label: "One uppercase letter",  test: (v) => /[A-Z]/.test(String(v || "")) },
  { key: "lower",  label: "One lowercase letter",  test: (v) => /[a-z]/.test(String(v || "")) },
  { key: "number", label: "One number",            test: (v) => /\d/.test(String(v || "")) },
];

const PasswordChecklist = ({ password }) => {
  const results     = passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) }));
  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div style={{
      background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
      borderRadius: 12, padding: 12,
    }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tf-text-muted)" }}>
          {passedCount === results.length ? "🔒 Strong password" : `Password strength — ${passedCount}/${results.length}`}
        </div>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {results.map((rule) => (
          <li key={rule.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
              background: rule.passed ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
              color: rule.passed ? "#10b981" : "var(--tf-text-subtle)",
              transition: "all 0.25s",
            }}>
              {rule.passed ? "✓" : "·"}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: rule.passed ? "var(--tf-text)" : "var(--tf-text-subtle)",
              transition: "color 0.25s",
            }}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordChecklist;
