"use client";

import * as React from "react";
import { Clock, Edit2, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  TextInput,
  TextArea,
  NumberInput,
  AlertBanner,
  EmptyState,
  SectionHeader,
  IconBtn,
} from "./shared";

export type TimelineEra = {
  id: string;
  category: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  year: string;
  era: string;
  blurb: string;
  sortOrder: number;
};

type Draft = Omit<TimelineEra, "id"> & { id?: string };

const emptyDraft: Draft = {
  category: "",
  label: "",
  emoji: "✨",
  color: "#ff6a00",
  tagline: "",
  year: "2024",
  era: "New Era",
  blurb: "",
  sortOrder: 0,
};

export function TimelineView({ eras }: { eras: TimelineEra[] }) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [alert, setAlert] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [localEras, setLocalEras] = React.useState<TimelineEra[]>(eras);

  React.useEffect(() => setLocalEras(eras), [eras]);

  const flash = (kind: "success" | "error", message: string) => {
    setAlert({ kind, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const startEdit = (e: TimelineEra) => {
    setEditingId(e.id);
    setDraft({ ...e });
  };

  const startAdd = () => {
    setEditingId("new");
    setDraft({ ...emptyDraft });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.category || !draft.label) {
      flash("error", "Category and label are required.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/admin/timeline", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? draft : { id: draft.id, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      const saved: TimelineEra = isNew
        ? data.era
        : { ...(localEras.find((i) => i.id === draft.id)!), ...data.era };
      setLocalEras((cur) =>
        isNew ? [...cur, saved] : cur.map((i) => (i.id === saved.id ? saved : i))
      );
      flash("success", isNew ? "Era created." : "Era updated.");
      cancelEdit();
    } catch (e: any) {
      flash("error", e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this era? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/timeline?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      setLocalEras((cur) => cur.filter((i) => i.id !== id));
      flash("success", "Era deleted.");
    } catch (e: any) {
      flash("error", e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeader title="Timeline Eras" count={localEras.length} onAdd={startAdd} addLabel="New era" />
      {alert && (
        <AlertBanner kind={alert.kind} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {editingId === "new" && draft && (
        <EraEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={cancelEdit} saving={saving} isNew />
      )}

      {localEras.length === 0 && editingId !== "new" ? (
        <EmptyState icon={Clock} message="No timeline eras yet. Click 'New era' to add one." />
      ) : (
        localEras.map((era) =>
          editingId === era.id && draft ? (
            <EraEditor
              key={era.id}
              draft={draft}
              setDraft={setDraft}
              onSave={save}
              onCancel={cancelEdit}
              saving={saving}
            />
          ) : (
            <EraCard key={era.id} era={era} onEdit={() => startEdit(era)} onDelete={() => remove(era.id)} />
          )
        )
      )}
    </div>
  );
}

function EraCard({ era, onEdit, onDelete }: { era: TimelineEra; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-lg grid place-items-center text-2xl flex-shrink-0"
          style={{ background: `${era.color}22`, border: `1px solid ${era.color}66` }}
        >
          {era.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg text-ohho-cream">{era.label}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{ color: era.color, borderColor: `${era.color}66`, background: `${era.color}15` }}
                >
                  {era.year}
                </span>
              </div>
              <div className="text-[11px] text-ohho-cream-dim mt-0.5">
                <span className="text-ohho-gold">{era.category}</span> · {era.era} · order #{era.sortOrder}
              </div>
            </div>
            <div className="flex gap-2">
              <IconBtn onClick={onEdit} icon={Edit2} label="Edit" />
              <IconBtn onClick={onDelete} icon={Trash2} label="Delete" tone="danger" />
            </div>
          </div>
          {era.tagline && (
            <p className="text-sm text-ohho-cream/80 mt-2 italic" style={{ color: era.color }}>
              {era.tagline}
            </p>
          )}
          {era.blurb && <p className="text-sm text-ohho-cream/70 mt-1">{era.blurb}</p>}
        </div>
      </div>
    </div>
  );
}

function EraEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  return (
    <div className={cn("glass-card rounded-xl p-4", isNew && "border-ohho-orange/50")}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-lg text-ohho-cream">
          {isNew ? "New era" : "Edit era"}
        </div>
        <div className="flex gap-2">
          <IconBtn onClick={onSave} icon={Save} label={saving ? "Saving…" : "Save"} tone="primary" />
          <IconBtn onClick={onCancel} icon={X} label="Cancel" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Emoji">
          <TextInput value={draft.emoji} onChange={(v) => setDraft({ ...draft, emoji: v })} />
        </Field>
        <Field label="Category" hint="unique key, e.g. genesis">
          <TextInput value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} />
        </Field>
        <Field label="Label" className="col-span-2">
          <TextInput value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} placeholder="The Genesis" />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <Field label="Year">
          <TextInput value={draft.year} onChange={(v) => setDraft({ ...draft, year: v })} placeholder="2024" />
        </Field>
        <Field label="Era name">
          <TextInput value={draft.era} onChange={(v) => setDraft({ ...draft, era: v })} placeholder="New Era" />
        </Field>
        <Field label="Color (hex)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              className="h-9 w-12 rounded border border-ohho-gold/20 bg-ohho-black/60 cursor-pointer"
              aria-label="Pick color"
            />
            <TextInput value={draft.color} onChange={(v) => setDraft({ ...draft, color: v })} />
          </div>
        </Field>
        <Field label="Sort order">
          <NumberInput value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
        </Field>
      </div>

      <Field label="Tagline" className="mt-3">
        <TextInput value={draft.tagline} onChange={(v) => setDraft({ ...draft, tagline: v })} placeholder="Short punchy tagline" />
      </Field>

      <Field label="Blurb" className="mt-3">
        <TextArea value={draft.blurb} onChange={(v) => setDraft({ ...draft, blurb: v })} rows={3} placeholder="Longer descriptive text" />
      </Field>
    </div>
  );
}
