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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,17,26,0.42)] px-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#17131c] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-white/80 transition hover:text-white"
        >
          ×
        </button>

        <h2 className="mb-6 text-2xl font-bold">
          {isUpdate ? "Edit Task" : "Add New Task"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
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
              className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
              placeholder="Enter task name"
            />
            {errors.taskName && (
              <p className="mt-1 text-sm text-red-400">{errors.taskName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Description
            </label>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be under 500 characters",
                },
              })}
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
              placeholder="Enter task description"
              rows="4"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Status
              </label>
              <select
                {...register("taskStatus")}
                className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Tags
            </label>
            <input
              {...register("tags")}
              className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
              placeholder="e.g. frontend, urgent, sprint-1"
            />
            <p className="mt-1 text-xs text-slate-500">Separate tags with commas.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Category
              </label>
              <input
                {...register("category")}
                className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
                placeholder="e.g. Product, Design, Personal"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
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
                    className="w-full rounded-2xl border border-white/10 bg-[#1d1723] p-3 text-white outline-none transition focus:border-[#ff7b86]"
                    wrapperClassName="w-full"
                    isClearable
                  />
                )}
              />
            </div>
          </div>

          {isUpdate && taskData ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
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
              className="rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/12"
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
