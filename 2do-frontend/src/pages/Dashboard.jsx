import { useEffect, useState, useCallback, useRef } from "react";
import { authRequest } from "../api";
import confetti from "canvas-confetti";
import {
  DndContext, closestCenter, closestCorners,
  PointerSensor, TouchSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check, RotateCcw, Pencil, Trash2, LogOut, Plus, X,
  ChevronDown, ChevronUp, SlidersHorizontal, Calendar,
  Flag, GripVertical, Sun, Flame, Clock, Keyboard,
  LayoutList, Columns2, TrendingUp, Circle, Link, ExternalLink,
  FileText, ClipboardList, Printer, Copy,
} from "lucide-react";
import Logo from "../assets/svg";
import QuickAdd from "../components/QuickAdd";
import Subtasks from "../components/Subtasks";
import ThemeToggle from "../components/ThemeToggle";

/* ─── Priority config ─── */
const PRIORITIES = {
  high:   { label: "High",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30",   dot: "bg-red-400"    },
  medium: { label: "Medium", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30", dot: "bg-amber-400"  },
  low:    { label: "Low",    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", dot: "bg-emerald-400" },
};
const PRIORITY_BORDER = {
  high:   "border-l-red-400/50",
  medium: "border-l-amber-400/40",
  low:    "border-l-emerald-400/30",
};
const KANBAN_COLUMNS = [
  { id: "todo",        label: "To do",       accent: "border-black/10 dark:border-white/10", dot: "bg-black/25 dark:bg-white/25", count_color: "text-lm-text3 dark:text-white/30" },
  { id: "in-progress", label: "In progress", accent: "border-amber-400/30",      dot: "bg-amber-400",    count_color: "text-amber-400"    },
  { id: "done",        label: "Done",        accent: "border-emerald-400/30",    dot: "bg-emerald-400",  count_color: "text-emerald-400"  },
];
function getTaskStatus(t) { if (t.status) return t.status; return t.completed ? "done" : "todo"; }

/* ─── PriorityPicker ─── */
function PriorityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = PRIORITIES[value] ?? PRIORITIES.medium;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition duration-150 ${cur.bg} ${cur.border} ${cur.color}`}>
        <Flag className="w-3 h-3" />{cur.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 rounded-xl border shadow-2xl overflow-hidden min-w-[130px]
                        border-black/10 bg-white dark:border-white/8 dark:bg-brand-dark">
          {Object.entries(PRIORITIES).map(([k, c]) => (
            <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition duration-100 ${value === k ? `${c.bg} ${c.color}` : "text-lm-text2 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/6 hover:text-lm-text1 dark:hover:text-white"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {c.label}
              {value === k && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PriorityBadge ─── */
function PriorityBadge({ priority }) {
  const c = PRIORITIES[priority] ?? PRIORITIES.medium;
  return (
    <span className={`badge ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
}

/* ─── PriorityFilterDropdown ─── */
const PRIORITY_DOT = { all: "bg-black/25 dark:bg-white/25", high: "bg-red-400", medium: "bg-amber-400", low: "bg-emerald-400" };
const PRIORITY_LABELS = { all: "Priority", high: "High", medium: "Medium", low: "Low" };
const PRIORITY_DOT_ACTIVE = { high: "bg-red-400", medium: "bg-amber-400", low: "bg-emerald-400" };
function PriorityFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const isActive = value !== "all";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-150
          ${isActive
            ? "border-brand-yellow/40 bg-brand-yellow/8 text-lm-text1 dark:text-white"
            : "border-black/[0.07] dark:border-white/[0.06] bg-black/[0.03] dark:bg-white/[0.03] text-lm-text2 dark:text-white/40 hover:text-lm-text1 dark:hover:text-white/70"}`}>
        {isActive && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT_ACTIVE[value]}`} />}
        {PRIORITY_LABELS[value]}
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 rounded-xl border shadow-2xl overflow-hidden min-w-[130px]
                        border-black/10 bg-white dark:border-white/8 dark:bg-brand-dark">
          {Object.entries(PRIORITY_DOT).map(([v, dot]) => (
            <button key={v} onClick={() => { onChange(v); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition duration-100
                ${value === v ? "bg-black/5 dark:bg-white/6 text-lm-text1 dark:text-white" : "text-lm-text2 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/6 hover:text-lm-text1 dark:hover:text-white"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {PRIORITY_LABELS[v]}
              {value === v && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SortDropdown ─── */
function SortDropdown({ value, onChange, opts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = opts.find(o => o.v === value);
  const isActive = value !== "manual";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-150
          ${isActive
            ? "border-brand-yellow/40 bg-brand-yellow/8 text-lm-text1 dark:text-white"
            : "border-black/[0.07] dark:border-white/[0.06] bg-black/[0.03] dark:bg-white/[0.03] text-lm-text2 dark:text-white/40 hover:text-lm-text1 dark:hover:text-white/70"}`}>
        {current?.l ?? "Sort"}
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 rounded-xl border shadow-2xl overflow-hidden min-w-[150px]
                        border-black/10 bg-white dark:border-white/8 dark:bg-brand-dark">
          {opts.map(o => (
            <button key={o.v} onClick={() => { onChange(o.v); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition duration-100
                ${value === o.v ? "bg-black/5 dark:bg-white/6 text-lm-text1 dark:text-white" : "text-lm-text2 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/6 hover:text-lm-text1 dark:hover:text-white"}`}>
              {o.l}
              {value === o.v && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Avatar ─── */
function Avatar({ avatarUrl, username, onClick }) {
  if (avatarUrl) return (
    <img src={`http://localhost:5000${avatarUrl}`} alt="Avatar" onClick={onClick}
      className="w-8 h-8 rounded-full object-cover cursor-pointer ring-1 ring-black/10 dark:ring-white/20 hover:ring-brand-yellow/60 transition" />
  );
  return (
    <button onClick={onClick} aria-label="Profile"
      className="w-8 h-8 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center font-bold text-sm hover:brightness-110 transition">
      {username?.charAt(0).toUpperCase() ?? "?"}
    </button>
  );
}

/* ─── StreakBadge ─── */
function StreakBadge({ streak, longestStreak }) {
  const [tip, setTip] = useState(false);
  if (!streak) return null;
  const col = streak >= 30 ? "text-red-400 border-red-400/20 bg-red-400/8" : streak >= 7 ? "text-orange-400 border-orange-400/20 bg-orange-400/8" : "text-orange-300 border-orange-300/15 bg-orange-300/6";
  return (
    <div className="relative">
      <button onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}
        onFocus={() => setTip(true)} onBlur={() => setTip(false)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition ${col}`}
        aria-label={`${streak}-day streak`}>
        <Flame className="w-3 h-3" />{streak}
      </button>
      {tip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-xl shadow-2xl text-xs pointer-events-none
                        border border-black/10 bg-white dark:border-white/8 dark:bg-brand-dark px-3 py-2.5">
          <p className="font-semibold text-lm-text1 dark:text-white">{streak}-day streak</p>
          {longestStreak > 0 && <p className="text-lm-text2 dark:text-white/35 mt-0.5">Best: {longestStreak} days</p>}
          <p className="text-lm-text3 dark:text-white/25 mt-0.5">Complete a task daily to keep it alive</p>
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t bg-white dark:bg-brand-dark border-black/10 dark:border-white/8" />
        </div>
      )}
    </div>
  );
}

/* ─── ShortcutHint ─── */
function ShortcutHint() {
  const [open, setOpen] = useState(false);
  const KEYS = [{ key: "N", desc: "New task" }, { key: "C", desc: "Complete focused" }, { key: "↵", desc: "Save" }, { key: "Esc", desc: "Cancel" }];
  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
        className="p-1.5 rounded-lg transition text-lm-text3 dark:text-white/20 hover:text-lm-text1 dark:hover:text-white/50 hover:bg-black/5 dark:hover:bg-white/5" aria-label="Shortcuts">
        <Keyboard className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 w-48 rounded-xl shadow-2xl p-3 space-y-1
                        border border-black/10 bg-white dark:border-white/8 dark:bg-brand-dark"
             onMouseDown={e => e.preventDefault()}>
          <p className="text-[9px] font-semibold uppercase tracking-widest px-1 pb-1.5
                        text-lm-text3 dark:text-white/25">Shortcuts</p>
          {KEYS.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between px-1 py-1">
              <span className="text-xs text-lm-text2 dark:text-white/45">{desc}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SortableTaskItem ─── */
function SortableTaskItem({ id, isDragDisabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isDragDisabled });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1, zIndex: isDragging ? 10 : "auto", position: "relative" };
  return <li ref={setNodeRef} style={style}>{children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}</li>;
}

/* ─── KanbanColumn ─── */
function KanbanColumn({ column, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="flex flex-col min-w-0 flex-1 min-w-[200px]">
      <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${column.accent}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${column.dot}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-lm-text2 dark:text-white/50">{column.label}</span>
        <span className={`ml-auto text-xs font-semibold tabular-nums ${column.count_color}`}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={`flex-1 rounded-xl min-h-[180px] p-1.5 space-y-2 transition-colors duration-100 ${isOver ? "bg-black/[0.03] dark:bg-white/[0.03] ring-1 ring-black/8 dark:ring-white/8" : ""}`}>
        {children}
        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-black/10 dark:border-white/6">
            <p className="text-[10px] font-medium text-lm-text3 dark:text-white/15">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── KanbanCard ─── */
function KanbanCard({ task, onEdit, onDelete, onToggleFocus }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: task._id, data: { task } });
  const p = task.priority ?? "medium";
  const cfg = PRIORITIES[p] ?? PRIORITIES.medium;
  const now = Date.now();
  const due = task.dueDate ? new Date(task.dueDate).getTime() : null;
  const ms  = due ? due - now : null;
  const overdue  = !task.completed && due !== null && ms < 0;
  const dueSoon  = !task.completed && !overdue && due !== null && ms < 864e5;
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style}
      className={`rounded-xl border px-3 py-2.5 space-y-2 select-none transition duration-100 ${isDragging ? "opacity-30 shadow-card-lift" : ""} ${task.completed ? "border-black/8 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] opacity-45" : overdue ? "border-red-400/15 bg-red-400/[0.03] hover:bg-red-400/[0.05]" : dueSoon ? "border-amber-400/15 bg-amber-400/[0.03] hover:bg-amber-400/[0.05]" : "border-black/8 dark:border-white/7 bg-white dark:bg-ink-5 hover:border-black/15 dark:hover:border-white/12 hover:bg-lm-surface2 dark:hover:bg-white/[0.06]"}`}>
      <div className="flex items-start gap-2">
        <button {...listeners} {...attributes} className="mt-0.5 shrink-0 text-lm-text3 dark:text-white/15 hover:text-lm-text2 dark:hover:text-white/40 cursor-grab active:cursor-grabbing touch-none transition" tabIndex={-1}><GripVertical className="w-3.5 h-3.5" /></button>
        <span className={`flex-1 text-xs font-medium leading-snug ${task.completed ? "line-through text-lm-text3 dark:text-white/25" : "text-lm-text1 dark:text-white/85"}`}>{task.title}</span>
      </div>
      <div className="flex items-center justify-between pl-5">
        <div className="flex flex-wrap gap-1">
          <span className={`badge ${cfg.bg} ${cfg.color}`}><span className={`w-1 h-1 rounded-full ${cfg.dot}`}/>{cfg.label}</span>
          {overdue  && <span className="badge bg-red-400/10 text-red-400"><Clock className="w-2.5 h-2.5"/>Overdue</span>}
          {dueSoon && !overdue && <span className="badge bg-amber-400/10 text-amber-400"><Clock className="w-2.5 h-2.5"/>Soon</span>}
          {task.focusToday && <span className="badge bg-brand-yellow/10 text-brand-yellow"><Sun className="w-2.5 h-2.5"/>Today</span>}
        </div>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <button onClick={() => onToggleFocus(task)} className={`p-1 rounded transition ${task.focusToday ? "text-brand-yellow" : "text-lm-text3 dark:text-white/15 hover:text-brand-yellow/60"}`}><Sun className="w-3 h-3"/></button>
          <button onClick={() => onEdit(task)} className="p-1 rounded transition text-lm-text3 dark:text-white/15 hover:text-lm-text1 dark:hover:text-white/70"><Pencil className="w-3 h-3"/></button>
          <button onClick={() => onDelete(task._id)} className="p-1 rounded transition text-lm-text3 dark:text-white/15 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
        </div>
      </div>
      {task.dueDate && (
        <div className="pl-5">
          <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-red-400/60" : dueSoon ? "text-amber-400/60" : "text-lm-text3 dark:text-white/20"}`}>
            <Calendar className="w-2.5 h-2.5"/>{new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      )}
      {task.links?.length > 0 && (
        <div className="pl-5 flex flex-wrap gap-1">
          {task.links.map(l => (
            <a key={l._id} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-sky-400/70 hover:text-sky-400 transition">
              <Link className="w-2.5 h-2.5" />{l.label || new URL(l.url).hostname}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── TaskLinks ─── */
function TaskLinks({ task, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [url, setUrl]       = useState("");
  const [label, setLabel]   = useState("");
  const [busy, setBusy]     = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    try {
      const updated = await authRequest(`tasks/${task._id}/links`, { url: url.trim(), label: label.trim() }, "POST");
      onUpdate(updated);
      setUrl(""); setLabel(""); setAdding(false);
    } catch {}
    setBusy(false);
  };

  const handleDelete = async (linkId) => {
    try {
      const updated = await authRequest(`tasks/${task._id}/links/${linkId}`, null, "DELETE");
      onUpdate(updated);
    } catch {}
  };

  const links = task.links ?? [];

  return (
    <div className="pl-7 space-y-1.5">
      {/* Existing links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {links.map(l => (
            <div key={l._id} className="group flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg border text-[11px]
                                        border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]
                                        hover:border-sky-400/30 dark:hover:border-sky-400/25 transition duration-150">
              <Link className="w-2.5 h-2.5 shrink-0 text-sky-400/60" />
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="max-w-[180px] truncate text-sky-500 dark:text-sky-400 hover:underline font-medium leading-none">
                {l.label || l.url}
              </a>
              <a href={l.url} target="_blank" rel="noopener noreferrer" tabIndex={-1}
                className="text-lm-text3 dark:text-white/20 hover:text-sky-400 transition ml-0.5" aria-label="Open link">
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button onClick={() => handleDelete(l._id)} aria-label="Remove link"
                className="ml-0.5 text-lm-text3 dark:text-white/15 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex gap-1.5">
            <input
              type="url"
              placeholder="https://…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              autoFocus
              className="input-dark text-xs py-1.5 flex-1 min-w-0"
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="input-dark text-xs py-1.5 w-28 shrink-0"
            />
          </div>
          <div className="flex gap-1.5">
            <button type="submit" disabled={busy || !url.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition
                         bg-sky-500/10 text-sky-500 dark:text-sky-400 hover:bg-sky-500/20 disabled:opacity-40">
              <Check className="w-3 h-3" />Add
            </button>
            <button type="button" onClick={() => { setAdding(false); setUrl(""); setLabel(""); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition
                         text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-[11px] font-medium transition
                     text-lm-text3 dark:text-white/25 hover:text-sky-500 dark:hover:text-sky-400">
          <Plus className="w-3 h-3" />Add link
        </button>
      )}
    </div>
  );
}

/* ─── Confetti ─── */
function fireConfetti() {
  const s = { particleCount: 55, spread: 65, startVelocity: 42, ticks: 190, gravity: 1.1, colors: ["#FDCE00","#FFFFFF","#F97316","#FDE68A"], disableForReducedMotion: true };
  confetti({ ...s, origin: { x: 0.2, y: 0.85 }, angle: 60 });
  confetti({ ...s, origin: { x: 0.8, y: 0.85 }, angle: 120 });
}

/* ════════════════════════════════════════
   REPORT VIEW
════════════════════════════════════════ */
function ReportView({ tasks, reportMonth, setReportMonth, onToggleForReport }) {
  const [copied, setCopied] = useState(false);

  // All months that have at least one forReport task (completed or not), for the month picker
  const availableMonths = [...new Set(
    tasks
      .filter(t => t.forReport)
      .map(t => {
        const d = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
  )].sort((a, b) => b.localeCompare(a));

  // Tasks for report tagged for the selected month
  const [selYear, selMonth] = reportMonth.split("-").map(Number);
  const monthTasks = tasks.filter(t => {
    if (!t.forReport) return false;
    const d = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
    return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
  });
  const completedTasks = monthTasks.filter(t => t.completed);
  const pendingTasks   = monthTasks.filter(t => !t.completed);

  const monthLabel = new Date(selYear, selMonth - 1, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Plain-text report for copy / print
  const buildReportText = () => {
    const lines = [];
    lines.push(`MONTHLY ACCOMPLISHMENT REPORT`);
    lines.push(`Period: ${monthLabel}`);
    lines.push(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`);
    lines.push(`${"─".repeat(50)}`);
    lines.push(``);
    if (completedTasks.length > 0) {
      lines.push(`COMPLETED TASKS (${completedTasks.length})`);
      completedTasks.forEach((t, i) => {
        lines.push(`  ${i + 1}. ${t.title}`);
        if (t.description) lines.push(`     ${t.description}`);
        if (t.completedAt) lines.push(`     Completed: ${new Date(t.completedAt).toLocaleDateString()}`);
        if (t.priority)    lines.push(`     Priority: ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}`);
      });
      lines.push(``);
    }
    if (pendingTasks.length > 0) {
      lines.push(`ONGOING / PENDING TASKS (${pendingTasks.length})`);
      pendingTasks.forEach((t, i) => {
        lines.push(`  ${i + 1}. ${t.title}`);
        if (t.description) lines.push(`     ${t.description}`);
        if (t.dueDate)     lines.push(`     Due: ${new Date(t.dueDate).toLocaleDateString()}`);
        if (t.priority)    lines.push(`     Priority: ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}`);
      });
      lines.push(``);
    }
    lines.push(`${"─".repeat(50)}`);
    lines.push(`Total for report: ${monthTasks.length}  |  Completed: ${completedTasks.length}  |  Pending: ${pendingTasks.length}`);
    return lines.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildReportText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Report – ${monthLabel}</title>
      <style>body{font-family:monospace;font-size:13px;padding:32px;white-space:pre-wrap;color:#111}</style>
      </head><body>${buildReportText().replace(/&/g,"&amp;").replace(/</g,"&lt;")}</body></html>`);
    w.document.close();
    w.print();
  };

  const PRIORITY_COLOR = { high: "text-red-400", medium: "text-amber-400", low: "text-emerald-400" };

  return (
    <div className="space-y-5">

      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Month picker */}
          <select value={reportMonth} onChange={e => setReportMonth(e.target.value)}
            className="input-dark text-xs py-1.5 h-auto w-auto">
            {/* Always show current month even if no tasks yet */}
            {[...new Set([reportMonth, ...availableMonths])].sort((a,b) => b.localeCompare(a)).map(m => {
              const [y, mo] = m.split("-").map(Number);
              const label = new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
          <span className="text-xs text-lm-text3 dark:text-white/30">
            {monthTasks.length} task{monthTasks.length !== 1 ? "s" : ""} for report
          </span>
        </div>
        {monthTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-150
                ${copied
                  ? "border-emerald-400/40 bg-emerald-400/8 text-emerald-500 dark:text-emerald-400"
                  : "border-black/[0.08] dark:border-white/[0.08] text-lm-text2 dark:text-white/40 hover:text-lm-text1 dark:hover:text-white/70"}`}>
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-150
                border-black/[0.08] dark:border-white/[0.08] text-lm-text2 dark:text-white/40 hover:text-lm-text1 dark:hover:text-white/70">
              <Printer className="w-3.5 h-3.5" />Print
            </button>
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {monthTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-400/8 border border-violet-400/15 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-violet-400/50" />
          </div>
          <p className="text-sm font-medium text-lm-text1 dark:text-white/60">No tasks marked for report</p>
          <p className="text-xs text-lm-text3 dark:text-white/25 max-w-xs">
            Tag tasks with the <FileText className="w-3 h-3 inline mx-0.5 text-violet-400" /> icon to include them here.
          </p>
        </div>
      )}

      {/* ── Report card ── */}
      {monthTasks.length > 0 && (
        <div className="rounded-2xl border overflow-hidden
                        border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-white/[0.02]">

          {/* Report heading */}
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-violet-400/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">Monthly Accomplishment Report</p>
            <p className="text-sm font-semibold text-lm-text1 dark:text-white/85 mt-0.5">{monthLabel}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">{completedTasks.length} completed</span>
              <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">{pendingTasks.length} pending</span>
            </div>
          </div>

          {/* Completed section */}
          {completedTasks.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
                Completed ({completedTasks.length})
              </p>
              {completedTasks.map((t, i) => (
                <div key={t._id} className="flex items-start gap-3 group">
                  <span className="mt-0.5 text-[10px] font-mono text-lm-text3 dark:text-white/20 w-4 shrink-0 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-sm font-medium text-lm-text1 dark:text-white/85 leading-snug">{t.title}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_COLOR[t.priority ?? "medium"]}`}>
                        {t.priority ?? "medium"}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-lm-text2 dark:text-white/30 mt-0.5 leading-relaxed">{t.description}</p>
                    )}
                    {t.completedAt && (
                      <p className="text-[10px] text-lm-text3 dark:text-white/20 mt-0.5">
                        Completed {new Date(t.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => onToggleForReport(t)} title="Remove from report"
                    className="shrink-0 mt-0.5 p-1 rounded opacity-0 group-hover:opacity-100 transition
                               text-lm-text3 dark:text-white/20 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Divider between sections */}
          {completedTasks.length > 0 && pendingTasks.length > 0 && (
            <div className="mx-6 border-t border-black/[0.06] dark:border-white/[0.05]" />
          )}

          {/* Pending section */}
          {pendingTasks.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                Ongoing / Pending ({pendingTasks.length})
              </p>
              {pendingTasks.map((t, i) => (
                <div key={t._id} className="flex items-start gap-3 group">
                  <span className="mt-0.5 text-[10px] font-mono text-lm-text3 dark:text-white/20 w-4 shrink-0 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-sm font-medium text-lm-text1 dark:text-white/85 leading-snug">{t.title}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_COLOR[t.priority ?? "medium"]}`}>
                        {t.priority ?? "medium"}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-lm-text2 dark:text-white/30 mt-0.5 leading-relaxed">{t.description}</p>
                    )}
                    {t.dueDate && (
                      <p className="text-[10px] text-lm-text3 dark:text-white/20 mt-0.5">
                        Due {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => onToggleForReport(t)} title="Remove from report"
                    className="shrink-0 mt-0.5 p-1 rounded opacity-0 group-hover:opacity-100 transition
                               text-lm-text3 dark:text-white/20 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer summary */}
          <div className="px-6 py-3 border-t border-black/[0.06] dark:border-white/[0.05] bg-black/[0.015] dark:bg-white/[0.01]
                          flex items-center justify-between">
            <span className="text-[10px] text-lm-text3 dark:text-white/25">
              Generated {new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}
            </span>
            <span className="text-[10px] text-lm-text3 dark:text-white/25">
              Total: {monthTasks.length} &nbsp;·&nbsp; Done: {completedTasks.length} &nbsp;·&nbsp; Pending: {pendingTasks.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [forReport, setForReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPriority, setEditingPriority] = useState("medium");
  const [editingForReport, setEditingForReport] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortOption, setSortOption] = useState("priority");
  const [showSort, setShowSort] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const [layoutMode, setLayoutMode] = useState("list");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [username, setUsername] = useState("You");
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [focusedTaskId, setFocusedTaskId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const fetchTasks = async () => {
    try { const d = await authRequest("tasks", null, "GET"); setTasks(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  };
  const fetchStreak = async () => {
    try { const d = await authRequest("user/streak", null, "GET"); if (d) { setStreak(d.currentStreak ?? 0); setLongestStreak(d.longestStreak ?? 0); } }
    catch (e) { console.error(e); }
  };
  const fetchUserInfo = async () => {
    try { const d = await authRequest("user/me", null, "GET"); if (d) { setUsername(d.username ?? "You"); if (d.avatar) setAvatarUrl(d.avatar); } }
    catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTasks(); fetchStreak(); fetchUserInfo(); }, []);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || document.activeElement?.isContentEditable;
      if (e.key === "Escape") {
        if (editingTaskId) { cancelEdit(); return; }
        if (showAddForm) { setShowAddForm(false); return; }
        if (showProfileModal) { setShowProfileModal(false); return; }
        return;
      }
      if (typing) return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); if (!showAddForm && !editingTaskId && !showProfileModal) setShowAddForm(true); return; }
      if ((e.key === "c" || e.key === "C") && focusedTaskId) {
        e.preventDefault();
        const t = tasks.find(t => t._id === focusedTaskId);
        if (t && !editingTaskId) toggleTaskCompletion(t._id, t.completed);
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAddForm, showProfileModal, editingTaskId, focusedTaskId, tasks]);

  /* ── drag handlers ── */
  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setTasks(prev => {
      const oi = prev.findIndex(t => t._id === active.id);
      const ni = prev.findIndex(t => t._id === over.id);
      const r = arrayMove(prev, oi, ni);
      authRequest("tasks/reorder", { orderedIds: r.map(t => t._id) }, "PATCH").catch(console.error);
      return r;
    });
  }, []);

  const handleKanbanDragEnd = useCallback(async ({ active, over }) => {
    if (!over) return;
    const col = over.id;
    if (!["todo","in-progress","done"].includes(col)) return;
    const task = tasks.find(t => t._id === active.id);
    if (!task) return;
    const cur = getTaskStatus(task);
    if (cur === col) return;
    const wasCompleted = task.completed;
    const nowCompleted = col === "done";
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: col, completed: nowCompleted, completedAt: nowCompleted ? new Date().toISOString() : null } : t));
    if (col === "done" && !wasCompleted && tasks.filter(t => !t.completed && t._id !== task._id).length === 0) fireConfetti();
    try { await authRequest(`tasks/${task._id}`, { status: col }, "PUT"); fetchStreak(); }
    catch { setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: cur, completed: wasCompleted } : t)); }
  }, [tasks]);

  /* ── avatar upload ── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const res = await fetch("http://localhost:5000/api/user/avatar", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: fd });
      const r = await res.json(); if (res.ok) setAvatarUrl(r.avatar);
    } catch {}
  };

  /* ── task actions ── */
  const handleAddTask = async (e) => {
    e.preventDefault();
    try { await authRequest("tasks", { title, description, dueDate, priority, forReport }, "POST"); setTitle(""); setDescription(""); setDueDate(""); setPriority("medium"); setForReport(false); setShowAddForm(false); fetchTasks(); } catch {}
  };
  const handleQuickAdd = async ({ title: t, dueDate: d }) => {
    if (!t?.trim()) return;
    await authRequest("tasks", { title: t.trim(), dueDate: d, priority: "medium" }, "POST"); fetchTasks();
  };
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try { await authRequest(`tasks/${id}`, null, "DELETE"); fetchTasks(); } catch {}
  };
  const toggleTaskCompletion = async (id, cur) => {
    try {
      await authRequest(`tasks/${id}`, { completed: !cur }, "PUT");
      if (!cur) { const rem = tasks.filter(t => !t.completed && t._id !== id).length; if (rem === 0) fireConfetti(); fetchStreak(); }
      fetchTasks();
    } catch {}
  };
  const handleUpdateTask = async (id) => {
    try { await authRequest(`tasks/${id}`, { title: editingTitle, description: editingDescription, priority: editingPriority, forReport: editingForReport }, "PUT"); setEditingTaskId(null); fetchTasks(); } catch {}
  };
  const startEdit = (t) => { setEditingTaskId(t._id); setEditingTitle(t.title); setEditingDescription(t.description || ""); setEditingPriority(t.priority || "medium"); setEditingForReport(t.forReport ?? false); };
  const cancelEdit = () => { setEditingTaskId(null); setEditingTitle(""); setEditingDescription(""); setEditingPriority("medium"); setEditingForReport(false); };
  const handleSubtaskUpdate = (t) => setTasks(prev => prev.map(x => x._id === t._id ? t : x));
  const toggleFocusToday = async (task) => {
    const next = !task.focusToday;
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, focusToday: next } : t));
    try { await authRequest(`tasks/${task._id}`, { focusToday: next }, "PUT"); }
    catch { setTasks(prev => prev.map(t => t._id === task._id ? { ...t, focusToday: task.focusToday } : t)); }
  };
  const toggleForReport = async (task) => {
    const next = !task.forReport;
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, forReport: next } : t));
    try { await authRequest(`tasks/${task._id}`, { forReport: next }, "PUT"); }
    catch { setTasks(prev => prev.map(t => t._id === task._id ? { ...t, forReport: task.forReport } : t)); }
  };
  const toggleDescription = (id) => setExpandedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleLogout = () => { localStorage.removeItem("token"); window.location.href = "/login"; };

  /* ── derived state ── */
  const PW = { high: 0, medium: 1, low: 2 };
  const todayStr = new Date().toDateString();
  const isToday = (d) => d && new Date(d).toDateString() === todayStr;
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const highUrgent = tasks.filter(t => !t.completed && t.priority === "high").length;
  const todayCount = tasks.filter(t => !t.completed && (isToday(t.dueDate) || t.focusToday)).length;
  const reportCount = tasks.filter(t => t.forReport).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const filteredTasks = tasks
    .filter(t => {
      if (viewMode === "today") return !t.completed && (isToday(t.dueDate) || t.focusToday);
      if (filter === "completed") return t.completed;
      if (filter === "pending")   return !t.completed;
      return true;
    })
    .filter(t => priorityFilter === "all" || (t.priority || "medium") === priorityFilter)
    .sort((a, b) => {
      if (sortOption === "manual") return 0;
      if (sortOption === "priority") { const d = (PW[a.priority||"medium"]??1) - (PW[b.priority||"medium"]??1); return d !== 0 ? d : new Date(b.createdAt) - new Date(a.createdAt); }
      if (sortOption === "created_newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "created_oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "due_earliest")   return new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity);
      if (sortOption === "due_latest")     return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      return 0;
    });

  const SORT_OPTS = [
    { v: "manual",         l: "Manual order" },
    { v: "priority",       l: "Priority" },
    { v: "created_newest", l: "Newest first" },
    { v: "created_oldest", l: "Oldest first" },
    { v: "due_earliest",   l: "Due earliest" },
    { v: "due_latest",     l: "Due latest" },
  ];

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-lm-bg dark:bg-brand-dark text-lm-text1 dark:text-white overflow-x-hidden transition-colors duration-300">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(253,206,0,0.04) 0%, transparent 70%)" }} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl
                         border-black/[0.07] bg-lm-bg/85 dark:border-white/[0.06] dark:bg-brand-dark/85">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 h-12 flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            <Logo className="h-auto w-10 opacity-95" />
            {highUrgent > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {highUrgent} urgent
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <StreakBadge streak={streak} longestStreak={longestStreak} />
            <ShortcutHint />
            <ThemeToggle />
            <Avatar avatarUrl={avatarUrl} username={username} onClick={() => setShowProfileModal(true)} />
            <button onClick={handleLogout} className="p-1.5 rounded-lg transition
                                                       text-lm-text3 dark:text-white/25 hover:text-lm-text1 dark:hover:text-white/60 hover:bg-black/5 dark:hover:bg-white/5" aria-label="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center sm:items-center" onClick={() => setShowProfileModal(false)}>
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl border
                          bg-white border-black/10 dark:bg-[#0e0e0e] dark:border-white/8"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-lm-text1 dark:text-white">Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="transition text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3">
              <Avatar avatarUrl={avatarUrl} username={username} onClick={() => {}} />
              <span className="text-sm font-medium text-lm-text1 dark:text-white">{username}</span>
            </div>
            <div>
              <label className="form-label-dark">Change avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload}
                className="block w-full text-xs text-lm-text2 dark:text-white/35 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black/6 dark:file:bg-white/8 file:text-lm-text1 dark:file:text-white/60 file:text-xs file:font-medium hover:file:bg-black/10 dark:hover:file:bg-white/12 transition cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-10 pt-6 pb-20">

        {/* ════ STATS ROW ════ */}
        <div className="mb-3 flex items-center gap-6 flex-wrap">
          {/* Stat chips */}
          <div className="flex items-center gap-1">
            <span className="text-2xl font-semibold tabular-nums text-lm-text1 dark:text-white/90">{total}</span>
            <span className="text-xs font-medium text-lm-text3 dark:text-white/30 ml-1 mt-0.5">total</span>
          </div>
          <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.07]" />
          <div className="flex items-center gap-1">
            <span className="text-2xl font-semibold tabular-nums text-emerald-500 dark:text-emerald-400">{done}</span>
            <span className="text-xs font-medium text-lm-text3 dark:text-white/30 ml-1 mt-0.5">done</span>
          </div>
          <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.07]" />
          <div className="flex items-center gap-1">
            <span className="text-2xl font-semibold tabular-nums text-amber-500 dark:text-brand-yellow">{pending}</span>
            <span className="text-xs font-medium text-lm-text3 dark:text-white/30 ml-1 mt-0.5">pending</span>
          </div>

          {/* Progress bar — grows to fill remaining space */}
          {total > 0 && (
            <div className="flex-1 min-w-[100px] flex items-center gap-3">
              <div className="flex-1 h-[3px] rounded-full bg-black/[0.07] dark:bg-white/[0.07] overflow-hidden">
                <div className="h-full rounded-full bg-brand-yellow transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs tabular-nums font-medium text-lm-text3 dark:text-white/30 shrink-0">{progress}%</span>
            </div>
          )}
        </div>

        {/* ════ FILTER BAR ════ */}
        {viewMode === "all" && (
          <div className="mb-5 flex items-center gap-2 flex-wrap">

            {/* Status tabs */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl border
                            bg-black/[0.03] border-black/[0.07]
                            dark:bg-white/[0.03] dark:border-white/[0.06]">
              {[
                { v: "all",       l: "All" },
                { v: "pending",   l: "Pending" },
                { v: "completed", l: "Done" },
              ].map(({ v, l }) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150
                    ${filter === v
                      ? "bg-white dark:bg-white/10 text-lm-text1 dark:text-white shadow-sm"
                      : "text-lm-text3 dark:text-white/35 hover:text-lm-text1 dark:hover:text-white/60"}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Priority compact dropdown */}
            <PriorityFilterDropdown value={priorityFilter} onChange={setPriorityFilter} />

            {/* Sort compact dropdown */}
            <SortDropdown value={sortOption} onChange={setSortOption} opts={SORT_OPTS} />

          </div>
        )}

        <div>
          {/* ════ TASK FEED ════ */}
          <section className="space-y-4">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">

              {/* View tabs */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl border
                              bg-black/[0.04] border-black/[0.07]
                              dark:bg-white/[0.04] dark:border-white/[0.06]">
                <button onClick={() => setViewMode("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${viewMode === "all" ? "bg-black/8 text-lm-text1 dark:bg-white/8 dark:text-white" : "text-lm-text3 dark:text-white/35 hover:text-lm-text1 dark:hover:text-white/60"}`}>
                  All
                </button>
                <button onClick={() => setViewMode("today")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${viewMode === "today" ? "bg-brand-yellow text-brand-dark" : "text-lm-text3 dark:text-white/35 hover:text-lm-text1 dark:hover:text-white/60"}`}>
                  <Sun className="w-3 h-3" />Today
                  {todayCount > 0 && (
                    <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold ${viewMode === "today" ? "bg-black/20 text-brand-dark" : "bg-brand-yellow/20 text-brand-yellow"}`}>{todayCount}</span>
                  )}
                </button>
                <button onClick={() => setViewMode("report")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${viewMode === "report" ? "bg-violet-500 text-white" : "text-lm-text3 dark:text-white/35 hover:text-lm-text1 dark:hover:text-white/60"}`}>
                  <ClipboardList className="w-3 h-3" />Report
                  {reportCount > 0 && (
                    <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold ${viewMode === "report" ? "bg-white/20 text-white" : "bg-violet-400/20 text-violet-500 dark:text-violet-400"}`}>{reportCount}</span>
                  )}
                </button>
              </div>

              {/* Layout toggle — hidden in report mode */}
              {viewMode !== "report" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 p-0.5 rounded-xl border
                                bg-black/[0.04] border-black/[0.07]
                                dark:bg-white/[0.04] dark:border-white/[0.06]">
                  {[["list", <LayoutList className="w-3.5 h-3.5" key="ll"/>],["kanban", <Columns2 className="w-3.5 h-3.5" key="c2"/>]].map(([m, icon]) => (
                    <button key={m} onClick={() => setLayoutMode(m)} aria-label={`${m} view`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${layoutMode === m ? "bg-black/8 text-lm-text1 dark:bg-white/8 dark:text-white" : "text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white/55"}`}>
                      {icon}{m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>

            {/* Today context line */}
            {viewMode === "today" && (
              <div className="flex items-center justify-between px-0.5">
                <div>
                  <p className="text-sm font-semibold text-lm-text1 dark:text-white/85">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-xs mt-0.5 text-lm-text3 dark:text-white/25">
                    {filteredTasks.length === 0 ? "Nothing on your plate" : `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""} to tackle`}
                  </p>
                </div>
                {filteredTasks.length > 0 && (
                  <span className="text-xs tabular-nums text-lm-text3 dark:text-white/20">{filteredTasks.filter(t => t.completed).length}/{filteredTasks.length}</span>
                )}
              </div>
            )}

            {/* ── Quick-add ── */}
            {viewMode !== "report" && <QuickAdd onAdd={handleQuickAdd} />}

            {/* ── Add form ── */}
            {viewMode !== "report" && (showAddForm ? (
              <div className="rounded-2xl border p-5 space-y-4 shadow-card-lift
                              border-black/[0.08] bg-white dark:border-white/[0.07] dark:bg-[#0d0d0d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.07em] text-lm-text2 dark:text-white/70">New task</span>
                  <button onClick={() => setShowAddForm(false)} className="transition text-lm-text3 dark:text-white/25 hover:text-lm-text1 dark:hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                    <label className="form-label-dark">Title</label>
                    <input type="text" className="input-dark" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label-dark">Priority</label>
                      <PriorityPicker value={priority} onChange={setPriority} />
                    </div>
                    <div>
                      <label className="form-label-dark">Due date <span className="normal-case font-normal text-lm-text3 dark:text-white/20">(optional)</span></label>
                      <input type="date" className="input-dark" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label-dark">Description <span className="normal-case font-normal text-lm-text3 dark:text-white/20">(optional)</span></label>
                    <textarea className="input-dark resize-none" placeholder="Add details…" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  {/* For Report toggle */}
                  <button type="button" onClick={() => setForReport(p => !p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition duration-150 w-fit
                      ${forReport
                        ? "border-violet-400/40 bg-violet-400/8 text-violet-500 dark:text-violet-400"
                        : "border-black/[0.08] dark:border-white/[0.08] text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white/60 hover:border-black/20 dark:hover:border-white/20"}`}>
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {forReport ? "Marked for report" : "Mark for monthly report"}
                  </button>
                  <div className="flex gap-2.5 pt-1">
                    <button type="submit" className="btn-primary px-5 py-2">Add task</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost-dark px-5 py-2">Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed transition duration-200
                           border-black/[0.10] text-lm-text3 hover:border-brand-yellow/40 hover:text-brand-yellow/80
                           dark:border-white/[0.08] dark:text-white/25 dark:hover:border-brand-yellow/40 dark:hover:text-brand-yellow/80">
                <Plus className="w-3.5 h-3.5" />Add a task
              </button>
            ) /* end add form conditional */ )}

            {/* ════ REPORT VIEW ════ */}
            {viewMode === "report" && (
              <ReportView
                tasks={tasks}
                reportMonth={reportMonth}
                setReportMonth={setReportMonth}
                onToggleForReport={toggleForReport}
              />
            )}

            {/* ════ KANBAN + LIST ════ */}
            {viewMode !== "report" && (layoutMode === "kanban" ? (
              <div className="overflow-x-auto -mx-1 px-1 pb-4">
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleKanbanDragEnd}>
                  <div className="flex gap-4 min-w-[600px]">
                    {KANBAN_COLUMNS.map(col => {
                      const colTasks = tasks.filter(t => {
                        if (priorityFilter !== "all" && (t.priority || "medium") !== priorityFilter) return false;
                        if (viewMode === "today") return !t.completed && (isToday(t.dueDate) || t.focusToday) && getTaskStatus(t) === col.id;
                        return getTaskStatus(t) === col.id;
                      });
                      return (
                        <KanbanColumn key={col.id} column={col} tasks={colTasks}>
                          {colTasks.map(task => (
                            <KanbanCard key={task._id} task={task} onEdit={startEdit} onDelete={handleDeleteTask} onToggleFocus={toggleFocusToday} />
                          ))}
                        </KanbanColumn>
                      );
                    })}
                  </div>
                </DndContext>
              </div>

            ) : (
            /* ════ LIST ════ */
            filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                {viewMode === "today" ? (
                  <>
                    <Sun className="w-7 h-7 text-lm-border dark:text-white/[0.07]" />
                    <p className="text-xs text-lm-text3 dark:text-white/20">Nothing flagged for today.</p>
                    <p className="text-[10px] text-lm-text3 dark:text-white/12">Click ☀ on any task to add it to your focus.</p>
                  </>
                ) : filter === "all" && total > 0 && pending === 0 ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-400/8 border border-emerald-400/15 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-medium text-lm-text1 dark:text-white/70">All done</p>
                    <p className="text-xs text-lm-text3 dark:text-white/25">Every task is checked off.</p>
                    {streak > 0 && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/8 border border-orange-400/15 text-orange-400 text-xs font-medium">
                        <Flame className="w-3 h-3" />{streak}-day streak
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-lm-text3 dark:text-white/20">
                    {filter === "completed" ? "No completed tasks yet." : filter === "pending" ? "Nothing pending — nice." : "No tasks yet."}
                  </p>
                )}
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-1.5">
                    {filteredTasks.map(task => {
                      const isExp  = expandedTaskIds.includes(task._id);
                      const isEdit = editingTaskId === task._id;
                      const tp     = task.priority ?? "medium";
                      const isDragDisabled = sortOption !== "manual" || isEdit || task.completed;
                      const now  = Date.now();
                      const due  = task.dueDate ? new Date(task.dueDate).getTime() : null;
                      const ms   = due ? due - now : null;
                      const over = !task.completed && due !== null && ms < 0;
                      const soon = !task.completed && !over && due !== null && ms < 864e5;

                      return (
                        <SortableTaskItem key={task._id} id={task._id} isDragDisabled={isDragDisabled}>
                          {({ dragHandleProps, isDragging }) => (
                            <div
                              tabIndex={0}
                              onFocus={() => setFocusedTaskId(task._id)}
                              onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusedTaskId(p => p === task._id ? null : p); }}
                              style={over && !isDragging ? { boxShadow: "0 0 0 1px rgba(248,113,113,0.12), 0 0 20px rgba(248,113,113,0.06)" }
                                   : soon && !isDragging ? { boxShadow: "0 0 0 1px rgba(251,191,36,0.10), 0 0 20px rgba(251,191,36,0.05)" } : undefined}
                              className={`rounded-xl border px-4 py-3.5 space-y-2.5 transition duration-150 outline-none
                                focus-visible:ring-1 focus-visible:ring-black/15 dark:focus-visible:ring-white/20
                                ${isDragging ? "opacity-30 shadow-card-lift" : ""}
                                ${task.completed ? "border-black/[0.05] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.015] opacity-40"
                                  : over  ? "border-red-400/15 bg-red-400/[0.025] hover:bg-red-400/[0.04]"
                                  : soon  ? "border-amber-400/15 bg-amber-400/[0.025] hover:bg-amber-400/[0.04]"
                                  : "border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.025] hover:border-black/[0.12] dark:hover:border-white/[0.10] hover:bg-lm-surface2 dark:hover:bg-white/[0.04]"
                                } backdrop-blur-sm`}
                            >
                              {/* Row 1: handle + checkbox + title + actions */}
                              <div className="flex items-center gap-2.5">
                                {sortOption === "manual" && !isEdit && (
                                  <button {...dragHandleProps} tabIndex={-1} aria-label="Drag"
                                    className={`shrink-0 touch-none transition ${task.completed ? "text-lm-border dark:text-white/[0.08] cursor-default" : "text-lm-text3 dark:text-white/[0.15] hover:text-lm-text2 dark:hover:text-white/40 cursor-grab active:cursor-grabbing"}`}>
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button onClick={() => !isEdit && toggleTaskCompletion(task._id, task.completed)}
                                  className={`shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition duration-150 ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-black/20 dark:border-white/20 hover:border-emerald-400/60"}`}
                                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}>
                                  {task.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  {isEdit ? (
                                    <input type="text" value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleUpdateTask(task._id); } if (e.key === "Escape") { e.preventDefault(); cancelEdit(); } }}
                                      className="input-dark py-1.5 text-sm" autoFocus />
                                  ) : (
                                    <span className={`text-sm leading-snug break-words ${task.completed ? "line-through text-lm-text3 dark:text-white/25" : "text-lm-text1 dark:text-white/85 font-medium"}`}>{task.title}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {isEdit ? (
                                    <>
                                      <button onClick={() => handleUpdateTask(task._id)} className="p-1.5 rounded-lg text-emerald-500 dark:text-emerald-400 hover:bg-emerald-400/8 transition" aria-label="Save"><Check className="w-3.5 h-3.5" /></button>
                                      <button onClick={cancelEdit} className="p-1.5 rounded-lg transition text-lm-text3 dark:text-white/25 hover:text-lm-text1 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/6" aria-label="Cancel"><RotateCcw className="w-3.5 h-3.5" /></button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => toggleFocusToday(task)} className={`p-1.5 rounded-lg transition ${task.focusToday ? "text-brand-yellow hover:bg-brand-yellow/8" : "text-lm-text3 dark:text-white/[0.15] hover:text-brand-yellow/60 hover:bg-black/5 dark:hover:bg-white/5"}`} title={task.focusToday ? "Remove from today" : "Add to today"}><Sun className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => toggleForReport(task)} className={`p-1.5 rounded-lg transition ${task.forReport ? "text-violet-500 dark:text-violet-400 hover:bg-violet-400/8" : "text-lm-text3 dark:text-white/[0.15] hover:text-violet-400/70 hover:bg-black/5 dark:hover:bg-white/5"}`} title={task.forReport ? "Remove from report" : "Mark for monthly report"}><FileText className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => startEdit(task)} className="p-1.5 rounded-lg transition text-lm-text3 dark:text-white/[0.15] hover:text-lm-text1 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5" aria-label="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => handleDeleteTask(task._id)} className="p-1.5 rounded-lg transition text-lm-text3 dark:text-white/[0.15] hover:text-red-400 hover:bg-red-400/8" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: priority editor or badges */}
                              {isEdit ? (
                                <div className="pl-7 flex flex-wrap items-center gap-3">
                                  <div>
                                    <label className="form-label-dark">Priority</label>
                                    <PriorityPicker value={editingPriority} onChange={setEditingPriority} />
                                  </div>
                                  <button type="button" onClick={() => setEditingForReport(p => !p)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition duration-150 mt-4
                                      ${editingForReport
                                        ? "border-violet-400/40 bg-violet-400/8 text-violet-500 dark:text-violet-400"
                                        : "border-black/[0.08] dark:border-white/[0.08] text-lm-text3 dark:text-white/30 hover:text-lm-text1 dark:hover:text-white/60"}`}>
                                    <FileText className="w-3 h-3 shrink-0" />
                                    {editingForReport ? "For report" : "Mark for report"}
                                  </button>
                                </div>
                              ) : (
                                <div className="pl-7 flex flex-wrap items-center gap-1">
                                  <PriorityBadge priority={tp} />
                                  {task.forReport && <span className="badge bg-violet-400/8 text-violet-500 dark:text-violet-400"><FileText className="w-2.5 h-2.5"/>For report</span>}
                                  {task.focusToday && <span className="badge bg-brand-yellow/8 text-brand-yellow"><Sun className="w-2.5 h-2.5"/>Today</span>}
                                  {isToday(task.dueDate) && !task.focusToday && <span className="badge bg-sky-400/8 text-sky-400"><Calendar className="w-2.5 h-2.5"/>Due today</span>}
                                  {soon && !isToday(task.dueDate) && <span className="badge bg-amber-400/8 text-amber-400"><Clock className="w-2.5 h-2.5"/>Due soon</span>}
                                  {over && <span className="badge bg-red-400/8 text-red-400"><Clock className="w-2.5 h-2.5"/>Overdue</span>}
                                </div>
                              )}

                              {/* Subtasks */}
                              {!isEdit && <Subtasks task={task} onUpdate={handleSubtaskUpdate} />}

                              {/* Links */}
                              {!isEdit && <TaskLinks task={task} onUpdate={handleSubtaskUpdate} />}

                              {/* Description */}
                              {isEdit ? (
                                <textarea value={editingDescription} onChange={e => setEditingDescription(e.target.value)} className="input-dark text-sm resize-none pl-7" rows={2} placeholder="Description…" />
                              ) : task.description && (
                                <div className="pl-7">
                                  <p className="text-xs leading-relaxed break-words text-lm-text2 dark:text-white/30">
                                    {isExp || task.description.length <= 120 ? task.description : `${task.description.slice(0,120)}…`}
                                  </p>
                                  {task.description.length > 120 && (
                                    <button onClick={() => toggleDescription(task._id)} className="mt-1 flex items-center gap-0.5 text-[10px] text-brand-yellow/50 hover:text-brand-yellow font-medium transition">
                                      {isExp ? <><ChevronUp className="w-3 h-3"/>Less</> : <><ChevronDown className="w-3 h-3"/>More</>}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Dates */}
                              {(task.dueDate || (task.completed && task.completedAt)) && (
                                <div className="pl-7 flex flex-wrap gap-3">
                                  {task.dueDate && (
                                    <span className={`flex items-center gap-1 text-[10px] font-medium ${over ? "text-red-400/70" : soon ? "text-amber-400/70" : isToday(task.dueDate) ? "text-sky-400/60" : "text-lm-text3 dark:text-white/20"}`}>
                                      <Calendar className="w-2.5 h-2.5"/>Due {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {task.completed && task.completedAt && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-500/60 dark:text-emerald-400/50">
                                      <Check className="w-2.5 h-2.5"/>Done {new Date(task.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </SortableTaskItem>
                      );
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
            ) /* end list */
            ))} {/* end layoutMode/report guard */}
          </section>
        </div>
      </main>
    </div>
  );
}

