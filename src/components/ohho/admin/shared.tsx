"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared form primitives used by all admin CRUD view components.
 * Styled to match the OHHO dark / orange-gold aesthetic.
 */

/* ---------- Field label wrapper ---------- */
export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-ohho-cream-dim mb-1">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[10px] text-ohho-cream-dim/70 mt-1">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full px-3 py-2 rounded-md bg-ohho-black/60 border border-ohho-gold/20 text-ohho-cream placeholder:text-ohho-cream-dim/50 text-sm outline-none focus:border-ohho-orange focus:ring-1 focus:ring-ohho-orange/40 transition-colors";

/* ---------- Text input ---------- */
export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(inputBase, className)}
    />
  );
}

/* ---------- Number input ---------- */
export function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  step,
  className,
}: {
  value: number | string;
  onChange: (v: number) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className={cn(inputBase, className)}
    />
  );
}

/* ---------- Textarea ---------- */
export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(inputBase, "resize-y", className)}
    />
  );
}

/* ---------- Comma-separated list input ---------- */
export function ListInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = React.useState(value.join(", "));
  React.useEffect(() => {
    setText(value.join(", "));
  }, [value]);
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }}
      placeholder={placeholder || "Comma-separated values"}
      className={cn(inputBase, className)}
    />
  );
}

/* ---------- Toggle switch ---------- */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 group"
      aria-pressed={checked}
    >
      <span
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors",
          checked
            ? "bg-ohho-orange border-ohho-orange"
            : "bg-ohho-black/60 border-ohho-gold/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-ohho-cream transition-all",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-wider transition-colors",
          checked ? "text-ohho-orange" : "text-ohho-cream-dim"
        )}
      >
        {label}
      </span>
    </button>
  );
}

/* ---------- Alert banner (inline toast replacement) ---------- */
export function AlertBanner({
  kind,
  message,
  onDismiss,
}: {
  kind: "success" | "error";
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 rounded-md border text-xs font-semibold",
        kind === "success"
          ? "bg-ohho-green/10 border-ohho-green/40 text-ohho-green"
          : "bg-ohho-red/10 border-ohho-red/40 text-ohho-red"
      )}
      role="status"
    >
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="text-center py-20 text-ohho-cream-dim">
      <Icon className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
      {message}
    </div>
  );
}

/* ---------- Section header with action button ---------- */
export function SectionHeader({
  title,
  count,
  onAdd,
  addLabel = "Add new",
}: {
  title: string;
  count?: number;
  onAdd: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-lg text-ohho-cream">{title}</h3>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-ohho-gold/15 text-ohho-gold text-[10px] font-bold uppercase tracking-wider border border-ohho-gold/30">
            {count}
          </span>
        )}
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ohho-orange text-ohho-black border border-ohho-orange text-xs font-bold uppercase tracking-wider hover:bg-ohho-orange-deep transition-colors"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/* ---------- Edit / Save / Delete / Cancel icon buttons ---------- */
export function IconBtn({
  onClick,
  icon: Icon,
  label,
  tone = "default",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "default" | "danger" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold uppercase tracking-wider transition-colors",
        tone === "danger"
          ? "border-ohho-red/40 text-ohho-red hover:bg-ohho-red/10"
          : tone === "primary"
          ? "border-ohho-orange text-ohho-orange hover:bg-ohho-orange/10"
          : "border-ohho-gold/25 text-ohho-cream-dim hover:border-ohho-gold/50 hover:text-ohho-cream"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
