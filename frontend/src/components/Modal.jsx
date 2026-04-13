import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import taskApi from "../library/taskApi.js";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Modal = ({ isOpen, onClose, taskData, isUpdate, reload }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      priority: "Medium",
      taskStatus: "Pending",
      dueDate: null,
      category: "General",
      tags: "",
    },
  });

  useEffect(() => {
    if (isUpdate && taskData) {
      reset({
        taskName: taskData.taskName,
        description: taskData.description || "",
        priority: taskData.priority || "Medium",
        taskStatus: taskData.taskStatus || "Pending",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        category: taskData.category || "General",
        tags: Array.isArray(taskData.tags) ? taskData.tags.join(", ") : "",
      });
    } else {
      reset({
        taskName: "",
        description: "",
        priority: "Medium",
        taskStatus: "Pending",
        dueDate: null,
        category: "General",
        tags: "",
      });
    }
  }, [taskData, isUpdate, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        taskName: data.taskName.trim(),
        description: data.description?.trim() || "",
        priority: data.priority,
        taskStatus: data.taskStatus,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        category: data.category?.trim() || "General",
        tags: data.tags,
      };

      if (isUpdate && taskData?._id) {
        await taskApi.put(`/${taskData._id}`, payload);
        toast.success("Task updated successfully!");
      } else {
        await taskApi.post("/", {
          ...payload,
          ...(taskData?.board?._id ? { boardId: taskData.board._id } : {}),
        });
        toast.success("Task created successfully!");
      }

      onClose();
      reload?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save task.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(15,23,42,0.25)] px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-[28px] border border-white/80 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.18)] max-h-[calc(100vh-4rem)] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-slate-500 transition hover:text-slate-900"
        >
          x
        </button>

        <h2 className="mb-2 text-2xl font-bold text-slate-950">
          {isUpdate ? "Edit Task" : "Add New Task"}
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Keep the card clean and actionable so it feels at home in the new dashboard theme.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Task Name
            </label>
            <input
              {...register("taskName", {
                required: "Task title is required",
                minLength: {
                  value: 3,
                  message: "Task title must be at least 3 characters",
                },
              })}
              className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
              placeholder="Enter task name"
            />
            {errors.taskName && (
              <p className="mt-1 text-sm text-rose-500">{errors.taskName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be under 500 characters",
                },
              })}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
              placeholder="Enter task description"
              rows="4"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                {...register("taskStatus")}
                className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tags
            </label>
            <input
              {...register("tags")}
              className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
              placeholder="e.g. frontend, urgent, sprint-1"
            />
            <p className="mt-1 text-xs text-slate-500">Separate tags with commas.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                {...register("category")}
                className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
                placeholder="e.g. Product, Design, Personal"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Deadline
              </label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="Select deadline"
                    className="w-full rounded-2xl border border-slate-200 bg-[#fff8fa] p-3 text-slate-900 outline-none transition focus:border-[#ff7b86] focus:ring-4 focus:ring-rose-100"
                    wrapperClassName="w-full"
                    isClearable
                  />
                )}
              />
            </div>
          </div>

          {isUpdate && taskData ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div>Created: {new Date(taskData.createdAt).toLocaleString()}</div>
              {taskData.updatedAt !== taskData.createdAt ? (
                <div className="mt-1">Last Updated: {new Date(taskData.updatedAt).toLocaleString()}</div>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#ff7b86] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,123,134,0.28)] transition hover:bg-[#ff6a77] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (isUpdate ? "Updating..." : "Creating...") : (isUpdate ? "Update Task" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default Modal;
