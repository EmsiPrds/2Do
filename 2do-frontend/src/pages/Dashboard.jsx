import { useEffect, useState } from "react";
import { authRequest } from "../api";
import {
  Check,
  RotateCcw,
  Pencil,
  Trash2,
  LogOut,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Calendar,
  Flag,
} from "lucide-react";
import Logo from "../assets/svg";
import QuickAdd from "../components/QuickAdd";
import Subtasks from "../components/Subtasks";

/* ─────────────────────────────────────
   Priority config
───────────────────────────────────── */
const PRIORITIES = {
  high:   { label: "High",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/40",    dot: "bg-red-400",    flag: "text-red-400" },
  medium: { label: "Medium", color: "text-brand-yellow", bg: "bg-brand-yellow/10", border: "border-brand-yellow/40", dot: "bg-brand-yellow", flag: "text-brand-yellow" },
  low:    { label: "Low",    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/40", dot: "bg-emerald-400", flag: "text-emerald-400/70" },
};

/* Priority left-border accent on task card */
const PRIORITY_BORDER = {
  high:   "border-l-red-400/60",
  medium: "border-l-brand-yellow/50",
  low:    "border-l-emerald-400/40",
};

/* ─────────────────────────────────────
   Priority picker component
───────────────────────────────────── */
function PriorityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = PRIORITIES[value] ?? PRIORITIES.medium;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition duration-200
                    ${current.bg} ${current.border} ${current.color}`}
      >
        <Flag className="w-3 h-3" />
        {current.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-20 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl overflow-hidden min-w-[130px]">
          {Object.entries(PRIORITIES).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition duration-150
                          ${value === key ? `${cfg.bg} ${cfg.color}` : "text-white/60 hover:bg-white/8 hover:text-white"}`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
              {value === key && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Compact inline badge shown on task cards */
function PriorityBadge({ priority }) {
  const cfg = PRIORITIES[priority] ?? PRIORITIES.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────
   Other sub-components
───────────────────────────────────── */
function Avatar({ avatarUrl, username, onClick }) {
  if (avatarUrl) {
    return (
      <img
        src={`http://localhost:5000${avatarUrl}`}
        alt="Avatar"
        onClick={onClick}
        className="w-8 h-8 rounded-full object-cover cursor-pointer ring-2 ring-brand-yellow ring-offset-2 ring-offset-black transition hover:opacity-90"
      />
    );
  }
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center font-bold text-sm cursor-pointer transition hover:brightness-105"
      aria-label="Open profile"
    >
      {username?.charAt(0).toUpperCase() ?? "?"}
    </button>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-4 lg:py-5">
      <span className={`text-2xl lg:text-3xl font-bold ${accent}`}>{value}</span>
      <span className="text-xs text-white/40 font-medium">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────
   Dashboard
───────────────────────────────────── */
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  // add form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showAddForm, setShowAddForm] = useState(false);

  // edit
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPriority, setEditingPriority] = useState("medium");

  const [expandedTaskIds, setExpandedTaskIds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all"); // "all" | "high" | "medium" | "low"
  const [sortOption, setSortOption] = useState("priority"); // default: priority sort
  const [showSort, setShowSort] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState("You");

  /* ── data ── */
  const fetchTasks = async () => {
    try {
      const data = await authRequest("tasks", null, "GET");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchTasks failed:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  /* ── avatar ── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch("http://localhost:5000/api/user/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) setAvatarUrl(result.avatar);
    } catch { /* noop */ }
  };

  /* ── task actions ── */
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await authRequest("tasks", { title, description, dueDate, priority }, "POST");
      setTitle(""); setDescription(""); setDueDate(""); setPriority("medium");
      setShowAddForm(false);
      fetchTasks();
    } catch { /* noop */ }
  };

  /* Quick-add handler (called from QuickAdd component) */
  const handleQuickAdd = async ({ title: qTitle, dueDate: qDueDate }) => {
    if (!qTitle?.trim()) return;
    await authRequest("tasks", { title: qTitle.trim(), dueDate: qDueDate, priority: "medium" }, "POST");
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await authRequest(`tasks/${taskId}`, null, "DELETE");
      fetchTasks();
    } catch { /* noop */ }
  };

  const toggleTaskCompletion = async (taskId, current) => {
    try {
      await authRequest(`tasks/${taskId}`, { completed: !current }, "PUT");
      fetchTasks();
    } catch { /* noop */ }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      await authRequest(`tasks/${taskId}`, {
        title: editingTitle,
        description: editingDescription,
        priority: editingPriority,
      }, "PUT");
      setEditingTaskId(null);
      fetchTasks();
    } catch { /* noop */ }
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
    setEditingDescription(task.description || "");
    setEditingPriority(task.priority || "medium");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingPriority("medium");
  };

  /* Optimistic subtask update — replaces the task in local state */
  const handleSubtaskUpdate = (updatedTask) => {
    setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
  };

  const toggleDescription = (id) =>
    setExpandedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  /* ── derived ── */
  const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highUrgent = tasks.filter((t) => !t.completed && t.priority === "high").length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = Array.isArray(tasks) ? tasks
    .filter((t) => {
      // status filter
      if (filter === "completed") return t.completed === true;
      if (filter === "pending") return t.completed !== true;
      return true;
    })
    .filter((t) => {
      // priority filter
      if (priorityFilter === "all") return true;
      const p = t.priority || "medium";
      return p === priorityFilter;
    })
    .sort((a, b) => {
      if (sortOption === "priority") {
        const pa = PRIORITY_WEIGHT[a.priority || "medium"] ?? 1;
        const pb = PRIORITY_WEIGHT[b.priority || "medium"] ?? 1;
        if (pa !== pb) return pa - pb;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === "created_newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "created_oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "due_earliest") return new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity);
      if (sortOption === "due_latest") return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      return 0;
    }) : [];

  const panel = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm";

  /* ─────────────────────────────────────
     Render
  ───────────────────────────────────── */
  return (
    <div className="relative min-h-screen bg-brand-dark text-white overflow-x-hidden">

      {/* Radial glow */}
      <div
        className="pointer-events-none fixed z-0 top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(100vw, 900px)",
          height: "500px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(253,206,0,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ════════════ HEADER ════════════ */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-brand-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-auto w-12 opacity-90" />
            {/* High-urgency alert pill */}
            {highUrgent > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/25 text-red-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {highUrgent} urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Avatar avatarUrl={avatarUrl} username={username} onClick={() => setShowProfileModal(true)} />
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/40 hover:text-white transition duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════ PROFILE MODAL ════════════ */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 space-y-5 bg-[#111] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-white/40 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Avatar avatarUrl={avatarUrl} username={username} onClick={() => {}} />
              <span className="font-medium text-white">{username}</span>
            </div>
            <div>
              <label className="form-label-dark">Change Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="block w-full text-sm text-white/40
                           file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                           file:bg-white/10 file:text-white/70 file:font-medium
                           hover:file:bg-white/15 transition cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════ MAIN ════════════ */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-10">

          {/* ══ SIDEBAR ══ */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4 lg:sticky lg:top-20 lg:self-start">

            {/* Stats */}
            <div className={`flex lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-white/8 ${panel}`}>
              <StatCard label="Total"   value={totalTasks}     accent="text-white" />
              <StatCard label="Done"    value={completedTasks} accent="text-emerald-400" />
              <StatCard label="Pending" value={pendingTasks}   accent="text-brand-yellow" />
            </div>

            {/* Progress */}
            {totalTasks > 0 && (
              <div className={`hidden lg:block ${panel} px-5 py-4 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">Progress</span>
                  <span className="text-xs font-semibold text-brand-yellow">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-yellow transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status filter */}
            <div className={`${panel} p-4 space-y-2`}>
              <p className="form-label-dark">Status</p>
              <div className="flex lg:flex-col gap-1.5">
                {["all", "pending", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 lg:flex-none px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
                      filter === f
                        ? "bg-brand-yellow text-brand-dark"
                        : "text-white/50 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {f === "all" ? "All tasks" : f === "pending" ? "Pending" : "Completed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority filter */}
            <div className={`${panel} p-4 space-y-2`}>
              <p className="form-label-dark">Priority</p>
              <div className="flex lg:flex-col gap-1.5">
                {[
                  { key: "all",    label: "All priorities", dot: "bg-white/30",    active: "bg-white/10 text-white" },
                  { key: "high",   label: "High",           dot: "bg-red-400",     active: "bg-red-400/15 text-red-400" },
                  { key: "medium", label: "Medium",         dot: "bg-brand-yellow", active: "bg-brand-yellow/15 text-brand-yellow" },
                  { key: "low",    label: "Low",            dot: "bg-emerald-400", active: "bg-emerald-400/15 text-emerald-400" },
                ].map(({ key, label, dot, active }) => (
                  <button
                    key={key}
                    onClick={() => setPriorityFilter(key)}
                    className={`flex-1 lg:flex-none flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
                      priorityFilter === key
                        ? active
                        : "text-white/50 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort — desktop */}
            <div className={`hidden lg:block ${panel} p-4 space-y-2`}>
              <p className="form-label-dark">Sort by</p>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="input-dark"
              >
                <option value="priority">Priority (High → Low)</option>
                <option value="created_newest">Created — Newest first</option>
                <option value="created_oldest">Created — Oldest first</option>
                <option value="due_earliest">Due date — Earliest first</option>
                <option value="due_latest">Due date — Latest first</option>
              </select>
            </div>

          </aside>

          {/* ══ TASK FEED ══ */}
          <section className="flex-1 min-w-0 mt-4 lg:mt-0 space-y-3">

            {/* Mobile sort toggle */}
            <div className="flex items-center justify-end lg:hidden">
              <button
                onClick={() => setShowSort(!showSort)}
                className={`flex items-center gap-1.5 text-xs font-medium transition duration-200 ${
                  showSort ? "text-brand-yellow" : "text-white/40 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sort
              </button>
            </div>

            {showSort && (
              <div className={`lg:hidden ${panel} px-4 py-3`}>
                <label className="form-label-dark">Sort by</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="input-dark mt-1"
                >
                  <option value="priority">Priority (High → Low)</option>
                  <option value="created_newest">Created — Newest first</option>
                  <option value="created_oldest">Created — Oldest first</option>
                  <option value="due_earliest">Due date — Earliest first</option>
                  <option value="due_latest">Due date — Latest first</option>
                </select>
              </div>
            )}

            {/* ── Quick add bar ── */}
            <QuickAdd onAdd={handleQuickAdd} />

            {/* ── Add task form ── */}
            {showAddForm ? (
              <div className={`${panel} p-5 space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">New Task</span>
                  <button onClick={() => setShowAddForm(false)} className="text-white/30 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddTask} className="space-y-4">

                  {/* Title row */}
                  <div>
                    <label className="form-label-dark">Title</label>
                    <input
                      type="text"
                      className="input-dark"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Priority + Due date row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label-dark">Priority</label>
                      <PriorityPicker value={priority} onChange={setPriority} />
                    </div>
                    <div>
                      <label className="form-label-dark">
                        Due Date <span className="normal-case font-normal text-white/25">(optional)</span>
                      </label>
                      <input
                        type="date"
                        className="input-dark"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="form-label-dark">
                      Description <span className="normal-case font-normal text-white/25">(optional)</span>
                    </label>
                    <textarea
                      className="input-dark resize-none"
                      placeholder="Add some details…"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary">Add Task</button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-3.5 rounded-xl border border-white/15 text-white/50 text-sm font-medium
                                 hover:border-white/30 hover:text-white transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                           border border-dashed border-white/15 text-sm text-white/40
                           hover:border-brand-yellow/50 hover:text-brand-yellow transition duration-200"
              >
                <Plus className="w-4 h-4" />
                Add a task
              </button>
            )}

            {/* ── Task list ── */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 text-white/20 text-sm">
                {filter === "completed"
                  ? "No completed tasks yet."
                  : filter === "pending"
                  ? "Nothing pending — great work!"
                  : "No tasks yet. Add one above."}
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTasks.map((task) => {
                  const isExpanded = expandedTaskIds.includes(task._id);
                  const isEditing = editingTaskId === task._id;
                  const taskPriority = task.priority ?? "medium";
                  const borderAccent = PRIORITY_BORDER[taskPriority];

                  return (
                    <li
                      key={task._id}
                      className={`rounded-2xl border-l-4 border border-white/10 px-4 py-4 space-y-2.5 transition duration-200
                                  ${borderAccent}
                                  ${task.completed
                                    ? "bg-white/[0.03] opacity-55"
                                    : "bg-white/5 hover:bg-white/8 hover:border-white/15"
                                  } backdrop-blur-sm`}
                    >
                      {/* Row — checkbox + title + actions */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => !isEditing && toggleTaskCompletion(task._id, task.completed)}
                          className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition duration-200 ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-white/20 hover:border-emerald-400"
                          }`}
                          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="input-dark py-2 text-sm"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`text-sm font-medium leading-snug break-words ${
                                task.completed ? "line-through text-white/30" : "text-white"
                              }`}
                            >
                              {task.title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdateTask(task._id)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition"
                                aria-label="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white transition"
                                aria-label="Cancel"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(task)}
                                className="p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white transition"
                                aria-label="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="p-1.5 rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-400 transition"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Priority picker (edit mode) or badge (view mode) */}
                      {isEditing ? (
                        <div className="ml-8">
                          <label className="form-label-dark mb-1.5">Priority</label>
                          <PriorityPicker value={editingPriority} onChange={setEditingPriority} />
                        </div>
                      ) : (
                        <div className="ml-8">
                          <PriorityBadge priority={taskPriority} />
                        </div>
                      )}

                      {/* Subtasks */}
                      {!isEditing && (
                        <Subtasks task={task} onUpdate={handleSubtaskUpdate} />
                      )}

                      {/* Description */}
                      {isEditing ? (
                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          className="input-dark text-sm resize-none ml-8"
                          rows={2}
                          placeholder="Description…"
                        />
                      ) : (
                        task.description && (
                          <div className="ml-8">
                            <p className="text-xs text-white/40 leading-relaxed break-words">
                              {isExpanded || task.description.length <= 120
                                ? task.description
                                : `${task.description.slice(0, 120)}…`}
                            </p>
                            {task.description.length > 120 && (
                              <button
                                onClick={() => toggleDescription(task._id)}
                                className="mt-1 flex items-center gap-0.5 text-xs text-brand-yellow/70 hover:text-brand-yellow font-medium transition"
                              >
                                {isExpanded
                                  ? <><ChevronUp className="w-3 h-3" />Less</>
                                  : <><ChevronDown className="w-3 h-3" />More</>}
                              </button>
                            )}
                          </div>
                        )
                      )}

                      {/* Meta — dates */}
                      {(task.dueDate || (task.completed && task.completedAt)) && (
                        <div className="ml-8 flex flex-wrap gap-3">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-xs text-white/30">
                              <Calendar className="w-3 h-3" />
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.completed && task.completedAt && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400/70">
                              <Check className="w-3 h-3" />
                              Done {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
