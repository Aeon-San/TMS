const SmartSuggestions = ({ suggestions, darkMode }) => {
  const shellClass = darkMode
    ? "rounded-[28px] border border-white/8 bg-white/5 p-5 shadow-sm"
    : "rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm";
  const titleText = darkMode ? "text-white" : "text-slate-900";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={shellClass}>
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${titleText}`}>Smart Suggestions</h3>
        <p className={`text-sm ${mutedText}`}>Helpful heuristics based on your recent task patterns.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {suggestions.map((item) => (
          <div key={item.title} className={darkMode ? "rounded-2xl border border-white/8 bg-white/6 p-4" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
            <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              {item.badge}
            </div>
            <div className={`mb-2 text-lg font-bold ${titleText}`}>{item.title}</div>
            <p className={`text-sm ${mutedText}`}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
