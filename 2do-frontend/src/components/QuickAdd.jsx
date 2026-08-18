import { useState, useRef, useEffect } from "react";
import * as chrono from "chrono-node";
import { Sparkles, ArrowRight, Calendar, X } from "lucide-react";

/* ─────────────────────────────────────
   Helpers
───────────────────────────────────── */

/**
 * Parse a natural-language string and extract:
 *   - title  : the text with the date expression removed
 *   - date   : JS Date | null
 *   - dateStr: YYYY-MM-DD string for <input type="date"> | ""
 *   - hint   : human-readable preview of what was parsed, e.g. "Tomorrow, Jul 20"
 */
function parseInput(raw) {
  const results = chrono.parse(raw, new Date(), { forwardDate: true });

  if (!results.length) {
    return { title: raw.trim(), date: null, dateStr: "", hint: "" };
  }

  const result = results[0];
  const date = result.date();

  // Remove the matched date expression from the title text
  const before = raw.slice(0, result.index).trim();
  const after  = raw.slice(result.index + result.text.length).trim();
  const title  = [before, after].filter(Boolean).join(" ").trim() || raw.trim();

  // YYYY-MM-DD in local time (not UTC)
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  // Friendly label
  const today    = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const isToday    = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const hint = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return { title, date, dateStr, hint };
}

/* ─────────────────────────────────────
   Component
───────────────────────────────────── */
export default function QuickAdd({ onAdd }) {
  const [value, setValue]         = useState("");
  const [parsed, setParsed]       = useState(null);   // { title, dateStr, hint }
  const [focused, setFocused]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  /* Re-parse on every keystroke */
  useEffect(() => {
    if (!value.trim()) { setParsed(null); return; }
    const p = parseInput(value);
    setParsed(p.date ? p : { ...p, hint: "" });
  }, [value]);

  const reset = () => {
    setValue("");
    setParsed(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!value.trim() || submitting) return;

    const { title, dateStr } = parsed ?? parseInput(value);
    if (!title) return;

    setSubmitting(true);
    try {
      await onAdd({ title, dueDate: dateStr || undefined });
      reset();
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") { reset(); inputRef.current?.blur(); }
  };

  const showPreview = focused && value.trim().length > 0;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">

        {/* Input wrapper */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
                      ${focused
                        ? "border-brand-yellow/50 bg-white/8 shadow-[0_0_0_3px_rgba(253,206,0,0.08)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
        >
          {/* Icon */}
          <Sparkles
            className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
              focused ? "text-brand-yellow" : "text-white/25"
            }`}
          />

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder='Quick add — try "Fix bug tomorrow" or "Call client Friday 3pm"'
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none min-w-0"
            aria-label="Quick add task"
          />

          {/* Clear */}
          {value && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); reset(); }}
              className="text-white/25 hover:text-white/60 transition shrink-0"
              aria-label="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Submit arrow */}
          <button
            type="submit"
            disabled={!value.trim() || submitting}
            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200
                        ${value.trim()
                          ? "bg-brand-yellow text-brand-dark hover:brightness-105 active:scale-95"
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                        }`}
            aria-label="Add task"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Parse preview pill */}
        {showPreview && (
          <div className="absolute left-0 right-0 top-full mt-2 z-10 flex flex-wrap items-center gap-2 px-1">

            {/* Parsed title */}
            {parsed?.title && parsed.title !== value.trim() && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-xs text-white/70">
                <Sparkles className="w-3 h-3 text-brand-yellow shrink-0" />
                <span className="font-medium text-white">{parsed.title}</span>
              </span>
            )}

            {/* Parsed date */}
            {parsed?.hint && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-yellow/10 border border-brand-yellow/25 text-xs text-brand-yellow font-medium">
                <Calendar className="w-3 h-3 shrink-0" />
                {parsed.hint}
              </span>
            )}

            {/* Hint when nothing parsed */}
            {!parsed?.hint && !parsed?.date && (
              <span className="text-xs text-white/25 px-1">
                Press Enter to add · include a date like "tomorrow" or "Friday"
              </span>
            )}
          </div>
        )}
      </form>

      {/* Spacer so preview doesn't overlap content below */}
      {showPreview && <div className="h-9" />}
    </div>
  );
}
