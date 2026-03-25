import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiClock } from "react-icons/fi";

const startOfMonthGrid = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return start;
};

const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDayKey = (date) => date.toISOString().split("T")[0];

const priorityAccent = {
  High: "bg-[#ff7b86]",
  Medium: "bg-[#ffb86b]",
  Low: "bg-[#5ec7a1]",
};

const TaskCalendar = ({ tasks, onTaskClick, onReschedule, darkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const monthGrid = useMemo(() => {
    const start = startOfMonthGrid(currentMonth);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [currentMonth]);

  const tasksByDay = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dueDate = new Date(task.dueDate);
      if (Number.isNaN(dueDate.getTime())) return;
      const key = formatDayKey(dueDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    });
    return map;
  }, [tasks]);

  const selectedDayTasks = tasksByDay.get(formatDayKey(selectedDate)) || [];

  const handleDrop = (event, date) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = tasks.find((item) => item._id === taskId);
    if (!task) return;

    const updatedDate = new Date(date);
    if (task.dueDate) {
      const previous = new Date(task.dueDate);
      updatedDate.setHours(previous.getHours(), previous.getMinutes(), 0, 0);
    } else {
      updatedDate.setHours(10, 0, 0, 0);
    }

    onReschedule?.(task, updatedDate);
  };

  return (
    <div className={darkMode ? "rounded-[30px] border border-white/8 bg-white/5 p-5 shadow-sm" : "rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm"}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className={darkMode ? "text-2xl font-bold text-white" : "text-2xl font-bold text-slate-900"}>
            Calendar View
          </h3>
          <p className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            Drag tasks onto a date to reschedule them.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className={darkMode ? "rounded-2xl bg-white/8 p-3 text-slate-200 hover:bg-white/12" : "rounded-2xl bg-[#fff3f6] p-3 text-slate-700 hover:bg-[#ffe4eb]"}
          >
            <FiChevronLeft />
          </button>
          <div className={darkMode ? "min-w-[220px] text-center text-lg font-semibold text-white" : "min-w-[220px] text-center text-lg font-semibold text-slate-900"}>
            {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className={darkMode ? "rounded-2xl bg-white/8 p-3 text-slate-200 hover:bg-white/12" : "rounded-2xl bg-[#fff3f6] p-3 text-slate-700 hover:bg-[#ffe4eb]"}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={darkMode ? "px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" : "px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"}>
            {day}
          </div>
        ))}

        {monthGrid.map((date) => {
          const key = formatDayKey(date);
          const dayTasks = tasksByDay.get(key) || [];
          const inCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isSelected = sameDay(date, selectedDate);
          const isToday = sameDay(date, new Date());

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(date)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, date)}
              className={`min-h-[140px] rounded-[24px] border p-3 text-left align-top transition ${
                darkMode
                  ? `${isSelected ? "border-[#ff7b86] bg-[#241a2a]" : "border-white/8 bg-white/5"} ${!inCurrentMonth ? "opacity-45" : ""}`
                  : `${isSelected ? "border-[#ff7b86] bg-[#fff0f4]" : "border-[#f3d1da] bg-white"} ${!inCurrentMonth ? "opacity-50" : ""}`
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {date.getDate()}
                </span>
                {isToday ? (
                  <span className="rounded-full bg-[#ff7b86] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    Today
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("taskId", task._id)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onTaskClick?.(task);
                    }}
                    className={`rounded-2xl px-3 py-2 text-xs text-white shadow-sm ${priorityAccent[task.priority] || "bg-[#ff7b86]"}`}
                  >
                    <div className="truncate font-semibold">{task.taskName}</div>
                    {task.dueDate ? (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
                        <FiClock />
                        {new Date(task.dueDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    ) : null}
                  </div>
                ))}
                {dayTasks.length > 3 ? (
                  <div className={darkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                    +{dayTasks.length - 3} more
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className={darkMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900"}>
            Tasks for {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h4>
          <span className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            {selectedDayTasks.length} task{selectedDayTasks.length === 1 ? "" : "s"}
          </span>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className={darkMode ? "rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400" : "rounded-2xl border border-dashed border-[#f2c2cd] bg-[#fff8fa] p-6 text-sm text-slate-500"}>
            No tasks scheduled for this date.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedDayTasks.map((task) => (
              <button
                key={task._id}
                type="button"
                onClick={() => onTaskClick?.(task)}
                className={darkMode ? "rounded-2xl border border-white/8 bg-white/5 p-4 text-left hover:bg-white/8" : "rounded-2xl border border-[#f2d4db] bg-white p-4 text-left hover:bg-[#fff8fa]"}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={darkMode ? "font-semibold text-white" : "font-semibold text-slate-900"}>{task.taskName}</span>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold text-white ${priorityAccent[task.priority] || "bg-[#ff7b86]"}`}>
                    {task.priority}
                  </span>
                </div>
                <div className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
                  {task.description || "No description"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
