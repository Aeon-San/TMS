import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import taskApi from "../library/taskApi.js";
import Search from "../components/Search.jsx";
import TaskCard from "../components/TaskCard.jsx";
import Modal from "../components/Modal.jsx";
import SimpleModal from "../components/SimpleModal.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import BoardSelector from "../components/BoardSelector.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import TaskAssignment from "../components/TaskAssignment.jsx";
import CommentSection from "../components/CommentSection.jsx";
import TaskCalendar from "../components/TaskCalendar.jsx";
import ProductivityCharts from "../components/ProductivityCharts.jsx";
import PomodoroWidget from "../components/PomodoroWidget.jsx";
import SmartSuggestions from "../components/SmartSuggestions.jsx";
import usePortal from "../hooks/usePortal.js";
import { MdGridView, MdViewKanban } from "react-icons/md";
import { FiAlertCircle, FiBarChart2, FiCheckCircle, FiClock, FiHome, FiMenu, FiMoon, FiSun, FiUser, FiX } from "react-icons/fi";
import { IoSparklesOutline } from "react-icons/io5";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("dashboard-theme");
    return storedTheme ? storedTheme === "dark" : true;
  });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { isOpen, onOpen, onClose } = usePortal();
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, selectedBoard]);

  useEffect(() => {
    filterTasks();
  }, [data, search, statusFilter, priorityFilter, categoryFilter, tagFilter, deadlineFilter, sortBy]);

  useEffect(() => {
    localStorage.setItem("dashboard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const params = selectedBoard ? { boardId: selectedBoard._id } : {};
      const response = await taskApi.get("/", { params });
      const tasks = Array.isArray(response.data) ? response.data : response.data.tasks || [];
      setData(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Unable to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const normalizeDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const filterTasks = () => {
    let filtered = [...data];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter((task) =>
        task.taskName?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((task) => task.taskStatus === statusFilter);
    }

    if (priorityFilter !== "All") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter((task) => (task.category || "General") === categoryFilter);
    }

    if (tagFilter.trim()) {
      const tagQuery = tagFilter.trim().toLowerCase();
      filtered = filtered.filter((task) =>
        Array.isArray(task.tags) && task.tags.some((tag) => tag.toLowerCase().includes(tagQuery))
      );
    }

    if (deadlineFilter !== "All") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const nextWeek = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

      filtered = filtered.filter((task) => {
        const due = normalizeDate(task.dueDate);

        if (deadlineFilter === "No Deadline") return !due;
        if (!due) return false;
        if (deadlineFilter === "Overdue") return due < now && task.taskStatus !== "Completed";
        if (deadlineFilter === "Today") return due >= startOfToday && due < endOfToday;
        if (deadlineFilter === "This Week") return due >= now && due <= nextWeek;
        return true;
      });
    }

    filtered.sort((a, b) => {
      const aCreated = normalizeDate(a.createdAt)?.getTime() || 0;
      const bCreated = normalizeDate(b.createdAt)?.getTime() || 0;
      const aDue = normalizeDate(a.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bDue = normalizeDate(b.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      const priorityRank = { High: 3, Medium: 2, Low: 1 };

      switch (sortBy) {
        case "oldest":
          return aCreated - bCreated;
        case "priority":
          return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        case "deadline":
          return aDue - bDue;
        case "title":
          return a.taskName.localeCompare(b.taskName);
        case "newest":
        default:
          return bCreated - aCreated;
      }
    });

    setFilteredData(filtered);
  };

  const handleTaskUpdate = (updatedTask) => {
    setData((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    setSelectedTask((prev) => (prev && prev._id === updatedTask._id ? updatedTask : prev));
    setEditingTask((prev) => (prev && prev._id === updatedTask._id ? updatedTask : prev));
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const response = updatedData.taskStatus
        ? await taskApi.patch(`/${taskId}/status`, { status: updatedData.taskStatus })
        : await taskApi.put(`/${taskId}`, updatedData);

      const updatedTask = response.data.task || response.data;
      toast.success("Task updated successfully!");
      handleTaskUpdate(updatedTask);
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskApi.delete(`/${taskId}`);
      setData((prev) => prev.filter((task) => task._id !== taskId));
      setSelectedTask(null);
      setEditingTask(null);
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task.");
    }
  };

  const totalTasks = filteredData.length;
  const completedTasks = filteredData.filter((task) => task.taskStatus === "Completed").length;
  const inProgressTasks = filteredData.filter((task) => task.taskStatus === "In Progress").length;
  const pendingTasks = filteredData.filter((task) => task.taskStatus === "Pending").length;
  const overdueTasks = filteredData.filter((task) => {
    const due = normalizeDate(task.dueDate);
    return due && due < new Date() && task.taskStatus !== "Completed";
  }).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const availableCategories = useMemo(
    () => ["All", ...new Set(data.map((task) => task.category || "General"))],
    [data]
  );

  const analyticsCards = useMemo(
    () => [
      {
        label: "Total Tasks",
        value: totalTasks,
        subtext: selectedBoard ? "Inside this board" : "Across your workspace",
        icon: FiBarChart2,
      },
      {
        label: "Completed",
        value: completedTasks,
        subtext: `${completionRate}% completion rate`,
        icon: FiCheckCircle,
      },
      {
        label: "Pending",
        value: pendingTasks,
        subtext: "Awaiting action",
        icon: FiClock,
      },
      {
        label: "Overdue",
        value: overdueTasks,
        subtext: `${inProgressTasks} in active progress`,
        icon: FiAlertCircle,
      },
    ],
    [totalTasks, completedTasks, completionRate, pendingTasks, overdueTasks, inProgressTasks, selectedBoard]
  );

  const productivityAnalytics = useMemo(() => {
    const now = new Date();
    const daySeries = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const value = data.filter((task) => {
        if (task.taskStatus !== "Completed") return false;
        const updated = normalizeDate(task.updatedAt);
        return updated && updated.toDateString() === date.toDateString();
      }).length;
      return { label, value };
    });

    const monthSeries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const value = data.filter((task) => {
        if (task.taskStatus !== "Completed") return false;
        const updated = normalizeDate(task.updatedAt);
        return updated && updated.getMonth() === date.getMonth() && updated.getFullYear() === date.getFullYear();
      }).length;
      return { label: date.toLocaleDateString("en-US", { month: "short" }), value };
    });

    const completedTasksOnly = data.filter((task) => task.taskStatus === "Completed");
    const completionHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      value: completedTasksOnly.filter((task) => {
        const updated = normalizeDate(task.updatedAt);
        return updated && updated.getHours() === hour;
      }).length,
    }));
    const peakHour = completionHours.sort((a, b) => b.value - a.value)[0] || { hour: 9, value: 0 };

    const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const completedByDay = weekDayLabels.map((label, index) => ({
      label,
      value: completedTasksOnly.filter((task) => {
        const updated = normalizeDate(task.updatedAt);
        return updated && updated.getDay() === index;
      }).length,
    }));
    const bestDay = completedByDay.sort((a, b) => b.value - a.value)[0] || { label: "Mon" };

    return {
      total: data.length,
      completionRate,
      weekCompleted: daySeries.reduce((sum, item) => sum + item.value, 0),
      monthCompleted: monthSeries[monthSeries.length - 1]?.value || 0,
      daySeries,
      monthSeries,
      statusBreakdown: [
        { label: "Completed", value: completedTasks, color: "#2f66dd" },
        { label: "In Progress", value: inProgressTasks, color: "#5a86e8" },
        { label: "Pending", value: pendingTasks, color: "#8fb2ff" },
      ],
      bestDayLabel: bestDay.label,
      peakHourLabel: `${String(peakHour.hour).padStart(2, "0")}:00`,
    };
  }, [data, completedTasks, inProgressTasks, pendingTasks, completionRate]);

  const smartSuggestions = useMemo(() => {
    const suggestions = [];
    const highPriorityPending = data.filter((task) => task.priority === "High" && task.taskStatus !== "Completed");
    const noDeadlineTasks = data.filter((task) => !task.dueDate && task.taskStatus !== "Completed");
    const commonCategory = Object.entries(
      data.reduce((acc, task) => {
        const category = task.category || "General";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    suggestions.push({
      badge: "Future Scope",
      title: highPriorityPending.length
        ? `Prioritize ${highPriorityPending[0].taskName}`
        : "Keep momentum steady",
      description: highPriorityPending.length
        ? `${highPriorityPending.length} high-priority tasks are still open. A focused sprint today would clear the biggest blockers first.`
        : "No urgent blockers right now. Consider batching low-effort tasks in your next focus session.",
    });

    suggestions.push({
      badge: "Smart Deadline",
      title: noDeadlineTasks.length ? "Add deadlines to loose tasks" : "Deadline hygiene looks strong",
      description: noDeadlineTasks.length
        ? `${noDeadlineTasks.length} active tasks have no deadline. Adding target dates will improve reminder accuracy and planning.`
        : "Most active tasks already have time boundaries, which improves planning and reminder quality.",
    });

    suggestions.push({
      badge: "Pattern Insight",
      title: commonCategory ? `${commonCategory[0]} is your heaviest lane` : "Start categorizing your work",
      description: commonCategory
        ? `Most of your recent tasks belong to ${commonCategory[0]}. Consider creating a focused board or recurring workflow for it.`
        : "Once categories grow, the system can recommend smart deadlines and priorities more accurately.",
    });

    return suggestions;
  }, [data]);

  const shellClass = darkMode
    ? "min-h-screen bg-[radial-gradient(circle_at_top,#1a2947_0%,#111b31_42%,#0a1120_100%)] pb-8 text-slate-100"
    : "min-h-screen bg-[linear-gradient(180deg,#ecf3ff_0%,#f8fbff_52%,#e7f0ff_100%)] pb-8 text-slate-900";
  const sidebarClass = darkMode
    ? "w-80 min-h-[calc(100vh-3rem)] rounded-[32px] border border-white/8 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur"
    : "w-80 min-h-[calc(100vh-3rem)] rounded-[32px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_60px_rgba(163,82,104,0.12)] backdrop-blur";
  const contentClass = darkMode
    ? "flex-1 rounded-[36px] border border-white/8 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur"
    : "flex-1 rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(163,82,104,0.12)] backdrop-blur";
  const topBarClass = darkMode
    ? "mb-6 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between"
    : "mb-6 flex flex-col gap-4 rounded-[28px] bg-[linear-gradient(135deg,#f7faff_0%,#eaf2ff_100%)] p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between";
  const analyticsCardClass = darkMode
    ? "rounded-[26px] border border-white/8 bg-white/6 p-5 shadow-sm"
    : "rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-sm";
  const filterSelectClass = darkMode
    ? "select w-full rounded-2xl border border-white/10 bg-[#1a2742] text-slate-200 shadow-sm"
    : "select w-full rounded-2xl border border-[#c9d9f6] bg-[#f8fbff] text-slate-700 shadow-sm";
  const sidebarTextMuted = darkMode ? "text-slate-400" : "text-slate-600";
  const pageTitleClass = darkMode ? "text-3xl font-black tracking-tight text-white" : "text-3xl font-black tracking-tight text-slate-900";
  const navItemBase = darkMode
    ? "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-200 transition hover:bg-white/8"
    : "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-[#edf4ff]";
  const mobilePanelClass = darkMode
    ? "fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm overflow-y-auto border-r border-white/8 bg-[#0e1a30]/95 p-5 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
    : "fixed inset-y-0 left-0 z-50 w-[88vw] max-w-sm overflow-y-auto border-r border-white/60 bg-white/95 p-5 text-slate-900 shadow-[0_20px_60px_rgba(55,110,210,0.18)] backdrop-blur";

  if (loading) {
    return (
      <div className={`${shellClass} flex items-center justify-center`}>
        <div className={darkMode ? "rounded-[28px] bg-white/8 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]" : "rounded-[28px] bg-white p-8 shadow-[0_24px_60px_rgba(163,82,104,0.16)]"}>
          <span className="loading loading-infinity loading-xl text-4xl text-[#2f66dd]"></span>
          <p className={`mt-4 ${sidebarTextMuted}`}>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="mx-auto flex max-w-[1600px] gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
        {showMobileSidebar ? (
          <>
            <div className={mobilePanelClass}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.28)]">
                    <IoSparklesOutline size={22} />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.28em] ${sidebarTextMuted}`}>Workspace</p>
                    <h2 className={darkMode ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>TaskFlow Pro</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(false)}
                  className={darkMode ? "rounded-2xl bg-white/8 p-3 text-slate-100" : "rounded-2xl bg-[#edf4ff] p-3 text-slate-700"}
                >
                  <FiX />
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <Link to="/dashboard" onClick={() => setShowMobileSidebar(false)} className={`${navItemBase} ${darkMode ? "bg-white/10 text-white" : "bg-[#e6efff] text-slate-900 shadow-sm"}`}>
                  <FiHome />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/profile" onClick={() => setShowMobileSidebar(false)} className={navItemBase}>
                  <FiUser />
                  <span className="font-medium">Profile</span>
                </Link>
              </div>

              <div className="mb-6">
                <h2 className={darkMode ? "mb-4 text-xl font-bold text-white" : "mb-4 text-xl font-bold text-slate-900"}>Boards</h2>
                <BoardSelector selectedBoard={selectedBoard} onBoardSelect={(board) => { setSelectedBoard(board); setShowMobileSidebar(false); }} onBoardCreate={fetchTasks} darkMode={darkMode} />
              </div>

              <div className="mb-6">
                <h3 className={darkMode ? "mb-3 text-lg font-semibold text-white" : "mb-3 text-lg font-semibold text-slate-900"}>Filters</h3>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectClass}>
                    <option value="All">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Priority</label>
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={filterSelectClass}>
                    <option value="All">All Priority</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Category</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={filterSelectClass}>
                    {availableCategories.map((category) => <option key={category} value={category}>{category === "All" ? "All Categories" : category}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Tag Search</label>
                  <input value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className={darkMode ? "w-full rounded-2xl border border-white/10 bg-[#1a2742] p-3 text-slate-200 outline-none" : "w-full rounded-2xl border border-[#c9d9f6] bg-[#f8fbff] p-3 text-slate-700 outline-none"} placeholder="Search by tag" />
                </div>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Deadline</label>
                  <select value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)} className={filterSelectClass}>
                    <option value="All">All Deadlines</option><option value="Today">Due Today</option><option value="This Week">Due This Week</option><option value="Overdue">Overdue</option><option value="No Deadline">No Deadline</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={filterSelectClass}>
                    <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="priority">Priority</option><option value="deadline">Deadline</option><option value="title">Title</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className={darkMode ? "mb-3 text-lg font-semibold text-white" : "mb-3 text-lg font-semibold text-slate-900"}>View</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "grid", label: "Grid", icon: MdGridView },
                    { key: "kanban", label: "Kanban", icon: MdViewKanban },
                    { key: "calendar", label: "Calendar", icon: null },
                  ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => { setViewMode(key); setShowMobileSidebar(false); }} className={`btn btn-sm rounded-2xl border-0 ${viewMode === key ? "bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.3)]" : darkMode ? "bg-white/8 text-slate-200 hover:bg-white/12" : "bg-[#edf4ff] text-slate-700 hover:bg-[#dfeaff]"}`}>
                      {Icon ? <Icon className="mr-1 h-4 w-4" /> : null}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" className="fixed inset-0 z-40 bg-[#120f17]/35 backdrop-blur-[2px]" onClick={() => setShowMobileSidebar(false)} />
          </>
        ) : null}
        <aside className={`${sidebarClass} hidden xl:block`}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.28)]">
              <IoSparklesOutline size={24} />
            </div>
            <div>
              <p className={`text-xs uppercase tracking-[0.28em] ${sidebarTextMuted}`}>Workspace</p>
              <h2 className={darkMode ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>TaskFlow Pro</h2>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <Link to="/dashboard" className={`${navItemBase} ${darkMode ? "bg-white/10 text-white" : "bg-[#e6efff] text-slate-900 shadow-sm"}`}>
              <FiHome />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/profile" className={navItemBase}>
              <FiUser />
              <span className="font-medium">Profile</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className={darkMode ? "mb-4 text-xl font-bold text-white" : "mb-4 text-xl font-bold text-slate-900"}>Boards</h2>
            <BoardSelector
              selectedBoard={selectedBoard}
              onBoardSelect={setSelectedBoard}
              onBoardCreate={fetchTasks}
              darkMode={darkMode}
            />
          </div>

          <div className="mb-6">
            <h3 className={darkMode ? "mb-3 text-lg font-semibold text-white" : "mb-3 text-lg font-semibold text-slate-900"}>Filters</h3>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectClass}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={filterSelectClass}>
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={filterSelectClass}>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Tag Search</label>
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className={darkMode ? "w-full rounded-2xl border border-white/10 bg-[#1a2742] p-3 text-slate-200 outline-none" : "w-full rounded-2xl border border-[#c9d9f6] bg-[#f8fbff] p-3 text-slate-700 outline-none"}
                placeholder="Search by tag"
              />
            </div>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Deadline</label>
              <select value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)} className={filterSelectClass}>
                <option value="All">All Deadlines</option>
                <option value="Today">Due Today</option>
                <option value="This Week">Due This Week</option>
                <option value="Overdue">Overdue</option>
                <option value="No Deadline">No Deadline</option>
              </select>
            </div>

            <div className="mb-4">
              <label className={darkMode ? "mb-2 block text-sm font-medium text-slate-300" : "mb-2 block text-sm font-medium text-slate-700"}>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={filterSelectClass}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
                <option value="deadline">Deadline</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className={darkMode ? "mb-3 text-lg font-semibold text-white" : "mb-3 text-lg font-semibold text-slate-900"}>View</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`btn btn-sm rounded-2xl border-0 ${
                  viewMode === "grid"
                    ? "bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.3)]"
                    : darkMode
                      ? "bg-white/8 text-slate-200 hover:bg-white/12"
                      : "bg-[#edf4ff] text-slate-700 hover:bg-[#dfeaff]"
                }`}
              >
                <MdGridView className="mr-1 h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`btn btn-sm rounded-2xl border-0 ${
                  viewMode === "kanban"
                    ? "bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.3)]"
                    : darkMode
                      ? "bg-white/8 text-slate-200 hover:bg-white/12"
                      : "bg-[#edf4ff] text-slate-700 hover:bg-[#dfeaff]"
                }`}
              >
                <MdViewKanban className="mr-1 h-4 w-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`btn btn-sm rounded-2xl border-0 ${
                  viewMode === "calendar"
                    ? "bg-[#2f66dd] text-white shadow-[0_12px_24px_rgba(47,102,221,0.3)]"
                    : darkMode
                      ? "bg-white/8 text-slate-200 hover:bg-white/12"
                      : "bg-[#edf4ff] text-slate-700 hover:bg-[#dfeaff]"
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </aside>

        <main className={`${contentClass} min-w-0 p-4 sm:p-6`}>
          <div className={topBarClass}>
            <div>
              <p className={`mb-2 text-xs uppercase tracking-[0.28em] ${sidebarTextMuted}`}>Task Management System</p>
              <div className="mb-3 flex items-center gap-3 xl:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(true)}
                  className={darkMode ? "rounded-2xl bg-white/8 p-3 text-slate-100" : "rounded-2xl bg-white p-3 text-slate-700 shadow-sm"}
                >
                  <FiMenu />
                </button>
                <div className={darkMode ? "rounded-2xl bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300" : "rounded-2xl bg-[#edf4ff] px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-600"}>
                  {selectedBoard ? "Board View" : "Workspace"}
                </div>
              </div>
              <h1 className={`${pageTitleClass} text-2xl sm:text-3xl`}>{selectedBoard ? selectedBoard.name : "Productivity Dashboard"}</h1>
              <p className={`mt-2 max-w-2xl ${sidebarTextMuted}`}>
                {selectedBoard
                  ? selectedBoard.description || "Track work, align your team, and keep deadlines visible in one polished workspace."
                  : "Plan, prioritize, and execute your work with a clean task hub built like a modern SaaS product."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className={darkMode ? "btn rounded-2xl border-0 bg-white/8 text-slate-100 hover:bg-white/12" : "btn rounded-2xl border-0 bg-white text-slate-700 hover:bg-[#f4f8ff]"}
              >
                {darkMode ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />}
                {darkMode ? "Light" : "Dark"} Mode
              </button>
              <NotificationBell darkMode={darkMode} compact />
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analyticsCards.map(({ label, value, subtext, icon: Icon }) => (
              <div key={label} className={analyticsCardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <div className={darkMode ? "rounded-2xl bg-[#2f66dd]/20 p-3 text-[#8fb2ff]" : "rounded-2xl bg-[#edf4ff] p-3 text-[#2f66dd]"}>
                    <Icon size={20} />
                  </div>
                  <span className={darkMode ? "text-xs uppercase tracking-[0.25em] text-slate-400" : "text-xs uppercase tracking-[0.25em] text-slate-500"}>
                    {label}
                  </span>
                </div>
                <div className={darkMode ? "text-3xl font-black text-white" : "text-3xl font-black text-slate-900"}>{value}</div>
                <p className={`mt-2 text-sm ${sidebarTextMuted}`}>{subtext}</p>
                {label === "Completed" ? (
                  <div className={darkMode ? "mt-4 h-2 rounded-full bg-white/10" : "mt-4 h-2 rounded-full bg-[#dbe7ff]"}>
                    <div className="h-full rounded-full bg-[#2f66dd] transition-all duration-500" style={{ width: `${completionRate}%` }} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mb-6 space-y-4">
            <ProductivityCharts analytics={productivityAnalytics} darkMode={darkMode} />
            <div className="mx-auto w-full max-w-sm">
              <PomodoroWidget darkMode={darkMode} activeTaskName={selectedTask?.taskName || filteredData[0]?.taskName} />
            </div>
          </div>

          <div className="mb-6">
            <SmartSuggestions suggestions={smartSuggestions} darkMode={darkMode} />
          </div>

          <Search
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            setSearch={setSearch}
            darkMode={darkMode}
            selectedBoard={selectedBoard}
            totalTasks={totalTasks}
          />

          {loadingTasks ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-[#2f66dd]"></span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className={darkMode ? "rounded-[28px] border border-dashed border-white/10 bg-white/5 py-12 text-center" : "rounded-[28px] border border-dashed border-[#c9d9f6] bg-[#f7fbff] py-12 text-center"}>
              <div className="mb-4 text-6xl">No Tasks</div>
              <h3 className={darkMode ? "mb-2 text-xl font-semibold text-white" : "mb-2 text-xl font-semibold text-slate-900"}>No Tasks Found</h3>
              <p className={sidebarTextMuted}>
                {search || statusFilter !== "All" || priorityFilter !== "All" || deadlineFilter !== "All"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first task to get started"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onSelect={setSelectedTask}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  darkMode={darkMode}
                />
              ))}
            </div>
          ) : viewMode === "calendar" ? (
            <TaskCalendar
              tasks={filteredData}
              onTaskClick={setSelectedTask}
              onReschedule={(task, newDate) =>
                handleUpdateTask(task._id, { dueDate: newDate.toISOString() })
              }
              darkMode={darkMode}
            />
          ) : (
            <KanbanBoard
              tasks={filteredData}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onStatusChange={(task) => handleUpdateTask(task._id, { taskStatus: task.taskStatus })}
              darkMode={darkMode}
            />
          )}
        </main>
      </div>

      {selectedTask ? (
        <SimpleModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
          <div className="w-full max-w-2xl px-1">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedTask.taskName}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedTask.dueDate ? `Deadline: ${new Date(selectedTask.dueDate).toLocaleString()}` : "No deadline set"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingTask(selectedTask);
                    setSelectedTask(null);
                  }}
                  className="btn btn-sm border-0 bg-[#2f66dd] text-white hover:bg-[#2456c2]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(selectedTask._id)}
                  className="btn btn-sm btn-error text-white"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-300">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["Pending", "In Progress", "Completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateTask(selectedTask._id, { taskStatus: status })}
                      className={`btn btn-sm ${selectedTask.taskStatus === status ? "btn-primary" : "btn-outline"}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-300">Description</h3>
                <p className="text-gray-300">{selectedTask.description || "No description"}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-300">Priority</h3>
                  <span className={`badge ${
                    selectedTask.priority === "High" ? "badge-error" :
                    selectedTask.priority === "Medium" ? "badge-warning" :
                    "badge-success"
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-300">Category</h3>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-sm text-slate-200">
                    {selectedTask.category || "General"}
                  </span>
                </div>
              </div>

              {Array.isArray(selectedTask.tags) && selectedTask.tags.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-300">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#1e2e4a] px-3 py-1 text-sm text-[#a9c5ff]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <TaskAssignment
                task={selectedTask}
                board={selectedBoard || selectedTask.board}
                onAssignmentChange={fetchTasks}
                darkMode={darkMode}
              />

              <CommentSection
                taskId={selectedTask._id}
                board={selectedBoard || selectedTask.board}
                task={selectedTask}
                darkMode={darkMode}
              />

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-300">Activity History</h3>
                <div className="max-h-56 space-y-3 overflow-y-auto rounded-2xl border border-white/8 bg-white/5 p-4">
                  {selectedTask.activityHistory?.length ? (
                    [...selectedTask.activityHistory]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((entry, index) => (
                        <div key={`${entry.createdAt}-${index}`} className="border-b border-white/6 pb-3 last:border-b-0 last:pb-0">
                          <div className="text-sm font-medium text-white">{entry.summary}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {new Date(entry.createdAt).toLocaleString()}
                          </div>
                          {entry.changes?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.changes.map((change, changeIndex) => (
                                <span key={`${change.field}-${changeIndex}`} className="rounded-full bg-white/8 px-2 py-1 text-xs text-slate-300">
                                  {change.field}: {String(change.oldValue ?? "empty")} → {String(change.newValue ?? "empty")}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-slate-400">No activity yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SimpleModal>
      ) : null}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        taskData={selectedBoard ? { board: selectedBoard } : null}
        isUpdate={false}
        reload={fetchTasks}
      />

      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        taskData={editingTask}
        isUpdate={true}
        reload={fetchTasks}
      />
    </div>
  );
};

export default Dashboard;
