import React, { useState } from "react";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { FaFlag, FaCalendarAlt } from "react-icons/fa";
import taskApi from "../library/taskApi";

const TaskCard = ({ task, onUpdate, onSelect, onEdit, onDelete, onStatusChange, darkMode }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const data = task || {};

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-rose-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-emerald-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-[#2563eb]";
      case "In Progress":
        return "bg-slate-700";
      case "Pending":
        return "bg-slate-400";
      default:
        return "bg-slate-500";
    }
  };

  const getCompletionWidth = (status) => {
    switch (status) {
      case "Completed":
        return "100%";
      case "In Progress":
        return "62%";
      default:
        return "24%";
    }
  };

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      let nextStatus = "In Progress";
      if (data.taskStatus === "Pending") nextStatus = "In Progress";
      else if (data.taskStatus === "In Progress") nextStatus = "Completed";
      else if (data.taskStatus === "Completed") nextStatus = "Pending";

      const response = await taskApi.patch(`/${data._id}/status`, { status: nextStatus });
      if (onStatusChange) onStatusChange(response.data);
      else if (onUpdate) onUpdate(response.data);
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = () => {
    if (!data?.dueDate || data.taskStatus === "Completed") return false;
    return new Date(data.dueDate) < new Date();
  };

  const handleCardClick = () => {
    if (onSelect) onSelect(data);
    else if (onEdit) onEdit(data);
  };

  if (!data?._id) return null;

  const lightCardClass = data.taskStatus === "Completed"
    ? "border-blue-200 bg-blue-50"
    : isOverdue()
      ? "border-rose-200 bg-rose-50"
      : "border-slate-200 bg-white";

  return (
    <div
      className={`mx-auto mb-4 w-full max-w-md cursor-pointer rounded-[24px] border p-4 transition-all duration-200 hover:scale-[1.02] ${
        darkMode
          ? `shadow-[0_12px_30px_rgba(0,0,0,0.28)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.34)] ${
              data.taskStatus === "Completed" ? "border-blue-400/20 bg-[#0f172a]" :
              isOverdue() ? "border-rose-400/20 bg-[#1f172a]" : "border-white/8 bg-[#17131c]"
            }`
          : `shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] ${lightCardClass}`
      }`}
      onClick={handleCardClick}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FaFlag className={`${getPriorityColor(data.priority)} text-sm`} />
          <span className={darkMode ? "text-xs font-medium uppercase tracking-wide text-slate-400" : "text-xs font-medium uppercase tracking-wide text-slate-500"}>
            {data.priority}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(data);
              else if (onSelect) onSelect(data);
            }}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
            title="Edit task"
          >
            <MdOutlineEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(data._id);
            }}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Delete task"
          >
            <MdOutlineDelete size={18} />
          </button>
        </div>
      </div>

      <h3 className={`mb-2 text-lg font-semibold ${
        data.taskStatus === "Completed"
          ? "line-through text-gray-500"
          : darkMode
            ? "text-slate-100"
            : "text-slate-950"
      }`}>
        {data.taskName}
      </h3>

      {data.description && (
        <p className={darkMode ? "mb-3 line-clamp-2 text-sm text-slate-400" : "mb-3 line-clamp-2 text-sm text-slate-600"}>
          {data.description}
        </p>
      )}

      {data.dueDate && (
        <div className={`mb-3 flex items-center gap-2 text-sm ${isOverdue() ? "text-rose-500" : darkMode ? "text-slate-400" : "text-slate-500"}`}>
          <FaCalendarAlt size={14} />
          <span className={isOverdue() ? "font-medium" : ""}>
            Due: {formatDate(data.dueDate)}
            {isOverdue() && " (Overdue)"}
          </span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {data.category && data.category !== "General" ? (
          <span className={darkMode ? "rounded-full bg-white/8 px-2 py-1 text-xs text-slate-300" : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"}>
            {data.category}
          </span>
        ) : null}
        {Array.isArray(data.tags) && data.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className={darkMode ? "rounded-full bg-[#2b2133] px-2 py-1 text-xs text-[#bfdbfe]" : "rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"}
          >
            #{tag}
          </span>
        ))}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStatusToggle();
        }}
        disabled={isUpdating}
        className={`w-full rounded-xl px-4 py-2 font-medium text-white transition-all duration-200 ${getStatusColor(data.taskStatus)} hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isUpdating ? "Updating..." : data.taskStatus}
      </button>

      <div className={darkMode ? "mt-3 h-2 rounded-full bg-white/8" : "mt-3 h-2 rounded-full bg-slate-100"}>
        <div
          className="h-full rounded-full bg-[#2563eb] transition-all duration-500"
          style={{ width: getCompletionWidth(data.taskStatus) }}
        />
      </div>

      {data.assignedTo?.length ? (
        <div className="mt-3">
          <div className="mb-2 text-xs text-slate-500">Assigned to:</div>
          <div className="flex flex-wrap gap-1">
            {data.assignedTo.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                title={user.name}
              >
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563eb] text-xs text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-16 truncate">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={darkMode ? "mt-3 space-y-1 text-center text-xs text-slate-500" : "mt-3 space-y-1 text-center text-xs text-slate-500"}>
        <div>Created: {formatDateTime(data.createdAt)}</div>
        {data.updatedAt !== data.createdAt && <div>Updated: {formatDateTime(data.updatedAt)}</div>}
      </div>
    </div>
  );
};

export default TaskCard;
