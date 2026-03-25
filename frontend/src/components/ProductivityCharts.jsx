const buildLinePoints = (values, width, height, padding) => {
  const max = Math.max(...values, 1);
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((value / max) * (height - padding * 2));
      return `${x},${y}`;
    })
    .join(" ");
};

const PieSlice = ({ cx, cy, radius, startAngle, endAngle, color }) => {
  const start = {
    x: cx + radius * Math.cos((Math.PI / 180) * startAngle),
    y: cy + radius * Math.sin((Math.PI / 180) * startAngle),
  };
  const end = {
    x: cx + radius * Math.cos((Math.PI / 180) * endAngle),
    y: cy + radius * Math.sin((Math.PI / 180) * endAngle),
  };
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const d = [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");

  return <path d={d} fill={color} />;
};

const ProductivityCharts = ({ analytics, darkMode }) => {
  const chartShell = darkMode
    ? "rounded-[28px] border border-white/8 bg-white/5 p-5 shadow-sm"
    : "rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";
  const titleText = darkMode ? "text-white" : "text-slate-900";

  const maxDayValue = Math.max(...analytics.daySeries.map((item) => item.value), 1);
  const totalPie = analytics.statusBreakdown.reduce((sum, item) => sum + item.value, 0) || 1;

  let angleCursor = -90;
  const pieSlices = analytics.statusBreakdown.map((item) => {
    const sweep = (item.value / totalPie) * 360;
    const slice = { ...item, startAngle: angleCursor, endAngle: angleCursor + sweep };
    angleCursor += sweep;
    return slice;
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className={chartShell}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-bold ${titleText}`}>Productivity Overview</h3>
            <p className={`text-sm ${mutedText}`}>Daily completions and work rhythm across the week.</p>
          </div>
          <div className={darkMode ? "rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-300" : "rounded-2xl bg-[#fff3f6] px-3 py-2 text-sm text-slate-600"}>
            Peak hour: {analytics.peakHourLabel}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-3 flex items-end justify-between">
              <span className={`text-sm font-medium ${mutedText}`}>Completed this week</span>
              <span className={`text-2xl font-black ${titleText}`}>{analytics.weekCompleted}</span>
            </div>
            <div className="flex h-56 items-end gap-3">
              {analytics.daySeries.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className={darkMode ? "flex h-44 w-full items-end rounded-2xl bg-white/6 px-2 pb-2" : "flex h-44 w-full items-end rounded-2xl bg-[#fff6f8] px-2 pb-2"}>
                    <div
                      className="w-full rounded-2xl bg-[linear-gradient(180deg,#ffb7c4_0%,#ff7b86_100%)] transition-all duration-500"
                      style={{ height: `${(item.value / maxDayValue) * 100}%`, minHeight: item.value ? "18px" : "6px" }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${mutedText}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between">
              <span className={`text-sm font-medium ${mutedText}`}>Monthly completion trend</span>
              <span className={`text-sm ${mutedText}`}>{analytics.monthCompleted} tasks this month</span>
            </div>
            <div className={darkMode ? "rounded-[24px] border border-white/8 bg-[#140f18] p-4" : "rounded-[24px] border border-[#f3d2db] bg-[#fff9fa] p-4"}>
              <svg viewBox="0 0 320 180" className="h-56 w-full">
                <defs>
                  <linearGradient id="productivityLine" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff7b86" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffb7c4" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="url(#productivityLine)"
                  strokeWidth="4"
                  points={buildLinePoints(analytics.monthSeries.map((item) => item.value), 320, 180, 18)}
                />
                {analytics.monthSeries.map((item, index) => {
                  const width = 320;
                  const height = 180;
                  const padding = 18;
                  const stepX = (width - padding * 2) / Math.max(analytics.monthSeries.length - 1, 1);
                  const max = Math.max(...analytics.monthSeries.map((entry) => entry.value), 1);
                  const x = padding + index * stepX;
                  const y = height - padding - ((item.value / max) * (height - padding * 2));

                  return (
                    <g key={item.label}>
                      <circle cx={x} cy={y} r="4" fill="#ff7b86" />
                      <text x={x} y="172" textAnchor="middle" fontSize="11" fill={darkMode ? "#94a3b8" : "#64748b"}>
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className={chartShell}>
          <div className="mb-4">
            <h3 className={`text-xl font-bold ${titleText}`}>Status Mix</h3>
            <p className={`text-sm ${mutedText}`}>Completed vs active workload.</p>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <svg viewBox="0 0 200 200" className="h-48 w-48">
              {pieSlices.map((slice) => (
                <PieSlice
                  key={slice.label}
                  cx={100}
                  cy={100}
                  radius={82}
                  startAngle={slice.startAngle}
                  endAngle={slice.endAngle}
                  color={slice.color}
                />
              ))}
              <circle cx="100" cy="100" r="42" fill={darkMode ? "#17131c" : "#ffffff"} />
              <text x="100" y="96" textAnchor="middle" className={darkMode ? "fill-white text-[18px] font-bold" : "fill-slate-900 text-[18px] font-bold"}>
                {analytics.total}
              </text>
              <text x="100" y="116" textAnchor="middle" className={darkMode ? "fill-slate-400 text-[11px]" : "fill-slate-500 text-[11px]"}>
                Tasks
              </text>
            </svg>

            <div className="w-full space-y-3">
              {analytics.statusBreakdown.map((item) => (
                <div key={item.label} className={darkMode ? "rounded-2xl bg-white/6 p-3" : "rounded-2xl bg-[#fff7f8] p-3"}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className={`text-sm font-medium ${titleText}`}>{item.label}</span>
                    </div>
                    <span className={`text-sm ${mutedText}`}>{item.value}</span>
                  </div>
                  <div className={darkMode ? "h-2 rounded-full bg-white/8" : "h-2 rounded-full bg-[#ffe2e9]"}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / totalPie) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={chartShell}>
          <div className="mb-4">
            <h3 className={`text-xl font-bold ${titleText}`}>Insights</h3>
            <p className={`text-sm ${mutedText}`}>Best days and momentum indicators.</p>
          </div>

          <div className="grid gap-3">
            <div className={darkMode ? "rounded-2xl bg-white/6 p-4" : "rounded-2xl bg-[#fff7f8] p-4"}>
              <div className={`text-sm ${mutedText}`}>Most productive day</div>
              <div className={`mt-1 text-lg font-bold ${titleText}`}>{analytics.bestDayLabel}</div>
            </div>
            <div className={darkMode ? "rounded-2xl bg-white/6 p-4" : "rounded-2xl bg-[#fff7f8] p-4"}>
              <div className={`text-sm ${mutedText}`}>Peak working hour</div>
              <div className={`mt-1 text-lg font-bold ${titleText}`}>{analytics.peakHourLabel}</div>
            </div>
            <div className={darkMode ? "rounded-2xl bg-white/6 p-4" : "rounded-2xl bg-[#fff7f8] p-4"}>
              <div className={`text-sm ${mutedText}`}>Completion trend</div>
              <div className={`mt-1 text-lg font-bold ${titleText}`}>{analytics.completionRate}% done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityCharts;
