import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const formatTime = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const PomodoroWidget = ({ darkMode, activeTaskName }) => {
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(() => Number(localStorage.getItem("pomodoro-sessions") || 0));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          const nextMode = mode === "focus" ? "break" : "focus";

          if (mode === "focus") {
            const updatedCount = sessionCount + 1;
            setSessionCount(updatedCount);
            localStorage.setItem("pomodoro-sessions", String(updatedCount));
            toast.success("Focus session complete. Time for a short break.");
          } else {
            toast("Break finished. Ready for your next focus sprint.");
          }

          setMode(nextMode);
          setIsRunning(false);
          return nextMode === "focus" ? WORK_DURATION : BREAK_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, sessionCount]);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? WORK_DURATION : BREAK_DURATION);
  };

  const progress = useMemo(() => {
    const total = mode === "focus" ? WORK_DURATION : BREAK_DURATION;
    return ((total - timeLeft) / total) * 100;
  }, [mode, timeLeft]);

  const shellClass = darkMode
    ? "mx-auto w-full max-w-[220px] min-w-0 rounded-[26px] border border-white/10 bg-[#131d31] p-4 sm:max-w-[252px] sm:p-5 shadow-[0_14px_38px_rgba(0,0,0,0.34)]"
    : "mx-auto w-full max-w-[220px] min-w-0 rounded-[26px] border border-[#d9e1ef] bg-[#eef2f8] p-4 sm:max-w-[252px] sm:p-5 shadow-[0_10px_30px_rgba(81,107,148,0.15)]";
  const mutedText = darkMode ? "text-slate-400" : "text-[#6f7d91]";
  const titleText = darkMode ? "text-white" : "text-[#0f2140]";

  return (
    <div className={`${shellClass} min-w-0`}>
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-2.5 sm:gap-3">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs sm:tracking-[0.34em] ${mutedText}`}>
          {mode === "focus" ? "Focus Session" : "Break Time"}
        </span>
        <span
          className={`text-right text-xs leading-[1.35] break-words ${mutedText}`}
          title={activeTaskName || ""}
        >
          {activeTaskName ? `Now focusing: ${activeTaskName}` : "Pick a task to focus"}
        </span>
      </div>

      <div className={`mb-5 text-center text-[clamp(2rem,14vw,3.15rem)] font-black leading-none tracking-tight tabular-nums whitespace-nowrap ${titleText}`}>
        {formatTime(timeLeft)}
      </div>

      <div className={darkMode ? "mx-auto mb-6 h-3 w-full max-w-[150px] rounded-full bg-white/10" : "mx-auto mb-6 h-3 w-full max-w-[150px] rounded-full bg-[#d8dee8]"}>
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#86a8ff_0%,#2f66dd_100%)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[150px] min-w-0 flex-col gap-3">
        <button
          type="button"
          onClick={() => setIsRunning((prev) => !prev)}
          className="w-full rounded-[16px] bg-[#2f66dd] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(47,102,221,0.3)] transition hover:bg-[#2456c2]"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className={darkMode ? "w-full rounded-[16px] bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/15" : "w-full rounded-[16px] bg-[#e9edf3] px-4 py-3 text-sm font-semibold text-[#334155] hover:bg-[#dce4ef]"}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            const nextMode = mode === "focus" ? "break" : "focus";
            setMode(nextMode);
            setIsRunning(false);
            setTimeLeft(nextMode === "focus" ? WORK_DURATION : BREAK_DURATION);
          }}
          className={darkMode ? "w-full rounded-[16px] bg-white/10 px-2 py-3 text-sm font-semibold text-slate-200 hover:bg-white/15" : "w-full rounded-[16px] bg-[#e9edf3] px-2 py-3 text-sm font-semibold text-[#334155] hover:bg-[#dce4ef]"}
        >
          <span className="hidden sm:inline">Switch to {mode === "focus" ? "Break" : "Focus"}</span>
          <span className="sm:hidden">{mode === "focus" ? "Break" : "Focus"}</span>
        </button>
      </div>

      <p className={`mt-4 text-center text-xs ${mutedText}`}>{sessionCount} sessions</p>
    </div>
  );
};

export default PomodoroWidget;
