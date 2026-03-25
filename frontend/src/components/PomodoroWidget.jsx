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
    ? "rounded-[28px] border border-white/8 bg-white/5 p-5 shadow-sm"
    : "rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";
  const titleText = darkMode ? "text-white" : "text-slate-900";

  return (
    <div className={shellClass}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-bold ${titleText}`}>Pomodoro Focus</h3>
          <p className={`text-sm ${mutedText}`}>25 min focus, 5 min break to keep momentum high.</p>
        </div>
        <div className={darkMode ? "rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-300" : "rounded-2xl bg-[#fff3f6] px-3 py-2 text-sm text-slate-600"}>
          {sessionCount} sessions
        </div>
      </div>

      <div className={darkMode ? "rounded-[24px] border border-white/8 bg-[#140f18] p-5" : "rounded-[24px] border border-[#f3d2db] bg-[#fff9fa] p-5"}>
        <div className="mb-3 flex items-center justify-between">
          <span className={`text-sm font-medium uppercase tracking-[0.24em] ${mutedText}`}>
            {mode === "focus" ? "Focus Session" : "Break Time"}
          </span>
          <span className={`text-sm ${mutedText}`}>
            {activeTaskName ? `Now focusing: ${activeTaskName}` : "Pick a task to focus"}
          </span>
        </div>

        <div className={`mb-4 text-center text-5xl font-black ${titleText}`}>
          {formatTime(timeLeft)}
        </div>

        <div className={darkMode ? "mb-5 h-3 rounded-full bg-white/8" : "mb-5 h-3 rounded-full bg-[#ffe2e9]"}>
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#ffb7c4_0%,#ff7b86_100%)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            className="rounded-2xl bg-[#ff7b86] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,123,134,0.28)] transition hover:bg-[#ff6a77]"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className={darkMode ? "rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/12" : "rounded-2xl bg-[#fff3f6] px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#ffe4eb]"}
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
            className={darkMode ? "rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/12" : "rounded-2xl bg-[#fff3f6] px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#ffe4eb]"}
          >
            Switch to {mode === "focus" ? "Break" : "Focus"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroWidget;
