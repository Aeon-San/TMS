const passwordRules = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value) => String(value || "").length >= 8,
  },
  {
    key: "upper",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(String(value || "")),
  },
  {
    key: "lower",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(String(value || "")),
  },
  {
    key: "number",
    label: "One number",
    test: (value) => /\d/.test(String(value || "")),
  },
];

const PasswordChecklist = ({ password }) => {
  const results = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const passedCount = results.filter((rule) => rule.passed).length;
  const progress = (passedCount / results.length) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Password checklist</h3>
          <p className="mt-1 text-xs text-slate-500">
            {passedCount === results.length
              ? "Looks strong and ready."
              : `${passedCount}/${results.length} checks passed`}
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff7a86] to-[#ff8f7a] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {results.map((rule) => (
          <li key={rule.key} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                rule.passed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {rule.passed ? "✓" : "•"}
            </span>
            <span className={rule.passed ? "text-slate-900" : "text-slate-500"}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordChecklist;
