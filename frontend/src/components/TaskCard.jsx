import React, { useState } from "react";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { FaCalendarAlt, FaFlag } from "react-icons/fa";
import taskApi from "../library/taskApi";

const TaskCard = ({ task, onUpdate, onSelect, onEdit, onDelete, darkMode }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  if (!task?._id) return null;

  const statusButtonClass =
    task.taskStatus === "Completed"
      ? "bg-[#2f66dd] text-white"
      : task.taskStatus === "In Progress"
        ? "bg-[#2f3f5a] text-white"
        : "bg-[#94a3b8] text-white";

  const progressWidth =
    task.taskStatus === "Completed" ? "100%" : task.taskStatus === "In Progress" ? "62%" : "24%";

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      let nextStatus = "In Progress";
      if (task.taskStatus === "In Progress") nextStatus = "Completed";
      if (task.taskStatus === "Completed") nextStatus = "Pending";
      const response = await taskApi.patch(`/${task._id}/status`, { status: nextStatus });
      onUpdate?.(response.data);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`tap-bounce press-micro rounded-[20px] border p-4 transition ${
        darkMode
          ? "border-indigo-300/15 bg-[#1b2742] text-[#e6ecff]"
          : "border-[#dbe4f3] bg-[#e7ebf3] text-slate-800"
      }`}
      onClick={() => onSelect?.(task) || onEdit?.(task)}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
          <FaFlag size={10} />
          {task.priority || "Low"}
        </p>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-200"
            aria-label="Edit task"
          >
            <MdOutlineEdit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task._id);
            }}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-200"
            aria-label="Delete task"
          >
            <MdOutlineDelete size={14} />
          </button>
        </div>
      </div>

      <h3 className={`max-h-12 overflow-y-auto pr-1 text-[17px] font-bold leading-tight ${darkMode ? "text-[#e6ecff]" : "text-slate-800"}`}>
        {task.taskName}
      </h3>
      {task.description ? (
        <p className={`mt-1 line-clamp-2 text-sm ${darkMode ? "text-[#aebde0]" : "text-slate-600"}`}>
          {task.description}
        </p>
      ) : null}
      {task.dueDate ? (
        <p className={`mt-2 flex items-center gap-1.5 text-[12px] ${darkMode ? "text-[#9fb0d4]" : "text-slate-500"}`}>
          <FaCalendarAlt size={11} />
          Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      ) : null}

      <button
        onClick={handleStatusToggle}
        disabled={isUpdating}
        className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold ${statusButtonClass}`}
      >
        {isUpdating ? "Updating..." : task.taskStatus}
      </button>

      <div className={`mt-3 h-1.5 rounded-full ${darkMode ? "bg-white/10" : "bg-[#cfd7e6]"}`}>
        <div className="h-full rounded-full bg-[#2f66dd] transition-all duration-500" style={{ width: progressWidth }} />
      </div>

      <div className={`mt-3 space-y-1 text-center text-[11px] ${darkMode ? "text-[#8ea0cf]" : "text-[#7689ac]"}`}>
        <div>Created: {formatDateTime(task.createdAt)}</div>
        {task.updatedAt && task.updatedAt !== task.createdAt ? (
          <div>Updated: {formatDateTime(task.updatedAt)}</div>
        ) : null}
      </div>
    </div>
  );
};

export default TaskCard;
