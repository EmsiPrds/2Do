import { useState, useRef, useEffect } from "react";
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { authRequest } from "../api";

/* ── thin progress bar ── */
function SubtaskProgress({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div className="flex items-center gap-2">
      {/* x/y counter */}
      <span className={`text-[11px] font-semibold tabular-nums ${
        allDone ? "text-emerald-400" : "text-lm-text2 dark:text-white/50"
      }`}>
        {done}/{total}
      </span>
      {/* bar */}
      <div className="flex-1 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-400 ${
            allDone ? "bg-emerald-400" : "bg-brand-yellow"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* percent */}
      <span className={`text-[11px] font-medium tabular-nums ${
        allDone ? "text-emerald-400" : "text-lm-text3 dark:text-white/30"
      }`}>
        {pct}%
      </span>
    </div>
  );
}

/* ── main component ── */
export default function Subtasks({ task, onUpdate }) {
  const [expanded, setExpanded]   = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [adding, setAdding]       = useState(false);
  const [loading, setLoading]     = useState(null); // subtaskId being mutated
  const inputRef = useRef(null);

  const subtasks = task.subtasks ?? [];
  const doneCount = subtasks.filter((s) => s.completed).length;
  const hasSubtasks = subtasks.length > 0;

  // Auto-focus the input when adding mode opens
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  /* ── handlers ── */
  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const updated = await authRequest(`tasks/${task._id}/subtasks`, { title: newTitle.trim() }, "POST");
      setNewTitle("");
      onUpdate(updated);
      // keep adding mode open for rapid entry
      inputRef.current?.focus();
    } catch { /* noop */ }
  };

  const handleToggle = async (subtaskId) => {
    setLoading(subtaskId);
    try {
      const updated = await authRequest(`tasks/${task._id}/subtasks/${subtaskId}`, null, "PATCH");
      onUpdate(updated);
    } catch { /* noop */ }
    finally { setLoading(null); }
  };

  const handleDelete = async (subtaskId) => {
    setLoading(subtaskId);
    try {
      const updated = await authRequest(`tasks/${task._id}/subtasks/${subtaskId}`, null, "DELETE");
      onUpdate(updated);
    } catch { /* noop */ }
    finally { setLoading(null); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
  };

  return (
    <div className="ml-8 space-y-2">

      {/* Progress bar + toggle — always visible when there are subtasks */}
      {hasSubtasks && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="w-full group"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SubtaskProgress done={doneCount} total={subtasks.length} />
            </div>
            <span className="transition text-lm-text3 dark:text-white/25 group-hover:text-lm-text2 dark:group-hover:text-white/50">
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>
        </button>
      )}

      {/* Expanded checklist */}
      {(expanded || !hasSubtasks) && (
        <div className="space-y-1">
          {subtasks.map((sub) => (
            <div
              key={sub._id}
              className={`group flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition duration-150
                          ${loading === sub._id ? "opacity-50 pointer-events-none" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(sub._id)}
                className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition duration-150 ${
                  sub.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-black/20 dark:border-white/20 hover:border-emerald-400"
                }`}
                aria-label={sub.completed ? "Mark incomplete" : "Mark complete"}
              >
                {sub.completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
              </button>

              {/* Title */}
              <span className={`flex-1 text-xs leading-relaxed break-words ${
                sub.completed ? "line-through text-lm-text3 dark:text-white/25" : "text-lm-text2 dark:text-white/70"
              }`}>
                {sub.title}
              </span>

              {/* Delete — visible on hover */}
              <button
                type="button"
                onClick={() => handleDelete(sub._id)}
                className="opacity-0 group-hover:opacity-100 transition p-0.5 text-lm-text3 dark:text-white/20 hover:text-red-400"
                aria-label="Delete subtask"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add subtask input */}
          {adding ? (
            <form onSubmit={handleAdd} className="flex items-center gap-2 px-2 py-1">
              <div className="w-4 h-4 shrink-0 rounded border-2 border-black/15 dark:border-white/10" />
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (!newTitle.trim()) { setAdding(false); } }}
                placeholder="Subtask title…"
                className="flex-1 bg-transparent text-xs outline-none pb-0.5 transition
                           text-lm-text1 dark:text-white placeholder-lm-text3 dark:placeholder-white/25
                           border-b border-black/15 dark:border-white/15 focus:border-brand-yellow/50"
              />
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="text-brand-yellow/60 hover:text-brand-yellow transition disabled:opacity-30"
                aria-label="Add subtask"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setAdding(true); setExpanded(true); }}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs transition duration-150 rounded-lg
                         text-lm-text3 dark:text-white/25 hover:text-brand-yellow/70 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Plus className="w-3 h-3" />
              Add subtask
            </button>
          )}
        </div>
      )}
    </div>
  );
}
